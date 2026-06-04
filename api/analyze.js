import { createHash } from "node:crypto";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const DEFAULT_MODELS = "genai,type";
const MAX_CACHE_ENTRIES = 200;
const LIMIT_REASONS = new Set(["rate_limit", "quota", "limit", "usage"]);
const responseCache = new Map();

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(request);
    const imagePayload = parseImagePayload(body.image);

    if (!imagePayload) {
      return sendJson(response, 400, { error: "Missing image data." });
    }

    if (imagePayload.buffer.byteLength > MAX_IMAGE_BYTES) {
      return sendJson(response, 413, { error: "Image is too large. Limit is 12MB." });
    }

    const imageHash = body.hash || hashBuffer(imagePayload.buffer);
    const cached = responseCache.get(imageHash);

    if (cached) {
      return sendJson(response, 200, {
        ...cached,
        cached: true,
        cacheLayer: "server"
      });
    }

    const result = await analyzeWithProviders(imagePayload, body.filename || "upload");
    setCachedResult(imageHash, result);
    return sendJson(response, 200, result);
  } catch (error) {
    return sendJson(response, error.statusCode || 500, {
      error: error.message || "Unable to analyze image.",
      provider: error.provider || "unknown",
      reason: error.reason || "provider_unavailable",
      providersTried: error.providersTried || []
    });
  }
}

async function analyzeWithProviders(imagePayload, filename) {
  const providerOrder = (process.env.AI_DETECTOR_PROVIDER_ORDER || "sightengine,hive,aiornot,realityai")
    .split(",")
    .map((provider) => provider.trim().toLowerCase())
    .filter(Boolean);
  const providersTried = [];
  let lastError = null;

  for (const provider of providerOrder) {
    const adapter = providerAdapters[provider];
    if (!adapter) continue;

    if (!adapter.isConfigured()) {
      providersTried.push({ provider, status: "skipped", reason: "not_configured" });
      continue;
    }

    try {
      const result = await adapter.analyze(imagePayload, filename);
      return {
        ...result,
        providersTried: [
          ...providersTried,
          { provider, status: "success" }
        ]
      };
    } catch (error) {
      lastError = error;
      providersTried.push({
        provider,
        status: "failed",
        reason: error.reason || "error",
        message: error.message
      });

      if (!shouldTryNextProvider(error)) {
        break;
      }
    }
  }

  const limitedProviders = providersTried.filter((item) => item.status === "failed" && isLimitReason(item.reason));
  const attemptedProviders = providersTried.filter((item) => item.status === "failed");
  const allAttemptedLimited = attemptedProviders.length > 0 && attemptedProviders.length === limitedProviders.length;

  if (limitedProviders.length) {
    logProviderQuotaLimit({
      filename,
      allAttemptedLimited,
      limitedProviders,
      providersTried
    });
  }

  const error = new Error(lastError?.message || "No configured AI detector provider is available.");
  error.statusCode = lastError?.statusCode || 502;
  error.provider = lastError?.provider || "unknown";
  error.reason = allAttemptedLimited ? "all_providers_limited" : lastError?.reason || "provider_unavailable";
  error.providersTried = providersTried;
  throw error;
}

function logProviderQuotaLimit({ filename, allAttemptedLimited, limitedProviders, providersTried }) {
  const payload = {
    event: "provider_quota_limit",
    timestamp: new Date().toISOString(),
    filename,
    allAttemptedLimited,
    limitedProviders: limitedProviders.map((item) => ({
      provider: item.provider,
      reason: item.reason,
      message: item.message
    })),
    providersTried: providersTried.map((item) => ({
      provider: item.provider,
      status: item.status,
      reason: item.reason || null
    }))
  };

  console.warn("[PICCHECK_PROVIDER_QUOTA_LIMIT]", JSON.stringify(payload));
}

const providerAdapters = {
  sightengine: {
    isConfigured() {
      return Boolean(process.env.SIGHTENGINE_API_USER && process.env.SIGHTENGINE_API_SECRET);
    },
    async analyze(imagePayload, filename) {
      const form = new FormData();
      form.append("media", new Blob([imagePayload.buffer], { type: imagePayload.mimeType }), filename);
      form.append("models", process.env.SIGHTENGINE_MODELS || DEFAULT_MODELS);
      form.append("api_user", process.env.SIGHTENGINE_API_USER);
      form.append("api_secret", process.env.SIGHTENGINE_API_SECRET);

      const sightengineResponse = await fetch("https://api.sightengine.com/1.0/check.json", {
        method: "POST",
        body: form
      });
      const raw = await sightengineResponse.json();

      if (!sightengineResponse.ok || raw.status === "failure") {
        throw providerError({
          provider: "sightengine",
          statusCode: sightengineResponse.status || 502,
          message: raw.error?.message || "Sightengine analysis failed.",
          reason: raw.error?.type || raw.error?.code || "error",
          raw
        });
      }

      return normalizeSightengineResult(raw);
    }
  },
  hive: {
    isConfigured() {
      return Boolean(process.env.HIVE_API_KEY);
    },
    async analyze(imagePayload, filename) {
      const form = new FormData();
      form.append("media", new Blob([imagePayload.buffer], { type: imagePayload.mimeType }), filename);

      const hiveResponse = await fetch("https://api.thehive.ai/api/v2/task/sync", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.HIVE_API_KEY}`
        },
        body: form
      });
      const raw = await hiveResponse.json();

      if (!hiveResponse.ok || raw.status?.code >= 400) {
        throw providerError({
          provider: "hive",
          statusCode: hiveResponse.status || 502,
          message: raw.status?.message || "Hive analysis failed.",
          reason: hiveResponse.status === 420 ? "rate_limit" : "error",
          raw
        });
      }

      return normalizeHiveResult(raw);
    }
  },
  aiornot: {
    isConfigured() {
      return Boolean(process.env.AIORNOT_API_KEY);
    },
    async analyze(imagePayload, filename) {
      const form = new FormData();
      form.append("image", new Blob([imagePayload.buffer], { type: imagePayload.mimeType }), filename);

      const aiornotResponse = await fetch("https://api.aiornot.com/v2/image/sync?only=ai_generated", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIORNOT_API_KEY}`
        },
        body: form
      });
      const raw = await aiornotResponse.json();

      if (!aiornotResponse.ok) {
        throw providerError({
          provider: "aiornot",
          statusCode: aiornotResponse.status || 502,
          message: raw.detail || raw.message || raw.error || "AI or Not analysis failed.",
          reason: reasonFromStatus(aiornotResponse.status, raw),
          raw
        });
      }

      return normalizeAiOrNotResult(raw);
    }
  },
  realityai: {
    isConfigured() {
      return Boolean(process.env.REALITYAI_API_KEY);
    },
    async analyze(imagePayload, filename) {
      const form = new FormData();
      form.append("image", new Blob([imagePayload.buffer], { type: imagePayload.mimeType }), filename);

      const realityResponse = await fetch("https://api.realityai.ai/v2/detect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REALITYAI_API_KEY}`
        },
        body: form
      });
      const raw = await realityResponse.json();

      if (!realityResponse.ok) {
        throw providerError({
          provider: "realityai",
          statusCode: realityResponse.status || 502,
          message: raw.message || raw.error || "Reality AI analysis failed.",
          reason: reasonFromStatus(realityResponse.status, raw),
          raw
        });
      }

      return normalizeRealityAiResult(raw);
    }
  }
};

function normalizeSightengineResult(raw) {
  const type = raw.type || {};
  const aiGenerated = firstNumber(type.ai_generated, raw.ai_generated, raw.genai?.ai_generated);
  const recapture = firstNumber(raw.recapture?.score, raw.recapture?.prob, type.recapture);
  const photo = firstNumber(type.photo);
  const illustration = firstNumber(type.illustration);
  const score = clampPercent(Math.round((aiGenerated ?? 0) * 100));

  return {
    provider: "sightengine",
    score,
    confidence: confidenceFromProvider({ score, photo, illustration, recapture }),
    mediaType: classifyMediaType({ photo, illustration, recapture }),
    signals: buildSignals({ score, photo, illustration, recapture }),
    operations: raw.request?.operations,
    raw
  };
}

function normalizeHiveResult(raw) {
  const classes = extractHiveClasses(raw);
  const aiGenerated = findClassScore(classes, "ai_generated");
  const notAiGenerated = findClassScore(classes, "not_ai_generated");
  const source = topHiveSource(classes);
  const score = clampPercent(Math.round((aiGenerated ?? 0) * 100));
  const confidence = clampPercent(
    Math.round(58 + Math.abs((aiGenerated ?? 0.5) - (notAiGenerated ?? 0.5)) * 42),
    35,
    92
  );

  return {
    provider: "hive",
    score,
    confidence,
    mediaType: source ? `Nguồn AI ước lượng: ${source.name}` : "Không chắc loại media",
    signals: buildHiveSignals({ score, notAiGenerated, source }),
    raw
  };
}

function normalizeAiOrNotResult(raw) {
  const aiGenerated = raw.report?.ai_generated || raw.ai_generated || {};
  const aiConfidence = firstNumber(aiGenerated.ai?.confidence, aiGenerated.confidence, aiGenerated.score);
  const humanConfidence = firstNumber(aiGenerated.human?.confidence);
  const score = clampPercent(Math.round((aiConfidence ?? 0) * 100));
  const generator = topGenerator(aiGenerated.generator);

  return {
    provider: "aiornot",
    score,
    confidence: clampPercent(Math.round(58 + Math.abs((aiConfidence ?? 0.5) - (humanConfidence ?? 0.5)) * 42), 35, 92),
    mediaType: raw.report?.meta?.format ? `Format: ${raw.report.meta.format}` : "Không chắc loại media",
    signals: [
      `AI or Not trả về điểm AI ${score}%.`,
      ...(typeof humanConfidence === "number" ? [`Khả năng human theo AI or Not: ${Math.round(humanConfidence * 100)}%.`] : []),
      ...(generator ? [`Generator gần nhất theo AI or Not: ${generator.name} (${Math.round(generator.score * 100)}%).`] : [])
    ],
    raw
  };
}

function normalizeRealityAiResult(raw) {
  const directConfidence = firstNumber(raw.confidence, raw.score);
  const modelScores = Object.values(raw.models || {})
    .map((item) => firstNumber(item?.score, item?.confidence))
    .filter((value) => typeof value === "number");
  const meanScore = modelScores.length
    ? modelScores.reduce((total, value) => total + value, 0) / modelScores.length
    : undefined;
  const verdict = String(raw.verdict || raw.label || "").toLowerCase();
  const normalizedScore = directConfidence ?? meanScore ?? (verdict.includes("ai") ? 0.75 : 0.25);
  const score = clampPercent(Math.round(normalizedScore * 100));

  return {
    provider: "realityai",
    score,
    confidence: clampPercent(Math.round(55 + Math.abs(score - 50) * 0.5), 35, 92),
    mediaType: raw.verdict || "Không chắc loại media",
    signals: [
      `Reality AI verdict: ${raw.verdict || "unknown"}.`,
      `Reality AI score quy đổi: ${score}%.`,
      ...Object.entries(raw.models || {}).slice(0, 4).map(([name, model]) => {
        const modelScore = firstNumber(model?.score, model?.confidence);
        return `${name}: ${model?.label || "score"}${typeof modelScore === "number" ? ` (${Math.round(modelScore * 100)}%)` : ""}.`;
      })
    ],
    raw
  };
}

function buildHiveSignals({ score, notAiGenerated, source }) {
  const signals = [`Hive trả về điểm AI ${score}%.`];

  if (typeof notAiGenerated === "number") {
    signals.push(`Khả năng không phải AI: ${Math.round(notAiGenerated * 100)}%.`);
  }

  if (source) {
    signals.push(`Nguồn/generator gần nhất theo Hive: ${source.name} (${Math.round(source.score * 100)}%).`);
  }

  return signals;
}

function extractHiveClasses(raw) {
  const classes = [];

  visit(raw, (value) => {
    if (!value || typeof value !== "object") return;

    const className = value.class || value.class_name || value.label || value.name;
    const score = firstNumber(value.score, value.confidence, value.value);

    if (typeof className === "string" && typeof score === "number") {
      classes.push({
        name: className,
        score
      });
    }
  });

  return classes;
}

function findClassScore(classes, className) {
  return classes.find((item) => item.name === className)?.score;
}

function topHiveSource(classes) {
  const excluded = new Set(["ai_generated", "not_ai_generated", "deepfake", "none", "inconclusive"]);
  const candidates = classes.filter((item) => !excluded.has(item.name) && item.score > 0.12);
  candidates.sort((a, b) => b.score - a.score);

  return candidates[0];
}

function topGenerator(generatorScores) {
  if (!generatorScores || typeof generatorScores !== "object") return null;
  const candidates = Object.entries(generatorScores)
    .filter(([, score]) => typeof score === "number")
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

function visit(value, callback) {
  callback(value);

  if (Array.isArray(value)) {
    value.forEach((item) => visit(item, callback));
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => visit(item, callback));
  }
}

function confidenceFromProvider({ score, photo, illustration, recapture }) {
  let confidence = 62 + Math.abs(score - 50) * 0.45;

  if (typeof photo === "number" && photo > 0.72) confidence += 8;
  if (typeof illustration === "number" && illustration > 0.72) confidence -= 8;
  if (typeof recapture === "number" && recapture > 0.55) confidence -= 12;

  return clampPercent(Math.round(confidence), 35, 92);
}

function classifyMediaType({ photo, illustration, recapture }) {
  if (typeof recapture === "number" && recapture > 0.55) return "Ảnh chụp lại màn hình/bản in";
  if (typeof illustration === "number" && illustration > 0.65) return "Minh họa/screenshot/đồ họa";
  if (typeof photo === "number" && photo > 0.65) return "Ảnh chụp tự nhiên";
  return "Không chắc loại media";
}

function buildSignals({ score, photo, illustration, recapture }) {
  const signals = [
    `Sightengine genai trả về điểm AI ${score}%.`
  ];

  if (typeof photo === "number") {
    signals.push(`Khả năng là ảnh chụp tự nhiên: ${Math.round(photo * 100)}%.`);
  }

  if (typeof illustration === "number" && illustration > 0.45) {
    signals.push(`Ảnh có dấu hiệu minh họa/screenshot/đồ họa: ${Math.round(illustration * 100)}%, nên cần đọc kết quả thận trọng hơn.`);
  }

  if (typeof recapture === "number" && recapture > 0.35) {
    signals.push(`Có dấu hiệu ảnh chụp lại màn hình/bản in: ${Math.round(recapture * 100)}%.`);
  }

  return signals;
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_IMAGE_BYTES * 1.45) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    request.on("error", reject);
  });
}

function parseImagePayload(value) {
  if (typeof value !== "string") return null;

  const match = value.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match) return null;

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

function hashBuffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function setCachedResult(hash, result) {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const [oldestKey] = responseCache.keys();
    responseCache.delete(oldestKey);
  }

  responseCache.set(hash, {
    ...result,
    cachedAt: new Date().toISOString()
  });
}

function providerError({ provider, statusCode, message, reason, raw }) {
  const error = new Error(message);
  error.provider = provider;
  error.statusCode = statusCode;
  error.reason = reason;
  error.raw = raw;
  return error;
}

function shouldTryNextProvider(error) {
  const reason = String(error.reason || "").toLowerCase();
  const message = String(error.message || "").toLowerCase();
  const statusCode = Number(error.statusCode || 0);

  return (
    statusCode === 420 ||
    statusCode === 429 ||
    reason.includes("limit") ||
    reason.includes("quota") ||
    reason.includes("usage") ||
    message.includes("limit") ||
    message.includes("quota") ||
    message.includes("free plan")
  );
}

function reasonFromStatus(statusCode, raw = {}) {
  const message = String(raw.message || raw.error || raw.detail || "").toLowerCase();
  if (statusCode === 420 || statusCode === 429) return "rate_limit";
  if (statusCode === 401 || statusCode === 403) return "auth";
  if (message.includes("quota")) return "quota";
  if (message.includes("limit")) return "rate_limit";
  if (message.includes("usage")) return "usage";
  return "error";
}

function isLimitReason(reason) {
  const normalized = String(reason || "").toLowerCase();
  return LIMIT_REASONS.has(normalized) || normalized.includes("limit") || normalized.includes("quota") || normalized.includes("usage");
}

function firstNumber(...values) {
  return values.find((value) => typeof value === "number" && Number.isFinite(value));
}

function clampPercent(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}
