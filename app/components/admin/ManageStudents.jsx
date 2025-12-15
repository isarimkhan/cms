"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editId, setEditId] = useState(null);
  const [grNumber, setGrNumber] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);

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
    password: "", // NEW field for password
  });

  const classes = Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`);

  // 🔥 Realtime fetch students
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      let data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      data = data.sort((a, b) => (a.grNo || 0) - (b.grNo || 0));
      setStudents(data);

      if (data.length > 0) {
        const maxGr = Math.max(...data.map((s) => s.grNo || 0));
        setGrNumber(maxGr + 1);
      } else {
        setGrNumber(1);
      }
    });
    return () => unsubscribe();
  }, []);

  const renderAvatar = (student, size = 64) => {
    const dimension = `${size}px`;
    if (student.photo) {
      return (
        <img
          src={student.photo}
          alt={student.fullName}
          style={{
            width: dimension,
            height: dimension,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #60A5FA",
          }}
        />
      );
    }
    const initial = student.fullName ? student.fullName.charAt(0).toUpperCase() : "?";
    return (
      <div
        style={{
          width: dimension,
          height: dimension,
          borderRadius: "50%",
          backgroundColor: "#2563EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${size / 2}px`,
          fontWeight: "bold",
          border: "2px solid #60A5FA",
          color: "#fff",
        }}
      >
        {initial}
      </div>
    );
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadPhoto = async (file) => {
    if (!file) return "";
    try {
      const storageRef = ref(storage, `students/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("❌ Error uploading photo:", error);
      return "";
    }
  };

  // ✅ Add or Update Student
  const handleAddOrUpdateStudent = async () => {
    if (!formData.fullName || !formData.class) {
      alert("Please fill required fields (Name & Class)");
      return;
    }

    try {
      let imageUrl = formData.photo || "";
      if (formData.photo instanceof File) {
        imageUrl = await uploadPhoto(formData.photo);
      }

      if (editId) {
        // Update existing student
        const studentRef = doc(db, "students", editId);
        await updateDoc(studentRef, {
          ...formData,
          photo: imageUrl,
        });
      } else {
        // Auto-generate password: first name + @123
        const firstName = formData.fullName.split(" ")[0];
        const password = firstName + "@123";

        const classStudents = students.filter((s) => s.class === formData.class);
        const rollNoForClass = classStudents.length + 1;

        const newStudent = {
          ...formData,
          grNo: grNumber,
          rollNo: rollNoForClass,
          photo: imageUrl,
          password, // add password
        };

        await addDoc(collection(db, "students"), newStudent);
        setGrNumber(grNumber + 1);
      }

      resetForm();
    } catch (error) {
      console.error("❌ Error saving student:", error);
      alert("Failed to save student: " + error.message);
    }
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
      password: "",
    });
    setPreviewImage(null);
    setShowForm(false);
    setEditId(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteStudent = async (student) => {
    if (!confirm(`Delete student "${student.fullName}"?`)) return;
    try {
      await deleteDoc(doc(db, "students", student.id));
      await reorderNumbers();
      setSelectedStudent(null);
    } catch (error) {
      console.error("❌ Error deleting student:", error);
    }
  };

  const reorderNumbers = async () => {
    const allDocs = await getDocs(collection(db, "students"));
    const allData = allDocs.docs.map((d) => ({ id: d.id, ...d.data() }));

    const sortedByGr = allData.sort((a, b) => (a.grNo || 0) - (b.grNo || 0));
    const batch = writeBatch(db);

    sortedByGr.forEach((student, index) => {
      const studentRef = doc(db, "students", student.id);
      batch.update(studentRef, { grNo: index + 1 });
    });

    classes.forEach((cls) => {
      const classStudents = sortedByGr
        .filter((s) => s.class === cls)
        .sort((a, b) => a.rollNo - b.rollNo);

      classStudents.forEach((student, idx) => {
        const studentRef = doc(db, "students", student.id);
        batch.update(studentRef, { rollNo: idx + 1 });
      });
    });

    await batch.commit();
  };

  const handleEditStudent = (student) => {
    setFormData({ ...student, photo: student.photo || null });
    setPreviewImage(student.photo || null);
    setEditId(student.id);
    setSelectedStudent(null);
    setShowForm(true);
  };

  const filteredStudents = selectedClass
    ? students
        .filter((student) => student.class === selectedClass)
        .sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0))
    : [...students].sort((a, b) => (a.grNo || 0) - (b.grNo || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex flex-col overflow-y-auto">
      <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-80px)] pb-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📚 Manage Students</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            ➕ Add Student
          </button>
        </div>

        {/* Class Filter */}
        <div className="flex gap-2 overflow-x-auto border-b pb-2 mb-4">
          {classes.map((cls) => (
            <div
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`cursor-pointer px-4 py-2 rounded shadow ${
                selectedClass === cls
                  ? "bg-blue-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {cls}
            </div>
          ))}
          <div
            onClick={() => setSelectedClass(null)}
            className={`cursor-pointer px-4 py-2 rounded shadow ${
              selectedClass === null
                ? "bg-blue-600"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            All
          </div>
        </div>

        {/* Student List */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="bg-white/10 p-4 rounded shadow flex gap-4 cursor-pointer hover:bg-white/20 transition"
              >
                {renderAvatar(student, 50)}
                <div>
                  <h2 className="text-lg font-semibold">{student.fullName}</h2>
                  <p className="text-sm text-gray-300">{student.class}</p>
                  <p className="text-sm text-gray-300">
                    📌 Roll No: {student.rollNo} | 🆔 GR: {student.grNo}
                  </p>
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

      {/* ========== Add/Edit Form Modal ========== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "✍️ Edit Student" : "➕ Add Student"}
            </h2>

            <div className="flex justify-center mb-4">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
                />
              ) : (
                renderAvatar({ fullName: formData.fullName }, 96)
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["fullName", "phone", "email", "address"].map((name) => (
                <div key={name}>
                  <label className="block mb-1 text-sm capitalize">
                    {name.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={formData[name]}
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
                  {classes.map((cls) => (
                    <option key={cls} value={cls} className="text-black">
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
                "fatherName",
                "fatherPhone",
                "fatherOccupation",
                "motherName",
                "motherPhone",
                "motherOccupation",
              ].map((name) => (
                <div key={name}>
                  <label className="block mb-1 text-sm capitalize">
                    {name.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={formData[name]}
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
                {editId ? "Update" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Details Modal ========== */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white/10 p-6 rounded-lg max-w-lg w-full text-white">
            <div className="flex justify-center mb-4">
              {renderAvatar(selectedStudent, 96)}
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
              <p>🔑 <strong>Password:</strong> {selectedStudent.password}</p> {/* NEW */}
              <hr className="border-white/30 my-2" />
              <p>👨 <strong>Father:</strong> {selectedStudent.fatherName}</p>
              <p>📞 {selectedStudent.fatherPhone}</p>
              <p>💼 {selectedStudent.fatherOccupation}</p>
              <p>👩 <strong>Mother:</strong> {selectedStudent.motherName}</p>
              <p>📞 {selectedStudent.motherPhone}</p>
              <p>💼 {selectedStudent.motherOccupation}</p>
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
