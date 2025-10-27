
import type { Logger } from "pino";
import {
  prisma,
  DreamTitleStatus,
  GenerationJobStatus,
  GenerationJobType,
} from "@ruyatabiri/database";
import type { DreamJobPayload, GeneratedArticle } from "../types";

export async function handleTextGeneration(
  payload: DreamJobPayload,
  logger: Logger,
  jobId?: string,
) {
  if (!payload.dreamTitleId) {
    throw new Error("dreamTitleId is required");
  }

  const dream = await prisma.dreamTitle.findUnique({
    where: { id: payload.dreamTitleId },
  });

  if (!dream) {
    throw new Error(`DreamTitle ${payload.dreamTitleId} not found`);
  }

  logger.info({ jobId, dreamTitleId: dream.id }, "Starting text generation");

  const generated = await generateArticleDraft(dream.title, logger);

  await prisma.$transaction([
    prisma.dreamTitle.update({
      where: { id: dream.id },
      data: {
        status: DreamTitleStatus.GENERATING,
        metaTitle: generated.seo.metaTitle,
        metaDescription: generated.seo.metaDescription,
        contentHtml: generated.article.html,
        contentToc: generated.article.toc ?? [],
        relatedKeywords: generated.article.relatedKeywords,
        faqs: generated.faqs ?? [],
        imageAlt: generated.image.alt,
        lastGenerationAt: new Date(),
      },
    }),
    prisma.generationJob.create({
      data: {
        dreamTitleId: dream.id,
        type: GenerationJobType.IMAGE,
        status: GenerationJobStatus.QUEUED,
      },
    }),
  ]);

  logger.info({ jobId, dreamTitleId: dream.id }, "Text generation completed");
  return generated;
}

async function generateArticleDraft(title: string, logger: Logger): Promise<GeneratedArticle> {
  logger.warn({ title }, "generateArticleDraft uses a placeholder implementation");
  const safeTitle = title.trim();
  return {
    seo: {
      metaTitle: `${safeTitle} Rüya Tabiri`,
      metaDescription: `${safeTitle} rüyasının ne anlama geldiğini ve olası yorumlarını öğrenin.`,
    },
    article: {
      title: safeTitle,
      html: `<p><strong>${safeTitle}</strong> rüyası, kişinin iç dünyasında yaşadığı duygusal süreçlere işaret eder. GPT-5 entegrasyonu tamamlandığında bu metin otomatik olarak üretilecektir.</p>`,
      relatedKeywords: [safeTitle, "rüya tabiri", "rüya yorumu"],
      toc: [],
    },
    image: {
      prompt: `Dream interpretation illustration for "${safeTitle}", warm palette, soft light.`,
      alt: `${safeTitle} rüyasının görsel yorumu`,
    },
    faqs: [
      {
        question: `${safeTitle} rüyası ne anlama gelir?`,
        answer: "Kapsamlı cevap GPT-5 ile oluşturulacaktır.",
      },
    ],
  };
}
