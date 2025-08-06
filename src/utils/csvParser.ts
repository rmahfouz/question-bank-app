import { Question } from '../types';

export function parseCSV(csv: string): Question[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, idx) => {
      obj[header.trim()] = values[idx].trim();
    });
    return obj as Question;
  });
}
