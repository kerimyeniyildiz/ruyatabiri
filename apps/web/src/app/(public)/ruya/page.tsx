import Link from "next/link";
import { prisma, DreamTitleStatus } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

export const revalidate = 3_600;

const PAGE_SIZE = 20;

type PageProps = {
  searchParams: { page?: string };
};

export default async function DreamIndexPage({ searchParams }: PageProps) {
  const page = Math.max(parseInt(searchParams.page ?? "1", 10) || 1, 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [dreams, total] = await Promise.all([
    prisma.dreamTitle.findMany({
      where: { status: DreamTitleStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        metaDescription: true,
        publishedAt: true,
      },
    }),
    prisma.dreamTitle.count({
      where: { status: DreamTitleStatus.PUBLISHED },
    }),
  ]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{siteConfig.name}</p>
        <h1 className="text-3xl font-semibold text-slate-900">Rüya Tabirleri</h1>
        <p className="text-sm text-slate-500">
          Yayınlanan son içerikler. Her yorum GPT-5 tarafından düzenlenir, kültürel hassasiyetler
          gözetilir.
        </p>
      </header>

      <section className="grid gap-4">
        {dreams.map((dream) => (
          <article
            key={dream.id}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <Link href={`/ruya/${dream.slug}`} className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">{dream.title}</h2>
              <p className="text-sm text-slate-600">
                {dream.metaDescription ??
                  `${dream.title} rüyasının anlamı ve olası yorumları.`}
              </p>
              {dream.publishedAt && (
                <p className="text-xs text-slate-400">
                  {new Date(dream.publishedAt).toLocaleDateString("tr-TR", {
                    dateStyle: "medium",
                  })}
                </p>
              )}
            </Link>
          </article>
        ))}
        {dreams.length === 0 && (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Henüz yayınlanmış içerik bulunmuyor.
          </p>
        )}
      </section>

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav className="flex items-center justify-between text-sm text-slate-600">
      <Link
        href={prevPage ? `/ruya?page=${prevPage}` : "#"}
        className={`rounded-md border px-3 py-2 ${
          prevPage
            ? "border-slate-300 hover:bg-slate-100"
            : "cursor-not-allowed border-slate-200 text-slate-400"
        }`}
        aria-disabled={!prevPage}
      >
        Önceki
      </Link>

      <p>
        Sayfa {currentPage} / {totalPages}
      </p>

      <Link
        href={nextPage ? `/ruya?page=${nextPage}` : "#"}
        className={`rounded-md border px-3 py-2 ${
          nextPage
            ? "border-slate-300 hover:bg-slate-100"
            : "cursor-not-allowed border-slate-200 text-slate-400"
        }`}
        aria-disabled={!nextPage}
      >
        Sonraki
      </Link>
    </nav>
  );
}
