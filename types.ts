
export interface Character {
  id: string;
  name: string;
  description: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-1000 scale
}

export interface AnalysisResult {
  characters: Character[];
  audioTranscript: string;
}

export enum AppStep {
  INITIAL = 'initial',
  ANALYZING = 'analyzing',
  SELECT_CHARACTER = 'select_character',
  GENERATING = 'generating',
  COMPLETE = 'complete',
}

export interface FileData {
  base64: string;
  mimeType: string;
  url: string;
}
