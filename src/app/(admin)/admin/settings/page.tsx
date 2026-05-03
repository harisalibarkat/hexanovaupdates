import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const allSettings = await db.query.settings.findMany();
  const settingsMap = Object.fromEntries(allSettings.map((s) => [s.key, s.value]));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ChangePasswordForm />
      <SettingsForm settings={settingsMap} />
    </div>
  );
}
