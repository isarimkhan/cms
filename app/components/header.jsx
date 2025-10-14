"use client";

import { Search, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // clear cookies, localStorage, sessionStorage
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
    localStorage.clear();
    sessionStorage.clear();

    // redirect to login page
    router.push("/login");
  };

  return (
    <header className="w-full bg-white/10 backdrop-blur-lg border-b border-white/20 p-4 flex items-center justify-between sticky top-0 z-50">
      {/* Search Bar */}
      <div className="flex items-center bg-white/20 rounded-lg px-3 py-2 w-full max-w-md text-white">
        <Search size={18} className="mr-2 text-white/70" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none w-full placeholder-white/70 text-white"
        />
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="ml-4 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
      >
        <LogOut size={18} />
        Logout
      </button>
    </header>
  );
}
