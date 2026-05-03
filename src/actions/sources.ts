"use server";

import { db } from "@/lib/db";
import { rssSources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { z } from "zod";

const sourceSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  category: z.enum(["tech", "celebs", "viral", "finance", "health", "travel"]),
  country: z.string().max(10).optional(),
  language: z.string().max(10).optional(),
});

export async function createSource(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = sourceSchema.parse({
    name: formData.get("name"),
    url: formData.get("url"),
    category: formData.get("category"),
    country: formData.get("country") || undefined,
    language: formData.get("language") || undefined,
  });

  await db.insert(rssSources).values({
    ...parsed,
    country: parsed.country ?? null,
    language: parsed.language ?? "en",
  });
  revalidatePath("/admin/sources");
}

export async function toggleSource(sourceId: string, isActive: boolean) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.update(rssSources).set({ isActive }).where(eq(rssSources.id, sourceId));
  revalidatePath("/admin/sources");
}

export async function deleteSource(sourceId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.delete(rssSources).where(eq(rssSources.id, sourceId));
  revalidatePath("/admin/sources");
}
