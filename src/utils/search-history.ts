// Utility functions for managing recent search history using Supabase

import { supabase } from './supabase/client';

const MAX_RECENT_SEARCHES = 10;

// Helper function to calculate similarity between two strings
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // Check if one is contained within the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const shorter = s1.length < s2.length ? s1 : s2;
    const longer = s1.length < s2.length ? s2 : s1;
    return shorter.length / longer.length;
  }
  
  // Calculate word-based similarity
  const words1 = s1.split(/\s+/).filter(w => w.length > 0);
  const words2 = s2.split(/\s+/).filter(w => w.length > 0);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(word1 => 
    words2.some(word2 => word2.includes(word1) || word1.includes(word2))
  );
  
  const totalWords = Math.max(words1.length, words2.length);
  return commonWords.length / totalWords;
};

// Helper function to check if two searches are too similar
const areSimilarSearches = (search1: string, search2: string): boolean => {
  const similarity = calculateSimilarity(search1, search2);
  return similarity > 0.8; // 80% similarity threshold
};

export const getRecentSearches = async (userId?: string): Promise<string[]> => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('recent_searches')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }
    
    return data?.recent_searches || [];
  } catch (error) {
    console.error('Error reading recent searches:', error);
    return [];
  }
};

export const addRecentSearch = async (
  searchTerm: string, 
  userId?: string, 
  onUpdate?: (searches: string[]) => void
): Promise<void> => {
  if (!userId || !searchTerm.trim()) return;
  
  try {
    const currentSearches = await getRecentSearches(userId);
    const trimmedSearchTerm = searchTerm.trim();
    
    // Remove exact duplicates and similar searches
    const filteredSearches = currentSearches.filter(existingSearch => {
      // Remove exact matches (case-insensitive)
      if (existingSearch.toLowerCase() === trimmedSearchTerm.toLowerCase()) {
        return false;
      }
      
      // Remove similar searches (80% similarity threshold)
      if (areSimilarSearches(existingSearch, trimmedSearchTerm)) {
        return false;
      }
      
      return true;
    });
    
    // Add the new search term at the beginning
    const newSearches = [trimmedSearchTerm, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);
    
    const { error } = await supabase
      .from('profiles')
      .update({ recent_searches: newSearches })
      .eq('id', userId);
    
    if (error) {
      console.error('Error saving recent search:', error);
    } else {
      // Call the update callback if provided
      onUpdate?.(newSearches);
    }
  } catch (error) {
    console.error('Error updating recent searches:', error);
  }
};

export const clearRecentSearches = async (userId?: string): Promise<void> => {
  if (!userId) return;
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ recent_searches: [] })
      .eq('id', userId);
    
    if (error) {
      console.error('Error clearing recent searches:', error);
    }
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
};

// Function to clean up existing duplicate searches
export const cleanupDuplicateSearches = async (userId?: string): Promise<void> => {
  if (!userId) return;
  
  try {
    const currentSearches = await getRecentSearches(userId);
    const uniqueSearches: string[] = [];
    
    for (const search of currentSearches) {
      // Check if this search is already in uniqueSearches or too similar to any existing one
      const isDuplicate = uniqueSearches.some(existingSearch => 
        existingSearch.toLowerCase() === search.toLowerCase() || 
        areSimilarSearches(existingSearch, search)
      );
      
      if (!isDuplicate) {
        uniqueSearches.push(search);
      }
    }
    
    // Update the database with cleaned searches
    const { error } = await supabase
      .from('profiles')
      .update({ recent_searches: uniqueSearches })
      .eq('id', userId);
    
    if (error) {
      console.error('Error cleaning up duplicate searches:', error);
    }
  } catch (error) {
    console.error('Error cleaning up duplicate searches:', error);
  }
}; 