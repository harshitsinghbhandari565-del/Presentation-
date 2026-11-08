import Link from "next/link";
import { Layers3 } from "lucide-react";
export default function Brand() {
  return <Link href="/" className="brand" aria-label="Harshit Presentation Hub home">
    <span className="brand-mark"><Layers3 size={21} strokeWidth={1.7} aria-hidden="true" /></span>
    <span className="brand-wordmark">Harshit<span>Presentation Hub</span></span>
  </Link>;
}
