'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Step2VideoSelector from '@/app/_components/private-pages-steps/step2';

export default function Step2() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const doctorId = searchParams.get('doctor') ?? '';
  const patientEmail = searchParams.get('patientEmail') ?? '';
  const patientPhone = searchParams.get('patientPhone') ?? '';
  const pageId = searchParams.get('pageID') ?? undefined;

  const handleNext = (selectedVideoIds: string[]) => {
    const videoList = selectedVideoIds.join(',');
    const baseUrl = `/admin/private_pages/new-private-page/step3`;
    const query = `?${pageId ? `pageID=${pageId}&` : ''}doctor=${doctorId}&patientEmail=${patientEmail}&patientPhone=${patientPhone}&videos=${videoList}`;
    router.push(baseUrl + query);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[#f78f1e]">Step 2: Select Videos</h1>

      <Step2VideoSelector
        doctorId={doctorId}
        patientEmail={patientEmail}
        patientPhone={patientPhone}
        pageId={pageId}
        onNext={handleNext}
      />
    </div>
  );
}
