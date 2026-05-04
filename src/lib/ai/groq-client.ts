import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getGroqClients(): Promise<Groq[]> {
  const [keysRow, singleKeyRow] = await Promise.all([
    db.query.settings.findFirst({ where: eq(settings.key, "groq_api_keys") }),
    db.query.settings.findFirst({ where: eq(settings.key, "groq_api_key") }),
  ]);

  let keys: string[] = [];
  try {
    const parsed = JSON.parse(keysRow?.value ?? "[]");
    if (Array.isArray(parsed)) keys = parsed.filter((k: unknown) => typeof k === "string" && k.trim());
  } catch {}

  if (keys.length === 0 && singleKeyRow?.value?.trim()) {
    keys = [singleKeyRow.value.trim()];
  }
  if (keys.length === 0) {
    const envKey = process.env.GROQ_API_KEY?.trim() ?? "";
    if (envKey) keys = [envKey];
  }

  return keys.map((apiKey) => new Groq({ apiKey }));
}

export async function getGroqModel(): Promise<string> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, "groq_model") });
  return row?.value?.trim() || "llama-3.1-8b-instant";
}

type CompletionParams = Parameters<Groq["chat"]["completions"]["create"]>[0];

function isRateLimitError(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  // 429 = rate limit, 503 = service unavailable (often also rate-limit related)
  return status === 429 || status === 503;
}

export async function groqChatWithFallback(
  clients: Groq[],
  params: CompletionParams
): Promise<Groq.Chat.ChatCompletion> {
  if (clients.length === 0) throw new Error("No Groq API keys configured. Add at least one key in Settings → AI & Content.");

  let lastErr: unknown;
  for (let i = 0; i < clients.length; i++) {
    try {
      return (await clients[i].chat.completions.create(params)) as Groq.Chat.ChatCompletion;
    } catch (err: unknown) {
      if (isRateLimitError(err) && i < clients.length - 1) {
        console.warn(`[Groq] Key ${i + 1} rate limited (status ${(err as { status?: number })?.status}), trying key ${i + 2}…`);
        lastErr = err;
        continue;
      }
      // Last key or non-rate-limit error — throw a plain serializable Error
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Groq API error: ${message}`);
    }
  }
  throw new Error("All Groq API keys are rate-limited. Please wait a minute and try again.");
}
