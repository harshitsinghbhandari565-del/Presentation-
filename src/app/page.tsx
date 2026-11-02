import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Check, FileText, FolderOpen, Layers3, Link2, Search, ShieldCheck, Sparkles, Presentation, Table2, FileType2 } from "lucide-react";
import { getCatalogHighlights, getFacets, getCatalogMode } from "@/lib/catalog";
import HeroVisual from "@/components/landing/HeroVisual";
import Reveal from "@/components/layout/Reveal";
import DocumentCard from "@/components/documents/DocumentCard";
import ExternalLink from "@/components/documents/ExternalLink";
import StoryIndex from "@/components/landing/StoryIndex";
import OptionalShelf from "@/components/landing/OptionalShelf";

export const revalidate = 60;
export default async function HomePage() {
  const [{ total, featured, recent }, facets] = await Promise.all([getCatalogHighlights(), getFacets()]);
  return <>
    <section className="hero container">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" />A LITTLE MORE ORGANIZED</div>
        <h1>Less searching.<br />More <em>learning.</em></h1>
        <p className="hero-description">That useful presentation. Those well-written notes.<br className="desktop-break" /> Find the resources you need, all in one thoughtfully organized place.</p>
        <div className="hero-actions"><Link href="/library" className="button button-primary button-large">Explore the library <ArrowRight size={18} /></Link><Link href="#how-it-works" className="button button-quiet button-large">How it works <ArrowUpRight size={17} /></Link></div>
        <div className="hero-reassurance"><span><Check size={14} />No student sign-up</span><span><Check size={14} />Original sources, directly</span></div>
        <div className="hero-stats"><div><strong>{total.toString().padStart(2, "0")}</strong><span>Curated resource{total !== 1 ? "s" : ""}</span></div><div><strong>{facets.subjects.length.toString().padStart(2, "0")}</strong><span>Subject{facets.subjects.length !== 1 ? "s" : ""} to explore</span></div><div><strong>01</strong><span>Place to start</span></div></div>
      </div>
      <HeroVisual document={featured[0] ?? recent[0]} />
    </section>

    <section className="compatibility container" aria-label="Compatible source platforms"><p>YOUR RESOURCES, RIGHT WHERE THEY BELONG</p><div className="platform-list"><span><FolderOpen size={22} />Google Drive</span><span><FileText size={21} />Google Docs</span><span><Presentation size={22} />Google Slides</span><span><Table2 size={21} />Google Sheets</span><span><Layers3 size={22} />Dropbox</span></div></section>

    <section className="section container" id="featured"><Reveal><div className="section-heading"><div><div className="eyebrow"><Sparkles size={14} />THE GOOD STUFF</div><h2>Worth your <em>attention.</em></h2><p>A small, considered collection. A great place to begin.</p></div><Link href="/library" className="text-link">Browse all resources <ArrowRight size={16} /></Link></div></Reveal>
      <div className={`featured-grid ${featured.length === 1 ? "single-feature" : ""}`}>{featured.length ? featured.map((document, index) => <Reveal key={document.id} delay={index * 0.06}><DocumentCard document={document} /></Reveal>) : <div className="empty-state"><BookOpen size={28} /><h3>A fresh chapter is coming.</h3><p>Resources will appear here when an administrator publishes them.</p></div>}
      {featured.length === 1 && <Reveal className="featured-editorial" delay={0.1}><span className="editorial-icon"><BookOpen size={27} strokeWidth={1.4} /></span><div className="eyebrow">LESS NOISE. MORE KNOWLEDGE.</div><h3>Good resources deserve<br />a <em>better home.</em></h3><p>No scattered links. No endless group-chat scrolling. Just the right material, organized around the way you learn.</p><Link href="/subjects" className="text-link">Find your subject <ArrowRight size={16} /></Link></Reveal>}
      </div>
    </section>

    <section className="section subjects-section"><div className="container"><Reveal><div className="section-heading"><div><div className="eyebrow"><FolderOpen size={14} />FOLLOW YOUR CURIOSITY</div><h2>A place for every <em>subject.</em></h2><p>Start with what you’re studying. We’ll help with the rest.</p></div><Link href="/subjects" className="text-link">All subjects <ArrowRight size={16} /></Link></div></Reveal><div className="subject-preview-grid">{facets.subjects.slice(0, 4).map((subject, index) => <Reveal key={subject.slug} delay={index * 0.04}><Link href={`/subjects/${subject.slug}`} className="subject-preview"><span className="subject-icon"><BookOpen size={24} strokeWidth={1.5} /></span><div><h3>{subject.name}</h3><p>{subject.count} resource{subject.count !== 1 ? "s" : ""} to explore</p></div><ArrowUpRight size={21} /></Link></Reveal>)}{facets.subjects.length < 3 && <Reveal className="subject-coming"><Sparkles size={23} strokeWidth={1.4} /><h3>Room to grow.</h3><p>More subjects will join the shelf as the collection grows.</p><span>Built around your learning</span></Reveal>}</div></div></section>

    <section className="section container"><OptionalShelf subjects={facets.subjects.map(subject => ({ name: subject.name, count: subject.count }))} /></section>

    <section className="section container how-section pinned-story" id="how-it-works"><Reveal className="how-intro"><div className="eyebrow"><Link2 size={14} />BEAUTIFULLY SIMPLE</div><h2>From “where is it?”<br />to <em>“here it is.”</em></h2><p>Your documents don’t need another new home. They just need a better way to be found.</p><div className="source-note"><ShieldCheck size={22} /><span>Original files. Original platforms.<br /><strong>Always in their owner’s control.</strong></span></div><StoryIndex /></Reveal><div className="how-steps">{[{ n: "01", icon: Search, title: "Find your next resource", text: "Search a title or keyword. Narrow things down by subject, course, semester or document type." }, { n: "02", icon: FileType2, title: "Get the context first", text: "See what a resource covers, where it lives and how it fits into your studies before you open it." }, { n: "03", icon: ArrowUpRight, title: "Go straight to the source", text: "One click opens the original document. No extra account, no copied file, no unnecessary detours." }].map((step, index) => <Reveal key={step.n} delay={index * 0.05}><article className="how-step" id={`story-step-${index + 1}`}><span className="step-number">{step.n}</span><div><step.icon size={21} strokeWidth={1.5} /><h3>{step.title}</h3><p>{step.text}</p></div><ArrowRight size={18} className="step-arrow" /></article></Reveal>)}</div></section>

    {recent.length > 0 && <section className="section container"><Reveal><div className="section-heading"><div><div className="eyebrow">FRESH ON THE SHELF</div><h2>Recently <em>added.</em></h2></div><Link href="/library?sort=newest" className="text-link">See what’s new <ArrowRight size={16} /></Link></div></Reveal><div className="resource-grid">{recent.map(document => <DocumentCard key={document.id} document={document} />)}</div></section>}

    <section className="container final-section"><Reveal className="final-cta"><div className="cta-decoration" aria-hidden="true"><BookOpen size={160} strokeWidth={0.5} /></div><div className="eyebrow"><span className="eyebrow-dot" />YOUR NEXT STUDY SESSION STARTS HERE</div><h2>A little less searching.<br />A lot more <em>possibility.</em></h2><p>Make room for the part that matters: learning.</p><Link href="/library" className="button button-primary button-large">Find your next resource <ArrowRight size={18} /></Link><span className="cta-note">Free to explore. No student account required.</span></Reveal></section>
    {featured[0] && <div className="container source-strip"><span><span className="tiny-dot" />From the collection: {featured[0].title}</span><ExternalLink href={featured[0].originalUrl} className="text-link">Open original</ExternalLink></div>}
    {getCatalogMode() === "compatibility" && <p className="container compatibility-note">The original classroom collection is available while the live library is being connected.</p>}
  </>;
}
