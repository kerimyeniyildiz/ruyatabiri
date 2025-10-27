import Link from "next/link";
import { prisma, DreamTitleStatus } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TitlesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: DreamTitleStatus };
}) {
  const query = searchParams.q?.trim();
  const status = searchParams.status;

  const titles = await prisma.dreamTitle.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { slug: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        status ? { status } : {},
      ],
    },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      scheduledFor: true,
      publishedAt: true,
      lastGenerationAt: true,
    },
    take: 25,
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Başlıklar</h2>
          <p className="text-sm text-slate-500">Son eklenen 25 başlık listelenir.</p>
        </div>
        <Link
          href="/admin/import"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Başlık İçe Aktar
        </Link>
      </header>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Planlanan</th>
              <th className="px-4 py-3">Yayın</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {titles.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                <td className="px-4 py-3 text-slate-600">{item.slug}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.scheduledFor
                    ? new Date(item.scheduledFor).toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "-"}
                </td>
              </tr>
            ))}
            {titles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
