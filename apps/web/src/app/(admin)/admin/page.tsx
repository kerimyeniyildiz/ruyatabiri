import { prisma, DreamTitleStatus } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [statusCounts, upcomingToPublish] = await Promise.all([
    prisma.dreamTitle.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.dreamTitle.findMany({
      where: {
        status: { in: [DreamTitleStatus.QUEUED, DreamTitleStatus.READY] },
      },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
      select: { id: true, title: true, scheduledFor: true, status: true },
      take: 5,
    }),
  ]);

  const counters = Object.fromEntries(
    Object.values(DreamTitleStatus).map((status) => [
      status,
      statusCounts.find((item) => item.status === status)?._count ?? 0,
    ]),
  );

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-base font-semibold text-slate-900">Genel Durum</h2>
        <p className="text-sm text-slate-500">İçerik üretim hattındaki kayıtların özet görünümü.</p>
        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(counters).map(([status, count]) => (
            <div
              key={status}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <dt className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {status}
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-900">{count}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">Yaklaşan Yayınlar</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Başlık</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Planlanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingToPublish.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.scheduledFor
                      ? new Date(item.scheduledFor).toLocaleString("tr-TR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "-"}
                  </td>
                </tr>
              ))}
              {upcomingToPublish.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    Henüz planlanmış bir kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
