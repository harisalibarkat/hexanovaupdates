"use client";

import { useTransition, useState } from "react";
import { changePasswordAction } from "@/actions/auth";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await changePasswordAction(fd);
      setResult(res);
      if (res.success) (e.target as HTMLFormElement).reset();
    });
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4 max-w-2xl">
      <h2 className="font-bold text-base border-b border-border pb-3">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field name="current_password" label="Current Password" />
        <Field name="new_password" label="New Password" />
        <Field name="confirm_password" label="Confirm New Password" />

        {result?.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{result.error}</p>
        )}
        {result?.success && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">Password updated successfully.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}

function Field({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
      <input
        type="password"
        name={name}
        required
        className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </div>
  );
}
