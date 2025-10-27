import SettingsForm from "./settings/settings-form";
import { getSettings } from "@/server/settings";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">Ayarlar</h2>
        <p className="text-sm text-slate-500">
          Yayın temposu, prompt metinleri ve genel limitleri buradan yönetebilirsiniz.
        </p>
      </header>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
