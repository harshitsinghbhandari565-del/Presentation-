"use client";
import { BookOpen, RefreshCw } from "lucide-react";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="container inner-page"><div className="empty-state" style={{ minHeight: "55vh" }}><BookOpen size={36} strokeWidth={1.3} /><h1 style={{ fontSize: 32, fontWeight: 450 }}>A brief pause in the chapter.</h1><p>We couldn’t load this part of the library. Your original documents haven’t been changed. Please try again in a moment.</p><button className="button button-primary" onClick={reset}><RefreshCw size={16} />Try again</button></div></div>;
}
