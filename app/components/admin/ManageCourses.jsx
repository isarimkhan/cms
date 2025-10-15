"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";

export default function CourseManager() {
  const initialClasses = Array.from({ length: 10 }, (_, i) => ({
    classId: i + 1,
    isOpen: false,
    subjects: [
      "Mathematics",
      "English",
      "Science",
      "Urdu",
      "Islamiyat",
      "Computer",
      "History",
    ],
  }));

  const [classes, setClasses] = useState(initialClasses);
  const [newSubject, setNewSubject] = useState("");
  const [editing, setEditing] = useState({ classId: null, index: null });
  const [editText, setEditText] = useState("");

  const toggleClass = (classId) => {
    setClasses((prev) =>
      prev.map((c) => (c.classId === classId ? { ...c, isOpen: !c.isOpen } : c))
    );
  };

  const handleAddSubject = (classId) => {
    if (newSubject.trim() === "") return;
    setClasses((prev) =>
      prev.map((c) =>
        c.classId === classId
          ? { ...c, subjects: [...c.subjects, newSubject] }
          : c
      )
    );
    setNewSubject("");
  };

  const handleDeleteSubject = (classId, index) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.classId === classId
          ? { ...c, subjects: c.subjects.filter((_, i) => i !== index) }
          : c
      )
    );
  };

  const handleEditSubject = (classId, index) => {
    setEditing({ classId, index });
    const subject = classes.find((c) => c.classId === classId).subjects[index];
    setEditText(subject);
  };

  const handleSaveEdit = () => {
    setClasses((prev) =>
      prev.map((c) =>
        c.classId === editing.classId
          ? {
              ...c,
              subjects: c.subjects.map((s, i) =>
                i === editing.index ? editText : s
              ),
            }
          : c
      )
    );
    setEditing({ classId: null, index: null });
    setEditText("");
  };

  return (
    <div className="space-y-4 text-white h-[80vh] overflow-y-auto pr-2">
      {classes.map((classItem) => (
        <div
          key={classItem.classId}
          className="border border-gray-600 rounded-lg overflow-hidden bg-transparent backdrop-blur-sm"
        >
          <div
            onClick={() => toggleClass(classItem.classId)}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition"
          >
            <h2 className="text-xl font-semibold">Class {classItem.classId}</h2>
            {classItem.isOpen ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </div>

          {classItem.isOpen && (
            <div className="p-4 border-t border-gray-600 space-y-4">
              <ul className="space-y-2">
                {classItem.subjects.map((subject, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 rounded border border-gray-600 bg-white/5 hover:bg-white/10 transition"
                  >
                    {editing.classId === classItem.classId &&
                    editing.index === index ? (
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="border border-gray-500 bg-transparent text-white p-1 rounded flex-1 mr-2"
                        autoFocus
                      />
                    ) : (
                      <span>{subject}</span>
                    )}
                    <div className="flex gap-2">
                      {editing.classId === classItem.classId &&
                      editing.index === index ? (
                        <button
                          onClick={handleSaveEdit}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleEditSubject(classItem.classId, index)
                          }
                          className="p-1 bg-blue-600 hover:bg-blue-700 rounded"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteSubject(classItem.classId, index)
                        }
                        className="p-1 bg-red-600 hover:bg-red-700 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="border border-gray-500 bg-transparent text-white p-2 rounded flex-1 placeholder-gray-400"
                />
                <button
                  onClick={() => handleAddSubject(classItem.classId)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-1"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
