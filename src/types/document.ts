export const PLATFORMS = ["Google Drive", "Google Docs", "Google Sheets", "Google Slides", "Dropbox", "Other"] as const;
export const DOCUMENT_TYPES = ["Presentation", "Notes", "Worksheet", "Practice questions", "Reference", "Other"] as const;
export const PUBLICATION_STATUSES = ["draft", "published", "archived"] as const;
export type Platform = (typeof PLATFORMS)[number];
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export interface BackupLink {
  label: string;
  platform: Platform;
  url: string;
  description?: string;
}

export interface EducationalDocument {
  id: string;
  slug: string;
  title: string;
  description: string;
  originalUrl: string;
  platform: Platform;
  subject: string;
  subjectSlug: string;
  subjectId: string | null;
  course: string | null;
  courseSlug: string | null;
  courseId: string | null;
  semester: string | null;
  topic: string;
  documentType: DocumentType;
  thumbnailUrl: string | null;
  keywords: string[];
  tags: string[];
  isFeatured: boolean;
  publicationStatus: PublicationStatus;
  createdAt: string | null;
  updatedAt: string | null;
  presentationUrl: string | null;
  embedUrl: string | null;
  backupLinks: BackupLink[];
}

export interface CatalogFacets {
  subjects: { id: string | null; name: string; slug: string; count: number; topics: string[] }[];
  courses: { id: string | null; name: string; slug: string }[];
  semesters: string[];
  topics: string[];
  types: string[];
  platforms: string[];
}

export type CatalogMode = "compatibility" | "supabase";
