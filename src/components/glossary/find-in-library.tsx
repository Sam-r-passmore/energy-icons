"use client";

import {LibraryLink} from "@/components/layout/library-link";
import {useLibrary} from "@/components/library/library-provider";

/** Opens the library with the search filled in, so the glyph is the first result. */
export const FindInLibrary = ({name}: {name: string}) => {
  const {setQuery, setDrawerOpen} = useLibrary();

  const handleClick = () => {
    setQuery(name);
    setDrawerOpen(false);
  };

  return (
    <LibraryLink
      href="/"
      onClick={handleClick}
      className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[12px] font-medium text-fg hover:bg-hover"
    >
      Find in the library
    </LibraryLink>
  );
};
