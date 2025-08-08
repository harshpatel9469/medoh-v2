"use client";
import React from "react";
import Image from "next/image";
import styles from "./services.module.css";

export default function HowMedohWorks() {
  return (
    <section className={styles.sectionGap}>
      <div className={styles.sectionContainer}>
        <h2 className="text-center section-title title-mb">
          How <span className={styles.orangeHighlight}>Medoh</span> Works For
          You.
        </h2>

        {/* Grid Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tall Card */}
          <div className="flex">
            <div className="flex flex-col h-full w-full rounded-2xl overflow-hidden bg-[#FFF7F2]">
              <div className="w-full relative">
                <img
                  src="/Find-Your-Topic.jpg"
                  alt="Helps Patients Understand Their Treatment Options"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col items-center text-center">
                <h3 className="text-[22px] font-semibold leading-[32px] text-[#FA852F] mb-5 font-poppins">
                  Helps Patients Understand <br />
                  Their Treatment Options
                </h3>
                <p className="text-[16px] leading-[26px]">
                  Medoh makes it easier for patients to explore and understand
                  treatment options for their condition. They can watch videos
                  of real doctors explaining how each treatment works—making the
                  information more relatable and easier to trust.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - 2 Rows (1 full, 1 split) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Top Row */}
            <div className="flex flex-col md:flex-row bg-[#FFF7F2] rounded-2xl overflow-hidden">
              <div className="w-full md:w-1/2 flex items-center">
                <div className="p-6">
                  <h3 className="text-[22px] font-semibold text-[#FA852F] mb-5">
                    Educates Patients After They Leave the Doctor's Office
                  </h3>
                  <p className="text-[16px]">
                    After a consultation, patients often forget or misunderstand
                    important medical instructions. Medoh helps by reinforcing
                    what the doctor said, explaining the treatment or surgery in
                    a clear and simple way that patients can revisit anytime.
                  </p>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <img
                  src="/image3.png"
                  alt="Educates Patients After They Leave the Doctor's Office"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Bottom Row - Two Cards Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="bg-[#FFF7F2] rounded-2xl overflow-hidden flex flex-col text-center">
                <div className="w-full">
                  <img
                    src="/group-doctor.png"
                    alt="Delivers Trusted, Doctor-Created Content"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-[22px] font-semibold text-[#FA852F] mb-5">
                    Delivers Trusted, Doctor-Created Content
                  </h3>
                  <p className="text-[16px]">
                    All of Medoh's content is created by real doctors. It can be
                    tailored to match the specific physician the patient spoke
                    with, or selected from a trusted group of specialists. This
                    ensures the information is always accurate, relevant, and
                    trustworthy.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#FFF7F2] rounded-2xl overflow-hidden flex flex-col text-center">
                <div className="w-full relative">
                  <img
                    src="/group-doctors2.png"
                    alt="Guides Patients Step-by-Step Through Recovery"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-[22px] font-semibold text-[#FA852F] mb-5">
                    Guides Patients Step-by-Step Through Recovery
                  </h3>
                  <p className="text-[16px]">
                    Medoh provides clear, actionable steps for patients to
                    follow throughout their treatment and recovery journey,
                    making complex medical information accessible and
                    manageable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
