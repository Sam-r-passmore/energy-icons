import {createClient} from "next-sanity";

/** Public project. Published glossary entries are readable without a token. */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "oyh3ejkm";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2026-10-13";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
