export interface JadadItem {
  id: number;
  domain: string;
  question: string;
  score: number; // -1, 0, or 1
  justification: string;
}

export interface JadadAnalysis {
  articleTitle: string;
  articleAuthors: string;
  articleYear: string;
  articleJournal: string;
  articleDOI?: string;
  items: JadadItem[];
  totalScore: number;
  quality: 'low' | 'high';
  qualityLabel: string;
  summary: string;
}
