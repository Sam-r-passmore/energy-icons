"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CONSENT_RESET_EVENT, readConsent, saveConsent, type Consent } from "@/lib/consent";

/**
 * A small card in the bottom corner asking about analytics cookies. Shown only
 * until the visitor chooses; it never blocks the page.
 */
export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = () => {
      setOpen(true);
      // Let the card mount first so it can fade in.
      timer = setTimeout(() => setVisible(true), 20);
    };
    // A short pause so the page settles before the card appears.
    const initial = readConsent() === null ? setTimeout(show, 900) : undefined;
    window.addEventListener(CONSENT_RESET_EVENT, show);
    return () => {
      clearTimeout(initial);
      clearTimeout(timer);
      window.removeEventListener(CONSENT_RESET_EVENT, show);
    };
  }, []);

  if (!open) return null;

  const choose = (consent: Consent) => {
    saveConsent(consent);
    setVisible(false);
    setTimeout(() => setOpen(false), 200);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className={`fixed bottom-4 left-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-line bg-main/90 py-1.5 pr-1.5 pl-4 text-[12px] text-fg-muted shadow-[0_4px_20px_rgb(0_0_0/0.06)] backdrop-blur-md transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none max-sm:right-4 max-sm:rounded-2xl max-sm:flex-wrap max-sm:py-3 max-sm:pr-3 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      }`}
    >
      <p className="min-w-0 leading-snug">
        Analytics cookies help show which icons get used.{" "}
        <Link href="/docs/license#privacy" className="text-fg-subtle underline underline-offset-2 hover:text-fg">
          Privacy
        </Link>
      </p>
      <div className="flex shrink-0 items-center gap-1 max-sm:ml-auto">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="h-7 rounded-full px-3 text-[12px] font-medium text-fg-muted transition-colors hover:bg-hover hover:text-fg"
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="h-7 rounded-full bg-primary px-3 text-[12px] font-medium text-primary-fg transition-colors hover:bg-primary-hover"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
