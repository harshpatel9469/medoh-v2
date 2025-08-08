import { useRouter } from "next/navigation";
import Link from "next/link";

interface questionCardProps {
    question: any;
}

export default function QuestionCard({ question }: questionCardProps) {
    const router = useRouter();

    return (
        <div
            className="py-4 bg-card-background-primary-gradient text-white rounded-lg text-sm">
            <div className='mx-2 flex flex-col gap-4 justify-between h-full'>
                <p onClick={() => router.push(`/dashboard/question/${question.question_id}`)} className='cursor-pointer hover:underline font-semibold text-lg'>
                    {question.question_text}
                </p>

                <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-2'>
                        <p className='flex gap-1'>
                            <span className='font-semibold'>Topic:</span>
                            <Link href={question.is_detailed_topic? `/dashboard/topics/info/${question.topic_id}`:`/dashboard/home/${question.topic_id}`} className="hover:underline">
                                {question.topic_name}
                            </Link>
                            {!question.treatment_name && !question.topic_name && <span>None</span>}
                        </p>

                        <p className='flex gap-1'>
                            <span className='font-semibold'>Section:</span>
                            <Link href={question.is_detailed_topic? `/dashboard/topics/details/${question.section_id}`:`/dashboard/sections/${question.section_id}`} className="hover:underline">
                                {question.section_name}
                            </Link>
                            {!question.treatment_section_name && !question.section_name && <span>None</span>}
                        </p>
                    </div>

                    <img
                        src={question.doctor_picture_url}
                        className='w-10 h-10 md:w-16 md:h-16 rounded-full mx-2 shadow-sm cursor-pointer hover:outline-double outline-white aspect-square'
                        onClick={() => { router.push(`/dashboard/doctors/${question.doctor_id}`) }}
                    />
                </div>
            </div>
        </div>
    )
}