"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Brand from "./Brand";
import ThemeToggle from "@/components/theme/ThemeToggle";
import ProjectorModeToggle from "@/components/projector/ProjectorModeToggle";
import CommandTrigger from "@/components/command/CommandTrigger";
const links = [{ href: "/", label: "Home" }, { href: "/library", label: "Library" }, { href: "/subjects", label: "Subjects" }, { href: "/#how-it-works", label: "How it works" }];
export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return <header className="site-header">
    <div className="container header-inner">
      <Brand />
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map(link => <Link key={link.href} href={link.href} className={pathname === link.href ? "nav-link active" : "nav-link"} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
      </nav>
      <div className="header-actions">
        <CommandTrigger />
        <span className="header-divider" />
        <span className="projector-desktop"><ProjectorModeToggle /></span>
        <ThemeToggle />
        <button className="icon-button mobile-menu-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </div>
    {open && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">
      {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={pathname === link.href ? "active" : ""}>{link.label}<ArrowUpRight size={17} aria-hidden="true" /></Link>)}
      <div className="mobile-projector"><ProjectorModeToggle /></div>
    </nav>}
  </header>;
}
