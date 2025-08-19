export interface Choice {
  label: string;
  text: string;
}

export interface Question {
  id: string;
  question: string;
  choices: Choice[];
  correct_answer: string;
  abim_content_category: string;
  explanation: string;
  references: string[];
  imageUrl?: string;
}
