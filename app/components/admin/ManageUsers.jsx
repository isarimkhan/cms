"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { ShieldUser, Eye, EyeOff } from "lucide-react";

export default function ManageUsers() {
  const [view, setView] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [showPassword, setShowPassword] = useState({});

  const departments = [
    "Main Administration Department",
    "Principal / Vice Principal Office ",
    "Admissions Department",
    "Examination & Records Department",
    "Finance & Accounts Department",
    "Human Resources (HR) Department",
    "IT & Technical Support Department",
    "Transport Department",
    "Library Department",
    "Student Affairs Department",
  ];

  const classes = [
    "Class 1","Class 2","Class 3","Class 4","Class 5",
    "Class 6","Class 7","Class 8","Class 9","Class 10",
  ];

  /* ================= FETCH DATA ================= */
  const fetchAdmins = async () => {
    const snap = await getDocs(collection(db, "admins"));
    setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchTeachers = async () => {
    const snap = await getDocs(collection(db, "teachers"));
    setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchStudents = async (className) => {
    const q = query(collection(db, "students"), where("class", "==", className));
    const snap = await getDocs(q);
    setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchAdmins();
    fetchTeachers();
  }, []);

  /* ================= PASSWORD LOGIC ================= */
  const generateAndSavePassword = async (user, collectionName, userType) => {
    const password = `${user.firstName || user.fullName?.split(" ")[0]}@123`;

    try {
      // Optional: update user's own doc
      await updateDoc(doc(db, collectionName, user.id), { password });

      // Save in separate "passwords" collection
      await addDoc(collection(db, "passwords"), {
        userId: user.id,
        userType: userType,
        password,
        timestamp: new Date(),
      });

      // Refresh UI
      if (collectionName === "admins") fetchAdmins();
      if (collectionName === "teachers") fetchTeachers();
      if (collectionName === "students") fetchStudents(selectedClass);

      alert("Password generated & saved in separate collection!");
    } catch (err) {
      alert("Failed to save password: " + err.message);
    }
  };

  const togglePassword = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /* ================= UI COMPONENTS ================= */
  const Button = ({ label, onClick, active }) => (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full font-semibold transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-200 hover:bg-blue-500 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  const PasswordCell = ({ user, collectionName, userType }) => (
    <div className="flex items-center gap-2">
      <span className="font-mono">
        {showPassword[user.id] ? user.password || "Not Set" : "••••••••"}
      </span>

      <button onClick={() => togglePassword(user.id)}>
        {showPassword[user.id] ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>

      <button
        onClick={() => generateAndSavePassword(user, collectionName, userType)}
        className="text-blue-600 font-semibold"
      >
        Generate
      </button>
    </div>
  );

  const Table = ({ headers, rows }) => (
    <div className="overflow-x-auto rounded-md border mt-4">
      <table className="w-full">
        <thead className="bg-blue-600 text-white">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="p-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, i) => (
              <tr key={i} className="even:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="p-3">{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="p-4 text-center">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  /* ================= RENDER ================= */
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="flex items-center justify-center gap-3 text-4xl font-bold mb-8 bg-blue-600 text-white p-3 rounded-lg">
        <ShieldUser size={40} /> Manage Users
      </h1>

      <div className="flex justify-center gap-4 mb-8">
        <Button label="Admin" active={view==="admin"} onClick={()=>setView("admin")} />
        <Button label="Teacher" active={view==="teacher"} onClick={()=>setView("teacher")} />
        <Button label="Student" active={view==="student"} onClick={()=>setView("student")} />
      </div>

      {/* ADMIN */}
      {view === "admin" && (
        <Table
          headers={["Name", "Email", "Password"]}
          rows={admins.map(a => [
            `${a.firstName} ${a.lastName}`,
            a.email,
            <PasswordCell key={a.id} user={a} collectionName="admins" userType="admin" />
          ])}
        />
      )}

      {/* TEACHER */}
      {view === "teacher" && (
        <Table
          headers={["Name", "Email", "Password"]}
          rows={teachers.map(t => [
            `${t.firstName} ${t.lastName}`,
            t.email,
            <PasswordCell key={t.id} user={t} collectionName="teachers" userType="teacher" />
          ])}
        />
      )}

      {/* STUDENT */}
      {view === "student" && (
        <>
          <select
            className="border p-2 rounded mb-4"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              fetchStudents(e.target.value);
            }}
          >
            <option value="">Select Class</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>

          <Table
            headers={["Name", "Email", "Password"]}
            rows={students.map(s => [
              s.fullName,
              s.email,
              <PasswordCell key={s.id} user={s} collectionName="students" userType="student" />
            ])}
          />
        </>
      )}
    </div>
  );
}
