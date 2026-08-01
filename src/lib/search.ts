import { presentations } from "./presentations";

export function searchPresentations(query: string) {
  const q = query.toLowerCase();
  return presentations.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.topic.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      p.tags.some((t: string) => t.includes(q))
  );
}
