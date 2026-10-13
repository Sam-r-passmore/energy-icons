import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import type { ReactNode } from "react";

import { SanityLive } from "@/sanity/lib/live";

/** Live preview stays on the glossary, so the icon library can stay static. */
export default async function GlossaryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SanityLive />
      {(await draftMode()).isEnabled && <VisualEditing />}
    </>
  );
}
