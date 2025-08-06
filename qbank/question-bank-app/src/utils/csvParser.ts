import fs from 'fs';
import path from 'path';

export interface Question {
    question: string;
    answers: string[];
    correctAnswer: string;
    explanation: string;
}

export function parseCSV(filePath: string): Question[] {
    const csvData = fs.readFileSync(path.resolve(filePath), 'utf-8');
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    const questions: Question[] = [];

    for (const line of lines) {
        const [question, ...answers] = line.split(',');
        const correctAnswer = answers[0]; // Assuming the first answer is the correct one
        const explanation = answers.pop() || ''; // Assuming the last entry is the explanation

        questions.push({
            question,
            answers,
            correctAnswer,
            explanation,
        });
    }

    return questions;
}