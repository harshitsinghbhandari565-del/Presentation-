"use client";
import React from "react";
import { Search } from "lucide-react";
import { VaultInput } from "@/components/primitive/input/VaultInput";

export default function SearchBar({
  onSearch,
}: {
  onSearch: (q: string) => void;
}) {
  return (
    <VaultInput 
        type="search"
        placeholder="Scan vault records..."
        leadingIcon={<Search size={18} className="text-indigo-400" />}
        onChange={(e) => onSearch(e.target.value)}
        className="shadow-inner"
    />
  );
}
