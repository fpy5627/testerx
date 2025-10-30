import React from "react";

interface Question {
  id: number;
  category: string;
  question: string;
  type: string;
  scale?: number;
  options?: string[];
  weight: number;
}

interface Props {
  question: Question;
  answer?: number | number[];
  onAnswer: (score: number | number[]) => void;
}

const QuestionCard: React.FC<Props> = ({ question, answer, onAnswer }) => {
  if (question.type === "scale") {
    return (
      <div className="p-4 rounded shadow bg-white">
        <div className="mb-4 font-semibold text-lg">{question.question}</div>
        <div className="flex gap-3 mt-4">
          {[...Array(question.scale)].map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded transition-colors border ${
                answer === i + 1 ? "bg-primary text-white border-primary" : "bg-gray-100 border-gray-200"
              }`}
              onClick={() => onAnswer(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (question.type === "single" && question.options) {
    return (
      <div className="p-4 rounded shadow bg-white">
        <div className="mb-4 font-semibold text-lg">{question.question}</div>
        <div className="flex flex-col gap-2 mt-4">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded transition-colors border w-full text-left ${
                answer === i ? "bg-primary text-white border-primary" : "bg-gray-100 border-gray-200"
              }`}
              onClick={() => onAnswer(i)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (question.type === "multi" && question.options) {
    // 多选题：answer类型为number[]
    return (
      <div className="p-4 rounded shadow bg-white">
        <div className="mb-4 font-semibold text-lg">{question.question}</div>
        <div className="flex flex-col gap-2 mt-4">
          {question.options.map((opt, i) => {
            const checked = Array.isArray(answer) && answer.includes(i);
            return (
              <button
                key={i}
                className={`px-3 py-1 rounded transition-colors border w-full text-left ${
                  checked ? "bg-primary text-white border-primary" : "bg-gray-100 border-gray-200"
                }`}
                onClick={() => {
                  if (!Array.isArray(answer)) onAnswer([i]);
                  else if (checked) onAnswer(answer.filter((v) => v !== i));
                  else onAnswer([...answer, i]);
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default QuestionCard;
