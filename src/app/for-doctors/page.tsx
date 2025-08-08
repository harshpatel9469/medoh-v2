'use client';
import Image from "next/image";
import React, { useEffect, useState } from "react";
import "./for-doctors.css";
import Header from "../_components/Header";
import { Doctor, Video } from "../_types";
import Footer from "../_components/Footer";
import DoctorsHero from "./DoctorsHero";
import HowMedohWorksDR from "./HowMedohWorksDR";
import DoctorsSection from "../_components/DoctorsSection";
import TestimonialsSection from "../_components/TestimonialsSection";
import SignUpForm from "./SignUpForm";
import LegalCompliance from "./LegalCompliance";
import { useContentStore } from "@/utils/stores/content-store";
import { supabase } from "@/utils/supabase/client";
import { fetchAllTopics } from "@/app/_api/topics";
import { fetchCommonlyAskedQuestions, fetchQuestionsByHealthConcerns, fetchQuestionsByHealthConcernsSeparately } from "@/app/_api/questions";
import { fetchAllDoctors, fetchDoctorsByHealthConcerns } from "@/app/_api/doctors";
import { getGuestHealthConditions } from "@/app/_api/guest-auth";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [popularVideos, setPopularVideos] = useState<Video[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [guestHealthConcerns, setGuestHealthConcerns] = useState<string[]>([]);
  const getDisplayName = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "there";
  };

  const displayName = getDisplayName();
  // Helper function to get current user's health concerns (authenticated or guest)
  const getCurrentHealthConcerns = () => {
    if (user?.health_concerns && user.health_concerns.length > 0) {
      return user.health_concerns;
    }
    if (guestHealthConcerns.length > 0) {
      return guestHealthConcerns;
    }
    return [];
  };

  // Filter topics based on user's health concerns
  const getRelevantTopics = () => {
    const healthConcerns = getCurrentHealthConcerns();
    if (healthConcerns.length === 0) {
      return topics;
    }
    return topics.filter((topic) =>
      healthConcerns.some((concern) => {
        const concernLower = concern.toLowerCase();
        const topicNameLower = topic.name.toLowerCase();
        // Only show topics that exactly match the user's selected health concerns
        return topicNameLower === concernLower;
      })
    );
  };
  const {
    topics,
    commonQuestions,
    savedVideos,
    recentSearches,
    faqsByConcern,
    setFaqsByConcern,
    clearFaqsByConcern,
    isLoading: storeLoading,
    setTopics,
    setCommonQuestions,
    setSavedVideos,
    setRecentSearches,
    setLoading: setStoreLoading,
    isDataStale,
  } = useContentStore();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);

        // Fetch user profile if authenticated
        if (currentUser) {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", currentUser.id)
              .single();

            if (profile) {
              setUserProfile(profile);
            }
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);
          }
        }

        // Fetch popular videos
        const { data: videos, error: videosError } = await supabase
          .from("videos")
          .select()
          .eq("popular_video", true)
          .limit(3);

        if (videosError) {
          throw new Error(`Error fetching videos: ${videosError.message}`);
        }
        setPopularVideos(videos || []);
        const guestConcerns = await getGuestHealthConditions();
        if (guestConcerns.length > 0) {
          setGuestHealthConcerns(guestConcerns);
        } else {
        }

        // Fetch featured doctors
        const { data: doctorsData, error: doctorsError } = await supabase
          .from("doctors")
          .select()
          .eq("featured", true)
          .limit(5);

        if (doctorsError) {
          throw new Error(`Error fetching doctors: ${doctorsError.message}`);
        }
        setDoctors(doctorsData || []);
        const fetchPromises = [];
        const currentHealthConcerns = getCurrentHealthConcerns();
        if (topics.length === 0 || isDataStale("topics")) {
          fetchPromises.push(
            fetchAllTopics().then((topicsData) => setTopics(topicsData))
          );
        }
        if (currentHealthConcerns.length > 0) {
          // Fetch personalized content if not cached
          if (commonQuestions.length === 0 || isDataStale("commonQuestions")) {
            fetchPromises.push(
              fetchQuestionsByHealthConcerns(currentHealthConcerns).then(
                (relevantQuestions) => setCommonQuestions(relevantQuestions)
              )
            );
          }

          if (doctors.length === 0 || isDataStale("doctors")) {
            fetchPromises.push(
              fetchDoctorsByHealthConcerns(currentHealthConcerns).then(
                (relevantDoctors) => setDoctors(relevantDoctors)
              )
            );
          }

          // Always fetch questions by concern separately as it's dynamic
          fetchPromises.push(
            fetchQuestionsByHealthConcernsSeparately(currentHealthConcerns)
              .then((questionsByConcernData) => {
                setFaqsByConcern(questionsByConcernData);
              })
              .catch((error) =>
                console.error("Error fetching FAQs by concern:", error)
              )
          );
        } else {
          // Fetch general content if not cached
          if (commonQuestions.length === 0 || isDataStale("commonQuestions")) {
            fetchPromises.push(
              fetchCommonlyAskedQuestions().then((commonQuestions) =>
                setCommonQuestions(commonQuestions)
              )
            );
          }

          if (doctors.length === 0 || isDataStale("doctors")) {
            fetchPromises.push(
              fetchAllDoctors().then((allDoctors) => setDoctors(allDoctors))
            );
          }

          // For users without health concerns, no FAQs to load
        }

        // Execute all fetch promises in parallel
        await Promise.all(fetchPromises);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const relevantTopics = getRelevantTopics();
  return (
    <>
      <Header />
      <main className="for-doctors-page">
        <div className="w-full px-4">
          <div
            className="flex flex-wrap items-center"
            style={{ minHeight: "calc(100vh - 76px)" }}
          >
            {/* Right Half - Text Content */}
            <div className="w-full lg:w-1/2 flex items-center">
              <DoctorsHero />
            </div>
            {/* Left Half - Image */}
            <div className="w-full lg:w-1/2" style={{ padding: "0px" }}>
              <div className="relative hidden lg:block">
                <div className="hero-abs flex gap-2">
                  <Image
                    src="/banner-2.png"
                    alt="Medoh Service Preview"
                    width={220}
                    height={392}
                    className="rounded sec-img"
                    style={{ objectFit: "contain" }}
                    priority
                  />
                  <Image
                    src="/banner-3.png"
                    alt="Medoh Service Preview"
                    width={220}
                    height={392}
                    className="rounded sec-img"
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </div>
                <Image
                  src="/banner1.png"
                  alt="Medoh Service Preview"
                  width={583}
                  height={440}
                  className="rounded ms-auto d-block hero-bg-img"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <div className="flex justify-center p-0 lg:hidden">
                <Image
                  src="/poster2.png"
                  alt="Medoh Service Preview"
                  width={600}
                  height={400}
                  className="img rounded w-full h-full"
                  style={{ objectFit: "contain", maxHeight: 420 }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <HowMedohWorksDR />
      <div className="doctors-section-container">
        <DoctorsSection title="Our Expert " highlight="Community" doctors={doctors}/>
      </div>
      <div className="testimonials-section-container">
        <TestimonialsSection />
      </div>
      <SignUpForm />
      <LegalCompliance />
      <Footer />
    </>
  );
}
