"use client";
import React from "react";
import Image from "next/image";
import styles from "./services.module.css";

const partnerLogos = [
  { src: "/l-1.png", alt: "Stanford" },
  { src: "/l-2.png", alt: "UCSF Health" },
  { src: "/l-3.png", alt: "Duke University Hospital" },
  { src: "/l-4.png", alt: "Ossio" },
  { src: "/l-5.png", alt: "SmithNephew" },
  { src: "/l-6.png", alt: "Arthrex" },
  { src: "/l-1.png", alt: "Stanford" },
  { src: "/l-2.png", alt: "UCSF Health" },
  { src: "/l-3.png", alt: "Duke University Hospital" },
  { src: "/l-4.png", alt: "Ossio" },
  { src: "/l-5.png", alt: "SmithNephew" },
  { src: "/l-6.png", alt: "Arthrex" },
];

function getFullSlides(logos: any, logosPerSlide: any) {
  const minSlides = Math.ceil(logos.length / logosPerSlide);
  const needed = minSlides * logosPerSlide;
  const filled = [...logos];
  let i = 0;
  while (filled.length < needed) {
    filled.push(logos[i % logos.length]);
    i++;
  }
  const slides = [];
  for (let j = 0; j < filled.length; j += logosPerSlide) {
    slides.push(filled.slice(j, j + logosPerSlide));
  }
  return slides;
}

export default function TrustedPartners() {
  const [logosPerSlide, setLogosPerSlide] = React.useState(6);

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1200) setLogosPerSlide(6);
      else if (window.innerWidth >= 768) setLogosPerSlide(4);
      else setLogosPerSlide(2);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const slides = getFullSlides(partnerLogos, logosPerSlide);

  return (
    <section className={styles.partnersSection}>
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <h3 className="section-title title-mb text-center">
          Trusted <span className={styles.orangeHighlight}>Partners</span>
        </h3>

        <div className="overflow-hidden relative">
          <div
            className={`${styles.partnerCarousel} flex transition-all duration-500 animate-slide`}
          >
            {slides.map((group: any, idx: any) => (
              <div
                key={idx}
                className="min-w-full flex justify-center gap-6 py-4"
              >
                {group.map((logo: any, i: any) => (
                  <div key={logo.alt + i} className={styles.logoWrapper}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={200}
                      height={50}
                      className={styles.partnerLogo}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <button className="orange-button mx-auto">Become a Partner</button>
        </div>
      </div>
    </section>
  );
}
