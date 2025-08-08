"use client";
import MobileMenu from "@/app/_components/navigation/mobile-menu";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { PatientsHero } from "@/app/_components/PatientsHero";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  EyeIcon,
  IdentificationIcon,
  MagnifyingGlassCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { GlobeAmericasIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import VideoPlayer from "./_components/video-player";
import ContactUs from "./contact-us";
import { Doctor, Video } from "./_types";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import DoctorSlider from "./_components/DoctorSlider";
import Build from "./_components/Build";
import PopularTopics from "./_components/PopularTopics";
import DoctorsSection from "./_components/DoctorsSection";
import TestimonialsSection from "./_components/TestimonialsSection";
import CTASection from "./_components/CTASection";
import { useContentStore } from "@/utils/stores/content-store";
import {
  fetchCommonlyAskedQuestions,
  fetchQuestionsByHealthConcerns,
  fetchQuestionsByHealthConcernsSeparately,
} from "./_api/questions";
import { fetchAllDoctors, fetchDoctorsByHealthConcerns } from "./_api/doctors";
import { getGuestHealthConditions } from "./_api/guest-auth";
import { fetchAllTopics } from "./_api/topics";

const navigation = [{ name: "Contact Us", href: "#contact-us" }];

const conditions = [
  {
    name: "Rotator Cuff Tear & Pain",
    disabled: false,
    image_url: "/landing-page/rotator-cuff-tear.png",
  },
  {
    name: "Knee Arthritis",
    disabled: true,
    image_url: "/landing-page/knee-arthritis.png",
  },
];

export default function Home() {
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
  console.log("relevantTopics", relevantTopics);
  return (
    // <div className="bg-gradient-to-b from-gray-100 to-gray-50 min-h-screen">
    //   <PatientsHero />
    //   <div className="w-full doctor-main">
    //     <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-10 overflow-x-auto overflow-y-visible py-2">
    //       {doctors?.length > 0 && <DoctorSlider slides={doctors} />}
    //     </div>
    //   </div>
    //   <div className="max-w-screen-xl mx-auto">
    //     <div className="flex flex-col items-center text-center justify-start pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 max-w-screen-lg mx-auto gap-8 sm:gap-10">
    //       {user ? (
    //         <Link
    //           href="/dashboard/home"
    //           className="cursor-pointer w-full sm:w-auto text-center uppercase h-12 sm:h-16 px-6 sm:px-8 rounded-xl text-white hover:bg-primary-color-light bg-primary-color flex items-center justify-center mb-8 sm:mb-10 shadow-lg"
    //         >
    //           <p className="w-full text-base sm:text-lg font-semibold text-center">
    //             Go to Portal
    //           </p>
    //         </Link>
    //       ) : (
    //         <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8 sm:mb-10 w-full">
    //           <Link
    //             href="/auth/signup"
    //             className="cursor-pointer w-full sm:w-auto text-center uppercase h-12 sm:h-16 px-6 sm:px-8 rounded-xl text-white hover:bg-primary-color-light bg-primary-color flex items-center justify-center shadow-lg"
    //           >
    //             <p className="text-base sm:text-lg font-semibold">Sign Up</p>
    //           </Link>
    //           <Link
    //             href="/dashboard/home"
    //             className="cursor-pointer w-full sm:w-auto text-center uppercase h-12 sm:h-16 px-6 sm:px-8 rounded-xl text-blue-600 border-2 border-blue-600 hover:bg-blue-50 flex items-center justify-center"
    //           >
    //             <p className="text-base sm:text-lg font-semibold">
    //               Browse as Guest
    //             </p>
    //           </Link>
    //         </div>
    //       )}

    //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
    //         {conditions.map((condition, index) => (
    //           <div
    //             key={index}
    //             className="h-32 sm:h-40 w-full relative shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300 rounded-lg overflow-hidden"
    //           >
    //             <Link
    //               aria-disabled={condition.disabled}
    //               href={condition.disabled ? "" : "/dashboard/home"}
    //               style={{
    //                 backgroundImage: `url(${condition.image_url}), var(--card-background-primary-gradient)`,
    //               }}
    //               className="block h-full w-full p-4 sm:p-6 bg-cover bg-center bg-no-repeat aria-disabled:blur-sm rounded-lg"
    //             />
    //             <span className="text-sm sm:text-lg font-semibold text-white flex flex-col absolute w-full text-center bottom-2 sm:bottom-3 px-2">
    //               <p className="leading-tight">{condition.name}</p>
    //               <p className="text-xs sm:text-sm">
    //                 {condition.disabled && " (Coming Soon)"}
    //               </p>
    //             </span>
    //           </div>
    //         ))}
    //       </div>

    //       <div className="w-full">
    //         <p className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10">
    //           Popular Searches
    //         </p>
    //         <div className="flex flex-col gap-y-4 sm:gap-y-6 lg:flex-row lg:gap-x-3 justify-center items-center">
    //           {popularVideos.length &&
    //             popularVideos.map((video, index) => (
    //               <div key={video.id} className="w-full max-w-sm">
    //                 <VideoPlayer
    //                   id={video.id}
    //                   url={video.url}
    //                   name={video.name}
    //                   autoplay={false}
    //                   mute={false}
    //                   width="100%"
    //                 />
    //               </div>
    //             ))}
    //         </div>
    //       </div>

    //       <div className="mb-6 w-full">
    //         <p className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10">
    //           How Medoh works?
    //         </p>
    //         <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-evenly">
    //           <div className="flex flex-col justify-center items-center w-full max-w-60 text-center">
    //             <MagnifyingGlassCircleIcon className="text-primary-color w-16 sm:w-24 mb-4" />
    //             <p className="text-lg sm:text-xl mb-2 font-semibold">
    //               Ask a Question
    //             </p>
    //             <p className="text-sm sm:text-base text-gray-600">
    //               Submit your medical questions on our platform
    //             </p>
    //           </div>

    //           <ArrowRightIcon className="w-0 lg:w-16 hidden lg:block" />
    //           <ArrowDownIcon className="w-8 sm:w-10 lg:hidden" />

    //           <div className="flex flex-col justify-center items-center w-full max-w-60 text-center">
    //             <UserIcon className="text-primary-color w-16 sm:w-24 mb-4" />
    //             <p className="text-lg sm:text-xl mb-2 font-semibold">
    //               Doctor Answers
    //             </p>
    //             <p className="text-sm sm:text-base text-gray-600">
    //               A qualified doctor answers your question
    //             </p>
    //           </div>

    //           <ArrowRightIcon className="w-0 lg:w-16 hidden lg:block" />
    //           <ArrowDownIcon className="w-8 sm:w-10 lg:hidden" />

    //           <div className="flex flex-col justify-center items-center w-full max-w-60 text-center">
    //             <EyeIcon className="text-primary-color w-16 sm:w-24 mb-4" />
    //             <p className="text-lg sm:text-xl mb-2 font-semibold">
    //               Watch and Learn
    //             </p>
    //             <p className="text-sm sm:text-base text-gray-600">
    //               View your video answer and gain insights from an expert
    //             </p>
    //           </div>
    //         </div>
    //       </div>

    //       <div className="mb-6 w-full">
    //         <p className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10">
    //           Why Choose Medoh?
    //         </p>
    //         <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-evenly">
    //           <div className="flex flex-col justify-center items-center w-full max-w-60 text-center">
    //             <UserGroupIcon className="text-primary-color w-16 sm:w-24 mb-4" />
    //             <p className="text-lg sm:text-xl mb-2 font-semibold">
    //               Expert Doctors
    //             </p>
    //             <p className="text-sm sm:text-base text-gray-600">
    //               Get advice from experienced and trusted medical professionals
    //             </p>
    //           </div>

    //           <div className="flex flex-col justify-center items-center w-full max-w-60 text-center">
    //             <GlobeAmericasIcon className="text-primary-color w-16 sm:w-24 mb-4" />
    //             <p className="text-lg sm:text-xl mb-2 font-semibold">
    //               Easy Access
    //             </p>
    //             <p className="text-sm sm:text-base text-gray-600">
    //               Conveniently access video answers anytime, anywhere
    //             </p>
    //           </div>

    //           <div className="flex flex-col justify-center items-center w-full max-w-60 text-center">
    //             <IdentificationIcon className="text-primary-color w-16 sm:w-24 mb-4" />
    //             <p className="text-lg sm:text-xl mb-2 font-semibold">
    //               Personalized Responses
    //             </p>
    //             <p className="text-sm sm:text-base text-gray-600">
    //               Receive information specific to your health concerns
    //             </p>
    //           </div>
    //         </div>
    //       </div>

    //       <div className="flex flex-col items-center mb-6 w-full">
    //         <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-center leading-tight">
    //           Join Medoh Health today and get the answers you need from the
    //           doctors you trust
    //         </p>
    //         <Link
    //           href="/dashboard/home"
    //           className="cursor-pointer flex flex-row items-center justify-center w-full sm:w-auto text-center uppercase h-12 sm:h-16 px-6 sm:px-8 rounded-xl text-white hover:bg-primary-color-light bg-primary-color mt-6 shadow-lg"
    //         >
    //           <div className="flex flex-row items-center">
    //             <p className="text-sm sm:text-base font-bold">Start Now</p>
    //           </div>
    //         </Link>
    //       </div>

    //       <div
    //         className="mb-6 flex flex-col w-full sm:w-[80%] lg:w-[60%]"
    //         id="contact-us"
    //       >
    //         <p className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10">
    //           Contact Us
    //         </p>
    //         <ContactUs />
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div>
      <Header />
      <PatientsHero />
      <DoctorSlider />
      <Build />
      <PopularTopics relevantTopics={relevantTopics} />
      <DoctorsSection
        title="Meet Our Doctors, You're in"
        highlight="Good Hands"
        description="Are You a Medical Professional?"
        doctors={doctors}
      />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
