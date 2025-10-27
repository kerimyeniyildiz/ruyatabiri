
import type { Logger } from "pino";
import { prisma, DreamTitleStatus } from "@ruyatabiri/database";
import type { DreamJobPayload } from "../types";

export async function handlePublish(
  payload: DreamJobPayload,
  logger: Logger,
  jobId?: string,
) {
  if (!payload.dreamTitleId) {
    throw new Error("dreamTitleId is required");
  }

  const dream = await prisma.dreamTitle.findUnique({
    where: { id: payload.dreamTitleId },
    select: { id: true, slug: true, status: true },
  });

  if (!dream) {
    throw new Error(`DreamTitle ${payload.dreamTitleId} not found`);
  }

  logger.info({ jobId, dreamTitleId: dream.id }, "Publishing dream title");

  await prisma.dreamTitle.update({
    where: { id: dream.id },
    data: {
      status: DreamTitleStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  await triggerRevalidate(dream.slug, logger);

  logger.info({ jobId, dreamTitleId: dream.id }, "Publish completed");
}

async function triggerRevalidate(slug: string, logger: Logger) {
  const baseUrl = process.env.APP_BASE_URL;
  const secret = process.env.INTERNAL_WEBHOOK_SECRET;

  if (!baseUrl || !secret) {
    logger.warn("APP_BASE_URL or INTERNAL_WEBHOOK_SECRET not configured, skipping revalidate call");
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/api/revalidate?path=/ruya/${slug}`, {
      method: "POST",
      headers: {
        "x-internal-secret": secret,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      logger.warn({ slug, status: response.status, body }, "Revalidate request failed");
    }
  } catch (error) {
    logger.error({ slug, error }, "Revalidate request threw an error");
  }
}
