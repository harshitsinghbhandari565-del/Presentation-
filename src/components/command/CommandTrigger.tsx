"use client";
import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import CommandPalette from "./CommandPalette";
export default function CommandTrigger() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(value => !value); } };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);
  return <><button onClick={() => setOpen(true)} className="header-search" aria-label="Search resources (Command or Control K)" aria-haspopup="dialog" aria-expanded={open}><Search size={17} strokeWidth={1.7} /><span>Search</span><kbd>⌘ K</kbd></button><CommandPalette isOpen={open} onClose={close} /></>;
}
