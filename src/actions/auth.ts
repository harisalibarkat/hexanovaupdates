"use server";

import { signIn, signOut, auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const current = formData.get("current_password") as string;
  const next = formData.get("new_password") as string;
  const confirm = formData.get("confirm_password") as string;

  if (!current || !next || !confirm) return { error: "All fields are required." };
  if (next !== confirm) return { error: "New passwords do not match." };
  if (next.length < 8) return { error: "Password must be at least 8 characters." };

  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  if (!user?.password) return { error: "User not found." };

  const { default: bcrypt } = await import("bcryptjs");
  if (!(await bcrypt.compare(current, user.password))) return { error: "Current password is incorrect." };

  await db.update(users).set({ password: await bcrypt.hash(next, 12) }).where(eq(users.id, user.id));
  return { success: true };
}
