"use client";

import { useRef, useState } from "react";

interface Props {
  type: "logo" | "favicon";
  currentUrl?: string;
  onUploaded: (url: string) => void;
  label?: string;
}

export function LogoUploader({ type, currentUrl, onUploaded, label }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl ?? "");
  const [imgBroken, setImgBroken] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Upload failed");
      const cleanUrl = data.url!;
      setImgBroken(false);
      // Cache-buster in preview only; stored URL stays clean so it stays valid after rebuilds
      setPreview(`${cleanUrl}?v=${Date.now()}`);
      onUploaded(cleanUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {preview && !imgBroken && (
          <div className="w-16 h-16 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={type}
              className="max-w-full max-h-full object-contain"
              onError={() => setImgBroken(true)}
            />
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                Uploading…
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload {label ?? (type === "logo" ? "Logo" : "Favicon")}
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground mt-1">PNG, SVG, WebP — max 2 MB</p>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
