'use client'
import { useState } from 'react'
import { updateQuestion, createQuestion, deleteQuestion } from '@/app/_api/questions';
import { Question } from '@/app/_types';
import { useRouter } from 'next/navigation';
interface QuestionModalProps {
    question?: Question | null,
    title: string,
    confirmText: string,
    onClose: () => void;
    onConfirm: () => void;
}
export default function QuestionModal({ question, title, confirmText, onClose, onConfirm }: QuestionModalProps) {
    const [questionText, setQuestionText] = useState<string>(question?.question_text || '');
    const router = useRouter();

    const handleKeyUp = (event: any) => {
        if (event.key === 'Enter') {
            upsert({ questionText }).then(r => onConfirm())
        }
      }

    async function upsert({ questionText }: {
        questionText: string
    }) {
        if (!!question && !!questionText) {
            await updateQuestion(question, questionText, question.id)
        } else {
            const questionRes = await createQuestion(questionText);
            router.push(`/admin/questions/${questionRes.id}`);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg md:w-2/3 lg:w-1/2 p-8">
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>
                <div className="mt-4">
                    <div>
                        <label htmlFor="question_text" className="block text-sm font-medium leading-6 text-gray-900">
                            Question Text
                        </label>
                        <div className="mt-4">
                            <input
                                id="questionText"
                                name="questionText"
                                type="text"
                                value={questionText || ''}
                                onChange={(e) => setQuestionText(e.target.value)}
                                onKeyUp={handleKeyUp}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-semibold focus-visible:outline-2 "
                    >
                        Cancel
                    </button>
                    {question && <button
                        onClick={() => {

                            deleteQuestion(question.id)
                            onConfirm();
                        }}
                        className={"px-4 py-2 rounded-md bg-red-500 hover:bg-red-400 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"}
                    >
                        Delete
                    </button>}
                    <button
                        onClick={() => upsert({ questionText }).then(r => onConfirm())}
                        className={"px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-sm font-semibold focus-visible:outline-2"}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}