"use client";
import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCommonlyAskedQuestions } from "@/app/_api/questions";
import {
  searchContent,
  searchContentWithCondition,
} from "@/app/_api/search-actions";
import SearchBar from "@/app/_components/forms/search-bar";
import LoadingSpinner, {
  SearchResultsSkeleton,
} from "@/app/_components/loading-spinner";
import { useDebouncedCallback } from "use-debounce";
import QuestionCard from "@/app/_components/cards/question-card";
import Link from "next/link";
import { addRecentSearch, getRecentSearches } from "@/utils/search-history";
import { supabase } from "@/utils/supabase/client";
import { useContentStore } from "@/utils/stores/content-store";
import { fetchAllTopics, fetchTopicsSearch } from "@/app/_api/topics";
import TopicCard from "@/app/_components/cards/topic-card";
import SectionCard from "@/app/_components/cards/section-card";
import { fetchDoctorsByIds } from "@/app/_api/doctors";
import { fetchVideosByQuestionIdsBatch } from "@/app/_api/videos";
import DoctorCard from "@/app/_components/cards/doctor-card";
import { searchSectionsForCondition } from "@/app/_api/sections";
import { fetchDetailedTopicSectionById } from "@/app/_api/detailed-topic-sections";

// Group results by question text (case-insensitive, trimmed)
function groupResultsByQuestion(results: any[]): any[][] {
  const groups: Record<string, any[]> = {};
  results.forEach((item: any) => {
    const key = (item.question_text || item.content || "").trim().toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.values(groups);
}

// Request deduplication cache - only for identical searches
const ongoingRequests = new Map<string, Promise<any>>();
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add request cancellation
let currentSearchId = 0;

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [commonQuestions, setCommonQuestions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "questions" | "topics" | "experts"
  >("questions");
  const [topicResults, setTopicResults] = useState<any[]>([]);
  const [sectionResults, setSectionResults] = useState<any[]>([]);
  const [associatedDoctors, setAssociatedDoctors] = useState<any[]>([]);
  const [groupedCardIndexes, setGroupedCardIndexes] = useState<{
    [key: number]: number;
  }>({});
  const [activeCondition, setActiveCondition] = useState<string>("");

  // Use content store for recent searches
  const { recentSearches, setRecentSearches, topics, setTopics } =
    useContentStore();
  const [allTopicsLoaded, setAllTopicsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Get user's health concerns for condition tabs
  const getCurrentHealthConcerns = useCallback(() => {
    if (
      userProfile?.health_concerns &&
      userProfile.health_concerns.length > 0
    ) {
      return userProfile.health_concerns;
    }
    if (
      user?.user_metadata?.health_concerns &&
      user.user_metadata.health_concerns.length > 0
    ) {
      return user.user_metadata.health_concerns;
    }
    return [];
  }, [userProfile, user]);

  const healthConcerns = getCurrentHealthConcerns();

  // Set first health concern as default active condition
  useEffect(() => {
    if (healthConcerns.length > 0 && !activeCondition) {
      setActiveCondition("General");
    }
  }, [healthConcerns, activeCondition]);

  // Memoized search function with proper deduplication and cancellation
  const performSearch = useCallback(
    async (term: string, condition: string, searchId: number) => {
      if (!term || term.trim().length < 1) {
        return {
          searchResults: [],
          topicSearchResults: [],
          sectionSearchResults: [],
        };
      }

      const searchKey = `${term}:${condition}`;

      // Check if request already in flight for this exact search
      if (ongoingRequests.has(searchKey)) {
        return ongoingRequests.get(searchKey);
      }

      // Check cache only for identical searches (not new searches)
      const cached = searchCache.get(searchKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log("Using cached results for:", searchKey);
        return cached.data;
      }

      // Create new request
      const searchPromise = (async () => {
        try {
          console.log(
            "Making API request for:",
            searchKey,
            "searchId:",
            searchId
          );
          let searchResults: any[] = [],
            topicSearchResults: any[] = [],
            sectionSearchResults: any[] = [];

          if (condition && condition !== "General") {
            // Use condition-specific search
            [searchResults, topicSearchResults] = await Promise.all([
              searchContentWithCondition(term, condition),
              fetchTopicsSearch(term),
            ]);

            // Get sections for the active condition
            sectionSearchResults = await searchSectionsForCondition(condition);
          } else {
            // Use regular search (for General or no condition)
            [searchResults, topicSearchResults] = await Promise.all([
              searchContent(term),
              fetchTopicsSearch(term),
            ]);
            sectionSearchResults = [];
          }

          const result = {
            searchResults,
            topicSearchResults,
            sectionSearchResults,
          };

          // Cache the result for future identical searches
          searchCache.set(searchKey, { data: result, timestamp: Date.now() });

          return result;
        } finally {
          // Clean up ongoing request
          ongoingRequests.delete(searchKey);
        }
      })();

      // Store the promise
      ongoingRequests.set(searchKey, searchPromise);

      return searchPromise;
    },
    []
  );

  // Function to get section details for search results
  const getSectionDetailsForSearchResults = useCallback(
    async (searchResults: any[]) => {
      if (!searchResults || searchResults.length === 0) return [];

      console.log("Search results:", searchResults);

      // Get section IDs in order of appearance (to maintain relevance ranking)
      const sectionIdsInOrder = searchResults
        .slice(0, 6) // Top 6 results
        .map((result) => result.section_id)
        .filter(Boolean);

      // Remove duplicates while preserving order
      const uniqueSectionIds = sectionIdsInOrder.filter(
        (id, index) => sectionIdsInOrder.indexOf(id) === index
      );

      console.log("Section IDs in order:", uniqueSectionIds);

      if (uniqueSectionIds.length === 0) return [];

      // Fetch section details from detailed_topics_sections
      const { data, error } = await supabase
        .from("detailed_topics_sections")
        .select("*")
        .in("id", uniqueSectionIds);

      console.log("Section data from DB:", data);
      console.log("Section error:", error);

      if (error) {
        console.error("Error fetching section details:", error);
        return [];
      }

      // Sort sections to match the order of their appearance in search results
      const sectionMap = new Map(
        (data || []).map((section) => [section.id, section])
      );
      const orderedSections = uniqueSectionIds
        .map((id) => sectionMap.get(id))
        .filter(Boolean);

      console.log("Ordered sections:", orderedSections);

      return orderedSections;
    },
    []
  );

  // Debounced search handler with request cancellation
  const handleSearch = useDebouncedCallback(async (term: string) => {
    console.log(
      "Search called with term:",
      term,
      "condition:",
      activeCondition,
      "searchTerm:",
      searchTerm
    );

    // Don't search if term is the same as current search term
    if (term === searchTerm) {
      console.log("Skipping search - term unchanged:", term);
      return;
    }

    // Increment search ID to track current search
    const searchId = ++currentSearchId;

    // Don't search if term is empty
    if (!term || term.trim().length < 1) {
      setResults(commonQuestions);
      setSearchTerm("");
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log(
      "Setting loading to true for search:",
      term,
      "searchId:",
      searchId
    );

    try {
      const { searchResults, topicSearchResults, sectionSearchResults } =
        await performSearch(term, activeCondition, searchId);
      console.log("Search results:", searchResults);
      console.log("Topic search results:", topicSearchResults);
      // Only update state if this is still the current search
      if (searchId === currentSearchId) {
        // Get section details for search results
        const sectionDetails = await getSectionDetailsForSearchResults(
          searchResults
        );

        // Update state
        setResults(searchResults);
        setTopicResults(topicSearchResults);
        setSectionResults(sectionDetails); // Use section details from search results
        setSearchTerm(term);
        setActiveTab("questions");

        console.log("Updated search results for searchId:", searchId);
      } else {
        console.log(
          "Skipped updating results for outdated searchId:",
          searchId,
          "current:",
          currentSearchId
        );
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      // Only update loading state if this is still the current search
      if (searchId === currentSearchId) {
        setLoading(false);
        console.log(
          "Setting loading to false for search:",
          term,
          "searchId:",
          searchId
        );
      }
    }
  }, 500); // Increased debounce time

  // Separate debounced function for storing search history
  const storeSearchHistory = useDebouncedCallback(async (term: string) => {
    if (term.trim().length > 2 && userId) {
      await addRecentSearch(term, userId, setRecentSearches);
    }
  }, 4000);

  const clearSearchBar = useCallback(() => {
    setSearchTerm("");
    setResults(commonQuestions);
    setActiveCondition("");
  }, [commonQuestions]);

  // Memoize grouped results to prevent unnecessary re-renders
  const groupedResults = useMemo(
    () => groupResultsByQuestion(results),
    [results]
  );

  // Helper to render grouped result card
  const renderGroupedResultCard = useCallback(
    (group: any[], groupIdx: number) => {
      const currentIdx = groupedCardIndexes[groupIdx] || 0;
      const item = group[currentIdx];
      const total = group.length;
      const showArrowsAndCount = total > 1;
      const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setGroupedCardIndexes((idx) => ({
          ...idx,
          [groupIdx]: (currentIdx - 1 + total) % total,
        }));
      };
      const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setGroupedCardIndexes((idx) => ({
          ...idx,
          [groupIdx]: (currentIdx + 1) % total,
        }));
      };
      return (
        <div
          key={groupIdx}
          className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 shadow-md text-white mb-4 flex flex-col justify-between min-h-[160px] relative"
        >
          <div className="text-xl font-bold mb-2">
            {item.content || item.question_text || item.name}
          </div>
          <div className="text-xs uppercase mb-2">{item.type}</div>
          <div className="flex items-center justify-between mt-auto">
            <Link
              href={`/dashboard/question/${item.question_id || item.id}`}
              className="text-amber-200 underline text-sm"
            >
              View
            </Link>
            {showArrowsAndCount && (
              <div className="flex items-center gap-2">
                <button onClick={handlePrev} className="px-2">
                  &#8592;
                </button>
                <span className="text-xs">
                  {currentIdx + 1} / {total} ({total} doctor
                  {total > 1 ? "s" : ""})
                </span>
                <button onClick={handleNext} className="px-2">
                  &#8594;
                </button>
              </div>
            )}
          </div>
        </div>
      );
    },
    [groupedCardIndexes]
  );

  // Handle condition change
  const handleConditionChange = useCallback(
    (condition: string) => {
      const newCondition = activeCondition === condition ? "" : condition;
      setActiveCondition(newCondition);
      setSearchTerm("");
      setResults(commonQuestions);
      setActiveTab("questions");
    },
    [activeCondition, commonQuestions]
  );

  useEffect(() => {
    const fetchInitData = async () => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setUserId(user.id);
        // Fetch user profile to get health concerns
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (profile) {
            setUserProfile(profile);
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
        }
        // Only fetch if we don't have recent searches in store
        if (recentSearches.length === 0) {
          const searches = await getRecentSearches(user.id);
          setRecentSearches(searches);
        }
      }
      // Fetch topics if not already loaded
      if (topics.length === 0) {
        const fetchedTopics = await fetchAllTopics();
        setTopics(fetchedTopics);
        setAllTopicsLoaded(true);
      } else {
        setAllTopicsLoaded(true);
      }
      const commonQuestionsRes = await fetchCommonlyAskedQuestions();
      setCommonQuestions(commonQuestionsRes);
      // Only set results to common questions if there's no active search
      if (!searchTerm) {
        setResults(commonQuestionsRes);
      }
    };

    fetchInitData();

    // Check for URL parameter
    const queryParam = searchParams.get("q");
    if (queryParam && queryParam !== searchTerm) {
      setSearchTerm(queryParam);
      handleSearch(queryParam);
    }

    setLoading(false);
  }, [
    searchParams,
    recentSearches.length,
    setRecentSearches,
    topics.length,
    setTopics,
    searchTerm,
    handleSearch,
  ]);

  useEffect(() => {
    // After results are set (top 6 relevant questions)
    const getDoctorsForSearchResults = async () => {
      // Only process the top 4-5 search results to get their doctors
      const topResults = results.slice(0, 5);
      const questionIds = topResults.map((q: any) => q.id).filter(Boolean);

      if (questionIds.length === 0) {
        setAssociatedDoctors([]);
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
    };

    // Only fetch doctors if we have results and they're different from current
    if (results.length > 0 && !loading) {
      getDoctorsForSearchResults();
    }
  }, [results, loading]);

  // Cleanup effect to cancel ongoing requests
  useEffect(() => {
    return () => {
      // Cancel any ongoing requests when component unmounts
      ongoingRequests.clear();
      console.log("Cleaned up ongoing requests");
    };
  }, []);

  // Cancel ongoing requests when search parameters change
  useEffect(() => {
    // Increment search ID to cancel any ongoing requests
    currentSearchId++;
    console.log("Cancelled ongoing requests due to parameter change");
  }, [activeCondition, searchTerm]);

  return (
    <div className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-full pw-10">
        {/* Condition Tabs */}
        {healthConcerns.length > 0 && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Explore</h1>
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              {/* General tab always appears first */}
              <button
                className={`pb-2 px-4 font-semibold border-b-2 transition-colors ${
                  activeCondition === "General"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-orange-500"
                }`}
                onClick={() => handleConditionChange("General")}
              >
                All Topics
              </button>
              {healthConcerns.map((condition: string) => (
                <button
                  key={condition}
                  className={`pb-2 px-4 font-semibold border-b-2 transition-colors ${
                    activeCondition === condition
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-600 hover:text-orange-500"
                  }`}
                  onClick={() => handleConditionChange(condition)}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Condition-specific search bars */}
        {healthConcerns.length > 0 ? (
          // Show General search bar first
          <div className={activeCondition === "General" ? "block" : "hidden"}>
            <SearchBar
              key="search-general"
              handleSearch={handleSearch}
              placeholder="Search all topics, questions & experts"
              clearSearchBar={clearSearchBar}
              onInputChange={storeSearchHistory}
              activeCondition="General"
            />
          </div>
        ) : null}
        {healthConcerns.length > 0 ? (
          // Show condition-specific search bars
          healthConcerns.map((condition: string) => (
            <div
              key={condition}
              className={activeCondition === condition ? "block" : "hidden"}
            >
              <SearchBar
                key={`search-${condition}`}
                handleSearch={handleSearch}
                placeholder={`Search ${condition.toLowerCase()} topics, questions & experts`}
                clearSearchBar={clearSearchBar}
                onInputChange={storeSearchHistory}
                activeCondition={condition}
              />
            </div>
          ))
        ) : (
          // Show default search bar when no health concerns
          <SearchBar
            handleSearch={handleSearch}
            placeholder="Ask a question"
            clearSearchBar={clearSearchBar}
            onInputChange={storeSearchHistory}
          />
        )}

        <div className="mt-6">
          {/* Show loading spinner for initial page load */}
          {loading && searchTerm === "" && (
            <div className="flex justify-center items-center py-8">
              <SearchResultsSkeleton />
            </div>
          )}

          {searchTerm !== "" && (
            <div>
              {/* Sub-tabs for Questions, Topics, Experts */}
              <div className="flex gap-2 mb-6">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === "questions"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("questions")}
                >
                  Questions
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === "topics"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("topics")}
                >
                  {activeCondition && activeCondition !== "General"
                    ? "Topics"
                    : "Topics"}
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === "experts"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("experts")}
                >
                  Experts
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "questions" && (
                <>
                  <h2 className="text-lg font-semibold mb-4">
                    Relevant Questions
                  </h2>
                  {loading && <SearchResultsSkeleton />}
                  {!loading && results.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {groupedResults.map((group, idx) =>
                        renderGroupedResultCard(group, idx)
                      )}
                    </div>
                  )}
                  {!loading && results.length === 0 && (
                    <div className="flex flex-col w-full items-center">
                      <h3 className="text-xl font-semibold">No Results</h3>
                      <p>
                        Try using keywords like rotator cuff, shoulder,
                        treatment, etc...
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "topics" && (
                <>
                  <h2 className="text-lg font-semibold mb-4">
                    {activeCondition && activeCondition !== "General"
                      ? "Related Topics"
                      : "Related Topics"}
                  </h2>
                  {loading && <SearchResultsSkeleton />}
                  {!loading &&
                    activeCondition &&
                    activeCondition !== "General" &&
                    sectionResults.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {sectionResults.map((section: any) => (
                          <SectionCard
                            key={section.id}
                            section={section}
                            link={`/dashboard/topics/details/${section.id}`}
                          />
                        ))}
                      </div>
                    )}
                  {!loading &&
                    (!activeCondition || activeCondition === "General") &&
                    topicResults.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {topicResults.map((topic: any) => (
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
                    )}
                  {!loading &&
                    ((activeCondition &&
                      activeCondition !== "General" &&
                      sectionResults.length === 0) ||
                      ((!activeCondition || activeCondition === "General") &&
                        topicResults.length === 0)) && (
                      <div className="flex flex-col w-full items-center">
                        <h3 className="text-xl font-semibold">
                          {activeCondition && activeCondition !== "General"
                            ? "No Related Topics"
                            : "No Related Topics"}
                        </h3>
                      </div>
                    )}
                </>
              )}

              {activeTab === "experts" && (
                <>
                  <h2 className="text-lg font-semibold mb-4">
                    Associated Doctors
                  </h2>
                  {loading && <SearchResultsSkeleton />}
                  {!loading && associatedDoctors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {associatedDoctors.slice(0, 4).map((doctor: any) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col w-full items-center py-8">
                      <h3 className="text-xl font-semibold mb-2">
                        No Associated Doctors Found
                      </h3>
                      <p className="text-gray-600">
                        Try a different search term
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {searchTerm === "" && (
            <div>
              {/* Recently Searched Section */}
              {recentSearches.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
                  <h2 className="text-2xl font-bold mb-4">Recently Searched</h2>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Link
                        key={index}
                        href={`/dashboard/search?q=${encodeURIComponent(
                          search
                        )}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm transition-colors"
                      >
                        {search}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {healthConcerns.length === 0 && (
                <>
                  <h2 className="text-lg font-semibold mb-4">Categories</h2>
                  {loading || !allTopicsLoaded ? (
                    <SearchResultsSkeleton />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {topics.slice(0, 6).map((topic: any) => (
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
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}