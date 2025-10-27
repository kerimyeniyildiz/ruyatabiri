import "dotenv/config";
import Boss from "pg-boss";
import pino from "pino";
import { z } from "zod";
import { handleTextGeneration } from "./pipeline/text-generator";
import { handleImageGeneration } from "./pipeline/image-generator";
import { handlePublish } from "./pipeline/publish";
import type { DreamJobPayload } from "./types";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PG_BOSS_SCHEMA: z.string().default("pgboss"),
  PG_BOSS_APP_NAME: z.string().default("ruyatabiri-worker"),
  PG_BOSS_CONCURRENCY_TEXT: z.coerce.number().int().min(1).default(2),
  PG_BOSS_CONCURRENCY_IMAGE: z.coerce.number().int().min(1).default(2),
  PG_BOSS_CONCURRENCY_PUBLISH: z.coerce.number().int().min(1).default(1),
});

const env = envSchema.parse(process.env);

const logger = pino({
  name: env.PG_BOSS_APP_NAME,
  level: process.env.LOG_LEVEL ?? "info",
});

async function bootstrap() {
  const boss = new Boss({
    connectionString: env.DATABASE_URL,
    schema: env.PG_BOSS_SCHEMA,
    application_name: env.PG_BOSS_APP_NAME,
  });

  boss.on("error", (error) => {
    logger.error(error, "pg-boss emitted an error");
  });

  await boss.start();
  logger.info("pg-boss started");

  await Promise.all([
    boss.work(
      "dream:text",
      env.PG_BOSS_CONCURRENCY_TEXT,
      async (job) => {
        const payload = (job.data ?? {}) as DreamJobPayload;
        logger.info({ jobId: job.id, dreamTitleId: payload.dreamTitleId }, "Processing text job");
        try {
          await handleTextGeneration(payload, logger, job.id);
          logger.info({ jobId: job.id }, "Text job completed");
        } catch (error) {
          logger.error({ jobId: job.id, error }, "Text job failed");
          throw error;
        }
      },
    ),
    boss.work(
      "dream:image",
      env.PG_BOSS_CONCURRENCY_IMAGE,
      async (job) => {
        const payload = (job.data ?? {}) as DreamJobPayload;
        logger.info({ jobId: job.id, dreamTitleId: payload.dreamTitleId }, "Processing image job");
        try {
          await handleImageGeneration(payload, logger, job.id);
          logger.info({ jobId: job.id }, "Image job completed");
        } catch (error) {
          logger.error({ jobId: job.id, error }, "Image job failed");
          throw error;
        }
      },
    ),
    boss.work(
      "dream:publish",
      env.PG_BOSS_CONCURRENCY_PUBLISH,
      async (job) => {
        const payload = (job.data ?? {}) as DreamJobPayload;
        logger.info({ jobId: job.id, dreamTitleId: payload.dreamTitleId }, "Processing publish job");
        try {
          await handlePublish(payload, logger, job.id);
          logger.info({ jobId: job.id }, "Publish job completed");
        } catch (error) {
          logger.error({ jobId: job.id, error }, "Publish job failed");
          throw error;
        }
      },
    ),
  ]);

  logger.info("Workers registered");
}

bootstrap().catch((error) => {
  logger.error(error, "Worker bootstrap failed");
  process.exit(1);
});
