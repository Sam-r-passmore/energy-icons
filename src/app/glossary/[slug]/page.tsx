import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {stegaClean} from "next-sanity";

import {DocsPage} from "@/components/docs/docs-page";
import {GlossaryBody} from "@/components/glossary/glossary-body";
import {FindInLibrary} from "@/components/glossary/find-in-library";
import {Icon} from "@/components/icon";
import {getIconMeta, isIconName} from "@/data/icons";
import {getGlossaryEntry, getGlossaryLinks} from "@/sanity/lib/glossary";

export const dynamicParams = true;

export async function generateStaticParams() {
  const links = await getGlossaryLinks();
  return links.map((entry) => ({slug: entry.slug}));
}

export async function generateMetadata({params}: PageProps<"/glossary/[slug]">): Promise<Metadata> {
  const {slug} = await params;
  const entry = await getGlossaryEntry(slug);
  if (!entry) return {title: "Not found"};
  return {
    title: stegaClean(entry.term),
    description: entry.summary ? stegaClean(entry.summary) : undefined,
  };
}

export default async function GlossaryEntryPage({params}: PageProps<"/glossary/[slug]">) {
  const {slug} = await params;
  const entry = await getGlossaryEntry(slug);
  if (!entry) notFound();

  const icon = stegaClean(entry.icon);
  const knownIcon = isIconName(icon) ? icon : null;
  const related = (entry.related ?? []).flatMap((item) => {
    const relatedSlug = item.slug ? stegaClean(item.slug) : "";
    const term = item.term ? stegaClean(item.term) : "";
    if (!relatedSlug || !term) return [];
    return [{id: item._id, slug: relatedSlug, term: item.term}];
  });

  return (
    <DocsPage title={entry.term} section="Glossary" lead={entry.summary ?? ""}>
      <div className="flex flex-wrap items-center gap-3">
        {knownIcon ? (
          <span className="grid size-12 place-items-center rounded-2xl border border-line bg-surface text-fg" aria-hidden="true">
            <Icon name={knownIcon} size={28} />
          </span>
        ) : null}
        <div className="flex min-w-0 flex-col gap-2">
          {entry.aliases && entry.aliases.length > 0 ? (
            <p className="text-[12px] text-fg-muted">
              Also called {entry.aliases.map((alias) => stegaClean(alias)).join(", ")}
            </p>
          ) : null}
          {knownIcon ? <FindInLibrary name={getIconMeta(knownIcon).name} /> : null}
        </div>
      </div>

      {entry.body && entry.body.length > 0 ? <GlossaryBody value={entry.body} /> : null}

      {related.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-[14px] font-semibold text-fg">Related</h2>
          <ul className="flex flex-col gap-1">
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/glossary/${item.slug}`} className="text-[13.5px] text-fg-muted underline-offset-2 hover:text-fg hover:underline">
                  {item.term}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </DocsPage>
  );
}
