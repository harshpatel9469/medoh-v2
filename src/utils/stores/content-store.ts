import { create } from 'zustand';

interface ContentStore {
  // Data
  topics: any[];
  commonQuestions: any[];
  doctors: any[];
  savedVideos: any[];
  recentSearches: string[];
  faqsByConcern: Record<string, any[]>;
  
  // Loading states
  isLoading: boolean;
  
  // Timestamps for cache expiration (5 minutes)
  lastFetched: {
    topics: number | null;
    commonQuestions: number | null;
    doctors: number | null;
    savedVideos: number | null;
    recentSearches: number | null;
  };
  
  // Actions
  setTopics: (topics: any[]) => void;
  setCommonQuestions: (questions: any[]) => void;
  setDoctors: (doctors: any[]) => void;
  setSavedVideos: (videos: any[]) => void;
  setRecentSearches: (searches: string[]) => void;
  setFaqsByConcern: (faqs: Record<string, any[]>) => void;
  clearFaqsByConcern: () => void;
  setLoading: (loading: boolean) => void;
  
  // Cache helpers
  isDataStale: (key: keyof ContentStore['lastFetched']) => boolean;
  clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useContentStore = create<ContentStore>((set, get) => ({
  // Initial state
  topics: [],
  commonQuestions: [],
  doctors: [],
  savedVideos: [],
  recentSearches: [],
  faqsByConcern: {},
  isLoading: false,
  lastFetched: {
    topics: null,
    commonQuestions: null,
    doctors: null,
    savedVideos: null,
    recentSearches: null,
  },
  
  // Actions
  setTopics: (topics) => set({ 
    topics, 
    lastFetched: { ...get().lastFetched, topics: Date.now() } 
  }),
  
  setCommonQuestions: (commonQuestions) => set({ 
    commonQuestions, 
    lastFetched: { ...get().lastFetched, commonQuestions: Date.now() } 
  }),
  
  setDoctors: (doctors) => set({ 
    doctors, 
    lastFetched: { ...get().lastFetched, doctors: Date.now() } 
  }),
  
  setSavedVideos: (savedVideos) => set({ 
    savedVideos, 
    lastFetched: { ...get().lastFetched, savedVideos: Date.now() } 
  }),
  
  setRecentSearches: (recentSearches) => set({ 
    recentSearches, 
    lastFetched: { ...get().lastFetched, recentSearches: Date.now() } 
  }),
  
  setFaqsByConcern: (faqs) => set({ faqsByConcern: faqs }),
  clearFaqsByConcern: () => set({ faqsByConcern: {} }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  // Cache helpers
  isDataStale: (key) => {
    const lastFetched = get().lastFetched[key];
    if (!lastFetched) return true;
    return Date.now() - lastFetched > CACHE_DURATION;
  },
  
  clearCache: () => set({
    topics: [],
    commonQuestions: [],
    doctors: [],
    savedVideos: [],
    recentSearches: [],
    lastFetched: {
      topics: null,
      commonQuestions: null,
      doctors: null,
      savedVideos: null,
      recentSearches: null,
    },
  }),
})); 