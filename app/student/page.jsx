"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Book,
  Users,
  GraduationCap,
  ClipboardList,
  UserCog,
  BarChart3,
  Menu,
  ChevronLeft,
  BookOpen,
  FileText,
  CalendarCheck,
  ClipboardCheck,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Header from "../components/header";

export default function StudentDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
   {
    label: "View Courses",
    icon: <BookOpen size={22} />,
    href: "/Student/manage-course",
  },
  {
    label: "Submit Assignment",
    icon: <FileText size={22} />,
    href: "/Student/manage-teachers",
  },
  {
    label: "View Attendance",
    icon: <CalendarCheck size={22} />,
    href: "/Student/manage-students",
  },
  {
    label: "Check Result",
    icon: <ClipboardCheck size={22} />,
    href: "/Student/view-reports",
  },
  {
    label: "View Marks",
    icon: <GraduationCap size={22} />,
    href: "/Student/manage-users",
  },
    
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Sidebar - Fixed Full Height from Top */}
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-white/10 backdrop-blur-lg border-r border-white/20 p-4 flex flex-col transition-all duration-300 h-screen sticky top-0`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center mb-10">
          <h1
            className={`text-white font-bold text-3xl px-5 transition-all duration-300 ${
              !isOpen && "opacity-0 hidden"
            }`}
          >
            Student
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-2 rounded-lg hover:bg-white/20"
          >
            {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  pathname === item.href
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
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Area (Header + Content) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header on top of main content only */}
        <Header />

        {/* Main Content Scrollable */}
        <div className="flex-1 p-8 text-white overflow-y-auto">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Student Dashboard
          </h1>
          <p className="text-gray-200">
            Select any section from the sidebar to start managing.
          </p>
        </div>
      </div>
    </div>
  );
}
