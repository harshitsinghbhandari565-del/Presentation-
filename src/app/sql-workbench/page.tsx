import type { Metadata } from "next";
import Workbench from "@/components/sql-workbench/Workbench";

export const metadata: Metadata = { title: "SQL Workbench", description: "Practice real SQLite queries in a private, browser-based sandbox with classroom sample databases.", alternates: { canonical: "/sql-workbench" } };

export default function SqlWorkbenchPage() {
  return <div className="container inner-page"><Workbench /></div>;
}
