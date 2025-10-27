import { revalidatePath } from "next/cache";
import { requireInternalSecret } from "@/lib/auth";

export const runtime = "nodejs";

type Payload = {
  path?: string;
};

export async function POST(request: Request) {
  const authResponse = requireInternalSecret(request);
  if (authResponse) return authResponse;

  let path =
    new URL(request.url).searchParams.get("path") ??
    (await request
      .json()
      .then((body: Payload) => body?.path)
      .catch(() => undefined));

  if (!path) {
    return Response.json({ error: "Missing path" }, { status: 400 });
  }

  revalidatePath(path);
  return Response.json({ revalidated: true, path });
}
