import { requireAdminAuth, requireInternalSecret } from "@/lib/auth";
import {
  prisma,
  DreamTitleStatus,
  GenerationJobStatus,
  GenerationJobType,
} from "@/lib/prisma";

export const runtime = "nodejs";

type Params = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: Params) {
  const authResponse = requireAdminAuth();
  if (authResponse) return authResponse;

  const secretResponse = requireInternalSecret(request);
  if (secretResponse) return secretResponse;

  const dreamTitle = await prisma.dreamTitle.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  });

  if (!dreamTitle) {
    return Response.json({ error: "Dream title not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.dreamTitle.update({
      where: { id: params.id },
      data: {
        status: DreamTitleStatus.QUEUED,
        priority: 10,
        scheduledFor: new Date(),
      },
    }),
    prisma.generationJob.create({
      data: {
        dreamTitleId: params.id,
        type: GenerationJobType.TEXT,
        status: GenerationJobStatus.QUEUED,
      },
    }),
  ]);

  return Response.json({ queued: true });
}
