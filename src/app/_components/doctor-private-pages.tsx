'use client'
import { useEffect, useState } from "react";
import { fetchPrivatePagesByDoctorId } from "@/app/_api/private-pages";
import { deletePrivatePageAndAssets } from '@/app/_api/private-pages'; 

interface PrivatePagesListProps {
  doctorId: string;
  doctorEmail: string;
}

export default function PrivatePagesList({ doctorId, doctorEmail }: PrivatePagesListProps) {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      setLoading(true);
      const data = await fetchPrivatePagesByDoctorId(doctorId);
      setPages(data);
      setLoading(false);
    };
    loadPages();
  }, [doctorId]);

  if (loading) return <p className="p-4 text-gray-500">Loading...</p>;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">Private Pages</h2>
        <button
          onClick={() => window.location.href = `/admin/private_pages/new-private-page/step1?doctorID=${doctorId}`}
          className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-400"
        >
          + Create New
        </button>
      </div>

      <table className="w-full mt-4 border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Patient Email</th>
            <th className="px-4 py-2 border">Patient Phone</th>
            <th className="px-4 py-2 border">Link</th>
            <th className="px-4 py-2 border">Created</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pages.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                No private pages yet.
              </td>
            </tr>
          ) : (
            pages.map((page) => (
              <tr key={page.id} className="text-center border-t">
                <td className="px-4 py-2 border">{page.patient_email || "-"}</td>
                <td className="px-4 py-2 border">{page.patient_phone || "-"}</td>
                <td className="px-4 py-2 border">
                  <a href={`/private-page-patient/${page.id}/auth`} className="text-orange-500 hover:underline">
                    Open Page
                  </a>
                </td>
                <td className="px-4 py-2 border">
                  {new Date(page.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => window.location.href = `/admin/private_pages/new-private-page/step1?pageID=${page.id}&doctorID=${doctorId}`}
                    className="text-blue-500 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this private page and all its content?')) {
                        await deletePrivatePageAndAssets(page.id);
                        setPages((prev) => prev.filter((p) => p.id !== page.id));
                      }
                    }}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
