import { NextResponse } from "next/server";
import sitemap from "./sitemap";
import * as xmlbuilder from "xmlbuilder";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid sitemap ID" },
      { status: 400 }
    );
  }

  // Fetch the sitemap data
  const sitemapData: any[] = await sitemap({ id });

  // Convert the sitemap data to XML
  const xml = xmlbuilder.create("urlset", { encoding: "UTF-8" })
    .att("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");

  sitemapData.forEach((entry) => {
    const url = xml.ele("url");
    url.ele("loc", entry.url);
    url.ele("lastmod", entry.lastModified.toISOString());
    url.ele("changefreq", entry.changeFrequency);
    
    // Add video metadata
    const video = url.ele("video");
    video.ele("title", entry.videos[0].title);
    video.ele("thumbnail_loc", entry.videos[0].thumbnail_loc);
    video.ele("description", entry.videos[0].description);
  });

  const xmlString = xml.end({ pretty: true });

   // Returning the XML response with the correct Content-Type
   return new Response(xmlString, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
