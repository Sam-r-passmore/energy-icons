"use client";

import {createContext, useContext, useMemo, type ReactNode} from "react";

import type {GlossaryLink} from "@/sanity/lib/types";

type GlossaryState = {
  byIcon: Map<string, GlossaryLink>;
  count: number;
};

const GlossaryContext = createContext<GlossaryState>({byIcon: new Map(), count: 0});

export const GlossaryProvider = ({entries, children}: {entries: GlossaryLink[]; children: ReactNode}) => {
  const value = useMemo<GlossaryState>(
    () => ({
      byIcon: new Map(entries.map((entry) => [entry.icon, entry])),
      count: entries.length,
    }),
    [entries],
  );

  return <GlossaryContext.Provider value={value}>{children}</GlossaryContext.Provider>;
};

export const useGlossaryEntry = (icon: string): GlossaryLink | undefined => useContext(GlossaryContext).byIcon.get(icon);

export const useGlossaryCount = (): number => useContext(GlossaryContext).count;
