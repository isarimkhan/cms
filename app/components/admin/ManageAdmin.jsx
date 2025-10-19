"use client";

import { useState, useEffect } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    department: "",
    salary: "",
    file: null,
    picture: "",
  });

  // ✅ Department Options
  const departmentOptions = [
    "Main Administration Department",
    "Principal / Vice Principal Office",
    "Admissions Department",
    "Examination & Records Department ",
    "Finance & Accounts Department",
    "Human Resources (HR) Department ",
    "IT & Technical Support Department",
    "Transport Department",
    "Library Department",
    "Student Affairs Department",
  ];

  // ✅ Fetch Admins
  const fetchAdmins = async () => {
    const snapshot = await getDocs(collection(db, "admins"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ✅ Handle input
  const handleChange = (e) => {
    if (e.target.name === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // ✅ Add Admin
  const handleAdd = async (e) => {
    e.preventDefault();
    const pictureURL = formData.file ? URL.createObjectURL(formData.file) : "";

    await addDoc(collection(db, "admins"), {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      department: formData.department,
      salary: formData.salary,
      picture: pictureURL,
    });

    resetForm();
    setShowModal(false);
    fetchAdmins();
  };

  // ✅ Edit Admin
  const handleEdit = (admin) => {
    setIsEditing(true);
    setSelectedId(admin.id);
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      phone: admin.phone,
      email: admin.email,
      department: admin.department,
      salary: admin.salary,
      file: null,
      picture: admin.picture,
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const adminRef = doc(db, "admins", selectedId);
    const pictureURL = formData.file
      ? URL.createObjectURL(formData.file)
      : formData.picture;

    await updateDoc(adminRef, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      department: formData.department,
      salary: formData.salary,
      picture: pictureURL,
    });

    resetForm();
    setShowModal(false);
    setIsEditing(false);
    fetchAdmins();
  };

  // ✅ Delete Admin
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "admins", id));
    fetchAdmins();
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      department: "",
      salary: "",
      file: null,
      picture: "",
    });
  };

  return (
    <div className="p-6 text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">👨‍💼 Manage Admins</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus size={20} /> Add Admin
        </button>
      </div>

      {/* Admin List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="bg-white/20 backdrop-blur-lg p-4 rounded-lg shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {admin.picture ? (
                <img
                  src={admin.picture}
                  alt="Admin"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {admin.firstName?.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="font-bold text-black">
                  {admin.firstName} {admin.lastName}
                </h2>
                <p className="text-gray-600 text-sm">{admin.phone}</p>
                <p className="text-blue-600 text-sm">{admin.department}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(admin)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(admin.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
            <button
              onClick={() => {
                setShowModal(false);
                setIsEditing(false);
                resetForm();
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Admin" : "Add Admin"}
            </h2>
            <form
              onSubmit={isEditing ? handleUpdate : handleAdd}
              className="space-y-3"
            >
              {/* First and Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full text-black"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full text-black"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full text-black"
                />
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full text-black"
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium mb-1">Salary</label>
                <input
                  type="number"
                  name="salary"
                  placeholder="Salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full text-black"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload Photo
                </label>
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {isEditing ? "Update Admin" : "Add Admin"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
