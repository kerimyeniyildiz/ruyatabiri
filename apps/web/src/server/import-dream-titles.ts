import { Prisma } from "@prisma/client";
import { prisma, DreamTitleStatus } from "@/lib/prisma";
import { normalizeTitle, slugifyTr } from "@/lib/slugify";

export type ImportStats = {
  total: number;
  created: number;
  skippedExisting: number;
  skippedInvalid: number;
  duplicatesInFile: number;
};

export type ImportResult = {
  stats: ImportStats;
  queued: number;
};

export async function importDreamTitles(rawTitles: string[]): Promise<ImportResult> {
  const stats: ImportStats = {
    total: rawTitles.length,
    created: 0,
    skippedExisting: 0,
    skippedInvalid: 0,
    duplicatesInFile: 0,
  };

  if (rawTitles.length === 0) {
    return { stats, queued: 0 };
  }

  const deduped: Array<{ title: string; normalized: string }> = [];
  const seenNormalized = new Set<string>();

  for (const rawTitle of rawTitles) {
    const trimmed = rawTitle.trim();
    if (!trimmed) {
      stats.skippedInvalid += 1;
      continue;
    }
    const normalized = normalizeTitle(trimmed);
    if (!normalized) {
      stats.skippedInvalid += 1;
      continue;
    }
    if (seenNormalized.has(normalized)) {
      stats.duplicatesInFile += 1;
      continue;
    }
    seenNormalized.add(normalized);
    deduped.push({ title: trimmed, normalized });
  }

  if (deduped.length === 0) {
    return { stats, queued: 0 };
  }

  const existing = await prisma.dreamTitle.findMany({
    where: {
      titleNormalized: { in: deduped.map((item) => item.normalized) },
    },
    select: {
      titleNormalized: true,
    },
  });

  const existingSet = new Set(existing.map((item) => item.titleNormalized));
  const slugsInBatch = new Set<string>();

  const records: Prisma.DreamTitleCreateManyInput[] = [];

  for (const item of deduped) {
    if (existingSet.has(item.normalized)) {
      stats.skippedExisting += 1;
      continue;
    }

    const baseSlug = slugifyTr(item.title) || slugifyTr(item.normalized) || "ruya";
    const slug = await ensureUniqueSlug(baseSlug, slugsInBatch);

    records.push({
      title: item.title,
      titleNormalized: item.normalized,
      slug,
      status: DreamTitleStatus.QUEUED,
    });
  }

  if (records.length > 0) {
    const result = await prisma.dreamTitle.createMany({
      data: records,
      skipDuplicates: true,
    });
    stats.created = result.count;
  }

  return {
    stats,
    queued: records.length,
  };
}

async function ensureUniqueSlug(baseSlug: string, slugsInBatch: Set<string>) {
  let attempt = 0;
  let candidate = baseSlug;

  while (true) {
    const existsInBatch = slugsInBatch.has(candidate);
    const existsInDb = await prisma.dreamTitle.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existsInBatch && !existsInDb) {
      slugsInBatch.add(candidate);
      return candidate;
    }
    attempt += 1;
    candidate = `${baseSlug}-${attempt + 1}`;
  }
}
