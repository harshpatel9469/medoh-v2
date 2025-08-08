"use client";

import React, { useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import { useRouter } from "next/navigation";
import "../_components/components.css";

const SignUpForm = () => {
const router = useRouter()
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
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  return (
    <section className="signup-section">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full md:w-10/12 lg:w-8/12">
            <div className="text-center title-mb">
              <h2 className="signup-title">
                Start Getting <span className="highlight">Answers Today</span>
              </h2>
              <p className="signup-subtitle">
                Join thousands of doctors who trust Medoh Health for reliable,
                doctor-verified and easy patient education health information.
              </p>
            </div>

            <div className="signup-card bg-white rounded shadow">
              <div className="p-10">
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-wrap -mx-2 mb-4">
                    <div className="w-full md:w-1/2 px-2 mb-3 md:mb-0">
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input w-full"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2">
                      <input
                        type="text"
                        name="location"
                        placeholder="Location"
                        value={formData.location}
                        onChange={handleChange}
                        className="form-input w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-2 mb-4">
                    <div className="w-full md:w-1/2 px-2 mb-3 md:mb-0">
                      <input
                        type="text"
                        name="occupation"
                        placeholder="Occupation/Specialty"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="form-input w-full"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input w-full"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <textarea
                      rows={4}
                      name="message"
                      placeholder="Leave us a message..."
                      value={formData.message}
                      onChange={handleChange}
                      className="form-textarea w-full"
                    />
                  </div>

                  <div className="text-center">
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
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUpForm;
