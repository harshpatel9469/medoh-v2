'use client';
import { useSearchParams } from 'next/navigation';
import PrivatePageStep3 from '@/app/_components/private-pages-steps/step3';

export default function Step3Wrapper() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctor')!;
  const patientEmail = searchParams.get('patientEmail')!;
  const patientPhone = searchParams.get('patientPhone')!;
  const videos = (searchParams.get('videos') || '').split(',');
  const pageId = searchParams.get('pageID') || undefined;

  return (
    <PrivatePageStep3
      doctorId={doctorId}
      patientEmail={patientEmail}
      patientPhone={patientPhone}
      videos={videos}
      pageId={pageId}
    />
  );
}
