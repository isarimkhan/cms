"use client";

import { useState } from "react";
import {
  Book,
  Users,
  GraduationCap,
  ClipboardList,
  UserCog,
  BarChart3,
  Menu,
  ChevronLeft,
} from "lucide-react";
import Header from "../components/header";

// ✅ Import the components
import ManageCourses from "../components/admin/ManageCourses";
import ManageTeachers from "../components/admin/ManageTeachers";
import ManageStudents from "../components/admin/ManageStudents";
import ViewReports from "../components/admin/ViewReports";
import ManageUsers from "../components/admin/ManageUsers";
import AssignCourses from "../components/admin/AssignCourses";
import ManageRoles from "../components/admin/ManageRoles";
import Analytics from "../components/admin/Analytics";
import ManageAdmins from "../components/admin/ManageAdmin";

export default function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState("dashboard");

  const menuItems = [
    { label: "Manage Courses", icon: <Book size={22} />, key: "courses" },
    { label: "Manage Teachers", icon: <Users size={22} />, key: "teachers" },
    { label: "Manage Students", icon: <GraduationCap size={22} />, key: "students" },
    { label: "Manage Admins", icon: <UserCog size={22} />, key: "admin" },
    { label: "View Reports", icon: <ClipboardList size={22} />, key: "reports" },
    { label: "Manage Users", icon: <Users size={22} />, key: "users" },
    { label: "Assign Courses", icon: <Book size={22} />, key: "assign" },
    { label: "Manage Roles", icon: <UserCog size={22} />, key: "roles" },
    { label: "Analytics", icon: <BarChart3 size={22} />, key: "analytics" },
  ];

  const renderContent = () => {
    switch (activeComponent) {
      case "courses":
        return <ManageCourses />;
      case "teachers":
        return <ManageTeachers />;
      case "students":
        return <ManageStudents />;
         case "admin":
        return <ManageAdmins/>;
      case "reports":
        return <ViewReports />;
      case "users":
        return <ManageUsers />;
      case "assign":
        return <AssignCourses />;
      case "roles":
        return <ManageRoles />;
      case "analytics":
        return <Analytics />;
      default:
        return (
          <>
            <h1 className="text-3xl font-bold mb-4">
              Welcome to Admin Dashboard
            </h1>
            <p className="text-gray-200">
              Select any section from the sidebar to start managing.
            </p>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-white/10 backdrop-blur-lg border-r border-white/20 p-4 flex flex-col transition-all duration-300 h-full sticky top-0 overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center mb-10">
          <h1
            className={`text-white font-bold text-3xl px-5 transition-all duration-300 ${
              !isOpen && "opacity-0 hidden"
            }`}
          >
            Admin
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-2 rounded-lg hover:bg-white/20"
          >
            {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items — only sidebar scrolls */}
        <nav className="flex flex-col gap-2 overflow-y-auto h-full pr-2">
          {menuItems.map((item) => (
            <div
              key={item.key}
              onClick={() => setActiveComponent(item.key)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                activeComponent === item.key
                  ? "bg-white/30 scale-105 shadow-lg"
                  : "text-white hover:bg-white/20"
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              <span
                className={`font-medium transition-all duration-300 ${
                  !isOpen && "opacity-0 hidden"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 p-8 text-white overflow-hidden h-full">
          <div className="h-full w-full overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
