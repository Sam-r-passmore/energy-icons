import {defineQuery} from "next-sanity";

export const GLOSSARY_INDEX_QUERY = defineQuery(`
  *[_type == "glossaryEntry" && defined(slug.current)] | order(term asc) {
    _id,
    term,
    "slug": slug.current,
    icon,
    summary,
    aliases
  }
`);

export const GLOSSARY_ENTRY_QUERY = defineQuery(`
  *[_type == "glossaryEntry" && slug.current == $slug][0] {
    _id,
    term,
    "slug": slug.current,
    icon,
    summary,
    aliases,
    body[]{
      ...,
      _key
    },
    related[]->{
      _id,
      term,
      "slug": slug.current,
      icon
    }
  }
`);
