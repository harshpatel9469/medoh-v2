import { Topic } from "@/app/_types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TopicCardProps {
  topic: Topic & { image_url?: string }; // Allow image_url from detailed topics
  link: string;
}

export default function TopicCard({ topic, link }: TopicCardProps) {
  // Use image_url if available (from detailed topics), otherwise fallback to image
  const imageUrl = (topic as any).image_url || topic.image;
  const router = useRouter()

  console.log("topic",topic)
  return (
    <div className="topics-img" onClick={() => router.push(link)}>
      <Image src={imageUrl} alt="" height={375} width={250} className="" />
      {/* <Link
        key={topic.id}
        href={link}
        style={{ backgroundImage: `url(${imageUrl})` }}
        className="h-40 w-full flex flex-col items-center justify-end p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300 bg-cover bg-no-repeat"
      > */}
      <div className="text-xl font-semibold mt-3">{topic.name}</div>
      {/* </Link> */}
    </div>
  );
}
