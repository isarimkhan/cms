"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ViewAttendance() {
  const [activeTab, setActiveTab] = useState("student");

  const [classes] = useState([
    "Class 1","Class 2","Class 3","Class 4","Class 5",
    "Class 6","Class 7","Class 8","Class 9","Class 10",
  ]);

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const holidays = ["2025-01-01","2025-03-23","2025-05-01"];

  /* -------- LOAD STAFF -------- */
  useEffect(() => {
    loadTeachers();
    loadAdmins();
  }, []);

  const loadTeachers = async () => {
    const snap = await getDocs(collection(db, "teachers"));
    setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const loadAdmins = async () => {
    const snap = await getDocs(collection(db, "admins"));
    setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const loadStudents = async (className) => {
    const snap = await getDocs(collection(db, "students"));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setStudents(all.filter(s =>
      s.className === className || s.class === className || s.grade === className
    ));
  };

  const loadAttendance = async (role, userId) => {
    const ym = month.toISOString().slice(0, 7);
    const snap = await getDocs(collection(db, "attendance", role, userId, ym));
    setAttendance(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const getColor = (dateStr, status) => {
    if (holidays.includes(dateStr)) return "bg-purple-200 text-purple-900";
    const day = new Date(dateStr).getDay();
    if (day === 0) return "bg-gray-300 text-gray-800";
    switch (status) {
      case "present": return "bg-blue-200 text-blue-900";
      case "late": return "bg-yellow-200 text-yellow-900";
      case "absent": return "bg-red-200 text-red-900";
      default: return "bg-gray-200 text-gray-600";
    }
  };

  const changeMonth = (diff) => {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + diff, 1));
  };

  const getMonthDays = () => new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const formatYMD = (d) => `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto text-white min-h-screen flex flex-col">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6">
        📊 Attendance Viewer
      </h1>

      {/* -------- TABS -------- */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4 md:mb-6">
        {[
          ["student", <Users size={18}/>, "Students"],
          ["teacher", <UserCheck size={18}/>, "Teachers"],
          ["admin", <ShieldCheck size={18}/>, "Admins"],
        ].map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSelectedUser(null); }}
            className={`px-4 md:px-6 py-2 rounded flex items-center gap-2 font-semibold whitespace-nowrap ${
              activeTab === key ? "bg-blue-600" : "bg-white/20"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* -------- MONTH NAV -------- */}
      <div className="flex justify-center items-center gap-4 mb-4 md:mb-6 flex-wrap">
        <button onClick={() => changeMonth(-1)} className="p-1 md:p-2 bg-white/20 rounded">
          <ChevronLeft/>
        </button>
        <span className="text-lg md:text-xl font-semibold">
          {month.toLocaleString("default",{month:"long"})} {month.getFullYear()}
        </span>
        <button onClick={() => changeMonth(1)} className="p-1 md:p-2 bg-white/20 rounded">
          <ChevronRight/>
        </button>
      </div>

      {/* -------- USER CARDS -------- */}
      <div className="flex-1 overflow-auto">
        {activeTab==="student" && selectedClass && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {students.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedUser({...s, role:"students"}); loadAttendance("students", s.id); }}
                className="bg-white/20 p-3 rounded hover:bg-blue-600 text-left"
              >
                <div className="font-semibold">{s.firstName || s.name} {s.lastName || ""}</div>
                <div className="text-sm text-gray-300">Roll No: {s.rollNo || "-"}</div>
              </button>
            ))}
          </div>
        )}

        {activeTab==="teacher" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {teachers.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelectedUser({...t, role:"teachers"}); loadAttendance("teachers", t.id); }}
                className="bg-white/20 p-3 rounded hover:bg-blue-600 text-left"
              >
                <div className="font-semibold">{t.firstName} {t.lastName}</div>
              </button>
            ))}
          </div>
        )}

        {activeTab==="admin" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {admins.map(a => (
              <button
                key={a.id}
                onClick={() => { setSelectedUser({...a, role:"admins"}); loadAttendance("admins", a.id); }}
                className="bg-white/20 p-3 rounded hover:bg-blue-600 text-left"
              >
                <div className="font-semibold">{a.firstName} {a.lastName}</div>
              </button>
            ))}
          </div>
        )}

        {/* -------- ATTENDANCE GRID -------- */}
        {selectedUser && (
          <div className="mt-4 flex flex-col items-center w-full overflow-x-auto">
            <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4 text-center">
              {selectedUser.firstName || selectedUser.name} — {month.toLocaleString("default",{month:"long"})} {month.getFullYear()}
            </h2>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2 w-full min-w-[350px]">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} className="text-center font-semibold text-sm md:text-base">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2 w-full min-w-[350px]">
              {[...Array(getMonthDays())].map((_,i) => {
                const day = i+1;
                const dateStr = `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const rec = attendance.find(a => a?.date === dateStr || a?.day === day);
                return (
                  <div key={day} className={`p-2 md:p-3 rounded text-center text-xs md:text-sm ${getColor(dateStr, rec?.status)}`}>
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-2 md:gap-3 mt-4 md:mt-6 justify-center flex-wrap text-xs md:text-sm">
              <span className="px-2 py-1 rounded bg-blue-200 text-blue-900">Present</span>
              <span className="px-2 py-1 rounded bg-yellow-200 text-yellow-900">Late</span>
              <span className="px-2 py-1 rounded bg-red-200 text-red-900">Absent</span>
              <span className="px-2 py-1 rounded bg-gray-300 text-gray-900">Sunday Off</span>
              <span className="px-2 py-1 rounded bg-purple-200 text-purple-900">Holiday</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
