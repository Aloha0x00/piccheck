import { firebaseConfig, firebaseCollections } from "../firebase-config.js";

const MAX_IMAGE_DATA_URL_LENGTH = 900000;

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return sendText(response, 405, "Method not allowed");
  }

  try {
    const slug = getSlug(request);

    if (!slug || !/^[a-z0-9][a-z0-9._-]{4,160}\.png$/i.test(slug)) {
      return sendText(response, 404, "Image not found");
    }

    const imageDataUrl = await loadMarkedImageDataUrl(slug);
    const image = parsePngDataUrl(imageDataUrl);

    response.statusCode = 200;
    response.setHeader("Content-Type", "image/png");
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    response.setHeader("Content-Disposition", `inline; filename="${slug}"`);
    response.setHeader("Content-Length", String(image.byteLength));
    if (request.method === "HEAD") return response.end();
    return response.end(image);
  } catch (error) {
    return sendText(response, error.statusCode || 500, error.message || "Image not found");
  }
}

function getSlug(request) {
  const url = new URL(request.url, `https://${request.headers.host || "piccheck.vercel.app"}`);
  const querySlug = url.searchParams.get("slug");
  if (querySlug) return sanitizeSlug(querySlug);
  const match = url.pathname.match(/^\/pic\/([^?#]+)/);
  return match ? sanitizeSlug(decodeURIComponent(match[1])) : "";
}

function sanitizeSlug(value) {
  return String(value || "").split("/").filter(Boolean).pop() || "";
}

async function loadMarkedImageDataUrl(slug) {
  const projectId = firebaseConfig.projectId;
  const apiKey = firebaseConfig.apiKey;
  const collection = firebaseCollections.sharedScans || "shared_scans";
  const documentUrl = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${encodeURIComponent(slug)}`);
  documentUrl.searchParams.set("key", apiKey);

  const firestoreResponse = await fetch(documentUrl);

  if (!firestoreResponse.ok) {
    throw httpError(404, "Image not found");
  }

  const payload = await firestoreResponse.json();
  const imageDataUrl = payload.fields?.imageDataUrl?.stringValue || payload.fields?.markedImageDataUrl?.stringValue || "";

  if (!imageDataUrl || imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    throw httpError(404, "Image not found");
  }

  return imageDataUrl;
}

function parsePngDataUrl(dataUrl) {
  const match = String(dataUrl).match(/^data:image\/png;base64,([a-z0-9+/=]+)$/i);
  if (!match) throw httpError(415, "Stored image is not a PNG");
  return Buffer.from(match[1], "base64");
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sendText(response, statusCode, message) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end(message);
}
