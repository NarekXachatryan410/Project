"use client";
import { useEffect, useState } from "react";
import { Outlet, NavLink, Navigate } from "react-router-dom";
import { MessageCircle, Search, Settings, User, Users, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Axios } from "../api/api";
import type { IUser } from "../lib/types";

export default function Layout() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { id: "1", name: "Profile", to: "/profile", icon: <User className="w-5 h-5 mr-3" /> },
    { id: "2", name: "Search", to: "/profile/search", icon: <Search className="w-5 h-5 mr-3" /> },
    { id: "3", name: "Settings", to: "/profile/settings", icon: <Settings className="w-5 h-5 mr-3" /> },
    { id: "4", name: "Chats", to: "/profile/chats", icon: <MessageCircle className="w-5 h-5 mr-3" /> },
    { id: "5", name: "Groups", to: "/profile/groups", icon: <Users className="w-5 h-5 mr-3" /> }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);

    Axios.get("/verify", { headers: { authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data.payload))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-100 to-green-50 text-gray-700 text-lg font-semibold">
        🌿 Loading your profile...
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#ECE5DD] to-[#D9FDD3]">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-64 bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white flex flex-col py-8 px-6 shadow-2xl rounded-r-3xl"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-extrabold mb-10 text-center tracking-wide"
        >
          {user?.name || "Profile"}
        </motion.h1>

        <div className="flex-1 space-y-3">
          {navItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <NavLink
                to={item.to}
                end={item.to === "/profile"}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-[#25D366] text-white shadow-md scale-[1.03]"
                      : "text-gray-200 hover:bg-[#0d7a66] hover:text-white"
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            </motion.div>
          ))}
        </div>

      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-1 overflow-y-auto rounded-l-3xl"
      >
        {/* Inner content padding added inside, not on scrollable container */}
        <div className="min-h-full">
          <Outlet context={{ user, setUser }} />
        </div>
      </motion.div>
    </div>
  );
}
