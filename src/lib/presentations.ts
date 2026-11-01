import { compatibilityDocuments } from "./catalog";
/** @deprecated Legacy compatibility helper. Public pages use the catalog repository. */
export const presentations = compatibilityDocuments;
export const getPresentationById = (id: string) => compatibilityDocuments.find(document => document.id === id);
