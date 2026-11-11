import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, GraduationCap, Layers3 } from "lucide-react";
import { getFacets } from "@/lib/catalog";
import Reveal from "@/components/layout/Reveal";
import InnerPageSculpture from "@/components/layout/InnerPageSculpture";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Browse subjects",
  description:
    "Explore educational resources by subject and course. Start with what you are studying and find your next useful resource.",
  alternates: { canonical: "/subjects" },
};

export default async function SubjectsPage() {
  const facets = await getFacets();
  return (
    <div className="container inner-page">
      <div className="page-intro-split">
        <div className="page-intro">
          <div className="eyebrow">
            <BookOpen size={14} />
            FOLLOW YOUR CURIOSITY
          </div>
          <h1>
            What are you
            <br />
            <em>learning today?</em>
          </h1>
          <p>
            A starting point for every study session.
            <br />
            Explore the subjects and courses on our shelf.
          </p>
        </div>
        <InnerPageSculpture
          variant="subjects"
          statPrimary={facets.subjects.length.toString().padStart(2, "0")}
          statLabel={`${facets.courses.length} course${facets.courses.length !== 1 ? "s" : ""} organized`}
          badgeText="SUBJECT INDEX"
        />
      </div>

      <div className="subject-grid">
        {facets.subjects.map(subject => (
          <Reveal key={subject.slug}>
            <Link className="subject-card subject-card-3d" href={`/subjects/${subject.slug}`}>
              <span className="subject-icon">
                <BookOpen size={28} strokeWidth={1.3} />
              </span>
              <ArrowUpRight size={22} />
              <h2>{subject.name}</h2>
              <p>{subject.topics.slice(0, 2).join(" · ")}</p>
              {subject.topics.length > 0 && (
                <ul className="subject-topic-pills" aria-label={`${subject.name} topics`}>
                  {subject.topics.slice(0, 3).map(topic => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              )}
              <div>
                <span>
                  {subject.count} resource{subject.count !== 1 ? "s" : ""}
                </span>
                <span>
                  Explore subject <ArrowUpRight size={14} />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      {facets.subjects.length === 0 && (
        <div className="empty-state">
          <BookOpen size={30} />
          <h2>A new shelf, ready to grow.</h2>
          <p>Subjects will appear when resources are published.</p>
        </div>
      )}

      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <GraduationCap size={15} />
              ORGANIZED AROUND YOU
            </div>
            <h2>
              Find your <em>course.</em>
            </h2>
          </div>
        </div>
        <div className="course-list">
          {facets.courses.map(course => (
            <Link key={course.slug} href={`/library?course=${course.slug}`}>
              <GraduationCap size={21} />
              <span>{course.name}</span>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
        {facets.courses.length === 0 && <p className="muted">No courses have been specified in the collection yet.</p>}
      </section>

      <div className="library-bottom-note">
        <Layers3 size={18} />
        <p>A growing collection, organized with intention. More chapters to come.</p>
      </div>
    </div>
  );
}
