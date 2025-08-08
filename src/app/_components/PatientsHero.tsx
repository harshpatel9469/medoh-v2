"use client";
import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import AnimatedWords from "./AnimatedWords";
import { useRouter } from "next/navigation";

export const PatientsHero = () => {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(e.key);
    if (e.key === "Enter" && searchValue.trim()) {
      const query = encodeURIComponent(searchValue.trim());
      router.push(`/dashboard/search?q=${query}`);
    }  
  };

  return (
    <div className="hero-main">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center">
          <div className="w-full md:w-full lg:w-10/12 text-center">
            <h1>
              Medical <span className="text-orange-500">Info</span> You can{" "}
              <span className="text-orange-500">Trust</span>
            </h1>
            <p>
              At Medoh, we provide{" "}
              <span className="font-semibold text-gray-900">precise</span> and{" "}
              <span className="font-semibold text-gray-900">reliable</span>{" "}
              answers to all your questions about rotator cuff tears and
              injuries, delivered by healthcare professionals through
              easy-to-understand videos.
            </p>

            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                  if (e.target.value === "") setIsFocused(false);
                }}
                onKeyPress={handleKeyPress}
                placeholder={isFocused ? "Search medical questions..." : ""}
              />
              {!isFocused && (
                <div className="animated-placeholder">
                  <AnimatedWords
                    words={[
                      "Why does my shoulder hurt when I move it?",
                      "How do I know if I have a rotator cuff tear?",
                      "What are the treatment options for frozen shoulder?",
                      "Can a meniscus tear heal on its own?",
                      "How can I heal my tennis elbow?",
                      "What is hip impingement?",
                      "What is involved in shoulder replacement surgery?",
                    ]}
                  />
                </div>
              )} 
              <div onClick={() => handleKeyPress()}>
                <IoSearch className="search-icon" />
              </div>
            </div>

            <button
              className="orange-button mx-auto"
              onClick={() => {
                router.push("/dashboard/home");
              }}
            >
              <span>Explore Health Topics</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="12"
                viewBox="0 0 15 12"
                fill="none"
              >
                <path
                  d="M14.8054 5.42889L10.6677 0.286212C10.4013 -0.0647587 9.87469 -0.0960278 9.56577 0.209467C9.25685 0.51496 9.22568 1.09777 9.51202 1.42903L12.5022 5.14319H0.775836C0.347353 5.14319 0 5.52694 0 6.0003C0 6.47368 0.347353 6.85741 0.775836 6.85741H12.5022L9.51202 10.5716C9.22568 10.9028 9.26441 11.4846 9.57333 11.7901C9.88226 12.0956 10.4013 12.0653 10.6677 11.7144L14.8054 6.57171C15.0755 6.15592 15.054 5.78265 14.8054 5.42889Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
