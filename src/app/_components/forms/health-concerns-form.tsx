"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/utils/supabase/client";
import { useContentStore } from '@/utils/stores/content-store';
import { saveGuestHealthConditions } from '@/app/_api/guest-auth';

interface HealthConcernsFormProps {
  isModal?: boolean;
  onClose?: () => void;
  onSave?: (concerns: string[]) => void;
  initialConcerns?: string[];
  showSkip?: boolean;
}

export default function HealthConcernsForm({
  isModal = false,
  onClose,
  onSave,
  initialConcerns = [],
  showSkip = false,
}: HealthConcernsFormProps) {
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(initialConcerns);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { topics } = useContentStore();
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getUser();
  }, []);

  const handleConcernToggle = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (user) {
        // Save to profiles table for logged-in users
        await supabase.from("profiles").upsert({
          id: user.id,
          health_concerns: selectedConcerns,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Save to user_profiles table for guests
        await saveGuestHealthConditions(selectedConcerns);
      }
      if (onSave) onSave(selectedConcerns);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving health concerns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      if (user) {
        // Save to profiles table for logged-in users
        await supabase.from("profiles").upsert({
          id: user.id,
          health_concerns: [],
          updated_at: new Date().toISOString(),
        });
      } else {
        // Save to user_profiles table for guests
        await saveGuestHealthConditions([]);
      }
      if (onSave) onSave([]);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving skipped health concerns:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter topics by search
  const filteredTopics = topics.filter((topic: any) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formContent = (
    <div className={`${isModal ? "p-6" : "p-4"} bg-white rounded-lg shadow-lg`}>
      <div className="mb-6">
        <h2 className={`${isModal ? "text-2xl" : "text-xl"} font-bold mb-2`}>
          {isModal ? "What health concerns would you like to focus on?" : "Edit Health Concerns"}
        </h2>
        <p className="text-gray-600 mb-4">
          {isModal
            ? user 
              ? "This helps us personalize your experience with relevant content and expert advice."
              : "This helps us personalize your experience with relevant content and expert advice. Your preferences will be saved for this session."
            : "Update your health focus areas to get more personalized content."}
        </p>
        {isModal && showSkip && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Not sure?</strong> You can skip this step and explore all content in browsing mode. You can always update your preferences later.
              {!user && " Sign up to save your preferences permanently."}
            </p>
          </div>
        )}
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search health concerns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      <div className="max-h-64 overflow-y-auto mb-6">
        <div className="grid grid-cols-1 gap-2">
          {filteredTopics.map((topic: any) => (
            <label
              key={topic.id}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors relative ${
                selectedConcerns.includes(topic.name)
                  ? "bg-orange-50 border-orange-300"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedConcerns.includes(topic.name)}
                onChange={() => handleConcernToggle(topic.name)}
                className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium mr-2">{topic.name}</span>
              <button
                type="button"
                className="ml-1 text-gray-400 hover:text-orange-500 focus:outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTooltip(openTooltip === topic.id ? null : topic.id);
                }}
                tabIndex={0}
                aria-label={`More info about ${topic.name}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
                </svg>
              </button>
              {openTooltip === topic.id && (
                <div className="absolute left-1/2 z-50 mt-2 w-72 -translate-x-1/2 rounded-lg bg-white border border-gray-300 shadow-lg p-3 text-xs text-gray-700" style={{ top: '100%' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{topic.name}</span>
                    <button
                      className="text-gray-400 hover:text-orange-500 ml-2"
                      onClick={(e) => { e.preventDefault(); setOpenTooltip(null); }}
                      aria-label="Close info"
                    >
                      ×
                    </button>
                  </div>
                  {topic.description}
                </div>
              )}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Preferences"}
        </button>
        {showSkip && (
          <button
            onClick={handleSkip}
            disabled={loading}
            className="px-6 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
          >
            {loading ? "Skipping..." : "Skip & Browse"}
          </button>
        )}
        {!showSkip && onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  if (isModal) {
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose?.();
      }
    };

    return createPortal(
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" 
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={handleOverlayClick}
      >
        <div className="w-full max-w-md">{formContent}</div>
      </div>,
      document.body
    );
  }

  return formContent;
} 