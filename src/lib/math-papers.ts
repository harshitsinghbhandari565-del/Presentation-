/** Fixed public paper snapshot. The URL is never derived from a request. */
const revision = "9ced0726e2f242b5e5567c6e626d77d34fdc1054";

export function mathPaperForSlug(slug: string) {
  const match = /^maths-paper-(0[1-9]|1[0-9]|2[0-2])$/.exec(slug);
  if (!match) return null;
  const number = match[1];
  const filename = `Paper_${number}.pdf`;
  return {
    filename,
    originalUrl: `https://github.com/hh6762907-png/Nodia-/raw/${revision}/extracted_papers/${filename}`,
    cdnUrl: `https://raw.githubusercontent.com/hh6762907-png/Nodia-/${revision}/extracted_papers/${filename}`,
    fetchUrl: `https://api.github.com/repos/hh6762907-png/Nodia-/contents/extracted_papers/${filename}?ref=${revision}`,
    downloadUrl: `/api/download/${slug}`,
  };
}

/** Only advertise the download for the exact curated, published document. */
export function mathPaperDownload(document: { slug: string; originalUrl: string; publicationStatus: string }) {
  const paper = mathPaperForSlug(document.slug);
  return paper && document.publicationStatus === "published" && document.originalUrl === paper.originalUrl ? paper : null;
}
