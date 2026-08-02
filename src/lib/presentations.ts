import data from "@/data/presentations.json";

export const presentations = data.presentations || [];

export const getPresentationById = (id: string) =>
  presentations.find((p) => p.id === id);
