import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-16 text-slate-900">
      <div className="max-w-2xl space-y-6 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2rem] text-slate-500">
          Rüya Tabiri Platformu
        </p>
        <h1 className="text-3xl font-semibold">
          GPT-5 destekli rüya tabiri içerik ve görsel üretim sistemi.
        </h1>
        <p className="text-base text-slate-600">
          Admin panelinden başlıkları içe aktarın, günlük üretim temposunu
          planlayın ve otomatik olarak SEO uyumlu rüya tabirleri yayımlayın.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link
            href="/admin"
            className="rounded-full bg-slate-900 px-5 py-2 font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            Admin Paneline Git
          </Link>
          <Link
            href="/ruya"
            className="rounded-full border border-slate-200 px-5 py-2 font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            İçerik Listesi
          </Link>
        </div>
      </div>
    </div>
  );
}
