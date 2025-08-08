"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./services.module.css";

export default function HeroSection() {
  return (
    <section className={styles.heroSection}>
      <div className="flex flex-col lg:flex-row items-center gap-y-8 gap-5">
        <div className="w-full lg:w-5/12 flex justify-center">
          <Image
            src="/poster3.png"
            alt="Medoh Service Preview"
            width={600}
            height={400}
            className="rounded w-full h-full"
            style={{ objectFit: "contain", maxHeight: 420 }}
            priority
          />
        </div>
        <div className="w-full lg:w-7/12 flex flex-col justify-center items-center lg:items-start">
          <h1 className={styles.heroTitle}>
            Helping <span className={styles.orangeHighlight}>Patients</span>{" "}
            Understand
            <br />
            Their Treatment For{" "}
            <span className={styles.orangeHighlight}>
              Better <br /> Outcomes
            </span>
          </h1>
          <p
            className={`mt-3 mb-4 text-center lg:text-left ${styles.heroText}`}
          >
            At Medoh, our goal is to ensure patients fully understand their
            condition and treatment plan
            <br /> -because informed patients make better decisions and have
            better outcomes.
          </p>
          <Link
            href="#how-medoh-works"
            className="orange-button inline-flex items-center gap-2"
          >
            <span>Explore Offerings</span>
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
              ></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
