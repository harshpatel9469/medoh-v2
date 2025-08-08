"use client";
import React, { useEffect, useState } from "react";
import "./AnimatedWords.css";

interface AnimatedWordsProps {
  label?: string;
  words: string[];
  colors?: string[];
}

const AnimatedWords: React.FC<AnimatedWordsProps> = ({
  label = "",
  words = [],
  colors = [],
}) => {
  const [currentWord, setCurrentWord] = useState<number>(0);

  useEffect(() => {
    if (words.length === 0) return;

    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="text">
      {label && <p>{label}</p>}
      <p className="words-wrapper">
        {words.map((word, index) => (
          <span
            key={index}
            className={`word-line ${
              index === currentWord ? "active" : "inactive"
            }`}
            style={{ color: colors[index] || "#000" }}
          >
            {word}
          </span>
        ))}
      </p>
    </div>
  );
};

export default AnimatedWords;
