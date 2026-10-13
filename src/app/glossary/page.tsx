import type {Metadata} from "next";
import Link from "next/link";

import {DocsPage} from "@/components/docs/docs-page";
import {Icon} from "@/components/icon";
import {isIconName} from "@/data/icons";
import {getGlossaryIndex} from "@/sanity/lib/glossary";
import {stegaClean} from "next-sanity";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Plain-English definitions for the energy terms behind the icons.",
};

export default async function GlossaryPage() {
  const entries = await getGlossaryIndex();

  return (
    <DocsPage
      title="Glossary"
      section="Project"
      lead="Plain-English definitions for the words behind the icons: what something is, what else it is called, and which glyph to use."
    >
      {entries.length === 0 ? (
        <p className="text-[13.5px] leading-[1.65] text-fg-muted">No definitions published yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => {
            const slug = stegaClean(entry.slug);
            const icon = stegaClean(entry.icon);
            return (
              <li key={entry._id}>
                <Link
                  href={`/glossary/${slug}`}
                  className="flex items-start gap-4 rounded-2xl border border-line bg-surface px-4 py-3 transition-colors hover:bg-hover"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-bg text-fg" aria-hidden="true">
                    {isIconName(icon) ? <Icon name={icon} size={24} /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-fg">{entry.term}</span>
                    {entry.summary ? <span className="mt-1 block text-[13px] leading-[1.6] text-fg-muted">{entry.summary}</span> : null}
                    {entry.aliases && entry.aliases.length > 0 ? (
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {entry.aliases.map((alias) => (
                          <span key={alias} className="rounded-full bg-bg px-2 py-0.5 text-[11px] text-fg-muted">
                            {alias}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DocsPage>
  );
}
