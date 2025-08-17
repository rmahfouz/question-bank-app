import { Question } from '../types';

export function parseJSON(jsonString: string): Question[] {
  const data = JSON.parse(jsonString);
  const questions: Question[] = [];

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const item = data[key];
      questions.push({
        id: key,
        question: item.question,
        option1: item.choices[0]?.text || '',
        option2: item.choices[1]?.text || '',
        option3: item.choices[2]?.text || '',
        option4: item.choices[3]?.text || '',
        correct_option: String(item.choices.findIndex((choice: any) => choice.text === item.correct_answer) + 1),
        explanation: item.explanation,
        imageUrl: undefined, // Or map if a corresponding field exists
      });
    }
  }
  return questions;
}
