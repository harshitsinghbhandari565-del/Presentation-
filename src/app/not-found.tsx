import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
export default function NotFound() {
  return <div className="container inner-page"><div className="empty-state" style={{ minHeight: "55vh" }}><BookOpen size={38} strokeWidth={1.2} /><div className="eyebrow" style={{ marginBottom: 17 }}>404 · A PAGE OUT OF PLACE</div><h1 style={{ fontSize: 36, fontWeight: 450 }}>This page isn’t on the shelf.</h1><p>The resource may have moved or been archived. There’s still plenty to discover in the library.</p><Link href="/library" className="button button-primary"><ArrowLeft size={16} />Back to the library</Link></div></div>;
}
