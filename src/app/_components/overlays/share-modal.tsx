import { useQRCode } from 'next-qrcode';
import { MouseEvent } from 'react';
import { useState } from 'react';

interface ShareModalProps {
    path: string,
    onClose: () => void;
    doctorName?: string;
    title?: string;
}

export default function ShareModal({ path, onClose, doctorName = '', title = '' }: ShareModalProps) {
    const { Image } = useQRCode();
    // Use current host instead of hardcoded production URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.medohhealth.com';
    const url = `${baseUrl}${path}`;
    const [copied, setCopied] = useState<boolean>(false);

    const copyToClipboard = (e: MouseEvent) => {
        e.preventDefault();

        // Create message with doctor name and title if provided
        const message = doctorName && title 
            ? `Hello ${doctorName}, this is the URL and QR code to your ${title} page:\n${url}`
            : url;

        // Copy to clipboard
        navigator.clipboard.writeText(message);

        // Change copy button to tick
        setCopied(true);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3 p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-xl font-bold">Share</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        &times;
                    </button>
                </div>
                <div className="mt-4 w-full">
                    <div className="flex flex-col items-center">
                        <div className='flex w-full gap-2'>
                            <input disabled={true} value={url} className='rounded-lg w-full'/>
                            <button className='border border-primary-color bg-primary-color font-semibold text-white px-3 rounded-lg'
                                onClick={(e: MouseEvent<HTMLButtonElement>) => copyToClipboard(e)}>
                                {!copied? "Copy" : "Copied" }
                            </button>
                        </div>
                        <Image
                            text={url}
                            options={{
                                type: 'image/jpeg',
                                quality: 0.3,
                                errorCorrectionLevel: 'M',
                                margin: 3,
                                scale: 4,
                                width: 200,
                                color: {
                                    dark: '#FA852F',
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}