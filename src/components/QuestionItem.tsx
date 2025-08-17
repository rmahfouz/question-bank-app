import React from 'react';

interface QuestionItemProps {
    question: string;
    answers: string[];
    selectedAnswer: string | null;
    onSelectAnswer: (answer: string) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, answers, selectedAnswer, onSelectAnswer }) => {
    return (
        <div className="question-item">
            <h3>{question}</h3>
            <ul>
                {answers.map((answer, index) => (
                    <li key={index} onClick={() => onSelectAnswer(answer)} className={selectedAnswer === answer ? 'selected' : ''}>
                        {answer}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QuestionItem;