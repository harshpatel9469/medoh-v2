"use client";
import React, { useEffect, useState } from "react";
import "./AnimatedWords.css";

const AnimatedWords = ({ label = "", words = [], colors = [] }) => {
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
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
