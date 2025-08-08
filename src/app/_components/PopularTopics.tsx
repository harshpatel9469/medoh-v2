"use client";
import React, { useState } from "react";
import "./components.css";
import { RiStethoscopeFill } from "react-icons/ri";
import { IoPlayCircleOutline } from "react-icons/io5";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Dummy topic data mapped to categories
const topicsData = {
  "Plantar Fasciitis": [
    "PF Basics",
    "Heel Pain Explained",
    "Treating Plantar Fasciitis",
  ],
  "Rotator Cuff Tears": [
    "Rotator Cuff Basics",
    "Rotator Cuff Symptoms",
    "Rotator Cuff Diagnoses",
    "Rotator Cuff Surgery",
    "Recovering From Rotator Cuff",
  ],
  "Other Shoulder Conditions": ["Frozen Shoulder", "Shoulder Instability"],
  "Labral Tears": ["Labral Tear Basics", "Labral Rehab"],
  "ACL Tears": ["ACL Recovery", "ACL Surgery Options"],
  "Meniscal Injuries": ["Meniscus Basics", "Torn Meniscus Recovery"],
  "Rotator Cuff Treatments": ["Non-Surgical Options", "Injections for Pain"],
  "Trigger Finger": ["What is Trigger Finger?", "Fixing Trigger Finger"],
};

type Topic = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  condition_id: string;
  description: string;
  image: string;
  topic_order: number;
  is_detailed: boolean;
  body_part_id: string;
  body_parts: {
    name: string;
  };
};
interface PopularTopicsProps {
  relevantTopics: Topic[];
}
const PopularTopics = (props: PopularTopicsProps) => {
  const { relevantTopics } = props;
  const router = useRouter();
  console.log("relevantTopic------s", relevantTopics);
  const [activeCategory, setActiveCategory] = useState(
    relevantTopics?.length > 0 ? relevantTopics[0]?.name : ""
  );

  return (
    <section className="popular-topics-section">
      <div className="max-w-6xl mx-auto">
        <h2 className="section-title text-center !mb-0">
          Top <span className="highlight">Doctors</span>. Straight{" "}
          <span className="highlight">Answers</span>. One{" "}
          <span className="highlight">Place</span>.
        </h2>
        <p className="text-center !mb-4 small-text">
          Our Most Popular/People Recently Viewed:
        </p>

        {/* Category Tabs */}
        <div className="category-scroll mb-6">
          {relevantTopics?.length > 0 &&
            relevantTopics.slice(0, 8).map((cat: Topic, index: number) => (
              <button
                key={index}
                className={`category-btn ${
                  activeCategory === cat.name ? "active" : ""
                }`}
                onClick={() => setActiveCategory(cat?.name)}
              >
                {cat?.name}
              </button>
            ))}
        </div>

        {/* Topic Cards */}
        <div className="gy-4 gap-3 grid grid-cols-3">
          {relevantTopics?.length > 0 &&
            relevantTopics.slice(0, 6).map((topic: Topic, index: number) => (
              <div
                onClick={() => router.push(`/dashboard/topics/${topic?.id}`)}
                key={index}
              >
                <div className="topic-card">
                  <h5>{topic?.name}</h5>
                  <div className="meta-info">
                    <div className="flex items-center gap-2">
                      <RiStethoscopeFill /> <span>3 Doctors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IoPlayCircleOutline /> <span>42 Videos</span>
                    </div>
                  </div>
                  <div
                    onClick={() =>
                      router.push(`/dashboard/topics/${topic?.id}`)
                    }
                    className="details-link"
                  >
                    More Details →
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => router.push("/dashboard/home")}
            className="orange-button mx-auto"
          >
            <span>SEE ALL TOPICS</span>
            <span>
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
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularTopics;
