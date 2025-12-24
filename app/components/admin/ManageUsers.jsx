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
import { ShieldUser } from "lucide-react";

export default function ManageUsers() {
  const [view, setView] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  // Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Message Modal (Success / Error)
  const [messageModal, setMessageModal] = useState({
    show: false,
    text: "",
    type: "success", // success | error
  });

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

  /* ================= CHANGE PASSWORD ================= */
  const openPasswordModal = (user, collectionName, userType) => {
    setSelectedUser({ user, collectionName, userType });
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const updatePassword = async () => {
    if (!newPassword) {
      return showMessage("Please enter a password", "error");
    }

    try {
      await updateDoc(
        doc(db, selectedUser.collectionName, selectedUser.user.id),
        { password: newPassword }
      );

      await addDoc(collection(db, "passwords"), {
        userId: selectedUser.user.id,
        userType: selectedUser.userType,
        password: newPassword,
        timestamp: new Date(),
      });

      if (selectedUser.collectionName === "admins") fetchAdmins();
      if (selectedUser.collectionName === "teachers") fetchTeachers();
      if (selectedUser.collectionName === "students") fetchStudents(selectedClass);

      setShowPasswordModal(false);
      showMessage("Password updated successfully", "success");
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  /* ================= MESSAGE MODAL ================= */
  const showMessage = (text, type) => {
    setMessageModal({ show: true, text, type });
  };

  /* ================= UI COMPONENTS ================= */
  const Button = ({ label, onClick, active }) => (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-full font-semibold transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white/20 text-white hover:bg-blue-500"
      }`}
    >
      {label}
    </button>
  );

  const PasswordCell = ({ user, collectionName, userType }) => (
    <div className="flex items-center gap-4">
      <span className="font-mono">{user.password || "Not Set"}</span>
      <button
        onClick={() => openPasswordModal(user, collectionName, userType)}
        className="px-3 py-1 rounded bg-yellow-500 text-black font-semibold"
      >
        Change Password
      </button>
    </div>
  );

  const Table = ({ headers, rows }) => (
    <div className="overflow-x-auto mt-4 border border-white/30 rounded-lg">
      <table className="w-full text-white">
        <thead className="border-b border-white/30">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="p-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-white/20">
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
    <div className="p-6 max-w-5xl mx-auto text-white">

      <h1 className="flex justify-center gap-3 text-4xl font-bold mb-8 p-4 rounded-lg">
        <ShieldUser size={40} /> Manage Users
      </h1>

      <div className="flex justify-center gap-4 mb-8">
        <Button label="Admin" active={view==="admin"} onClick={()=>setView("admin")} />
        <Button label="Teacher" active={view==="teacher"} onClick={()=>setView("teacher")} />
        <Button label="Student" active={view==="student"} onClick={()=>setView("student")} />
      </div>

      {view === "admin" && (
        <Table headers={["Name","Email","Password"]}
          rows={admins.map(a => [
            `${a.firstName} ${a.lastName}`,
            a.email,
            <PasswordCell key={a.id} user={a} collectionName="admins" userType="admin" />
          ])}
        />
      )}

      {view === "teacher" && (
        <Table headers={["Name","Email","Password"]}
          rows={teachers.map(t => [
            `${t.firstName} ${t.lastName}`,
            t.email,
            <PasswordCell key={t.id} user={t} collectionName="teachers" userType="teacher" />
          ])}
        />
      )}

      {view === "student" && (
        <>
          <select
            className="border border-white/30 bg-transparent p-2 rounded mb-4"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              fetchStudents(e.target.value);
            }}
          >
            <option value="" className="text-black">Select Class</option>
            {classes.map(c => (
              <option key={c} value={c} className="text-black">{c}</option>
            ))}
          </select>

          <Table headers={["Name","Email","Password"]}
            rows={students.map(s => [
              s.fullName,
              s.email,
              <PasswordCell key={s.id} user={s} collectionName="students" userType="student" />
            ])}
          />
        </>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-center">Change Password</h2>
            <input
              className="w-full border p-2 rounded mb-4"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <div className="flex justify-end gap-3">
              <button onClick={()=>setShowPasswordModal(false)}>Cancel</button>
              <button onClick={updatePassword} className="bg-blue-600 text-white px-4 py-2 rounded">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE MODAL */}
      {messageModal.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-96 text-center ${
            messageModal.type === "success" ? "bg-green-100" : "bg-red-600"
          }`}>
            <p className="text-white font-semibold mb-4">
              {messageModal.text}
            </p>
            <button
              onClick={() => setMessageModal({ ...messageModal, show: false })}
              className="bg-white text-black px-4 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
