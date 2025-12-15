"use client";

import { useState, useEffect } from "react";
import { Plus, X, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  const [formData, setFormData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    education: "",
    dob: "",
    salary: "",
    dutyTime: "Full Time",
    picture: "",
    file: null,
  });

  // Real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teachers"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setTeachers(data);
    });
    return () => unsubscribe();
  }, []);

  // Toggle password visibility
  const togglePassword = (id) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      education: "",
      dob: "",
      salary: "",
      dutyTime: "Full Time",
      picture: "",
      file: null,
    });
  };

  // Add Teacher (password auto-generated, no alert)
  const handleAddTeacher = async () => {
    if (!formData.firstName || !formData.lastName) {
      alert("Please fill all required fields");
      return;
    }

    const password = `${formData.firstName}@123`;

    const newTeacher = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      education: formData.education,
      dob: formData.dob,
      salary: formData.salary,
      dutyTime: formData.dutyTime,
      picture: formData.file
        ? URL.createObjectURL(formData.file)
        : formData.picture,
      password: password, // saved directly to database
    };

    await addDoc(collection(db, "teachers"), newTeacher);
    resetForm();
    setShowAddModal(false);
  };

  // Update Teacher
  const handleUpdateTeacher = async () => {
    const teacherRef = doc(db, "teachers", formData.id);

    await updateDoc(teacherRef, {
      ...formData,
      picture:
        formData.file && typeof formData.file !== "string"
          ? URL.createObjectURL(formData.file)
          : formData.picture,
    });

    resetForm();
    setShowAddModal(false);
    setIsEditing(false);
  };

  // Delete Teacher
  const handleDeleteTeacher = async (id) => {
    await deleteDoc(doc(db, "teachers", id));
    setShowDetailModal(null);
  };

  // Edit Flow
  const handleEdit = (teacher) => {
    setFormData({
      ...teacher,
      file: null,
    });
    setIsEditing(true);
    setShowAddModal(true);
  };

  return (
    <div className="flex min-h-screen bg-transparent text-white">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">👩‍🏫 Manage Teachers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white/10 backdrop-blur-sm shadow rounded-lg p-4 flex flex-col items-center text-center hover:bg-white/20 transition cursor-pointer"
              onClick={() => setShowDetailModal(teacher)}
            >
              <img
                src={
                  teacher.picture ||
                  "https://via.placeholder.com/100x100.png?text=No+Photo"
                }
                alt="Teacher"
                className="w-24 h-24 rounded-full object-cover mb-2"
              />
              <h2 className="font-semibold text-lg">
                {teacher.firstName} {teacher.lastName}
              </h2>
              <p className="opacity-80">{teacher.email}</p>
              <p className="opacity-60 text-sm">{teacher.dutyTime}</p>

            
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-transparent p-4 flex flex-col items-center">
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
            setIsEditing(false);
          }}
          className="bg-white/20 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-white/30 transition w-full justify-center"
        >
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-lg shadow-lg w-full max-w-3xl p-8 relative border border-white/30 text-white overflow-auto max-h-[95vh]">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-white hover:text-red-300"
            >
              <X size={26} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isEditing ? "✏️ Edit Teacher" : "➕ Add Teacher"}
            </h2>

            {/* Preview */}
            <div className="flex justify-center mb-5">
              <img
                src={
                  formData.file
                    ? URL.createObjectURL(formData.file)
                    : formData.picture ||
                      "https://via.placeholder.com/100x100.png?text=No+Photo"
                }
                alt="Preview"
                className="w-28 h-28 rounded-full object-cover border border-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "First Name", key: "firstName" },
                { label: "Last Name", key: "lastName" },
                { label: "Email", key: "email", colSpan: 2 },
                { label: "Phone", key: "phone", colSpan: 2 },
                { label: "Address", key: "address", colSpan: 2 },
                { label: "Education", key: "education", colSpan: 2 },
              ].map(({ label, key, colSpan }) => (
                <div
                  key={key}
                  className={colSpan === 2 ? "col-span-2" : undefined}
                >
                  <label className="block mb-1 text-sm opacity-80">{label}</label>
                  <input
                    type="text"
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    className="w-full bg-transparent border border-white/40 p-2 rounded"
                  />
                </div>
              ))}

              {/* DOB */}
              <div className="col-span-2">
                <label className="block mb-1 text-sm opacity-80">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  className="w-full bg-transparent border border-white/40 p-2 rounded"
                />
              </div>

              {/* Salary */}
              <div className="col-span-2">
                <label className="block mb-1 text-sm opacity-80">Salary</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className="w-full bg-transparent border border-white/40 p-2 rounded"
                />
              </div>

              {/* Duty Time */}
              <div className="col-span-2">
                <label className="block mb-1 text-sm opacity-80">Duty Time</label>
                <select
                  value={formData.dutyTime}
                  onChange={(e) =>
                    setFormData({ ...formData, dutyTime: e.target.value })
                  }
                  className="w-full bg-transparent border border-white/40 p-2 rounded text-black"
                >
                  <option>Full Time</option>
                  <option>Half Time</option>
                  <option>Hourly</option>
                </select>
              </div>

              {/* Picture Upload */}
              <div className="col-span-2">
                <label className="block mb-1 text-sm text-red-400">
                  Upload Picture (required)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                  className="w-full bg-transparent border border-red-500 p-2 rounded text-sm text-white"
                />
              </div>
            </div>

            <button
              onClick={isEditing ? handleUpdateTeacher : handleAddTeacher}
              className="bg-white/20 text-white px-4 py-3 rounded mt-6 hover:bg-white/30 w-full font-semibold"
            >
              {isEditing ? "💾 Save Changes" : "➕ Add Teacher"}
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-lg shadow-lg w-full max-w-xl p-6 relative border border-white/30 text-white">
            <button
              onClick={() => setShowDetailModal(null)}
              className="absolute top-3 right-3 text-white hover:text-red-300"
            >
              <X size={22} />
            </button>
            <div className="flex flex-col items-center text-center">
              <img
                src={
                  showDetailModal.picture ||
                  "https://via.placeholder.com/120x120.png?text=No+Photo"
                }
                alt="Teacher"
                className="w-32 h-32 rounded-full object-cover mb-4 border border-white/50"
              />
              <h2 className="text-2xl font-bold mb-2">
                {showDetailModal.firstName} {showDetailModal.lastName}
              </h2>
              <p className="mb-1 opacity-90">{showDetailModal.email}</p>
              <p className="mb-1 opacity-90">{showDetailModal.phone}</p>
              <p className="mb-1 opacity-90">{showDetailModal.address}</p>
              <p className="mb-1 opacity-90">
                Education: {showDetailModal.education}
              </p>
              <p className="mb-1 opacity-90">
                DOB: {showDetailModal.dob || "N/A"}
              </p>
              <p className="mb-1 opacity-90">
                Salary: {showDetailModal.salary} PKR
              </p>
              <p className="mb-1 opacity-90">
                Duty Time: {showDetailModal.dutyTime}
              </p>

              {/* Password */}
              {showDetailModal.password && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono">
                    {showPassword[showDetailModal.id]
                      ? showDetailModal.password
                      : "••••••••"}
                  </span>
                  <button
                    onClick={() => togglePassword(showDetailModal.id)}
                  >
                    {showPassword[showDetailModal.id] ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    handleEdit(showDetailModal);
                    setShowDetailModal(null);
                  }}
                  className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
                >
                  <Pencil size={18} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteTeacher(showDetailModal.id)}
                  className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
