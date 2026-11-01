import { LoaderCircle } from "lucide-react";
export default function Loading() {
  return <div className="container inner-page" role="status" aria-live="polite"><div className="empty-state" style={{ minHeight: "55vh" }}><LoaderCircle size={28} className="spin" /><h2>Finding your next chapter…</h2><p>Loading the learning collection.</p></div></div>;
}
