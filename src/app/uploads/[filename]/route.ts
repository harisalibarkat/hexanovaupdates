import { readFile } from "fs/promises";
import { join, basename } from "path";
import { NextRequest, NextResponse } from "next/server";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  webp: "image/webp",
  ico: "image/x-icon",
  gif: "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safe = basename(filename); // strip any path traversal attempts
  const ext = safe.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME[ext] ?? "application/octet-stream";

  // Try file-uploads/ first (new location), fall back to public/uploads/ for
  // any files that were written there before this change.
  let file: Buffer;
  try {
    file = await readFile(join(process.cwd(), "file-uploads", safe));
  } catch {
    try {
      file = await readFile(join(process.cwd(), "public", "uploads", safe));
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  }

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
