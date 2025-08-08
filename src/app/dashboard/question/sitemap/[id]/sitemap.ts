import { fetchAllVideos, fetchTotalVideoCount } from "@/app/_api/videos";
import { MetadataRoute } from "next";

const SITEMAP_LIMIT = 50000; // Google's limit for URLs per sitemap

/**
 * Dynamically generates a single sitemap based on the provided ID.
 */
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const videos = await fetchAllVideos(); // Fetch all videos

  // Determine the slice of videos for this sitemap
  const start = id * SITEMAP_LIMIT;
  const end = start + SITEMAP_LIMIT;
  const sitemapVideos = videos.slice(start, end);

  // Map videos to sitemap entries
  return sitemapVideos.map((video) => ({
    url: `https://medohhealth.com/dashboard/question/${video.question_id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    videos: [
      {
        title: video.name,
        thumbnail_loc: video.thumbnail_url,
        description: video.description,
      },
    ],
  }));
}
