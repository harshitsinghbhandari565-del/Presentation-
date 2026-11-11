import Link from "next/link";
import { BookOpen, ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container inner-page">
      <div className="empty-state not-found-stage" style={{ minHeight: "58vh" }}>
        <div className="not-found-3d-trio" aria-hidden="true">
          <span className="nf-tile nf-tile-left">4</span>
          <span className="nf-tile nf-tile-center">
            <BookOpen size={28} strokeWidth={1.4} />
          </span>
          <span className="nf-tile nf-tile-right">4</span>
        </div>
        <div className="eyebrow" style={{ marginBottom: 17 }}>
          404 · A PAGE OUT OF PLACE
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 450 }}>This page isn’t on the shelf.</h1>
        <p>The resource may have moved or been archived. There’s still plenty to discover in the library.</p>
        <div className="not-found-actions">
          <Link href="/library" className="button button-primary">
            <ArrowLeft size={16} />
            Back to the library
          </Link>
          <Link href="/subjects" className="button button-secondary">
            <Compass size={16} />
            Browse subjects
          </Link>
        </div>
      </div>
    </div>
  );
}
