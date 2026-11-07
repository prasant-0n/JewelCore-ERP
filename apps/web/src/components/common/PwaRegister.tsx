"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "[JewelCore PWA] Service Worker registered with scope:",
            registration.scope,
          );
        })
        .catch((error) => {
          console.warn("[JewelCore PWA] Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
