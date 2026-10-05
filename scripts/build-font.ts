/**
 * Builds the icon font into packages/energy-icons/font/ from the 20px masters:
 *   font/regular/EnergyIcons-Regular.woff2 + style.css   class="ei ei-<slug>"
 *   font/bold/EnergyIcons-Bold.woff2 + style.css         class="ei-b ei-<slug>"
 *   font/style.css                                       both weights in one file
 *
 * A font holds one drawing per glyph, so it uses the 20 master only.
 * Codepoints live in packages/energy-icons/codepoints.json, which is committed:
 * an icon keeps its codepoint forever, new icons take the next free one, and a
 * removed icon's codepoint is never reused.
 *
 * Run with `npm run package`.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import svg2ttf from "svg2ttf";
import { SVGIcons2SVGFontStream } from "svgicons2svgfont";
import wawoff2 from "wawoff2";

import { getMasterFileName, type IconWeight } from "../src/config/icons";
import { icons } from "../src/data/icons";

const ROOT = path.resolve(__dirname, "..");
const ICONS_DIR = path.join(ROOT, "icons");
const PKG = path.join(ROOT, "packages/energy-icons");
const OUT = path.join(PKG, "font");
const CODEPOINTS_FILE = path.join(PKG, "codepoints.json");

/** First codepoint in the Unicode Private Use Area. */
const FIRST_CODEPOINT = 0xe000;
/** Glyphs are drawn on a 1000-unit em; the icon spans -DESCENT..ASCENT so it sits on the text like a letter. */
const EM = 1000;
const DESCENT = 125;

const WEIGHTS: Record<IconWeight, { family: string; file: string; className: string }> = {
  regular: { family: "Energy Icons", file: "EnergyIcons-Regular", className: "ei" },
  bold: { family: "Energy Icons Bold", file: "EnergyIcons-Bold", className: "ei-b" },
};

function loadCodepoints(): Record<string, number> {
  const stored: Record<string, string> = existsSync(CODEPOINTS_FILE) ? JSON.parse(readFileSync(CODEPOINTS_FILE, "utf8")) : {};
  const codepoints: Record<string, number> = {};
  for (const [slug, hex] of Object.entries(stored)) codepoints[slug] = parseInt(hex, 16);

  let next = Math.max(FIRST_CODEPOINT - 1, ...Object.values(codepoints)) + 1;
  for (const icon of icons) {
    if (codepoints[icon.slug] === undefined) codepoints[icon.slug] = next++;
  }
  if (next > 0xf8ff) throw new Error("Icon font is out of Private Use Area codepoints");

  const serialised = Object.fromEntries(
    Object.entries(codepoints)
      .sort(([, a], [, b]) => a - b)
      .map(([slug, cp]) => [slug, cp.toString(16)]),
  );
  writeFileSync(CODEPOINTS_FILE, `${JSON.stringify(serialised, null, 2)}\n`);
  return codepoints;
}

async function buildSvgFont(weight: IconWeight, codepoints: Record<string, number>): Promise<string> {
  const fontStream = new SVGIcons2SVGFontStream({
    fontName: WEIGHTS[weight].family,
    fontHeight: EM,
    ascent: EM - DESCENT,
    descent: DESCENT,
    normalize: false,
    fixedWidth: true,
    centerHorizontally: false,
    round: 10e3,
  });

  const chunks: Buffer[] = [];
  const done = new Promise<string>((resolve, reject) => {
    fontStream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    fontStream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    fontStream.on("error", reject);
  });

  for (const icon of icons) {
    const file = path.join(ICONS_DIR, icon.slug, getMasterFileName(20, weight));
    const glyph = Readable.from([readFileSync(file)]) as Readable & { metadata: { name: string; unicode: string[] } };
    glyph.metadata = { name: icon.slug, unicode: [String.fromCodePoint(codepoints[icon.slug])] };
    fontStream.write(glyph);
  }
  fontStream.end();
  return done;
}

function fontFace(weight: IconWeight, url: string) {
  return `@font-face {
  font-family: "${WEIGHTS[weight].family}";
  src: url("${url}") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: block;
}`;
}

function rules(weight: IconWeight, codepoints: Record<string, number>) {
  const { family, className } = WEIGHTS[weight];
  const base = `.${className} {
  font-family: "${family}" !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;
  const glyphs = icons.map(
    (icon) => `.${className}.ei-${icon.slug}::before { content: "\\${codepoints[icon.slug].toString(16)}"; }`,
  );
  return `${base}\n\n${glyphs.join("\n")}`;
}

async function main() {
  for (const { className } of Object.values(WEIGHTS)) {
    const clash = icons.find((icon) => `ei-${icon.slug}` === className);
    if (clash) throw new Error(`Icon "${clash.slug}" would share the class .${className} with a font weight`);
  }
  const codepoints = loadCodepoints();
  rmSync(OUT, { recursive: true, force: true });

  const combined: string[] = [];
  for (const weight of ["regular", "bold"] as const) {
    const { file } = WEIGHTS[weight];
    const svgFont = await buildSvgFont(weight, codepoints);
    const ttf = Buffer.from(svg2ttf(svgFont, { description: "Energy Icons, MIT licensed. energyicons.com" }).buffer);
    const woff2 = Buffer.from(await wawoff2.compress(ttf));

    const dir = path.join(OUT, weight);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, `${file}.woff2`), woff2);
    writeFileSync(
      path.join(dir, "style.css"),
      `/* Energy Icons ${weight}. MIT licensed. energyicons.com */\n${fontFace(weight, `./${file}.woff2`)}\n\n${rules(weight, codepoints)}\n`,
    );
    combined.push(`${fontFace(weight, `./${weight}/${file}.woff2`)}\n\n${rules(weight, codepoints)}`);
    console.log(`✓ ${weight} font: ${icons.length} glyphs, ${(woff2.length / 1024).toFixed(0)} KB woff2`);
  }

  writeFileSync(path.join(OUT, "style.css"), `/* Energy Icons. MIT licensed. energyicons.com */\n${combined.join("\n\n")}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
