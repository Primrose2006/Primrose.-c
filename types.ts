export interface SimplifiedDocument {
  summary: string;
  keyTerms: KeyTerm[];
  potentialRisks: string[];
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface FileData {
  name: string;
  data: string; // base64 encoded
  mimeType: string;
}
