import { requireAdminAuth, requireInternalSecret } from "@/lib/auth";
import { importDreamTitles } from "@/server/import-dream-titles";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const authResponse = requireAdminAuth();
  if (authResponse) return authResponse;

  const secretResponse = requireInternalSecret(request);
  if (secretResponse) return secretResponse;

  const titles = await extractTitles(request);
  if (titles.length === 0) {
    return Response.json({ error: "No titles found" }, { status: 400 });
  }

  const result = await importDreamTitles(titles);
  return Response.json(result);
}

async function extractTitles(request: Request): Promise<string[]> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    if (file instanceof File) {
      const text = await file.text();
      return splitLines(text);
    }
    const titlesField = formData.get("titles");
    if (typeof titlesField === "string") {
      try {
        const parsed = JSON.parse(titlesField);
        if (Array.isArray(parsed)) {
          return parsed.map(String);
        }
      } catch {
        return splitLines(titlesField);
      }
    }
    return [];
  }

  if (contentType.includes("text/plain")) {
    const text = await request.text();
    return splitLines(text);
  }

  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      if (Array.isArray(body?.titles)) {
        return body.titles.map(String);
      }
    } catch {
      return [];
    }
  }

  return [];
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
