"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";

type ImportState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const initialState: ImportState = { status: "idle" };

export default function ImportPage() {
  const [state, formAction] = useFormState(importAction, initialState);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">Başlık İçe Aktarma</h2>
        <p className="text-sm text-slate-500">
          Satır başı bir başlık olacak şekilde .txt dosyası yükleyebilir veya metin alanına
          yapıştırabilirsiniz.
        </p>
      </header>

      <form
        action={formAction}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="titles" className="text-sm font-medium text-slate-700">
            Metin
          </label>
          <textarea
            id="titles"
            name="titles"
            rows={10}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Rüyada uçmak&#10;Rüyada deniz görmek&#10;..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">.txt Dosyası</label>
          <input
            type="file"
            name="file"
            accept=".txt"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setFileName(file ? file.name : null);
            }}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-800 hover:file:bg-slate-200"
          />
          {fileName && <p className="text-xs text-slate-500">Seçilen dosya: {fileName}</p>}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Maksimum 1000 başlık önerilir. Çakışmalar otomatik temizlenir.
          </p>
          <SubmitButton />
        </div>

        {state.status !== "idle" && (
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              state.status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </div>
        )}
      </form>
    </div>
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
      {pending ? "İçe aktarılıyor..." : "İçe aktar"}
    </button>
  );
}

async function importAction(_: ImportState, formData: FormData): Promise<ImportState> {
  "use server";

  const { importDreamTitles } = await import("@/server/import-dream-titles");
  const file = formData.get("file");
  const textField = formData.get("titles");

  const titles: string[] = [];

  if (typeof textField === "string" && textField.trim().length > 0) {
    titles.push(...splitLines(textField));
  }

  if (file instanceof File) {
    const content = await file.text();
    titles.push(...splitLines(content));
  }

  if (titles.length === 0) {
    return { status: "error", message: "İçe aktarılacak başlık bulunamadı." };
  }

  try {
    const result = await importDreamTitles(titles);
    return {
      status: "success",
      message: `Toplam ${result.stats.total} satır işlendi. ${result.stats.created} yeni kayıt eklendi, ${result.stats.skippedExisting} mevcut, ${result.stats.duplicatesInFile} tekrar, ${result.stats.skippedInvalid} geçersiz satır.`,
    };
  } catch (error) {
    console.error("Import failed", error);
    return { status: "error", message: "İçe aktarma başarısız oldu." };
  }
}

function splitLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
