import React from 'react';

interface ExplanationProps {
    explanation: string;
    selectedAnswer: string;
}

const Explanation: React.FC<ExplanationProps> = ({ explanation, selectedAnswer }) => {
    return (
        <div className="explanation">
            <h3>Selected Answer: {selectedAnswer}</h3>
            <p>{explanation}</p>
        </div>
    );
};

export default Explanation;