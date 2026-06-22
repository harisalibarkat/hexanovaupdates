import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp", "image/x-icon"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only PNG, JPG, SVG, WebP, ICO allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 2 MB)" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
  const filename =
    type === "favicon"    ? `favicon.${ext}`    :
    type === "logo-light" ? `logo-light.${ext}` :
    type === "logo-dark"  ? `logo-dark.${ext}`  :
                            `logo.${ext}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      allowOverwrite: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload] Vercel Blob upload failed:", msg);
    return NextResponse.json({ error: `Could not upload file: ${msg}` }, { status: 500 });
  }
}
