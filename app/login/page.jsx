"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Predefined users
  const users = [
    { role: "admin", email: "admin@example.com", password: "admin123", path: "/admin" },
    { role: "teacher", email: "teacher@example.com", password: "teacher123", path: "/teacher" },
    { role: "student", email: "student@example.com", password: "student123", path: "/student" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const matchedUser = users.find(
        (user) => user.email === email && user.password === password
      );

      if (matchedUser) {
        alert(`✅ Welcome ${matchedUser.role.toUpperCase()}`);
        router.push(matchedUser.path);
      } else {
        alert("❌ Invalid email or password");
      }

      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-center text-white mb-8">
          CMS Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-300" size={20} />
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-gray-300 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-300" size={20} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-3 bg-white/10 text-white placeholder-gray-300 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <a
              href="#"
              className="text-sm text-pink-300 hover:text-white transition-colors"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 flex justify-center items-center gap-2 rounded-lg text-white font-semibold shadow-lg transition-all duration-300 ${
              loading
                ? "bg-pink-400/60 cursor-not-allowed"
                : "bg-pink-500 hover:bg-pink-600 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-8 text-sm text-gray-200 bg-white/5 p-4 rounded-lg border border-white/10">
          💡 <strong>Test Accounts:</strong>
          <ul className="mt-2 space-y-1">
            <li>👑 Admin → <code>admin@example.com</code> / <code>admin123</code></li>
            <li>👨‍🏫 Teacher → <code>teacher@example.com</code> / <code>teacher123</code></li>
            <li>👨‍🎓 Student → <code>student@example.com</code> / <code>student123</code></li>
          </ul>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
