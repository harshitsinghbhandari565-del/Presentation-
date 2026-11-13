import Image from "next/image";
import Link from "next/link";

export default function Brand() {
  return <Link href="/" className="brand" aria-label="Class12thA1 Hub home">
    <span className="brand-mark"><Image src="/images/brand/orbital-mark.webp" alt="" width={290} height={290} sizes="40px" priority /></span>
    <span className="brand-wordmark">Class12thA1{" "}<span>Hub</span></span>
  </Link>;
}
