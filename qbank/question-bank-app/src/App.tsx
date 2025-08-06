import React, { useState, useEffect } from 'react';
import QuestionList from './components/QuestionList';
import { parseCSV } from './utils/csvParser';
import { Question } from './types';

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      const questionsData = await parseCSV('public/questions.csv');
      setQuestions(questionsData);
    };
    loadQuestions();
  }, []);

  const handleAnswerSelect = (answer: string, explanation: string) => {
    setSelectedAnswer(answer);
    setExplanation(explanation);
  };

  return (
    <div>
      <h1>Question Bank</h1>
      <QuestionList questions={questions} onAnswerSelect={handleAnswerSelect} />
      {explanation && <div className="explanation">{explanation}</div>}
    </div>
  );
};

export default App;