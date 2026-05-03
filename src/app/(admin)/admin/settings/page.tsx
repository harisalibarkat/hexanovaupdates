import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const allSettings = await db.query.settings.findMany();
  const settingsMap = Object.fromEntries(allSettings.map((s) => [s.key, s.value]));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsForm settings={settingsMap} />
    </div>
  );
}
