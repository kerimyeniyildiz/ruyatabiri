import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

export const schedulerSchema = z.object({
  ratePerDay: z
    .union([z.number().int().positive(), z.enum(["1", "3", "5"])])
    .transform((value) => (typeof value === "string" ? Number(value) : value)),
  publishTimes: z.array(z.string()),
  timezone: z.string().default(siteConfig.timezone),
});

export const promptsSchema = z.object({
  system: z.string().min(1),
  textTemplate: z.string().min(1),
  imageTemplate: z.string().min(1),
});

export const limitsSchema = z.object({
  dailyMax: z.number().int().positive(),
});

export const seoSchema = z.object({
  siteName: z.string().min(1).default(siteConfig.name),
  defaultMeta: z
    .object({
      title: z.string().max(60).optional(),
      description: z.string().max(160).optional(),
    })
    .default({}),
});

export const settingsSchema = z.object({
  scheduler: schedulerSchema.optional(),
  prompts: promptsSchema.optional(),
  limits: limitsSchema.optional(),
  seo: seoSchema.optional(),
});

export type SettingsPayload = z.infer<typeof settingsSchema>;

export async function getSettings() {
  const rows = await prisma.settings.findMany();
  const data: Record<string, unknown> = {};
  for (const row of rows) {
    data[row.key] = row.value;
  }
  return {
    scheduler: (data.scheduler as unknown) ?? defaultScheduler(),
    prompts: (data.prompts as unknown) ?? defaultPrompts(),
    limits: (data.limits as unknown) ?? defaultLimits(),
    seo: (data.seo as unknown) ?? defaultSeo(),
  };
}

export async function updateSettings(payload: SettingsPayload) {
  const parsed = settingsSchema.parse(payload);

  const entries = Object.entries(parsed).filter(
    (entry): entry is [string, NonNullable<(typeof parsed)[keyof typeof parsed]>] => Boolean(entry[1]),
  );

  if (entries.length === 0) return 0;

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    ),
  );
  return entries.length;
}

export function defaultScheduler() {
  return {
    ratePerDay: 1,
    publishTimes: ["09:00"],
    timezone: siteConfig.timezone,
  };
}

export function defaultPrompts() {
  return {
    system:
      "Kıdemli içerik editörüsün. Türkçe, sade ve abartısız yaz. Dini/kültürel hassasiyetlere saygılı ol; tıbbi/hukuki vaat verme. SEO başlık/açıklama sınırlarına uy.",
    textTemplate:
      "'{title}' başlığı için özgün bir rüya tabiri makalesi yaz. Akıcı bir anlatı kur; kısa paragraflar kullan. Gerektiğinde listeler ekleyebilirsin. Görsel için tek cümlelik image prompt ve alt üret.",
    imageTemplate:
      "Dream interpretation themed surreal yet calming visual for '{title}'. Warm tones, tranquil atmosphere, high detail.",
  };
}

export function defaultLimits() {
  return {
    dailyMax: Number(process.env.DAILY_PUBLICATION_LIMIT ?? 5),
  };
}

export function defaultSeo() {
  return {
    siteName: siteConfig.name,
    defaultMeta: {
      title: siteConfig.name,
      description: "Rüya tabirleri için GPT-5 destekli içerik platformu.",
    },
  };
}
