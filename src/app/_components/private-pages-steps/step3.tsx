'use client';

import { useEffect, useState } from 'react';
import {
  createCompletePrivatePage,
  fetchPrivatePageDocuments,
  updatePrivatePage,
} from '@/app/_api/private-pages';

const DOCUMENT_TYPES = [
  'Blood Test Results',
  'MRI Scans',
  'X-rays',
  'Physical Therapy Notes',
  'Surgical Reports',
  'Medication Instructions',
  'Other',
];

type FileItem = {
  id?: string;
  file?: File;
  name: string;
  type: string;
  customType?: string;
  existing?: boolean;
};

interface Step3Props {
  doctorId: string;
  patientEmail: string;
  patientPhone: string;
  videos: string[];
  pageId?: string;
  onComplete?: (url: string) => void;
}

export default function PrivatePageStep3({
  doctorId,
  patientEmail,
  patientPhone,
  videos,
  pageId,
  onComplete,
}: Step3Props) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!pageId) return;
    setLoading(true);
    fetchPrivatePageDocuments(pageId)
      .then((docs) => {
        const prefill = docs.map((doc) => ({
          id: doc.id,
          name: doc.file_name,
          type: doc.document_type,
          customType: doc.document_type === 'Other' ? doc.document_type : '',
          existing: true,
        }));
        setFiles(prefill);
      })
      .finally(() => setLoading(false));
  }, [pageId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        name: file.name,
        type: DOCUMENT_TYPES[0],
        customType: '',
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const updateFile = (index: number, changes: Partial<FileItem>) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, ...changes } : file))
    );
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const toRemove = prev[index];
      if (toRemove.existing && toRemove.id) {
        setDeletedFileIds((prev) => [...prev, toRemove.id!]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!doctorId || !patientEmail || !patientPhone) {
      alert('Missing required data.');
      return;
    }

    const hasBlankName = files.some((f) => !f.name.trim());
    const hasBlankCustom = files.some((f) => f.type === 'Other' && !f.customType?.trim());
    if (hasBlankName || hasBlankCustom) {
      alert('Please fix file names and custom types.');
      return;
    }

    const newFiles = files
      .filter((f) => !f.existing && f.file)
      .map((f) => ({
        file: f.file!,
        type: f.type === 'Other' ? f.customType || 'Other' : f.type,
      }));

    const allFiles = files.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type === 'Other' ? f.customType || 'Other' : f.type,
      existing: f.existing,
      file: f.file,
    }));

    setUploading(true);
    try {
      let url = '';
      if (pageId) {
        await updatePrivatePage(pageId, allFiles, videos, deletedFileIds);
        url = `/private-page-patient/${pageId}/auth`;
        alert('Updated successfully!');
      } else {
        url = await createCompletePrivatePage(
          doctorId,
          patientEmail,
          patientPhone,
          newFiles,
          videos
        );
        alert('Created successfully!');
        setFiles([]);
      }

      setGeneratedUrl(url);
      onComplete?.(url);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4 text-[#f78f1e]">
        {pageId ? 'Edit Documents' : 'Upload Documents'}
      </h1>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        accept=".pdf,.png,.jpg,.jpeg"
        className="mb-4"
      />

      {files.length > 0 && (
        <ul className="space-y-3">
          {files.map((f, i) => (
            <li key={i} className="border p-3 rounded bg-white shadow-sm">
              <input
                className="w-full mb-2 border p-1 rounded"
                value={f.name}
                onChange={(e) => updateFile(i, { name: e.target.value })}
              />
              <select
                className="w-full mb-2 border p-1 rounded"
                value={f.type}
                onChange={(e) => updateFile(i, { type: e.target.value, customType: '' })}
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {f.type === 'Other' && (
                <input
                  className="w-full mb-2 border p-1 rounded"
                  placeholder="Custom Type"
                  value={f.customType || ''}
                  onChange={(e) => updateFile(i, { customType: e.target.value })}
                />
              )}
              <button className="text-red-500 text-sm" onClick={() => removeFile(i)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        className="mt-4 bg-[#f78f1e] text-white px-4 py-2 rounded hover:bg-[#e2790a] transition"
        disabled={uploading}
        onClick={handleSubmit}
      >
        {uploading ? 'Submitting...' : pageId ? 'Save Changes' : 'Create Private Page'}
      </button>

      {generatedUrl && (
        <div className="mt-4">
          <a
            className="text-blue-600 underline"
            target="_blank"
            href={generatedUrl}
          >
            View Page
          </a>
        </div>
      )}
    </div>
  );
}
