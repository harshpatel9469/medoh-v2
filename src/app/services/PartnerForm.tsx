"use client";

import React, { useState } from "react";
import styles from "./services.module.css";
import {useRouter} from 'next/navigation';
const PartnerForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    occupation: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <section className="signup-section">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Partner{" "}
            <span className="text-orange-500">
              With <span className="text-black">Us</span> Today
            </span>
          </h2>
          <p className="text-gray-600">
            Join thousands of people who trust Medoh Health for reliable,
            doctor-verified health information.
          </p>
        </div>

        <div className={styles.signupCard}>
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <input
                type="text"
                name="occupation"
                placeholder="Occupation/Specialty"
                value={formData.occupation}
                onChange={handleChange}
                className="form-input"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="mb-6">
              <textarea
                rows={4}
                name="message"
                placeholder="Leave us a message..."
                value={formData.message}
                onChange={handleChange}
                className="form-textarea w-full"
              />
            </div>

            <button type="submit" className="orange-button mx-auto" onClick={()=>router.push("/auth/signup")}>
              <span>SIGN UP</span>
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
          </form>
        </div>
      </div>
    </section>
  );
};

export default PartnerForm;
