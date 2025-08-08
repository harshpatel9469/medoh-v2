'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchPrivateVideosByPageId, fetchDoctorNameByPageId } from "@/app/_api/private-pages";
import { supabase } from "@/utils/supabase/client";
import LoadingSpinner from "@/app/_components/loading-spinner";
import Link from "next/link";

type PrivateTopic = {
  topic_id: string;
  topic_name: string;
  topic_image?: string | null;
};

export default function PrivateTopics() {
  const { id: privatePageId } = useParams() as { id: string };
  const [topics, setTopics] = useState<PrivateTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User");
  const [doctorName, setDoctorName] = useState<string>("your doctor");
  const [greeting, setGreeting] = useState<string>("Hello");

  // Determine greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }
  }, []);

  // Fetch logged-in user's name
  useEffect(() => {
    async function fetchUserName() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", data.user.id)
          .single();
        setUserName(profile?.first_name || data.user.email?.split("@")[0] || "User");
      }
    }
    fetchUserName();
  }, []);

  // Fetch topics and doctor name
  useEffect(() => {
    async function loadData() {
      try {
        const rawData = await fetchPrivateVideosByPageId(privatePageId);
        setTopics(rawData);

        const doctor = await fetchDoctorNameByPageId(privatePageId);
        if (doctor) setDoctorName(doctor);
      } catch (err) {
        console.error("Error fetching private topics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (privatePageId) loadData();
  }, [privatePageId]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-4">
      <h1 className="text-3xl font-bold mb-2 text-primary-color">
        {greeting}, {userName}!
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Here are the videos suggested to you by <span className="font-semibold">{doctorName}</span>.
      </p>

      {topics.length === 0 ? (
        <p>No topics available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Link
              key={topic.topic_id}
              href={`/private-page-patient/${privatePageId}/topics/${topic.topic_id}`}
              className="relative h-48 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300 overflow-hidden"
            >
              {topic.topic_image && (
                <img
                  src={topic.topic_image}
                  alt={topic.topic_name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 flex items-end p-4">
                <span className="text-lg font-semibold text-white">
                  {topic.topic_name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
