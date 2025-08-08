"use client";
import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/utils/supabase/client";
import {
  fetchCommonlyAskedQuestions,
  fetchQuestionsByHealthConcerns,
  fetchQuestionsByHealthConcernsSeparately,
} from "@/app/_api/questions";
import { fetchAllTopics } from "@/app/_api/topics";
import {
  fetchAllDoctors,
  fetchDoctorsByHealthConcerns,
  fetchDoctorsByIds,
} from "@/app/_api/doctors";
import { getPartialSavedVideos } from "@/app/_api/saved-videos";
import { fetchVideosByQuestionIdsBatch } from "@/app/_api/videos";
import { Topic } from "@/app/_types";
import TopicCard from "@/app/_components/cards/topic-card";
import VideoCard from "@/app/_components/cards/video-card";
import HealthConcernsForm from "@/app/_components/forms/health-concerns-form";
import LoadingSpinner, {
  HomePageSkeleton,
} from "@/app/_components/loading-spinner";
import {
  getRecentSearches,
  cleanupDuplicateSearches,
} from "@/utils/search-history";
import { useContentStore } from "@/utils/stores/content-store";
import DoctorCard from "@/app/_components/cards/doctor-card";
import { getGuestHealthConditions } from "@/app/_api/guest-auth";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  health_concerns?: string[] | null;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [hasCompletedHealthForm, setHasCompletedHealthForm] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [updatingHealthConcerns, setUpdatingHealthConcerns] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [associatedDoctors, setAssociatedDoctors] = useState<any[]>([]);

  // Remove doctorsByConcern and instead aggregate all doctors for all selected conditions
  const [allAssociatedDoctors, setAllAssociatedDoctors] = useState<any[]>([]);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [searchDoctorsLoading, setSearchDoctorsLoading] = useState(true);
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  // Guest user state for health concerns
  const [guestHealthConcerns, setGuestHealthConcerns] = useState<string[]>([]);
  const [isGuest, setIsGuest] = useState(false);

  // Use content store for caching
  const {
    topics,
    doctors,
    commonQuestions,
    savedVideos,
    recentSearches,
    faqsByConcern,
    setFaqsByConcern,
    clearFaqsByConcern,
    isLoading: storeLoading,
    setTopics,
    setDoctors,
    setCommonQuestions,
    setSavedVideos,
    setRecentSearches,
    setLoading: setStoreLoading,
    isDataStale,
  } = useContentStore();

  useEffect(() => {
    // Skip if we've already initialized and have data
    if (hasInitialized && topics.length > 0 && commonQuestions.length > 0) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Get current user (only once)
        let {
          data: { user: currentAuthUser },
        } = await supabase.auth.getUser();
        setAuthUser(currentAuthUser);

        // Ensure guest authentication for all users
        if (!currentAuthUser) {
          // No user found, sign in anonymously
          console.log("🔍 No user found, signing in anonymously...");
          const { data, error } = await supabase.auth.signInAnonymously();
          if (data?.user) {
            console.log("✅ Guest signed in successfully:", data.user.id);
            setAuthUser(data.user);
            currentAuthUser = data.user;
          } else {
            console.error("❌ Guest sign-in failed:", error);
          }
        } else {
          console.log("👤 User already authenticated:", currentAuthUser.id);
        }

        // Only fetch user profile if we don't have it yet
        if (currentAuthUser && !user) {
          try {
            const { data: userProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", currentAuthUser.id)
              .single();

            if (userProfile) {
              setUser(userProfile);
              if (
                userProfile.health_concerns === null ||
                userProfile.health_concerns === undefined
              ) {
                setShowHealthModal(true);
                setHasCompletedHealthForm(false);
              } else {
                setHasCompletedHealthForm(true);
                setShowHealthModal(false);
              }
            } else {
              // No user profile found, check for guest health conditions
              const guestConcerns = await getGuestHealthConditions();
              if (guestConcerns.length > 0) {
                setGuestHealthConcerns(guestConcerns);
                setHasCompletedHealthForm(true);
                setShowHealthModal(false);
              } else {
                setShowHealthModal(true);
                setHasCompletedHealthForm(false);
              }

              setUser({
                id: currentAuthUser.id,
                first_name: currentAuthUser.user_metadata?.first_name,
                last_name: currentAuthUser.user_metadata?.last_name,
                health_concerns: null,
              });
            }
          } catch (profileError) {
            // Check for guest health conditions on error
            const guestConcerns = await getGuestHealthConditions();
            if (guestConcerns.length > 0) {
              setGuestHealthConcerns(guestConcerns);
              setHasCompletedHealthForm(true);
              setShowHealthModal(false);
            } else {
              setShowHealthModal(true);
              setHasCompletedHealthForm(false);
            }

            setUser({
              id: currentAuthUser.id,
              first_name: currentAuthUser.user_metadata?.first_name,
              last_name: currentAuthUser.user_metadata?.last_name,
              health_concerns: null,
            });
          }
        }

        // Check if user is a guest
        if (currentAuthUser) {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name, zip_code")
              .eq("id", currentAuthUser.id)
              .single();

            const isGuestUser =
              !profile ||
              !profile.first_name ||
              !profile.last_name ||
              !profile.zip_code;
            setIsGuest(isGuestUser);
          } catch (error) {
            console.error("Error checking guest status:", error);
            setIsGuest(true);
          }
        } else {
          setIsGuest(true);
        }

        // Only fetch content data if we don't have it or it's stale
        const fetchPromises = [];

        // Fetch topics if not cached or stale
        if (topics.length === 0 || isDataStale("topics")) {
          fetchPromises.push(
            fetchAllTopics().then((topicsData) => setTopics(topicsData))
          );
        }

        // Fetch saved videos if user is authenticated (not guest) and not cached
        if (
          currentAuthUser &&
          !isGuest &&
          (savedVideos.length === 0 || isDataStale("savedVideos"))
        ) {
          fetchPromises.push(
            getPartialSavedVideos(currentAuthUser.id, 6)
              .then((savedVideosData) => setSavedVideos(savedVideosData))
              .catch((error) =>
                console.error("Error fetching saved videos:", error)
              )
          );
        }

        // Load recent searches if user is authenticated and not cached
        if (
          currentAuthUser &&
          (recentSearches.length === 0 || isDataStale("recentSearches"))
        ) {
          fetchPromises.push(
            getRecentSearches(currentAuthUser.id)
              .then(async (searches) => {
                // Clean up any existing duplicates
                await cleanupDuplicateSearches(currentAuthUser.id);
                // Get the cleaned searches
                const cleanedSearches = await getRecentSearches(
                  currentAuthUser.id
                );
                setRecentSearches(cleanedSearches);
              })
              .catch((error) =>
                console.error("Error fetching recent searches:", error)
              )
          );
        }

        // Fetch questions and doctors based on user's health concerns
        const currentHealthConcerns = getCurrentHealthConcerns();

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
        setHasInitialized(true);
      }
    };
    fetchData();
    // Set default selected condition - update this to be more responsive
    const healthConcerns = getCurrentHealthConcerns();
    if (healthConcerns.length > 0) {
      // Only set if no condition is selected or if the current selection is not in the new list
      if (!selectedCondition || !healthConcerns.includes(selectedCondition)) {
        setSelectedCondition(healthConcerns[0]);
      }
    } else {
      // Clear selection if no health concerns
      setSelectedCondition(null);
    }
  }, [user, guestHealthConcerns, selectedCondition]); // Include selectedCondition to prevent infinite loops

  useEffect(() => {
    const getDoctorsForUserConcerns = async () => {
      setDoctorsLoading(true);
      const healthConcerns = getCurrentHealthConcerns();
      if (healthConcerns.length === 0) {
        setAllAssociatedDoctors([]);
        setDoctorsLoading(false);
        return;
      }

      // Collect all question IDs first
      const allQuestionIds: string[] = [];
      for (const concern of healthConcerns) {
        const questions = faqsByConcern[concern] || [];
        for (const question of questions) {
          if (question.id) {
            allQuestionIds.push(question.id);
          }
        }
      }

      if (allQuestionIds.length === 0) {
        setAllAssociatedDoctors([]);
        setDoctorsLoading(false);
        return;
      }

      // Fetch all videos in a single batch query
      const videosByQuestion = await fetchVideosByQuestionIdsBatch(
        allQuestionIds
      );

      // Extract doctor IDs from all videos
      let doctorIds: string[] = [];
      Object.values(videosByQuestion).forEach((videos: any[]) => {
        videos.forEach((video: any) => {
          if (video.doctor_id) {
            doctorIds.push(video.doctor_id);
          }
        });
      });

      doctorIds = Array.from(new Set(doctorIds));
      if (doctorIds.length > 0) {
        const docs = await fetchDoctorsByIds(doctorIds);
        setAllAssociatedDoctors(docs);
      } else {
        setAllAssociatedDoctors([]);
      }
      setDoctorsLoading(false);
    };
    const healthConcerns = getCurrentHealthConcerns();
    if (healthConcerns.length > 0 && Object.keys(faqsByConcern).length > 0) {
      getDoctorsForUserConcerns();
    } else {
      setDoctorsLoading(false);
    }
  }, [user?.health_concerns, guestHealthConcerns, faqsByConcern]);

  useEffect(() => {
    // Set allDataLoaded to true when we have essential data and all loading is complete
    const hasEssentialData = topics.length > 0 && commonQuestions.length > 0;
    const isLoadingComplete =
      !loading &&
      !storeLoading &&
      hasInitialized &&
      !doctorsLoading &&
      !searchDoctorsLoading;

    if (isLoadingComplete && hasEssentialData) {
      setAllDataLoaded(true);
      setInitialLoadComplete(true);
    }
  }, [
    loading,
    storeLoading,
    hasInitialized,
    doctorsLoading,
    searchDoctorsLoading,
    topics.length,
    commonQuestions.length,
  ]);

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

  // Function to refresh saved videos when user interacts with video
  const refreshSavedVideos = async () => {
    if (authUser && !isGuest) {
      try {
        const savedVideosData = await getPartialSavedVideos(authUser.id, 6);
        setSavedVideos(savedVideosData);
      } catch (error) {
        console.error("Error refreshing saved videos:", error);
      }
    }
  };

  // Filter questions based on user's health concerns
  const getRelevantQuestions = () => {
    const healthConcerns = getCurrentHealthConcerns();
    if (healthConcerns.length === 0) {
      return commonQuestions.slice(0, 6);
    }
    return commonQuestions
      .filter((question: any) =>
        healthConcerns.some((concern) => {
          const concernLower = concern.toLowerCase();
          const questionLower = question.question_text.toLowerCase();
          if (questionLower.includes(concernLower)) {
            return true;
          }
          const concernWords = concernLower
            .split(" ")
            .filter((word: string) => word.length > 2);
          const questionWords = questionLower
            .split(" ")
            .filter((word: string) => word.length > 2);
          const matchingWords = concernWords.filter((concernWord: string) =>
            questionWords.some((questionWord: string) =>
              questionWord.includes(concernWord)
            )
          );
          return matchingWords.length >= Math.min(2, concernWords.length);
        })
      )
      .slice(0, 6);
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

  // Memoize relevantQuestions so it does not change when setAssociatedDoctors is called
  const relevantQuestions = useMemo(
    () => getRelevantQuestions(),
    [user?.health_concerns, guestHealthConcerns, commonQuestions]
  );

  useEffect(() => {
    const getDoctorsForSearchResults = async () => {
      setSearchDoctorsLoading(true);
      const questionIds = relevantQuestions
        .map((q: any) => q.id)
        .filter(Boolean);

      if (questionIds.length === 0) {
        setAssociatedDoctors([]);
        setSearchDoctorsLoading(false);
        return;
      }

      // Fetch all videos in a single batch query
      const videosByQuestion = await fetchVideosByQuestionIdsBatch(questionIds);

      // Extract doctor IDs from all videos
      let doctorIds: string[] = [];
      Object.values(videosByQuestion).forEach((videos: any[]) => {
        videos.forEach((video: any) => {
          if (video.doctor_id) {
            doctorIds.push(video.doctor_id);
          }
        });
      });

      // Remove duplicates
      doctorIds = Array.from(new Set(doctorIds));
      if (doctorIds.length > 0) {
        const docs = await fetchDoctorsByIds(doctorIds);
        setAssociatedDoctors(docs);
      } else {
        setAssociatedDoctors([]);
      }
      setSearchDoctorsLoading(false);
    };
    if (relevantQuestions.length > 0) {
      getDoctorsForSearchResults();
    } else {
      setSearchDoctorsLoading(false);
    }
  }, [relevantQuestions]);

  // Helper to get topic description by name
  const getTopicDescription = (name: string) => {
    const topic = topics.find((t: any) => t.name === name);
    return topic?.description || "";
  };

  // Show skeleton until essential data is loaded or when updating health concerns
  if (!allDataLoaded || updatingHealthConcerns) {
    return <HomePageSkeleton />;
  }

  const relevantTopics = getRelevantTopics();

  const getDisplayName = () => {
    if (user?.first_name) {
      return user.first_name;
    }
    if (authUser?.user_metadata?.first_name) {
      return authUser.user_metadata.first_name;
    }
    if (authUser?.email) {
      return authUser.email.split("@")[0];
    }
    return "Guest";
  };

  const displayName = getDisplayName();

  const handleSaveHealthConcerns = async (concerns: string[]) => {
    // Reset selected condition when health concerns change
    setSelectedCondition(null);
    setUpdatingHealthConcerns(true);

    // Update user state for authenticated users
    if (authUser) {
      setUser((prev) => (prev ? { ...prev, health_concerns: concerns } : null));
    } else {
      // Update guest health concerns for non-authenticated users
      setGuestHealthConcerns(concerns);
    }

    setShowHealthModal(false);
    setShowHealthForm(false);
    setHasCompletedHealthForm(true);
    try {
      if (concerns.length > 0) {
        const [relevantQuestions, relevantDoctors, questionsByConcernData] =
          await Promise.all([
            fetchQuestionsByHealthConcerns(concerns),
            fetchDoctorsByHealthConcerns(concerns),
            fetchQuestionsByHealthConcernsSeparately(concerns),
          ]);
        setCommonQuestions(relevantQuestions);
        setDoctors(relevantDoctors);
        setFaqsByConcern(questionsByConcernData);

        // Set the first new condition as selected after data is loaded
        if (concerns.length > 0) {
          setSelectedCondition(concerns[0]);
        }
      } else {
        const [commonQuestions, allDoctors] = await Promise.all([
          fetchCommonlyAskedQuestions(),
          fetchAllDoctors(),
        ]);
        setCommonQuestions(commonQuestions);
        setDoctors(allDoctors);
        clearFaqsByConcern();
      }
    } catch (error) {
      console.error("Error refreshing personalized content:", error);
    } finally {
      setUpdatingHealthConcerns(false);
    }
  };

  // Dropdown for selecting condition
  const renderConditionDropdown = () => {
    const healthConcerns = getCurrentHealthConcerns();
    if (healthConcerns.length === 0) return null;
    return (
      <div className="relative inline-block ml-4" ref={dropdownRef}>
        <button
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm hover:bg-gray-50 min-w-[180px]"
          onClick={() => setDropdownOpen((open) => !open)}
          type="button"
        >
          <span className="truncate font-medium text-gray-800">
            {selectedCondition || "Select Concern"}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
            {healthConcerns.map((concern) => (
              <button
                key={concern}
                className={`block w-full text-left px-4 py-2 hover:bg-orange-50 ${
                  selectedCondition === concern
                    ? "bg-orange-100 font-semibold"
                    : ""
                }`}
                onClick={() => {
                  setSelectedCondition(concern);
                  setDropdownOpen(false);
                }}
              >
                {concern}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="lg:mx-4 space-y-8">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome, {displayName}</h1>
          <p>We’re here for youWe’re here for you</p>
        </div>
        <div className="welcome-button">
          {!hasCompletedHealthForm && (
            <button
              onClick={() => setShowHealthModal(true)}
              className="orange-button !font-normal"
            >
              <span className="!font-normal">
                Get access to personalized Q&As with a few quick questions
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
          {hasCompletedHealthForm && (
            <button
              onClick={() => setShowHealthForm(true)}
              className="orange-button "
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="!font-normal"> Change health concerns</span>
            </button>
          )}
        </div>
      </div>

      {/* Health Condition Info (if user has concerns) */}
      {getCurrentHealthConcerns().length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-3">Your Conditions</h2>
          <div className="space-y-4">
            {getCurrentHealthConcerns().map((concern, index) => {
              const topic = topics.find((t: any) => t.name === concern);
              return (
                <div
                  key={index}
                  className="border-l-4 border-orange-500 pl-4 relative"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{concern}</h3>
                    {topic && (
                      <button
                        type="button"
                        className="text-gray-400 hover:text-orange-500 focus:outline-none relative"
                        onClick={() =>
                          setOpenTooltip(
                            openTooltip === concern ? null : concern
                          )
                        }
                        tabIndex={0}
                        aria-label={`More info about ${concern}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 16v-4m0-4h.01"
                          />
                        </svg>
                        {openTooltip === concern && topic && (
                          <div
                            className="absolute left-0 z-50 mt-2 w-72 rounded-lg bg-white border border-gray-300 shadow-lg p-3 text-xs text-gray-700"
                            style={{ top: "100%" }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-900">
                                {topic.name}
                              </span>
                              <button
                                className="text-gray-400 hover:text-orange-500 ml-2"
                                onClick={() => setOpenTooltip(null)}
                                aria-label="Close info"
                              >
                                ×
                              </button>
                            </div>
                            {topic.description}
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* FAQs for You with dropdown */}
      {getCurrentHealthConcerns().length > 0 ? (
        <div className="space-y-8">
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold">FAQs for You</h2>
            {renderConditionDropdown()}
          </div>
          {selectedCondition ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedCondition}
                </h3>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(faqsByConcern[selectedCondition] || []).length > 0 ? (
                  faqsByConcern[selectedCondition].map(
                    (question: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 shadow-md text-white flex flex-col justify-between min-h-[160px]"
                      >
                        <div className="text-xl font-bold mb-2">
                          {question.question_text}
                        </div>
                        <div className="text-xs uppercase mb-2">QUESTION</div>
                        <div className="flex items-center justify-between mt-auto">
                          <Link
                            href={`/dashboard/question/${question.id}`}
                            className="text-amber-200 underline text-sm"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-gray-500 italic">
                    No FAQs found for this condition.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Select a condition from the dropdown to view FAQs.
            </div>
          )}
        </div>
      ) : (
        // Show general FAQs for users without health concerns
        <div className="faq-main-container">
          <h1 className="mb-4">Frequently Asked Questions</h1>
          <div className="faq-main-box">
            {relevantQuestions.length > 0
              ? relevantQuestions.map((question: any, index: number) => (
                  <a
                    key={index}
                    className="block"
                    onClick={() => {
                      router.push(`/dashboard/question/${question.id}`);
                    }}
                  >
                    <div className="faq-box flex flex-col justify-between">
                      <h2>{question.question_text}</h2>

                      <div className="flex justify-between items-end">
                        <p>
                          Answered by: <br />
                          <span>Dr Lucius Pomerantz</span>
                        </p>
                        <img src="/faq-img.png" className="img-fluid" />
                      </div>
                      {/* <div className="flex items-center justify-between mt-auto">
                        <Link
                          href={`/dashboard/question/${question.id}`}
                          className="text-amber-200 underline text-sm"
                        >
                          View
                        </Link>
                      </div> */}
                    </div>
                  </a>
                ))
              : commonQuestions
                  .slice(0, 6)
                  .map((question: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 shadow-md text-white flex flex-col justify-between min-h-[160px]"
                    >
                      <div className="text-xl font-bold mb-2">
                        {question.question_text}
                      </div>
                      <div className="text-xs uppercase mb-2">QUESTION</div>
                      <div className="flex items-center justify-between mt-auto">
                        <Link
                          href={`/dashboard/question/${question.id}`}
                          className="text-amber-200 underline text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
          </div>
        </div>
      )}
      {/* Relevant Topics */}
      {relevantTopics.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {getCurrentHealthConcerns().length > 0
              ? "Your Topics"
              : "Popular Topics"}
          </h2>
          {getCurrentHealthConcerns().length > 0 && (
            <h3 className="text-lg text-gray-600 mb-4">
              Related to your conditions:{" "}
              {getCurrentHealthConcerns().join(", ")}
            </h3>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relevantTopics.slice(0, 6).map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                link={
                  topic.is_detailed
                    ? `/dashboard/topics/${topic.id}`
                    : `/dashboard/home/${topic.id}`
                }
              />
            ))}
          </div>
        </div>
      )}
      {/* Top Health Experts */}
      {allAssociatedDoctors.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Experts for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {allAssociatedDoctors.slice(0, 4).map((doctor: any) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>
      )}
      {/* Saved Videos - Only show for authenticated users (not guests) */}
      {authUser && !isGuest && savedVideos.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Saved Videos</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {savedVideos.map((savedVideo: any) => (
              <VideoCard
                key={savedVideo.id}
                questionId={savedVideo.videos.question_id}
                name={savedVideo.videos.name}
                thumbnailUrl={savedVideo.videos.thumbnail_url}
                videoId={savedVideo.videos.id}
                onRefresh={refreshSavedVideos}
              />
            ))}
          </div>
        </div>
      )}
      {/* Health Concerns Modal for first-time users */}
      {showHealthModal && (
        <HealthConcernsForm
          isModal={true}
          onClose={() => setShowHealthModal(false)}
          onSave={handleSaveHealthConcerns}
          showSkip={true}
        />
      )}
      {/* Health Concerns Form as modal for editing */}
      {showHealthForm && (
        <HealthConcernsForm
          isModal={true}
          onClose={() => setShowHealthForm(false)}
          onSave={handleSaveHealthConcerns}
          initialConcerns={getCurrentHealthConcerns()}
          showSkip={false}
        />
      )}
    </div>
  );
}
