import SideBar from "@/app/_components/navigation/side-bar";
import { Metadata } from "next";
import { headers } from "next/headers";

import { fetchQuestionById } from "../_api/questions";
import { fetchTopicById } from "../_api/topics";
import { fetchSectionBySectionId } from "../_api/sections";
import { fetchDoctorById } from "../_api/doctors";
import { fetchDetailedTopicById } from "../_api/detailed-topics";
import { fetchDetailedTopicSectionById } from "../_api/detailed-topic-sections";
import { fetchBackPageDataByVideoId } from "../_api/videos";
import { createClient } from "@/utils/supabase/server";

// Cache for metadata to avoid repeated API calls
const metadataCache = new Map<string, { title: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedMetadata(pathname: string): Promise<string> {
  const now = Date.now();
  const cached = metadataCache.get(pathname);

  // Return cached result if still valid
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.title;
  }

  let title = "Medoh Health";

  try {
    if (pathname?.startsWith("/dashboard/question/")) {
      const { fetchQuestionById } = await import("../_api/questions");
      const res = await fetchQuestionById(pathname.slice(20));
      if (res) {
        title = res.question_text;
      }
    } else if (pathname?.startsWith("/dashboard/home/")) {
      const { fetchTopicById } = await import("../_api/topics");
      const res = await fetchTopicById(pathname.slice(16));
      if (res) {
        title = res.name;
      }
    } else if (pathname?.startsWith("/dashboard/sections/")) {
      const { fetchSectionBySectionId } = await import("../_api/sections");
      const res = await fetchSectionBySectionId(pathname.slice(20));
      if (res) {
        title = res.name;
      }
    } else if (pathname?.startsWith("/dashboard/doctors/")) {
      const { fetchDoctorById } = await import("../_api/doctors");
      const res = await fetchDoctorById(pathname.slice(19));
      if (res) {
        title = res.name;
      }
    } else if (pathname?.startsWith("/dashboard/topics/")) {
      if (pathname.includes("info")) {
        const { fetchDetailedTopicById } = await import(
          "../_api/detailed-topics"
        );
        const res = await fetchDetailedTopicById(pathname.slice(23));
        if (res) {
          title = res.name;
        }
      } else if (pathname.includes("details")) {
        const { fetchDetailedTopicSectionById } = await import(
          "../_api/detailed-topic-sections"
        );
        const res = await fetchDetailedTopicSectionById(pathname.slice(26));
        if (res) {
          title = res.name;
        }
      } else {
        const { fetchTopicById } = await import("../_api/topics");
        const res = await fetchTopicById(pathname.slice(18));
        if (res) {
          title = res.name;
        }
      }
    } else if (pathname?.startsWith("/dashboard/")) {
      title = pathname[11].toUpperCase() + pathname.slice(12);
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
    // Keep default title on error
  }

  // Cache the result
  metadataCache.set(pathname, { title, timestamp: now });

  return title;
}

export async function generateMetadata() {
  const pathname = headers().get("pathname") || "";
  const title = await getCachedMetadata(pathname);

  return {
    title: title,
  };
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current pathname
  const pathname = headers().get("pathname");
  let hideSidebar = false;

  // Hide sidebar for any video accessed from a private page
  if (pathname?.startsWith("/dashboard/question/")) {
    // Extract question id from pathname
    const questionId = pathname.slice("/dashboard/question/".length);
    try {
      // Fetch the question
      const question = await fetchQuestionById(questionId);
      // Use supabase server client
      const supabase = createClient();
      // Get the video id from question_videos
      const { data: questionVideo } = await supabase
        .from("question_videos")
        .select("video_id")
        .eq("question_id", questionId)
        .single();
      let backPageData = null;
      if (questionVideo && questionVideo.video_id) {
        backPageData = await fetchBackPageDataByVideoId(questionVideo.video_id);
      }
      // Debug log
      console.log(
        "DEBUG sidebar check:",
        JSON.stringify({ questionId, questionVideo, backPageData }, null, 2)
      );
      // Check for detailed topic section (private detailed topic)
      if (backPageData && backPageData.detailed_topics_sections) {
        const detailedTopicId =
          backPageData.detailed_topics_sections.detailed_topics.id;
        if (detailedTopicId) {
          const detailedTopic = await fetchDetailedTopicById(detailedTopicId);
          if (detailedTopic && detailedTopic.is_private) {
            hideSidebar = true;
          }
        }
      }
      // Check for section (see if the section's topic is a detailed topic and is private)
      if (
        backPageData &&
        backPageData.sections &&
        backPageData.sections.topics
      ) {
        const topicId = backPageData.sections.topics.id;
        if (topicId) {
          // Try to fetch as a detailed topic
          try {
            const detailedTopic = await fetchDetailedTopicById(topicId);
            if (detailedTopic && detailedTopic.is_private) {
              hideSidebar = true;
            }
          } catch (e) {
            // Not a detailed topic, ignore
          }
        }
      }
    } catch (e) {
      // If any error, default to showing the sidebar
    }
  }

  // Check if current page is a private detailed topic
  if (pathname?.startsWith("/dashboard/topics/info/")) {
    const topicId = pathname.split("/").pop();
    if (topicId) {
      const supabase = createClient();
      const { data } = await supabase
        .from("detailed_topics")
        .select("is_private")
        .eq("id", topicId)
        .single();

      if (data?.is_private === true) {
        hideSidebar = true;
      }
    }
  }

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className={`${hideSidebar ? "invisible" : "visible"} flex-shrink-0`}>
        <SideBar />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto  bg-gradient-to-b from-gray-100 to-gray-50 ">
        {children}
      </div>
    </div>
  );
}
