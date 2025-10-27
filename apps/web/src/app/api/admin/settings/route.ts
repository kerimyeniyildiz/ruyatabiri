import { requireAdminAuth, requireInternalSecret } from "@/lib/auth";
import { getSettings, settingsSchema, updateSettings } from "@/server/settings";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authResponse = requireAdminAuth();
  if (authResponse) return authResponse;

  const secretResponse = requireInternalSecret(request);
  if (secretResponse) return secretResponse;

  const settings = await getSettings();
  return Response.json(settings);
}

export async function POST(request: Request) {
  const authResponse = requireAdminAuth();
  if (authResponse) return authResponse;

  const secretResponse = requireInternalSecret(request);
  if (secretResponse) return secretResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Invalid settings payload", error);
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await updateSettings(parsed.data);
  return Response.json({ updated });
}
