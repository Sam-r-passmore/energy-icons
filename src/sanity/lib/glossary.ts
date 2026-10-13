import {stegaClean} from "next-sanity";

import {sanityFetch} from "@/sanity/lib/live";
import {GLOSSARY_ENTRY_QUERY, GLOSSARY_INDEX_QUERY} from "@/sanity/lib/queries";
import type {GlossaryLink} from "@/sanity/lib/types";
import type {GLOSSARY_ENTRY_QUERY_RESULT} from "@/sanity/types";

export type {GlossaryLink};

type IndexRow = {
  _id: string;
  term: string | null;
  slug: string | null;
  icon: string | null;
  summary: string | null;
  aliases: string[] | null;
};

export type GlossaryIndexEntry = {
  _id: string;
  term: string;
  slug: string;
  icon: string;
  summary: string | null;
  aliases: string[] | null;
};

export type GlossaryRelated = {
  _id: string;
  term: string | null;
  slug: string | null;
  icon: string | null;
};

export type GlossaryEntry = GlossaryIndexEntry & {
  body: NonNullable<GLOSSARY_ENTRY_QUERY_RESULT>["body"];
  related: GlossaryRelated[] | null;
};

const asEntry = (entry: IndexRow): GlossaryIndexEntry | null => {
  if (!entry.term || !entry.slug || !entry.icon) return null;
  if (!stegaClean(entry.slug) || !stegaClean(entry.icon)) return null;
  return {
    _id: entry._id,
    term: entry.term,
    slug: entry.slug,
    icon: entry.icon,
    summary: entry.summary,
    aliases: entry.aliases,
  };
};

/** Icon slug → glossary page, for the library dialog. Stega is off so slugs stay comparable. */
export const getGlossaryLinks = async (): Promise<GlossaryLink[]> => {
  try {
    const {data} = await sanityFetch({
      query: GLOSSARY_INDEX_QUERY,
      stega: false,
      perspective: "published",
    });
    return (data ?? []).flatMap((entry) => {
      const icon = entry.icon ? stegaClean(entry.icon) : "";
      const slug = entry.slug ? stegaClean(entry.slug) : "";
      const term = entry.term ? stegaClean(entry.term) : "";
      return icon && slug && term ? [{icon, slug, term}] : [];
    });
  } catch (error) {
    console.error("Glossary links unavailable", error);
    return [];
  }
};

export const getGlossaryIndex = async (): Promise<GlossaryIndexEntry[]> => {
  try {
    const {data} = await sanityFetch({query: GLOSSARY_INDEX_QUERY});
    return (data ?? []).flatMap((entry) => {
      const next = asEntry(entry);
      return next ? [next] : [];
    });
  } catch (error) {
    console.error("Glossary index unavailable", error);
    return [];
  }
};

export const getGlossaryEntry = async (slug: string): Promise<GlossaryEntry | null> => {
  try {
    const {data} = await sanityFetch({query: GLOSSARY_ENTRY_QUERY, params: {slug}});
    if (!data) return null;
    const next = asEntry(data);
    if (!next) return null;
    return {...next, body: data.body ?? null, related: data.related ?? null};
  } catch (error) {
    console.error("Glossary entry unavailable", error);
    return null;
  }
};
