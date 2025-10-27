import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ready" });
  } catch (error) {
    console.error("Readiness check failed", error);
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
