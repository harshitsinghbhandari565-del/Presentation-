import type { Metadata } from "next";
import MariaDbWorkbench from "@/components/sql-workbench/MariaDbWorkbench";

export const metadata: Metadata = {
  title: "Experimental MariaDB Workbench",
  description: "Try MariaDB SQL in an experimental temporary browser sandbox.",
  robots: { index: false, follow: true },
};

export default function MariaDbPage() {
  return <div className="container inner-page"><MariaDbWorkbench /></div>;
}
