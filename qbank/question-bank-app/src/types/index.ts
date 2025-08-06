export interface Question {
    id: number;
    questionText: string;
    options: Answer[];
}

export interface Answer {
    id: number;
    answerText: string;
    isCorrect: boolean;
}

export interface Explanation {
    questionId: number;
    explanationText: string;
}