
import { settingsSchema, updateSettings } from "@/server/settings";

export type SettingsFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  "use server";

  try {
    const scheduler = {
      ratePerDay: Number(formData.get("scheduler.ratePerDay") ?? 1),
      publishTimes: splitValues(formData.get("scheduler.publishTimes")),
      timezone: String(formData.get("scheduler.timezone") ?? ""),
    };

    const prompts = {
      system: String(formData.get("prompts.system") ?? ""),
      textTemplate: String(formData.get("prompts.textTemplate") ?? ""),
      imageTemplate: String(formData.get("prompts.imageTemplate") ?? ""),
    };

    const limits = {
      dailyMax: Number(formData.get("limits.dailyMax") ?? 5),
    };

    const seo = {
      siteName: String(formData.get("seo.siteName") ?? ""),
      defaultMeta: {
        title: nullableString(formData.get("seo.defaultMeta.title")),
        description: nullableString(formData.get("seo.defaultMeta.description")),
      },
    };

    const payload = settingsSchema.parse({
      scheduler,
      prompts,
      limits,
      seo,
    });

    const updated = await updateSettings(payload);
    return {
      status: "success",
      message: `Ayarlar kaydedildi. ${updated} satır güncellendi.`,
    };
  } catch (error) {
    console.error("Settings update failed", error);
    return {
      status: "error",
      message: "Ayarlar kaydedilirken bir hata oluştu.",
    };
  }
}

function splitValues(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function nullableString(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : undefined;
}
