import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import StudioLiveClock from "./StudioLiveClock";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Link href="/" className="footer-brand" aria-label="Harshit Presentation Hub home">
              <Image src="/images/brand/full-logo.webp" alt="" width={920} height={775} sizes="210px" />
            </Link>
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
              <Link href="/sql-workbench">SQL Workbench</Link>
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
        <p className="footer-note cosmic-photo-credit">
          Background: <a href="https://www.esa.int/ESA_Multimedia/Images/2022/07/Cosmic_Cliffs_in_Carina_NIRCam" target="_blank" rel="noopener noreferrer">Cosmic Cliffs in Carina</a>, NASA, ESA, CSA and STScI. Darkened for readability. <a href="https://creativecommons.org/licenses/by-sa/3.0/igo/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0 IGO</a>.
        </p>
      </div>
    </footer>
  );
}
