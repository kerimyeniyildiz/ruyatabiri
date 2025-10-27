
"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { SettingsFormState } from "./actions";
import { updateSettingsAction } from "./actions";

type SettingsFormProps = {
  initialSettings: {
    scheduler: {
      ratePerDay: number;
      publishTimes: string[];
      timezone: string;
    };
    prompts: {
      system: string;
      textTemplate: string;
      imageTemplate: string;
    };
    limits: {
      dailyMax: number;
    };
    seo: {
      siteName: string;
      defaultMeta?: {
        title?: string;
        description?: string;
      };
    };
  };
};

const initialState: SettingsFormState = { status: "idle" };

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [state, formAction] = useFormState(updateSettingsAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Planlayıcı</h3>
          <p className="text-xs text-slate-500">
            Günlük üretim temposu ve yayın saatleri. Saatler virgülle ayrılmıştır (örn.
            09:00, 15:30).
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Günlük üretim
            <select
              name="scheduler.ratePerDay"
              defaultValue={initialSettings.scheduler.ratePerDay}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value={1}>Günde 1</option>
              <option value={3}>Günde 3</option>
              <option value={5}>Günde 5</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Saatler
            <input
              type="text"
              name="scheduler.publishTimes"
              defaultValue={initialSettings.scheduler.publishTimes.join(", ")}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Zaman dilimi
            <input
              type="text"
              name="scheduler.timezone"
              defaultValue={initialSettings.scheduler.timezone}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Prompts</h3>
          <p className="text-xs text-slate-500">
            GPT-5 üretiminde kullanılacak sistem, içerik ve görsel prompt metinleri.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
            Sistem Promptu
            <textarea
              name="prompts.system"
              defaultValue={initialSettings.prompts.system}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Metin Promptu
            <textarea
              name="prompts.textTemplate"
              defaultValue={initialSettings.prompts.textTemplate}
              rows={5}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Görsel Promptu
            <textarea
              name="prompts.imageTemplate"
              defaultValue={initialSettings.prompts.imageTemplate}
              rows={5}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Limitler</h3>
          <p className="text-xs text-slate-500">Günlük maksimum üretim/bütçe sınırları.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Günlük limit
            <input
              type="number"
              name="limits.dailyMax"
              defaultValue={initialSettings.limits.dailyMax}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              min={1}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">SEO</h3>
          <p className="text-xs text-slate-500">
            Varsayılan meta bilgileri ve site adı. Başlık ≤60, açıklama ≤160 karakter.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Site adı
            <input
              type="text"
              name="seo.siteName"
              defaultValue={initialSettings.seo.siteName}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Varsayılan Başlık
            <input
              type="text"
              name="seo.defaultMeta.title"
              defaultValue={initialSettings.seo.defaultMeta?.title ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              maxLength={60}
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
            Varsayılan Açıklama
            <textarea
              name="seo.defaultMeta.description"
              defaultValue={initialSettings.seo.defaultMeta?.description ?? ""}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              maxLength={160}
            />
          </label>
        </div>
      </section>

      <footer className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Değişiklikler kaydedildiğinde planlayıcı yeniden yüklenir.</p>
        <SubmitButton />
      </footer>

      {state.status !== "idle" && (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Kaydediliyor..." : "Kaydet"}
    </button>
  );
}
