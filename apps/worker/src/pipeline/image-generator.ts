
import type { Logger } from "pino";
import {
  prisma,
  DreamTitleStatus,
  GenerationJobStatus,
} from "@ruyatabiri/database";
import type { DreamJobPayload } from "../types";

export async function handleImageGeneration(
  payload: DreamJobPayload,
  logger: Logger,
  jobId?: string,
) {
  if (!payload.dreamTitleId) {
    throw new Error("dreamTitleId is required");
  }

  const dream = await prisma.dreamTitle.findUnique({
    where: { id: payload.dreamTitleId },
    select: {
      id: true,
      title: true,
      imageAlt: true,
      status: true,
    },
  });

  if (!dream) {
    throw new Error(`DreamTitle ${payload.dreamTitleId} not found`);
  }

  logger.info({ jobId, dreamTitleId: dream.id }, "Starting image generation");

  const imageUrl = await generatePlaceholderImage(dream.title, logger);

  await prisma.dreamTitle.update({
    where: { id: dream.id },
    data: {
      imageUrl,
      status: DreamTitleStatus.READY,
    },
  });

  logger.info({ jobId, dreamTitleId: dream.id }, "Image generation completed");
  return imageUrl;
}

async function generatePlaceholderImage(title: string, logger: Logger) {
  logger.warn({ title }, "generatePlaceholderImage uses a placeholder implementation");
  const encodedTitle = encodeURIComponent(title.trim().slice(0, 40));
  return `https://placehold.co/1200x630/0f172a/fff?text=${encodedTitle}`;
}
