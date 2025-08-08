import React from "react";
import { LuSquareCheckBig } from "react-icons/lu";
import "./components.css";
import Link from "next/link";

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="max-w-6xl mx-auto px-4">
        <div className="cta-content">
          <h2>Start Getting Answers Today</h2>
          <p>
            Join thousands of people who trust Medoh Health for reliable,
            doctor-verified health information.
          </p>

          <div className="cta-buttons">
            {/* <button className="orange-button">
              BROWSE ALL QUESTIONS <span>→</span>
            </button> */}
            <Link className="orange-button" href="/dashboard/home">
              <span>BROWSE ALL QUESTIONS</span>
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
            </Link>
            <button className="orange-button outline-white">
              <span>LEARN MORE</span>
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
            {/* <button className="btn-outline">
              LEARN MORE <span>→</span>
            </button> */}
          </div>
          <hr />
          <div className="cta-features">
            <div>
              <LuSquareCheckBig /> Free to browse
            </div>
            <div>
              <LuSquareCheckBig /> No registration required
            </div>
            <div>
              <LuSquareCheckBig /> Verified doctors
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
