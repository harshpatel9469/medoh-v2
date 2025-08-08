'use client'
import { useState } from 'react';
import InputField from './_components/forms/input-field';
import EmailField from './_components/forms/email-field';
import { sendEmail } from './_api/email';

export default function ContactUs() {
    const [name, setName] = useState<string>('');
    const [subject, setSubject] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.target);
        const email = formData.get('email') as string;

        if(!name || !subject || !email || !message){
            setError('All fields need to be filled')
        }

        const response = await fetch('/email', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ name: name, subject: subject, email: email, message: message }),
        })
        
        if(response.status === 200) {
            setIsSuccess(true);
            setError('');
            event.target.reset();
            setName('');
            setSubject('');
            setMessage('');
        }
        else {
            const body = await response.json();
            setError(body.msg);
        }
        setIsSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit} method='POST' id="contact-us-form" className="space-y-6">
            <InputField
                id="name"
                name="name"
                label="Name"
                required={true}
                onChange={(e) => setName(e.target.value)}
                value={name}
            />

            <EmailField
                setIsEmailValid={setIsEmailValid}
            />

            <InputField
                id="subject"
                name="subject"
                label="Subject"
                required={true}
                onChange={(e) => setSubject(e.target.value)}
                value={subject}
            />

            <div>
                <label className='block text-sm font-medium leading-6 text-gray-900 mb-2'>Message</label>            
                <textarea 
                    id='message' 
                    form="contact-us-form" 
                    required={true} 
                    className='resize-none block w-full rounded-lg border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color-dark text-base sm:text-sm leading-6 h-40 sm:h-52' 
                    value={message} 
                    onChange={e => setMessage(e.target.value)}
                />
            </div>

            <div className="flex justify-center">
                <button
                    type="submit"
                    disabled={!name || !subject || !isEmailValid || isSubmitting }
                    className={'w-full sm:w-1/3 h-12 rounded-md px-3 py-1.5 text-base sm:text-md font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color-dark bg-primary-color hover:bg-primary-color-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors'}
                >
                    {isSubmitting ? 'Sending...' : 'Send'}
                </button>
            </div>
            
            {error && (
                <div className="flex justify-center">
                    <p className='bg-red-500 px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-white text-sm sm:text-lg text-center w-full sm:w-auto'>{error}</p>
                </div>
            )}
            
            {isSuccess && (
                <div className="flex justify-center">
                    <p className='bg-green-500 px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-white text-sm sm:text-lg text-center w-full sm:w-auto'>Email sent successfully</p>
                </div>
            )}
        </form>
    )
};

