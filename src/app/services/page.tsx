import React from "react";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import HeroSection from "./HeroSection";
import TrustedPartners from "./TrustedPartners";
import HowMedohWorks from "./HowMedohWorks";
import PatientEducation from "./PatientEducation";
import PartnerForm from "./PartnerForm";

export default function Page() {
  return (
    <>
      <Header />
      <HeroSection />
      <HowMedohWorks />
      <TrustedPartners />
      <PatientEducation />
      <PartnerForm />
      <Footer />
    </>
  );
}
