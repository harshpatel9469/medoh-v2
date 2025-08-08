"use client";

import React from "react";
import "../_components/components.css";
import { useRouter } from "next/navigation";

const DoctorsHero = () => {
  const router = useRouter();
  return (
    <div className="doctors-hero">
      <div className="hero-content">
        <h1 className="hero-headline text-center lg:text-left">
          Educate Your Patients Beyond{" "}
          <span className="highlight">Your Clinic Walls</span>
        </h1>

        <p className="hero-description text-center lg:text-left">
          Today's patients are searching online before and after visits. Medoh
          Health empowers you, the physician, to lead that conversation with
          trusted, accurate, and personalized content. Build your digital voice
          and make a lasting impact on your patients' understanding and
          well-being.
        </p>

        {/* <Link href="/partner" passHref> */}
        <button className="orange-button mx-auto lg:mx-0" onClick={()=>router.push("/dashboard/doctors")}>
          <span>PARTNER WITH US</span>
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
        {/* </Link> */}
      </div>
    </div>
  );
};

export default DoctorsHero;
