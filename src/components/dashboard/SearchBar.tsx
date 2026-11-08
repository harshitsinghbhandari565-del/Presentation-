"use client";
import { Search } from "lucide-react";
export default function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  return <div className="library-search-form"><Search size={19} aria-hidden="true" /><input type="search" placeholder="Search resources…" onChange={event => onSearch(event.target.value)} aria-label="Search resources" maxLength={200} /></div>;
}
