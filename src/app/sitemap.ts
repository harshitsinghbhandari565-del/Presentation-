import type { MetadataRoute } from "next";
import { getPublishedDocuments } from "@/lib/catalog";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return [];
  const documents = await getPublishedDocuments();
  const base = origin.replace(/\/$/, "");
  const subjects = [...new Set(documents.map(document => document.subjectSlug))];
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/library`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/subjects`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
    ...subjects.map(slug => ({ url: `${base}/subjects/${slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...documents.map(document => ({ url: `${base}/resources/${document.slug}`, lastModified: document.updatedAt ? new Date(document.updatedAt) : undefined, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
