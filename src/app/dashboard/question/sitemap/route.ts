import { fetchAllVideos, fetchTotalVideoCount } from "@/app/_api/videos";
import { NextResponse } from "next/server";

const SITEMAP_LIMIT = 50000; // Google's limit for URLs per sitemap

/**
 * Generates the list of sitemaps based on the total video count.
 */
async function generateSitemaps(): Promise<{ id: number }[]> {
  const totalItems = await fetchAllVideos(); // Fetch total video count
  const sitemapCount = Math.ceil(totalItems.length / SITEMAP_LIMIT); // Calculate number of sitemaps
  return Array.from({ length: sitemapCount }, (_, id) => ({ id })); // Generate sitemap IDs
}


// Handle requests to /dashboard/question/sitemap
export async function GET() {
    // Generate all sitemap IDs
    const sitemaps = await generateSitemaps();

  // Build the sitemap index XML
  const sitemapIndex = `
    <?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemaps
        .map(
          (sitemap) => `
        <sitemap>
          <loc>https://medohhealth.com/dashboard/question/sitemap/${sitemap.id}</loc>
        </sitemap>
      `
        )
        .join("")}
    </sitemapindex>
  `;

  // Return as XML response
  return new NextResponse(sitemapIndex.trim(), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
