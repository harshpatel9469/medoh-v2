import OtherVideos from "@/app/_components/other-videos";
import { fetchVideosByQuestionIdsServer } from "@/app/_api/videos-server";
import { createClient } from "@/utils/supabase/server";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";
import {
  fetchBackPageDataByVideoId,
  fetchLastVideoFromPreviousSection,
  fetchNextSectionVideos,
} from "@/app/_api/videos";
import {
  fetchLastVideoFromPreviousDetailedTopicSection,
  fetchNextDetailedTopicSectionVideos,
} from "@/app/_api/detailed-topic-sections-videos";
import QuestionShareModal from "./question-share-modal";
import VideoBody from "@/app/_components/question-page/video-body";
import { getUserId } from "@/app/_api/get-user";
import { fetchAllVideosBySectionId } from "@/app/_api/section-videos";
import {
  fetchDetailedTopicSectionById,
  fetchVideosByDetailedTopicSectionId,
} from "@/app/_api/detailed-topic-sections";
import { fetchSectionBySectionId } from "@/app/_api/sections";

import VideoAccessMessage from "./VideoAccessMessage";
import PrivateSideBar from "@/app/_components/navigation/private-side-bar";
import SideBar from "@/app/_components/navigation/side-bar";
import { fetchDetailedTopicById } from "@/app/_api/detailed-topics";
// COMMENTED OUT: Authentication requirement removed
// import AuthButtons from '@/app/_components/auth/auth-buttons';

export default async function Question({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const id = params.id;
  const modal = searchParams?.modal || false;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let video: any = null;
  let nextVideos: any[] = [];
  let prevVideo: any = null;
  let backPageData: any = null;
  let currSectionId: any = null;
  let otherVideosRes: any = null;
  let currVideoIdx: number = -1;
  let currSectionOrder: number = -1;
  let currTopicId: string = "";
  let isDetailedTopic: boolean = false;
  let sectionName: string = "";
  let nextSectionName: string = "";
  let topicName: string = "";
  let nextVideoTotal: number = 0;
  let nextSectionId: string = "";
  const fromPrivate = searchParams?.fromPrivate === "true";
  let hideSidebar = fromPrivate;

  // If user is logged in, play video
  const dataArr = await fetchVideosByQuestionIdsServer(id);
  // dataArr is an array of objects, each with a 'videos' property (the actual video object)
  video =
    dataArr && dataArr.length > 0 && dataArr[0].videos
      ? dataArr[0].videos
      : null;

  // Set data for the page to go back to

  backPageData = video ? await fetchBackPageDataByVideoId(video.id) : null;

  let isPrivateVideo = false;

  if (backPageData) {
    currSectionId = backPageData.section_id;
    isDetailedTopic = backPageData.sections ? false : true;

    // Check if it is a normal section or detailed section
    if (!isDetailedTopic) {
      otherVideosRes = await fetchAllVideosBySectionId(currSectionId, user?.id);
      currSectionOrder = backPageData.sections.section_order;
      currTopicId = backPageData.sections.topics.id;
      topicName = backPageData.sections.topics.name;
      sectionName = backPageData.sections.name;
    } else {
      otherVideosRes = await fetchVideosByDetailedTopicSectionId(
        currSectionId,
        user?.id
      );
      currSectionOrder = backPageData.detailed_topics_sections.section_order;
      currTopicId = backPageData.detailed_topics_sections.detailed_topics.id;
      topicName = backPageData.detailed_topics_sections.detailed_topics.name;
      sectionName = backPageData.detailed_topics_sections.name;
      // Check if parent detailed topic is private
      if (!fromPrivate && currSectionId) {
        const sectionData = await fetchDetailedTopicSectionById(currSectionId);
        if (sectionData && sectionData.topic_id) {
          const detailedTopic = await fetchDetailedTopicById(
            sectionData.topic_id
          );
          if (detailedTopic && detailedTopic.is_private) {
            hideSidebar = true;
            isPrivateVideo = true;
          }
        }
      }
    }

    currVideoIdx = otherVideosRes.findIndex(
      (otherVideoObj: { video_id: any }) => otherVideoObj.video_id === video?.id
    );
    nextVideoTotal = otherVideosRes.length;

    // If curr video idx is not the last in topic, set next videos
    if (currVideoIdx < otherVideosRes.length - 1) {
      nextVideos = otherVideosRes.slice(currVideoIdx + 1);
    }

    // if curr video idx is not the start of section
    if (currVideoIdx !== 0 && otherVideosRes.length > 1) {
      prevVideo = otherVideosRes[currVideoIdx - 1];
    }

    // If there is no previous video try to get last video from previous section
    if (prevVideo === null && !isDetailedTopic) {
      prevVideo = await fetchLastVideoFromPreviousSection(
        currTopicId,
        user?.id,
        currSectionId,
        currSectionOrder
      );
    } else if (prevVideo === null && isDetailedTopic) {
      prevVideo = await fetchLastVideoFromPreviousDetailedTopicSection(
        currSectionId,
        sectionName,
        currTopicId,
        currSectionOrder
      );
    }

    // If there is no videos left in the section go to the next
    if (nextVideos.length === 0 && !isDetailedTopic) {
      nextVideos = await fetchNextSectionVideos(
        currSectionId,
        currTopicId,
        currSectionOrder,
        user?.id
      );

      if (nextVideos[0]) {
        nextSectionId = nextVideos[0].section_id;
        const nextSectionData = await fetchSectionBySectionId(nextSectionId);
        nextSectionName = nextSectionData.name;
      }
    } else if (nextVideos.length === 0 && isDetailedTopic) {
      nextVideos = await fetchNextDetailedTopicSectionVideos(
        currSectionId,
        user?.id,
        currTopicId,
        currSectionOrder
      );
      if (nextVideos[0]) {
        nextSectionId = nextVideos[0].section_id;
        const nextSectionData = await fetchDetailedTopicSectionById(
          nextSectionId
        );
        nextSectionName = nextSectionData.name;
      }
    }
  }

  const isPrivate = user !== null;

  return (
    <div className="flex flex-col lg:flex-row lg:space-x-4 max-sm:space-y-4 items-start">
      {/* Conditionally render sidebar for public videos only */}
      {/* Removed temporary overlay - sidebar hiding is now handled by layout */}
      <div
        className={`w-full ${
          !hideSidebar ? "lg:w-2/3" : "lg:w-full"
        } p-4 flex flex-col`}
      >
        {video && (
          <div className="flex md:items-center md:flex-row flex-col justify-center">
            <div className="md:flex-1 hidden md:block">
              <Link
                href={
                  !backPageData
                    ? "/dashboard/home"
                    : backPageData.sections
                    ? `/dashboard/home/${backPageData.sections.topics.id}`
                    : `/dashboard/topics/info/${backPageData.detailed_topics_sections.detailed_topics.id}`
                }
                className="contents"
              >
                <ArrowLeftIcon className="w-7 md:w-10 hover:text-primary-color-light" />
              </Link>
            </div>

            <div className="flex gap-2 w-full max-w-[400px] items-center">
              {video.doctors && (
                <Link
                  href={`/dashboard/doctors/${video.doctors.id}`}
                  className="bg-card-background-primary-gradient rounded-full flex py-2 pl-2 pr-4 text-white gap-2 mx-auto items-center"
                >
                  <Image
                    src={video.doctors.picture_url}
                    alt="Doctor Picture"
                    width={64}
                    height={64}
                    className="w-10 h-10 md:w-16 md:h-16 rounded-full object-cover"
                  />
                  <div className="flex flex-col w-full gap-2">
                    <p className="text-sm md:text-xl font-semibold">
                      {video.doctors.name}
                    </p>
                    <div className="flex justify-between mr-4 md:text-md text-xs">
                      <p className="mr-1">{video.doctors.specialty}</p>
                      {video.doctors.city && video.doctors.state && (
                        <p>
                          {video.doctors.city}, {video.doctors.state}
                        </p>
                      )}
                      {video.doctors.city && !video.doctors.state && (
                        <p>{video.doctors.city}</p>
                      )}
                      {!video.doctors.city && video.doctors.state && (
                        <p>{video.doctors.state}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              <Link
                href={"?modal=true"}
                className="bg-card-background-primary-gradient rounded-full md:p-4 p-2 aspect-square w-10 h-10 md:w-16 md:h-16"
              >
                <ArrowUpOnSquareIcon className=" text-white" />
              </Link>
            </div>

            <div className="flex-1 opacity-0" />
          </div>
        )}
        {video && (
          <VideoBody
            prevVideo={prevVideo}
            video={video}
            nextVideos={nextVideos}
            backPageData={backPageData}
          />
        )}

        {!video && <VideoAccessMessage />}
        {/* COMMENTED OUT: Login requirement for missing videos */}
        {/* {!video && <AuthButtons />} */}
        {/* COMMENTED OUT: Login requirement for private videos */}
        {/* {video && isPrivateVideo && !user && <AuthButtons />} */}
      </div>
      {video && (
        <div className="w-full lg:w-1/3 p-4 lg:h-screen lg:overflow-y-auto">
          <OtherVideos
            results={nextVideos}
            topicName={topicName}
            sectionName={sectionName}
            currVideoIdx={currVideoIdx}
            nextSectionName={nextSectionName}
            videoTotal={nextVideoTotal}
            isDetailed={isDetailedTopic}
            topicId={currTopicId}
            sectionId={currSectionId}
            nextSectionId={nextSectionId}
          />
        </div>
      )}

      {modal && <QuestionShareModal path={`/dashboard/question/${id}`} />}
    </div>
  );
}