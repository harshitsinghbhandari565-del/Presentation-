export interface BackupLink {
  label: string;
  platform: string;
  url: string;
  description?: string;
}

export interface Presentation {
  id: string;
  title: string;
  subject: string;
  topic: string;
  description: string;
  platform: string;
  url: string;
  presentUrl?: string;
  embedUrl?: string;
  backupLinks?: BackupLink[];
  tags: string[];
  pinned?: boolean;
  accent?: string;
}
