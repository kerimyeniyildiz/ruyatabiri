import { headers } from "next/headers";

const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const internalSecret = process.env.INTERNAL_WEBHOOK_SECRET;

if (!adminUsername || !adminPassword) {
  console.warn("ADMIN_USERNAME or ADMIN_PASSWORD is not set. Admin routes will reject requests.");
}

if (!internalSecret) {
  console.warn("INTERNAL_WEBHOOK_SECRET is not set. Internal APIs will reject requests.");
}

export function parseBasicAuth(headerValue?: string | null) {
  if (!headerValue?.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(headerValue.replace("Basic ", ""), "base64").toString("utf8");
    const [username, password] = decoded.split(":");
    if (!username || !password) return null;
    return { username, password };
  } catch {
    return null;
  }
}

export function isBasicAuthValid(authHeader?: string | null) {
  const credentials = parseBasicAuth(authHeader);
  if (!credentials) return false;
  if (!adminUsername || !adminPassword) return false;
  return credentials.username === adminUsername && credentials.password === adminPassword;
}

export function requireAdminAuth(): Response | null {
  const headerList = headers();
  const authHeader = headerList.get("authorization");
  if (!isBasicAuthValid(authHeader)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"',
      },
    });
  }
  return null;
}

export function isInternalSecretValid(value?: string | null) {
  if (!internalSecret) return false;
  return value === internalSecret;
}

export function requireInternalSecret(request: Request): Response | null {
  const headerSecret = request.headers.get("x-internal-secret");
  const querySecret = new URL(request.url).searchParams.get("secret");
  if (isInternalSecretValid(headerSecret) || isInternalSecretValid(querySecret)) {
    return null;
  }
  return new Response("Forbidden", { status: 403 });
}
