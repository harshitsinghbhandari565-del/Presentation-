import Image from "next/image";
import Link from "next/link";

export default function Brand() {
  return <Link href="/" className="brand" aria-label="Harshit Presentation Hub home">
    <span className="brand-mark"><Image src="/images/brand/orbital-mark.webp" alt="" width={290} height={290} sizes="40px" priority /></span>
    <span className="brand-wordmark">Harshit{" "}<span>Presentation Hub</span></span>
  </Link>;
}
