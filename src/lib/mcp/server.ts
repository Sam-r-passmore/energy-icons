/**
 * The Energy Icons MCP server: the tools behind the Claude connector and the
 * ChatGPT app. Both clients speak MCP, so one server serves them both; the
 * route in src/app/mcp/route.ts mounts it over Streamable HTTP.
 *
 * Every tool is read-only and public: icons are open source, so there is no
 * auth and nothing is written.
 */
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { getMasterForSize, ICON_WEIGHTS, OPTICAL_MASTER_BREAKPOINT } from "@/config/icons";
import { siteConfig } from "@/config/site";
import { CATEGORIES, CATEGORY_LABELS } from "@/data/categories";
import { icons, isIconName } from "@/data/icons";
import { filterIcons, getNonEmptyCategories, TOTAL_ICONS, type IconEntry } from "@/lib/icons/filter";
import { getIconSvg, hasWeight, resolveWeight } from "@/lib/icons";
import { getIconCdnUrl, getIconSnippet } from "@/lib/icons/snippets";
import { categoryHref } from "@/lib/routes";

export const MCP_INSTRUCTIONS = `Energy Icons is an open-source (MIT) library of ${TOTAL_ICONS} stroke icons for renewable energy, the energy transition, engineering and interface use, by ${siteConfig.links.author.label}.
Use search_icons to find icons by concept (e.g. "wind turbine", "battery", "heat pump"), then get_icon for the SVG markup, a CDN URL and code snippets.
Icons come in Regular and Bold weights and are drawn on two optical masters (20 and 48): sizes below ${OPTICAL_MASTER_BREAKPOINT}px use the 20 master, larger sizes the 48 master. SVGs use currentColor, so they inherit the surrounding text colour.
Browse the full set at ${siteConfig.url}.`;

const categoryIds = CATEGORIES.map((c) => c.id) as [string, ...string[]];

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

const normalise = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

/**
 * The site's filter needs every term to match. Models often ask in phrases
 * ("solar panel on a roof"), so when that finds nothing, fall back to ranking
 * icons by how many terms they match.
 */
function searchIcons(query: string, category: string | undefined): IconEntry[] {
  const scope = (category ?? "all") as Parameters<typeof filterIcons>[1];
  const strict = filterIcons(query, scope);
  if (strict.length || !query.trim()) return strict;

  const terms = normalise(query).split(/\s+/).filter((t) => t.length > 2);
  return icons
    .filter((icon) => !category || icon.category === category)
    .map((icon) => {
      const haystack = normalise([icon.name, icon.slug, ...icon.keywords].join(" | "));
      return { icon, score: terms.filter((term) => haystack.includes(term)).length };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((hit) => hit.icon);
}

const summarise = (icon: IconEntry) => ({
  name: icon.slug,
  title: icon.name,
  category: icon.category,
  keywords: [...icon.keywords],
  weights: ICON_WEIGHTS.filter((w) => hasWeight(icon.slug, w)),
});

const json = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  structuredContent: value as Record<string, unknown>,
});

export function registerEnergyIconTools(server: McpServer) {
  server.registerTool(
    "search_icons",
    {
      title: "Search icons",
      description:
        "Search the Energy Icons library by name, keyword or concept (e.g. 'solar', 'EV charger', 'hydrogen'). Returns icon names to pass to get_icon. Leave the query empty to list a whole category.",
      inputSchema: z.object({
        query: z.string().default("").describe("Words to match against icon names and keywords"),
        category: z.enum(categoryIds).optional().describe("Limit results to one category (see list_categories)"),
        limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of results"),
      }),
      annotations: { title: "Search icons", ...readOnly },
    },
    async ({ query, category, limit }) => {
      const hits = searchIcons(query, category);
      return json({ total: hits.length, icons: hits.slice(0, limit).map(summarise) });
    },
  );

  server.registerTool(
    "get_icon",
    {
      title: "Get icon",
      description:
        "Get one icon as ready-to-use SVG markup at a given size and weight, plus a CDN URL and a React snippet. The SVG uses currentColor.",
      inputSchema: z.object({
        name: z.string().describe("Icon name from search_icons, e.g. 'wind-turbine'"),
        size: z.number().int().min(8).max(512).default(24).describe("Rendered size in px"),
        weight: z.enum(ICON_WEIGHTS).default("regular").describe("Regular or Bold; falls back to Regular if the icon has no Bold"),
      }),
      annotations: { title: "Get icon", ...readOnly },
    },
    async ({ name, size, weight }) => {
      if (!isIconName(name)) {
        const suggestions = searchIcons(name.replace(/-/g, " "), undefined).slice(0, 5).map((i) => i.slug);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `No icon named "${name}".${suggestions.length ? ` Did you mean: ${suggestions.join(", ")}?` : " Try search_icons."}`,
            },
          ],
        };
      }
      const meta = icons.find((i) => i.slug === name)!;
      const resolved = resolveWeight(name, weight);
      return json({
        name,
        title: meta.name,
        category: CATEGORY_LABELS[meta.category],
        size,
        weight: resolved,
        master: getMasterForSize(size),
        svg: getIconSvg(name, size, resolved),
        cdnUrl: getIconCdnUrl(name, size, resolved),
        react: getIconSnippet("react", name, size, resolved),
        page: `${siteConfig.url}${categoryHref(meta.category)}`,
        license: "MIT",
      });
    },
  );

  server.registerTool(
    "list_categories",
    {
      title: "List categories",
      description: "List the icon categories and how many icons each has.",
      inputSchema: z.object({}),
      annotations: { title: "List categories", ...readOnly },
    },
    async () => json({ total: TOTAL_ICONS, categories: getNonEmptyCategories() }),
  );
}
