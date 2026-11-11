import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Command,
  Layers3,
  Link2,
  Monitor,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import InnerPageSculpture from "@/components/layout/InnerPageSculpture";

export const metadata: Metadata = {
  title: "About the hub",
  description:
    "Why Harshit Presentation Hub exists: a simpler, calmer way to discover educational documents while keeping files at their original sources.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const specs = [
    {
      icon: Command,
      title: "Instant command search",
      text: "Press ⌘K or Ctrl+K from any page to jump straight to presentations, practice sets and chapter notes.",
    },
    {
      icon: Monitor,
      title: "Classroom projector mode",
      text: "High-contrast typography and static framing built specifically for classroom projection and smartboards.",
    },
    {
      icon: Sparkles,
      title: "Adaptive 3D motion",
      text: "60fps spatial choreography that automatically respects OS Reduce Motion preferences with a 1-tap toggle.",
    },
    {
      icon: UserCheck,
      title: "Zero student sign-up",
      text: "No accounts to create, no passwords to forget, and no tracking walls between you and your study material.",
    },
  ];

  return (
    <div className="container inner-page about-page">
      <div className="page-intro-split">
        <div className="page-intro">
          <div className="eyebrow">
            <BookOpen size={14} />A SMALL IDEA. A USEFUL PURPOSE.
          </div>
          <h1>
            Learning is hard enough.
            <br />
            <em>Finding resources shouldn’t be.</em>
          </h1>
          <p>
            Harshit Presentation Hub began as a simple home for classroom presentations. It’s growing into a
            thoughtfully organized library of educational resources.
          </p>
        </div>
        <InnerPageSculpture variant="about" />
      </div>

      <div className="about-principles">
        <article className="about-principle-card">
          <span className="principle-num" aria-hidden="true">01</span>
          <BookOpen size={25} />
          <h2>Organized for students</h2>
          <p>
            Resources are described by subject, course, semester and topic, so you can start with what you’re actually
            studying.
          </p>
        </article>
        <article className="about-principle-card">
          <span className="principle-num" aria-hidden="true">02</span>
          <Link2 size={25} />
          <h2>Connected, not copied</h2>
          <p>
            We store information about a resource and its original sharing link. Files remain on Google Drive, Dropbox
            or their original platform.
          </p>
        </article>
        <article className="about-principle-card">
          <span className="principle-num" aria-hidden="true">03</span>
          <ShieldCheck size={25} />
          <h2>Permissions matter</h2>
          <p>
            Opening a resource is subject to its owner’s settings. We don’t bypass access controls, mirror files or
            promise downloads that aren’t offered.
          </p>
        </article>
      </div>

      <section className="about-specs-section" aria-label="Built-in classroom features">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <Layers3 size={14} />
              ENGINEERED FOR STUDY SESSIONS
            </div>
            <h2>
              Thoughtful in every <em>detail.</em>
            </h2>
            <p>Every interaction is designed to stay fast, accessible and distraction-free on phones and desktops.</p>
          </div>
        </div>
        <div className="about-specs-grid">
          {specs.map(spec => (
            <article key={spec.title} className="about-spec-card">
              <span className="about-spec-icon">
                <spec.icon size={20} strokeWidth={1.6} />
              </span>
              <h3>{spec.title}</h3>
              <p>{spec.text}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="about-note">
        <h2>No student account. No extra detour.</h2>
        <p>
          Browse freely, find something useful and open it at the source. Administrators curate the collection
          separately; students never need to register.
        </p>
        <div className="about-note-actions">
          <Link href="/library" className="button button-primary">
            Explore the library <ArrowRight size={17} />
          </Link>
          <Link href="/subjects" className="button button-secondary">
            Browse subjects
          </Link>
        </div>
      </div>
    </div>
  );
}
