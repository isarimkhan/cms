"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ShieldUser, Users } from "lucide-react";

export default function ManageUsers() {
  const [view, setView] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

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

  const fetchAdmins = async () => {
    const snapshot = await getDocs(collection(db, "admins"));
    setAdmins(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchTeachers = async () => {
    const snapshot = await getDocs(collection(db, "teachers"));
    setTeachers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchStudents = async (className) => {
    const q = query(collection(db, "students"), where("class", "==", className));
    const snapshot = await getDocs(q);
    setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchAdmins();
    fetchTeachers();
  }, []);

  const Button = ({ label, onClick, active }) => (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${
        active
          ? "bg-blue-600 text-white shadow-md scale-105"
          : "bg-gray-200 hover:bg-blue-500 hover:text-white text-gray-700"
      }`}
    >
      {label}
    </button>
  );

  const Table = ({ headers, rows }) => (
    <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm mt-4">
      <table className="w-full">
        <thead>
          <tr className="bg-blue-600 text-white text-left">
            {headers.map((header, i) => (
              <th key={i} className="p-3 text-sm sm:text-base font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, i) => (
              <tr
                key={i}
                className={`${
                  i % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 transition`}
              >
                {row.map((cell, j) => (
                  <td key={j} className="p-3 text-sm text-gray-800">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="p-4 text-center text-gray-500 italic"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const Dropdown = ({ value, onChange, options, placeholder }) => (
    <div className="flex flex-col-reverse items-start relative w-full sm:w-1/2">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full border border-gray-300 bg-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 text-black max-w-5xl mx-auto">
        <h1 className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-bold mb-8 text-center bg-gradient-to-r  text-white px-4 py-2 rounded-lg ">
  <ShieldUser size={40} />
  Manage Users
</h1>

      {/* Selection Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Button
          label="Admin"
          onClick={() => {
            setView("admin");
            setSelectedDepartment("");
            setSelectedClass("");
          }}
          active={view === "admin"}
        />
        <Button
          label="Teacher"
          onClick={() => {
            setView("teacher");
            setSelectedDepartment("");
            setSelectedClass("");
          }}
          active={view === "teacher"}
        />
        <Button
          label="Student"
          onClick={() => {
            setView("student");
            setSelectedDepartment("");
            setSelectedClass("");
          }}
          active={view === "student"}
        />
      </div>

      {/* Admin Department Dropdown */}
      {view === "admin" && (
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
            Select Department
          </label>
          <Dropdown
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            options={departments}
            placeholder="-- Choose Department --"
          />
        </div>
      )}

      {/* Admin Table */}
      {view === "admin" && selectedDepartment && (
        <>
          <h2 className="text-lg font-bold mb-3 text-gray-800">
            Admins in {selectedDepartment}
          </h2>
          <Table
            headers={["Name", "Email", "Password"]}
            rows={admins
              .filter((a) => a.department === selectedDepartment)
              .map((admin) => [
                `${admin.firstName} ${admin.lastName}`,
                admin.email,
                `${admin.firstName}@123`,
              ])}
          />
        </>
      )}

      {/* Teacher Table */}
      {view === "teacher" && (
        <>
          <h2 className="text-lg font-bold mb-3 text-gray-800">Teachers</h2>
          <Table
            headers={["Name", "Email", "Password"]}
            rows={teachers.map((teacher) => [
              `${teacher.firstName} ${teacher.lastName}`,
              teacher.email,
              `${teacher.firstName}@123`,
            ])}
          />
        </>
      )}

      {/* Student Class Dropdown */}
      {view === "student" && (
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
            Select Class
          </label>
          <Dropdown
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              fetchStudents(e.target.value);
            }}
            options={classes}
            placeholder="-- Choose Class --"
          />
        </div>
      )}

      {/* Student Table */}
      {view === "student" && selectedClass && (
        <>
          <h2 className="text-lg font-bold mb-3 text-gray-800">
            Students in {selectedClass}
          </h2>
          <Table
            headers={["Full Name", "Email", "Password"]}
            rows={students.map((student) => [
              student.fullName,
              student.email,
              `${student.fullName?.split(" ")[0]}@123`,
            ])}
          />
        </>
      )}
    </div>
  );
}
