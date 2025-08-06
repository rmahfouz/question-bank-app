import React, { useState } from 'react';
import QuestionItem from './QuestionItem';
import { Question } from '../types';

interface QuestionListProps {
  questions: Question[];
  onAnswerSelect: (questionId: string, selectedAnswer: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, onAnswerSelect }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
    onAnswerSelect(questionId, answer);
  };

  return (
    <div>
      {questions.map((question) => (
        <QuestionItem
          key={question.id}
          question={question}
          selectedAnswer={selectedAnswers[question.id]}
          onAnswerSelect={handleAnswerSelect}
        />
      ))}
    </div>
  );
};

export default QuestionList;