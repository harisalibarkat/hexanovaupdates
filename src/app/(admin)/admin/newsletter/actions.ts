"use server";

import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function unsubscribeUser(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db
    .update(subscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(subscribers.id, id));

  revalidatePath("/admin/newsletter");
}

export async function deleteSubscriber(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.delete(subscribers).where(eq(subscribers.id, id));

  revalidatePath("/admin/newsletter");
}
