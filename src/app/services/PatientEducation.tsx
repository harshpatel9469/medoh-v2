"use client";

import React from "react";
import Image from "next/image";
import { BsXLg } from "react-icons/bs";
import styles from "./services.module.css";
import AnimatedWords from "../_components/AnimatedWords";

const PatientEducation = () => {
  const medohBenefits = [
    "Clear treatment options explained through doctor-led videos",
    "Better outcomes from improved understanding",
    "Patients know exact steps for recovery",
    "Engaging, personalized content that sticks",
    "Trusted information from real doctors, anytime",
  ];

  const traditionalDrawbacks = [
    { text: "Hard to find accurate info online", icon: "x" },
    { text: "Just 10 minutes with the doctor", icon: "x" },
    { text: "Given a paper handout or brochure", icon: "x" },
    { text: "No way to revisit doctor's explanation", icon: "x" },
    { text: "No clear recovery instructions post-visit", icon: "x" },
  ];

  return (
    <section className={styles.patientEducation}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-center section-title !p-0 !m-0">
            Modern Patient Education is
          </h2>
          <div className="text-center animated-title !p-0 !m-0">
            <AnimatedWords
              words={[
                "made for the patient.",
                "modern.",
                "to the point.",
                "insightful.",
                "engaging.",
                "personalized.",
                "medoh.",
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medoh Column */}
          <div className={styles.comparisonCard}>
            <h3 className={styles.sectionTitle}>medoh</h3>

            <div className={`${styles.benefitsList} mt-6`}>
              {medohBenefits.map((benefit: any, index: any) => (
                <div key={index} className="flex items-start gap-3">
                  <Image
                    src="/thumbright.png"
                    alt="Thumbs Up"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <span className={styles.benefitText}>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-12">
              <Image
                src="/laptop.png"
                alt="Laptop"
                width={0}
                height={0}
                sizes="100vw"
                className="w-[70%] h-auto mt-3"
              />
            </div>
          </div>

          {/* Traditional Column */}
          <div className={styles.comparisonCard}>
            <h3 className={styles.sectionTitle}>Traditional Education</h3>

            <div className={`${styles.drawbacksList} mt-6`}>
              {traditionalDrawbacks.map((drawback: any, index: any) => (
                <div key={index} className="flex items-start gap-3">
                  <BsXLg className={styles.benefitIcon} />
                  <span className={styles.drawbackText}>{drawback.text}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-12">
              <Image
                src="/Education.png"
                alt="Traditional Education"
                width={0}
                height={0}
                sizes="100vw"
                className="w-[62%] h-auto mt-3"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientEducation;
