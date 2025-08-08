"use client";
import React, { useState } from "react";
import Slider from "react-slick";
import { FaStar } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./components.css";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    quote:
      "Finally, reliable health answers without the long wait times. The doctors explain everything so clearly in their videos.",
  },
  {
    name: "Dr. Michael Chen",
    role: "Family Physician",
    quote:
      "I love how Medoh Health makes quality medical information accessible to everyone. Great platform for patient education.",
    isDoctor: true,
  },
  {
    name: "Emma Rodriguez",
    role: "Mother of Two",
    quote:
      "As a busy mom, having instant access to doctor answers for common health questions has been a lifesaver.",
  },
  {
    name: "James Taylor",
    role: "Caregiver",
    quote:
      "Having reliable medical info in one place gives me peace of mind when caring for my father.",
  },
];

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 3,
    slidesToScroll: 1,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.2,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.3,
        },
      },
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  return (
    <section className="testimonial-section">
      <h2 className="section-title text-center title-mb">
        Trusted by <span className="highlight">Doctors</span> and{" "}
        <span className="highlight">Patients</span>
      </h2>

      <Slider {...settings}>
        {testimonials.map((item, index) => {
          const middleIndex = currentSlide + 1; // center of 3 visible slides
          const isMiddle =
            index === middleIndex % testimonials.length ||
            (testimonials.length < 3 && index === 1); // fallback for smaller data
          return (
            <div key={index}>
              <div
                className={`testimonial-card slick-slide-content ${
                  isMiddle ? "highlight-card" : ""
                }`}
              >
                <div className="stars flex ">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} color={isMiddle ? "#FFF" : "#FFA500"} />
                  ))}
                </div>
                <p className="quote m-0">"{item.quote}"</p>
                <p className="name mb-0">
                  <strong>{item.name}</strong>
                </p>
                <p className="role">{item.role}</p>
              </div>
            </div>
          );
        })}
      </Slider>
    </section>
  );
};

export default TestimonialsSection;
