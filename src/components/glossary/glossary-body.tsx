import {PortableText, type PortableTextComponents} from "next-sanity";

import type {GLOSSARY_ENTRY_QUERY_RESULT} from "@/sanity/types";

type GlossaryBodyValue = NonNullable<NonNullable<GLOSSARY_ENTRY_QUERY_RESULT>["body"]>;

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="text-[13.5px] leading-[1.65] text-fg-muted">{children}</p>,
    h2: ({children}) => <h2 className="text-[14px] font-semibold text-fg">{children}</h2>,
  },
  list: {
    bullet: ({children}) => <ul className="flex flex-col gap-1.5 pl-4 text-[13.5px] leading-[1.65] text-fg-muted">{children}</ul>,
  },
  marks: {
    link: ({children, value}) => (
      <a href={value?.href} className="text-fg underline decoration-line underline-offset-2 hover:decoration-fg">
        {children}
      </a>
    ),
  },
};

export const GlossaryBody = ({value}: {value: GlossaryBodyValue}) => {
  return <PortableText components={components} value={value} />;
};
