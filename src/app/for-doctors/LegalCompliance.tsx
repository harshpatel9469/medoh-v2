"use client";

import React from "react";
import "../_components/components.css";

const LegalCompliance = () => {
  const legalItems = [
    {
      id: 1,
      title: "HIPAA Compliance:",
      description:
        "Our platform is designed with HIPAA-aligned standards for all patient-related interactions and content. Content you create is intended for general education and not for individualized treatment guidance.",
    },
    {
      id: 2,
      title: "Disclaimer:",
      description:
        "Content published via Medoh Health is for informational purposes and should not replace professional medical advice.",
    },
    {
      id: 3,
      title: "Content Moderation:",
      description:
        "All medical content is reviewed for accuracy and clarity before being published.",
    },
  ];

  return (
    <section className="legal-compliance">
      <div className="flex flex-wrap justify-center title-mb">
        <div className="w-full lg:w-8/12 text-center">
          <h2 className="legal-title p-0 m-0">Legal & Compliance</h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-y-3 -mx-2">
        {legalItems.map((item:any) => (
          <div key={item.id} className="w-full md:w-1/3 px-2">
            <div className="legal-card h-full bg-white rounded shadow">
              <div className="p-4">
                <h3 className="legal-card-title mb-3">{item.title}</h3>
                <p className="legal-card-text">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LegalCompliance;
