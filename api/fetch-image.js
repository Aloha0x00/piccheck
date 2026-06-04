const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 12000;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const HEIC_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  try {
    const { url } = await readJsonBody(request);
    const imageUrl = validateImageUrl(url);
    const remote = await fetchRemoteImage(imageUrl);

    return sendJson(response, 200, {
      image: `data:${remote.mimeType};base64,${remote.buffer.toString("base64")}`,
      mimeType: remote.mimeType,
      filename: filenameFromUrl(imageUrl, remote.mimeType),
      size: remote.buffer.byteLength
    });
  } catch (error) {
    return sendJson(response, error.statusCode || 500, {
      error: error.message || "Could not load that image URL.",
      reason: error.reason || "fetch_failed"
    });
  }
}

function validateImageUrl(value) {
  let url;

  try {
    url = new URL(String(value || "").trim());
  } catch {
    throw httpError(400, "Enter a valid public http(s) image URL.", "invalid_url");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw httpError(400, "Only http(s) image URLs are supported.", "invalid_url");
  }

  if (isBlockedHost(url.hostname)) {
    throw httpError(400, "Private or local URLs are not supported.", "blocked_host");
  }

  return url;
}

async function fetchRemoteImage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const remoteResponse = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "Accept": "image/avif,image/webp,image/png,image/jpeg,image/gif,image/*;q=0.8"
      }
    });

    if (!remoteResponse.ok) {
      throw httpError(502, "Image URL could not be fetched.", "fetch_failed");
    }

    const contentLength = Number(remoteResponse.headers.get("content-length") || 0);
    if (contentLength > MAX_IMAGE_BYTES) {
      throw httpError(413, "Image is too large. Limit is 12MB.", "too_large");
    }

    const mimeType = normalizeMimeType(remoteResponse.headers.get("content-type"));
    if (!mimeType.startsWith("image/")) {
      throw httpError(415, "URL does not point to an image file.", "non_image");
    }

    if (HEIC_TYPES.has(mimeType) || !SUPPORTED_IMAGE_TYPES.has(mimeType)) {
      throw httpError(415, "Unsupported image format. Use JPG, PNG, WEBP or GIF.", "unsupported_format");
    }

    const buffer = Buffer.from(await remoteResponse.arrayBuffer());
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw httpError(413, "Image is too large. Limit is 12MB.", "too_large");
    }

    return { buffer, mimeType };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeMimeType(contentType) {
  return String(contentType || "").split(";")[0].trim().toLowerCase();
}

function filenameFromUrl(url, mimeType) {
  const extensionByType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
  };
  const fallback = `remote-image.${extensionByType[mimeType] || "jpg"}`;
  const pathname = decodeURIComponent(url.pathname || "");
  const basename = pathname.split("/").filter(Boolean).pop() || fallback;
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return /\.[a-zA-Z0-9]{2,5}$/.test(sanitized) ? sanitized : fallback;
}

function isBlockedHost(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host === "0.0.0.0" || host === "::1") return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true;
  if (/^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}

function httpError(statusCode, message, reason) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.reason = reason;
  return error;
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}
