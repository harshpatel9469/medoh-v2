"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface BodyPart {
  id: string;
  name: string;
}

export default function BodyPartsAdmin() {
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchBodyParts();
  }, []);

  async function fetchBodyParts() {
    const { data, error } = await supabase.from("body_parts").select("id, name").order("name");
    if (!error && data) setBodyParts(data);
  }

  async function addBodyPart() {
    if (!newName.trim()) return;
    await supabase.from("body_parts").insert({ name: newName.trim() });
    setNewName("");
    fetchBodyParts();
  }

  async function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditingName(name);
  }

  async function saveEdit() {
    if (!editingId || !editingName.trim()) return;
    await supabase.from("body_parts").update({ name: editingName.trim() }).eq("id", editingId);
    setEditingId(null);
    setEditingName("");
    fetchBodyParts();
  }

  async function deleteBodyPart(id: string) {
    await supabase.from("body_parts").delete().eq("id", id);
    fetchBodyParts();
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Body Parts</h1>
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New body part name"
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={addBodyPart}
          className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-400"
        >
          Add
        </button>
      </div>
      <ul>
        {bodyParts.map(bp => (
          <li key={bp.id} className="flex items-center justify-between py-2 border-b">
            {editingId === bp.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className="border rounded px-2 py-1 mr-2"
                />
                <button onClick={saveEdit} className="text-green-600 mr-2">Save</button>
                <button onClick={() => setEditingId(null)} className="text-gray-500">Cancel</button>
              </>
            ) : (
              <>
                <span>{bp.name}</span>
                <div>
                  <button onClick={() => startEdit(bp.id, bp.name)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => deleteBodyPart(bp.id)} className="text-red-600">Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 