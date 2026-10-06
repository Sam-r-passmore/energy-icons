"use client";

import { resetConsent } from "@/lib/consent";

/** Inline link-style button that brings the cookie banner back. */
export function CookieSettingsButton() {
  return (
    <button type="button" onClick={resetConsent} className="text-accent underline-offset-2 hover:underline">
      cookie settings
    </button>
  );
}
