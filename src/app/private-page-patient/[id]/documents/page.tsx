'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPrivateDocumentsByPageId } from '@/app/_api/private-pages';

type PrivateDocument = {
  id: string;
  file_name: string;
  file_url: string;
  document_type?: string;
  created_at?: string;
};

const DOC_TYPE_IMAGES: Record<string, string> = {
  "Blood Test Results": "/blood-sample.svg",
  "MRI Scans": "/504317.png",
  "X-rays": "/x-ray.png",
  "Physical Therapy Notes": "/Notes.png",
  "Surgical Reports": "/pres.webp",
  "Medication Instructions": "/other.png",
  "Prescription": "/med_instruct.jpeg",
  "Other": "",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<PrivateDocument[]>([]);
  const params = useParams();
  const privatePageId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    const fetchDocs = async () => {
      console.log("Fetching docs for privatePageId:", privatePageId);
      try {
        const docs = await fetchPrivateDocumentsByPageId(privatePageId);
        console.log("Fetched docs:", docs);

        const sortedDocs = [...docs].sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );

        setDocuments(sortedDocs);
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };
    if (privatePageId) fetchDocs();
  }, [privatePageId]);

  const uniqueRecentDocs: PrivateDocument[] = [];
  const seenTypes = new Set<string>();
  for (const doc of documents) {
    const docType = doc.document_type || 'Other';
    if (!seenTypes.has(docType)) {
      uniqueRecentDocs.push(doc);
      seenTypes.add(docType);
    }
    if (uniqueRecentDocs.length >= 3) break;
  }

  const remainingDocs = documents.filter((d) => !uniqueRecentDocs.includes(d));
  const groupedDocs: Record<string, PrivateDocument[]> = {};
  for (const doc of remainingDocs) {
    const type = doc.document_type || 'Other';
    if (!groupedDocs[type]) groupedDocs[type] = [];
    groupedDocs[type].push(doc);
  }

  return (
    <div className="mx-4 mt-4">
      <h1 className="text-2xl font-bold mb-6">Shared Documents</h1>

      {documents.length === 0 ? (
        <p>No documents shared yet.</p>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {uniqueRecentDocs.map((doc) => (
              <div
                key={doc.id}
                className="relative p-4 bg-white rounded shadow flex flex-col items-center"
              >
                <span className="absolute top-2 left-2 bg-[#f78f1e] text-white text-xs px-2 py-1 rounded-md">
                  {doc.document_type || 'Other'}
                </span>

                <img
                  src={DOC_TYPE_IMAGES[doc.document_type || 'Other'] || doc.file_url}
                  alt={doc.file_name}
                  className="w-[150px] h-[150px] rounded-md object-cover mb-4 mt-4"
                />

                <p className="font-medium text-gray-800 text-center">{doc.file_name}</p>

                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 px-4 py-1 rounded text-white bg-[#f78f1e] hover:bg-[#e77900] text-sm font-medium"
                >
                  View
                </a>
              </div>
            ))}
          </div>

          {Object.entries(groupedDocs).map(([type, docs]) => (
            <div key={type} className="mb-10">
              <h3 className="text-lg font-semibold mb-4">{type}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-white rounded shadow flex flex-col items-center"
                  >
                    <img
                      src={doc.file_url}
                      alt={doc.file_name}
                      className="w-[120px] h-[120px] rounded-md object-cover mb-4"
                    />
                    <p className="font-medium text-gray-800 text-center text-sm">
                      {doc.file_name}
                    </p>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 px-3 py-1 rounded text-white bg-[#f78f1e] hover:bg-[#e77900] text-xs font-medium"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
