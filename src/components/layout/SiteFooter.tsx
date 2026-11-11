import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import Brand from "./Brand";
import StudioLiveClock from "./StudioLiveClock";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Brand />
            <p className="footer-description">
              A little more organized.
              <br />A lot more ready to learn.
            </p>
            <StudioLiveClock />
          </div>
          <div className="footer-links">
            <div>
              <h3>Discover</h3>
              <Link href="/library">Resource library</Link>
              <Link href="/subjects">Browse subjects</Link>
              <Link href="/library?featured=true">Featured resources</Link>
            </div>
            <div>
              <h3>The hub</h3>
              <Link href="/#how-it-works">How it works</Link>
              <Link href="/about">About the hub</Link>
              <Link href="/admin">
                Administrator <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Harshit Presentation Hub</p>
          <p>
            Made for curious minds <Heart size={12} aria-hidden="true" />
          </p>
        </div>
        <p className="footer-note">
          Documents stay on their original platforms. Access is subject to the owner’s sharing permissions.
        </p>
      </div>
    </footer>
  );
}
