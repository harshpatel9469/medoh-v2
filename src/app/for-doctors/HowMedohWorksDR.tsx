"use client";

import React from "react";
import { BsPhone, BsGlobe, BsStar, BsPeople } from "react-icons/bs";
import "../_components/components.css";
import Image from "next/image";

const HowMedohWorksDR = () => {
  const features = [
    {
      id: 1,
      icon: "/mob.png",
      title: "Digitize Your Patient Education",
      description:
        "Replace printed handouts with dynamic, digestible, on-demand content tailored to your specialty and voice.",
    },
    {
      id: 2,
      icon: "/web.png",
      title: "Build Your Professional Digital Presence",
      description:
        "Create a library of high-quality videos, articles, and guides that reflect your expertise and enhance your reputation.",
    },
    {
      id: 3,
      icon: "/care.png",
      title: "Influence Care Beyond The Visit",
      description:
        "Help patients retain crucial information with educational content they understand before they ever meet you.",
    },
    {
      id: 4,
      icon: "/com.png",
      title: "Engage With A Broader Community",
      description:
        "Connect with patients, other clinicians, and industry stakeholders interested in evidence-based education.",
    },
  ];

  return (
    <section className="how-medoh-works">
      <div className="flex flex-wrap justify-center title-mb">
        <div className="w-full lg:w-8/12 text-center">
          <h2 className="section-title p-0 m-0">
            How Medoh <span className="highlight"> Works for You.</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feature) => (
          <div key={feature.id}>
            <div className="feature-card h-full">
              <div className="text-center p-0">
                <div className="feature-icon-container mb-3">
                  <div className="feature-icon-circle">
                    <Image
                      height={50}
                      width={50}
                      alt=""
                      src={feature.icon}
                      className="img-fluid"
                    />
                  </div>
                </div>
                <h3 className="feature-title mb-3">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowMedohWorksDR;
