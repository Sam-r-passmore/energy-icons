import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { DOCS_PAGES } from "@/data/docs";
import { getNonEmptyCategories } from "@/lib/icons/filter";
import { categoryHref } from "@/lib/routes";
import { getGlossaryLinks } from "@/sanity/lib/glossary";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const glossary = await getGlossaryLinks();
  const paths = [
    "/",
    ...getNonEmptyCategories().map((category) => categoryHref(category.id)),
    ...DOCS_PAGES.map((doc) => doc.href),
    "/roadmap",
    "/glossary",
    ...glossary.map((entry) => `/glossary/${entry.slug}`),
  ];
  return paths.map((path) => ({ url: `${siteConfig.url}${path}` }));
}
