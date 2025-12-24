"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function AssignCourses() {
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [scheduleId, setScheduleId] = useState(null);
  const [activeTab, setActiveTab] = useState("class");
  const [allSchedules, setAllSchedules] = useState([]);
  const [message, setMessage] = useState("");

  const defaultSchedule = Array.from({ length: 7 }, (_, i) => ({
    period: i + 1,
    subject: "",
    teacherId: "",
  }));

  const [schedule, setSchedule] = useState(defaultSchedule);

  const classes = [
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
  ];

  const subjects = [
    "Math",
    "English",
    "Urdu",
    "Science",
    "Islamiyat",
    "Computer",
    "Social Studies",
  ];

  /* ================= TOAST ================= */
  const showMsg = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  /* ================= FETCH TEACHERS & SCHEDULES ================= */
  useEffect(() => {
    getDocs(collection(db, "teachers")).then((snap) =>
      setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    loadAllSchedules();
  }, []);

  const loadAllSchedules = async () => {
    const snap = await getDocs(collection(db, "classSchedules"));
    setAllSchedules(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          periods: Array.isArray(data.periods) ? data.periods : [],
        };
      })
    );
  };

  /* ================= LOAD CLASS SCHEDULE ================= */
  const loadSchedule = async (className) => {
    setSelectedClass(className);
    setSchedule(defaultSchedule);

    const q = query(
      collection(db, "classSchedules"),
      where("className", "==", className)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      setScheduleId(snap.docs[0].id);
      const data = snap.docs[0].data();
      setSchedule(Array.isArray(data.periods) ? data.periods : defaultSchedule);
    } else {
      setScheduleId(null);
      setSchedule(defaultSchedule);
    }
  };

  /* ================= TEACHER WISE VIEW DATA ================= */
  const teacherPeriods = selectedTeacher
    ? Array.from({ length: 7 }, (_, i) => {
        const period = i + 1;
        const entry = allSchedules.flatMap((s) =>
          (Array.isArray(s.periods) ? s.periods : [])
            .filter(
              (p) => p.period === period && p.teacherId === selectedTeacher
            )
            .map((p) => ({ className: s.className, subject: p.subject }))
        )[0];

        return {
          period,
          time: getPeriodTime(period),
          className: entry?.className || "-",
          subject: entry?.subject || "-",
        };
      })
    : [];

  /* ================= PERIOD TIME ================= */
  function getPeriodTime(period) {
    const start = 8 * 60 + (period - 1) * 30;
    const end = start + 30;
    const f = (m) =>
      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(
        2,
        "0"
      )}`;
    return `${f(start)} - ${f(end)}`;
  }

  /* ================= UPDATE PERIOD ================= */
  const updatePeriod = async (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  /* ================= SAVE SCHEDULE ================= */
  const saveSchedule = async () => {
    if (!selectedClass) return showMsg("⚠️ Please select a class");

    if (scheduleId) {
      await updateDoc(doc(db, "classSchedules", scheduleId), {
        periods: schedule,
        updatedAt: new Date(),
      });
    } else {
      await addDoc(collection(db, "classSchedules"), {
        className: selectedClass,
        periods: schedule,
        createdAt: new Date(),
      });
    }

    await loadAllSchedules();
    showMsg("✅ Schedule saved successfully");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      {message && (
        <div className="mb-4 bg-green-600 text-center py-2 rounded font-semibold">
          {message}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-center">
        Schedule Management
      </h1>

      {/* ===== TABS ===== */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab("class")}
          className={`px-6 py-2 rounded font-semibold ${
            activeTab === "class" ? "bg-blue-600" : "bg-white/20"
          }`}
        >
          Class-wise
        </button>

        <button
          onClick={() => setActiveTab("teacher")}
          className={`px-6 py-2 rounded font-semibold ${
            activeTab === "teacher" ? "bg-blue-600" : "bg-white/20"
          }`}
        >
          Teacher-wise
        </button>
      </div>

      {/* ============ CLASS WISE VIEW ============ */}
      {activeTab === "class" && (
        <>
          <div className="mb-6 text-center">
            <select
              onChange={(e) => loadSchedule(e.target.value)}
              className="p-2 rounded text-black"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Period</Th>
                <Th>Time</Th>
                <Th>Subject</Th>
                <Th>Teacher</Th>
              </tr>
            </thead>

            <tbody>
              {schedule.map((p, i) => (
                <tr key={i}>
                  <Td center>{p.period}</Td>
                  <Td center>{getPeriodTime(p.period)}</Td>

                  <Td>
                    <select
                      value={p.subject}
                      onChange={(e) =>
                        updatePeriod(i, "subject", e.target.value)
                      }
                      className="w-full p-1 text-black rounded"
                    >
                      <option value="">Select</option>
                      {subjects.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Td>

                  <Td>
                    <select
                      value={p.teacherId}
                      onChange={(e) =>
                        updatePeriod(i, "teacherId", e.target.value)
                      }
                      className="w-full p-1 text-black rounded"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.firstName} {t.lastName}
                        </option>
                      ))}
                    </select>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-6 text-center">
            <button
              onClick={saveSchedule}
              className="px-6 py-2 bg-blue-600 rounded font-semibold"
            >
              Save Schedule
            </button>
          </div>
        </>
      )}

      {/* ============ TEACHER WISE VIEW ============ */}
      {activeTab === "teacher" && (
        <>
          <div className="mb-6 text-center">
            <select
              className="p-2 rounded text-black"
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option value={t.id} key={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>

          {selectedTeacher && (
            <>
              <h2 className="text-center text-xl mb-3">Assigned Periods</h2>

              <Table>
                <thead>
                  <tr>
                    <Th>Period</Th>
                    <Th>Time</Th>
                    <Th>Class</Th>
                    <Th>Subject</Th>
                  </tr>
                </thead>

                <tbody>
                  {teacherPeriods.map((p, i) => (
                    <tr key={i}>
                      <Td center>{p.period}</Td>
                      <Td center>{p.time}</Td>
                      <Td center>{p.className}</Td>
                      <Td center>{p.subject}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ========= SMALL STYLED COMPONENT HELPERS ========= */
function Table({ children }) {
  return (
    <table className="w-full border border-white/30 rounded overflow-hidden">
      {children}
    </table>
  );
}

function Th({ children }) {
  return (
    <th className="bg-white/10 px-3 py-2 border border-white/20">{children}</th>
  );
}

function Td({ children, center }) {
  return (
    <td
      className={`px-3 py-2 border border-white/20 ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </td>
  );
}
