"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function OpenSharedQuery({ sql }: { sql: string }) {
  const [error, setError] = useState(""); const router = useRouter();
  function open() {
    try {
      const raw = sessionStorage.getItem("presentation-hub-sql-workspace-v2");
      if (raw) { const value = JSON.parse(raw); if (Array.isArray(value.tabs) && value.tabs.length >= 10) { setError("Close a SQL tab before opening this query."); return; } }
      sessionStorage.setItem("presentation-hub-sql-pending-query", sql);
      router.push("/sql-workbench");
    } catch { setError("Browser session storage is unavailable. Copy the query manually."); }
  }
  return <><button className="button button-secondary" onClick={open}>Open in editor</button>{error && <p role="alert">{error}</p>}</>;
}
