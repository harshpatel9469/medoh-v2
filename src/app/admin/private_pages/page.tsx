'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { deletePrivatePageAndAssets } from '@/app/_api/private-pages';

type PrivatePage = {
  id: string;
  doctor_email: string;
  patient_email: string;
  patient_phone: string;
  url_token: string;
  created_at: string;
};

export default function PrivatePagesAdminView() {
  const router = useRouter();
  const [pages, setPages] = useState<PrivatePage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_private_pages');
      if (error) {
        console.error('Error fetching private pages:', error);
        return;
      }
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching private pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this private page and all its content?')) return;
    try {
      await deletePrivatePageAndAssets(pageId);
      setPages((prev) => prev.filter((page) => page.id !== pageId));
      alert('Private page deleted successfully.');
    } catch (err: any) {
      alert('Error deleting page: ' + err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Private Patient Pages</h1>
        <button
          className="px-4 py-2 bg-primary-color text-white rounded hover:bg-primary-color-dark"
          onClick={() => router.push('/admin/private_pages/new-private-page/step1')}
        >
          + Create New
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-auto">
        {loading ? (
          <div className="p-4 text-gray-500">Loading...</div>
        ) : pages.length === 0 ? (
          <div className="p-4 text-gray-500">No private pages found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Doctor Email</th>
                <th className="px-4 py-2 text-left font-medium">Patient Email</th>
                <th className="px-4 py-2 text-left font-medium">Patient Phone</th>
                <th className="px-4 py-2 text-left font-medium">Link</th>
                <th className="px-4 py-2 text-left font-medium">Created</th>
                <th className="px-4 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className="px-4 py-2">{page.doctor_email || 'N/A'}</td>
                  <td className="px-4 py-2">{page.patient_email || 'N/A'}</td>
                  <td className="px-4 py-2">{page.patient_phone || 'N/A'}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`/private-page-patient/${page.id}/auth`}
                      className="text-[#F97316] underline hover:text-orange-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Page
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(page.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => router.push(`/admin/private_pages/new-private-page/step1?pageID=${page.id}&doctorID=${page.doctor_email}`)}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
