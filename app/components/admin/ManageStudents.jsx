"use client";

import { useState } from "react";

export default function ManageStudents() {
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [grNumber, setGrNumber] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editIndex, setEditIndex] = useState(null); // ✅ Track student index for editing

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    class: "",
    rollNo: "",
    grNo: "",
    fatherName: "",
    fatherPhone: "",
    fatherOccupation: "",
    motherName: "",
    motherPhone: "",
    motherOccupation: "",
    photo: null,
  });

  const classes = Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddOrUpdateStudent = () => {
    if (!formData.class) {
      alert("Please select a class.");
      return;
    }

    let updatedStudents = [...students];

    if (editIndex !== null) {
      // ✅ Editing existing student
      updatedStudents[editIndex] = {
        ...formData,
        rollNo: updatedStudents[editIndex].rollNo,
        grNo: updatedStudents[editIndex].grNo,
      };
      setStudents(updatedStudents);
      setEditIndex(null);
    } else {
      // 🆕 Adding new student
      const rollNoForClass =
        students.filter((s) => s.class === formData.class).length + 1;

      const newStudent = {
        ...formData,
        rollNo: rollNoForClass,
        grNo: grNumber,
      };

      updatedStudents.push(newStudent);
      setStudents(updatedStudents);
      setGrNumber(grNumber + 1);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      class: "",
      rollNo: "",
      grNo: "",
      fatherName: "",
      fatherPhone: "",
      fatherOccupation: "",
      motherName: "",
      motherPhone: "",
      motherOccupation: "",
      photo: null,
    });
    setPreviewImage(null);
    setShowForm(false);
  };

  const handleDeleteStudent = (student) => {
    if (!confirm(`Delete student "${student.fullName}"?`)) return;

    let updatedStudents = students.filter((s) => s.grNo !== student.grNo);

    // 🧮 Adjust GR numbers and roll numbers
    updatedStudents = updatedStudents
      .map((s) => {
        if (s.grNo > student.grNo) {
          return { ...s, grNo: s.grNo - 1 };
        }
        return s;
      })
      .map((s) => {
        if (s.class === student.class && s.rollNo > student.rollNo) {
          return { ...s, rollNo: s.rollNo - 1 };
        }
        return s;
      });

    setStudents(updatedStudents);
    setGrNumber(grNumber - 1);
    setSelectedStudent(null);
  };

  const handleEditStudent = (student) => {
    const index = students.findIndex((s) => s.grNo === student.grNo);
    if (index !== -1) {
      setFormData(student);
      setPreviewImage(
        student.photo ? URL.createObjectURL(student.photo) : null
      );
      setEditIndex(index);
      setSelectedStudent(null);
      setShowForm(true);
    }
  };

  const filteredStudents = selectedClass
    ? students.filter((student) => student.class === selectedClass)
    : students;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex">
      <div className="flex-1 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📚 Manage Students</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditIndex(null);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            ➕ Add Student
          </button>
        </div>

        {/* Class List */}
        <div className="flex gap-2 overflow-x-auto border-b pb-2 mb-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-800">
          {classes.map((cls, index) => (
            <div
              key={index}
              onClick={() => setSelectedClass(cls)}
              className={`cursor-pointer px-4 py-2 rounded shadow whitespace-nowrap border ${
                selectedClass === cls
                  ? "bg-blue-600 border-blue-400"
                  : "bg-white/10 border-white/20 hover:bg-white/20"
              }`}
            >
              {cls}
            </div>
          ))}
          <div
            onClick={() => setSelectedClass(null)}
            className={`cursor-pointer px-4 py-2 rounded shadow whitespace-nowrap border ${
              selectedClass === null
                ? "bg-blue-600 border-blue-400"
                : "bg-white/10 border-white/20 hover:bg-white/20"
            }`}
          >
            All
          </div>
        </div>

        {/* Students List */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student, index) => (
              <div
                key={index}
                onClick={() => setSelectedStudent(student)}
                className="bg-white/10 border border-white/20 p-4 rounded shadow flex items-center gap-4 backdrop-blur-md cursor-pointer hover:bg-white/20 transition"
              >
                {student.photo && (
                  <img
                    src={URL.createObjectURL(student.photo)}
                    alt="Student"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">{student.fullName}</h2>
                  <p className="text-sm text-gray-300">{student.class}</p>
                  <p className="text-sm text-gray-300">
                    📌 Roll No: {student.rollNo} | 🆔 GR: {student.grNo}
                  </p>
                  <p className="text-sm text-gray-300">{student.phone}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-lg mt-10">
            🚫 No students found for {selectedClass || "All Classes"}
          </div>
        )}
      </div>

      {/* Add/Edit Student Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm z-50">
          <div className="bg-white/10 border border-white/20 backdrop-blur-lg p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl text-white">
            <h2 className="text-xl font-bold mb-4">
              {editIndex !== null ? "✍️ Edit Student" : "Add New Student"}
            </h2>

            {previewImage && (
              <div className="flex justify-center mb-4">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Full Name", name: "fullName", type: "text" },
                { label: "Phone", name: "phone", type: "text" },
                { label: "Email", name: "email", type: "email" },
                { label: "Address", name: "address", type: "text" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block mb-1 text-sm">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="border border-white/30 p-2 rounded bg-transparent w-full"
                  />
                </div>
              ))}

              <div>
                <label className="block mb-1 text-sm">Class</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="border border-white/30 p-2 rounded bg-transparent text-white w-full"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls, index) => (
                    <option key={index} value={cls} className="text-black">
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm">Photo</label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="border border-white/30 p-2 rounded bg-transparent w-full"
                />
              </div>

              {[
                { label: "Father's Name", name: "fatherName" },
                { label: "Father's Phone", name: "fatherPhone" },
                { label: "Father's Occupation", name: "fatherOccupation" },
                { label: "Mother's Name", name: "motherName" },
                { label: "Mother's Phone", name: "motherPhone" },
                { label: "Mother's Occupation", name: "motherOccupation" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block mb-1 text-sm">{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="border border-white/30 p-2 rounded bg-transparent w-full"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdateStudent}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                {editIndex !== null ? "Update" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/10 border border-white/20 p-6 rounded-lg max-w-lg w-full text-white">
            <div className="flex justify-center mb-4">
              {selectedStudent.photo && (
                <img
                  src={URL.createObjectURL(selectedStudent.photo)}
                  alt="Student"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
                />
              )}
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">
              {selectedStudent.fullName}
            </h2>
            <div className="space-y-2 text-sm">
              <p>📚 <strong>Class:</strong> {selectedStudent.class}</p>
              <p>🆔 <strong>GR No:</strong> {selectedStudent.grNo}</p>
              <p>🧾 <strong>Roll No:</strong> {selectedStudent.rollNo}</p>
              <p>📞 <strong>Phone:</strong> {selectedStudent.phone}</p>
              <p>📧 <strong>Email:</strong> {selectedStudent.email}</p>
              <p>🏠 <strong>Address:</strong> {selectedStudent.address}</p>
              <hr className="border-white/30 my-2" />
              <p>👨 <strong>Father:</strong> {selectedStudent.fatherName}</p>
              <p>📞 <strong>Father Phone:</strong> {selectedStudent.fatherPhone}</p>
              <p>💼 <strong>Father Occupation:</strong> {selectedStudent.fatherOccupation}</p>
              <p>👩 <strong>Mother:</strong> {selectedStudent.motherName}</p>
              <p>📞 <strong>Mother Phone:</strong> {selectedStudent.motherPhone}</p>
              <p>💼 <strong>Mother Occupation:</strong> {selectedStudent.motherOccupation}</p>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handleDeleteStudent(selectedStudent)}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
              >
                🗑️ Delete
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditStudent(selectedStudent)}
                  className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700 transition"
                >
                  ✍️ Edit
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
