"use client";
import React from "react";
import { FaStethoscope, FaGraduationCap, FaVideo } from "react-icons/fa";
import { LuMapPinned } from "react-icons/lu";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import "./components.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const DoctorsSection = ({ highlight, title, description, doctors }: any) => {
  const router = useRouter();
  const swiperRef = React.useRef<any>(null);

  const goNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const goPrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  return (
    <section className="doctor-section">
      <h2 className="section-title text-center m-0 p-0">
        {title} <span className="highlight">{highlight}</span>
      </h2>

      <div className="doctor-swiper-container">
        {doctors?.length > 0 && (
          <button className="swiper-button-prev-custom" onClick={goPrev}>
            <IoChevronBack />
          </button>
        )}

        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          navigation={false}
          // pagination={{ clickable: true }}
          autoplay={
            {
              // delay: 3000,
              // disableOnInteraction: false,
            }
          }
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
          }}
          className="doctors-swiper"
        >
          {doctors?.length > 0 &&
            doctors.map((doc: any, index: any) => (
              <SwiperSlide key={index}>
                <div
                  className="doctor-main-card"
                  onClick={() => router.push(`/dashboard/doctors/${doc.id}`)}
                >
                  <div className="doctor-img">
                    <img
                      src={doc.picture_url}
                      alt={doc.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/doctor-sample.png";
                      }}
                    />
                  </div>
                  <h5 className="doctor-name">{doc.name}</h5>
                  <div className="doctor-card">
                    <div className="doctor-info">
                      <div className="flex items-start gap-3">
                        <div className="block">
                          <LuMapPinned className="text-xl mt-1" />
                        </div>
                        <div>
                          <div className="fw-semibold">Location:</div>
                          <p className="mb-0">{doc?.city}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="block">
                          <FaStethoscope className="text-xl mt-1" />
                        </div>
                        <div>
                          <div className="fw-semibold">Specialty:</div>
                          <p className="mb-0">{doc?.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 mt-2">
                        <div className="block">
                          <FaGraduationCap className="text-xl mt-1" />
                        </div>
                        <div>
                          <div className="fw-semibold">Training:</div>
                          <p className="mb-0">{doc?.training}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 mt-2">
                        <div className="block">
                          <FaVideo className="text-xl mt-1" />
                        </div>
                        <div>
                          <p className="mb-0">{doc?.videos}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
        </Swiper>
        {doctors?.length > 0 && (
          <button className="swiper-button-next-custom" onClick={goNext}>
            <IoChevronForward />
          </button>
        )}
      </div>

      <div className="text-center mt-6">
        {description && <h6 className="professional">{description}</h6>}
        <button
          className="orange-button mx-auto"
          onClick={() => router.push("/dashboard/doctors")}
        >
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
      </div>
    </section>
  );
};

export default DoctorsSection;
