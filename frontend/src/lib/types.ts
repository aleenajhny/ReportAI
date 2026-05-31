export type Project = {
  id: string;
  title: string;
  domain: string;
  description: string;
  status: "draft" | "learning" | "generating" | "compiled" | string;
  created_at?: string;
  updated_at?: string;
  latest_latex?: string;
  quality_score?: number;
};

export type QualityScore = {
  grammar: number;
  readability: number;
  technical_depth: number;
  formatting_quality: number;
  citation_quality: number;
  overall: number;
  suggestions: string[];
};

export type Report = {
  id: string;
  version: number;
  status: string;
  quality_score: number | null;
  pdf_storage_key: string | null;
};
