"use client";

import { useEffect } from "react";

interface Props {
  postId?: string;
}

export function PageViewTracker({ postId }: Props) {
  useEffect(() => {
    let sessionId = sessionStorage.getItem("hnu_sid");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("hnu_sid", sessionId);
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        postId: postId ?? null,
        referrer: document.referrer || null,
        sessionId,
      }),
    }).catch(() => {});
  }, [postId]);

  return null;
}
