"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Command } from "lucide-react";
import FeaturedPresentation from "@/components/dashboard/FeaturedPresentation";
import SearchBar from "@/components/dashboard/SearchBar";
import SubjectChips from "@/components/dashboard/SubjectChips";
import data from "@/data/presentations.json";
import type { Presentation } from "@/types/presentation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");

  const presentations = useMemo(
    () => (data.presentations || []) as Presentation[],
    []
  );
  const pinned = useMemo(
    () => presentations.find((p) => p.pinned),
    [presentations]
  );

  const filtered = useMemo(() => {
    let arr = presentations;
    if (subject !== "All") arr = arr.filter((p) => p.subject === subject);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.topic.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.includes(q))
      );
    }
    return arr;
  }, [query, subject, presentations]);

  const subjects = useMemo(
    () => Array.from(new Set(presentations.map((p) => p.subject))),
    [presentations]
  );

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Featured Hero - Primary visual element */}
      {pinned ? (
        <motion.div className="lg:col-span-8 order-1" variants={itemVariants}>
          <FeaturedPresentation presentation={pinned} />
        </motion.div>
      ) : (
        <motion.div className="lg:col-span-8 order-1 glass-card p-8" variants={itemVariants}>
          <p className="text-[#94a3b8]">No featured presentation available.</p>
        </motion.div>
      )}

      {/* Sidebar - Secondary elements */}
      <aside className="lg:col-span-4 order-2 flex flex-col gap-5">
        {/* Search panel */}
        <motion.div className="glass-card p-5" variants={itemVariants}>
          <h2 className="font-[family-name:var(--font-editorial)] text-lg font-semibold text-[#f8fafc] mb-3">
            Search &amp; Filter
          </h2>
          <SearchBar onSearch={setQuery} />
          <div className="mt-3">
            <SubjectChips
              subjects={subjects}
              active={subject}
              onSelect={setSubject}
            />
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[#94a3b8]">
              <span
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              <span>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div
              className="hidden md:flex items-center gap-1.5 text-xs text-[#475569]"
              aria-hidden="true"
            >
              <Command size={11} />
              <span>⌘K</span>
            </div>
          </div>
        </motion.div>

        {/* Stats - Tertiary element */}
        <motion.div className="glass-card glass-card-utility p-4" variants={itemVariants}>
          <h3 className="text-sm font-medium text-[#94a3b8] mb-2.5">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="stat-card p-3">
              <div className="text-[#475569] text-xs mb-0.5">Total</div>
              <div className="text-xl font-semibold text-[#f8fafc]">
                {presentations.length}
              </div>
            </div>
            <div className="stat-card p-3">
              <div className="text-[#475569] text-xs mb-0.5">Pinned</div>
              <div className="text-xl font-semibold text-[#f8fafc]">
                {presentations.filter((p) => p.pinned).length}
              </div>
            </div>
          </div>
        </motion.div>
      </aside>

      {/* Bottom cards - Utility elements */}
      <section className="lg:col-span-12 order-3 grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div className="glass-card glass-card-utility p-5" variants={itemVariants}>
          <h3 className="font-medium text-[#f8fafc] mb-1.5">
            Backup Access
          </h3>
          <p className="text-[#94a3b8] text-sm leading-relaxed mb-2.5">
            Alternative link if primary source is unavailable.
          </p>
          <a
            href="https://www.dropbox.com/scl/fi/ovqnktu25x7f2oq6txzjr/The_Lost_Spring_MCQs.pptx?rlkey=ethvwy1cuuvdasrn0gxk6p1sg&st=raevvife&dl=0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            Open Dropbox Backup →
          </a>
        </motion.div>
        <motion.div className="glass-card glass-card-utility p-5" variants={itemVariants}>
          <h3 className="font-medium text-[#f8fafc] mb-1.5">
            Projector Mode
          </h3>
          <p className="text-[#94a3b8] text-sm leading-relaxed mb-2.5">
            Larger text and stronger contrast for classroom visibility.
          </p>
          <span className="text-[#475569] text-sm">
            Toggle in header →
          </span>
        </motion.div>
      </section>
    </motion.div>
  );
}
