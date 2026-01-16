import { motion } from "framer-motion";
import { Search, ArrowLeft, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { IUser } from "../lib/types";
import { Axios } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [text, setText] = useState("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [recent, setRecent] = useState<IUser[]>([]);
  const navigate = useNavigate();

  // 🔍 Live search
  useEffect(() => {
    if (!text.trim()) {
      setUsers([]);
      return;
    }

    const delay = setTimeout(() => {
      Axios.get("/account/search/" + text)
        .then((res) => setUsers(res.data.users))
        .catch((err) => console.log(err));
    }, 350);

    return () => clearTimeout(delay);
  }, [text]);

  // 💾 Save to recent searches
  const handleUserClick = (user: IUser) => {
    const updated = [user, ...recent.filter((u) => u._id !== user._id)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    navigate("/profile/search/account/" + user._id);
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100 overflow-hidden">
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-10 left-10 w-[28rem] h-[28rem] bg-emerald-400/30 rounded-full blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-10 w-[30rem] h-[30rem] bg-teal-300/30 rounded-full blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />

      {/* Header */}
      <motion.div
        className="flex items-center gap-4 px-8 py-5 bg-white/70 backdrop-blur-xl text-emerald-800 shadow-lg border-b border-emerald-200 z-10"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 80 }}
      >
        <ArrowLeft
          className="cursor-pointer hover:scale-110 transition-transform text-emerald-700"
          onClick={() => navigate(-1)}
        />
        <h1 className="font-bold text-2xl tracking-wide">Search</h1>
      </motion.div>

      {/* Search bar */}
      <motion.div
        className="relative w-full max-w-3xl self-center mt-10 px-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" />
        <input
          type="text"
          placeholder="Search or start a new chat..."
          className="w-full pl-14 pr-6 py-4 rounded-full bg-white/80 backdrop-blur-lg shadow-lg border border-white/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/40 transition-all text-gray-700 placeholder-gray-400 text-lg"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </motion.div>

      {/* Results list */}
      <motion.div
        className="flex flex-col flex-1 overflow-y-auto mt-8 px-6 pb-6 space-y-5 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {/* No users found */}
        {users.length === 0 && text.trim() !== "" && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-500 text-lg mb-2">No users found 😢</p>
            <motion.div
              className="mx-auto w-40 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"
              animate={{ backgroundPositionX: ["0%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              style={{ backgroundSize: "200%" }}
            />
          </motion.div>
        )}

        {/* Found users */}
        {users.map((user, i) => (
          <motion.div
            key={user._id}
            className="flex items-center gap-5 w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl p-5 shadow-lg hover:shadow-2xl hover:bg-white/90 transition-all cursor-pointer border border-emerald-100"
            whileHover={{ scale: 1.03, rotate: 0.4 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            onClick={() => handleUserClick(user)}
          >
            <img src={user.picture ? import.meta.env.VITE_BASE + user.picture : import.meta.env.VITE_DEFAULT_PIC} className="w-16 h-16 rounded-full"/>
            <div className="flex flex-col">
              <h2 className="font-semibold text-gray-800 text-xl">
                {user.name} {user.surname}
              </h2>
              <h2 className="text-sm text-gray-500 font-light">
                @{user.login}
              </h2>
              <p className="text-gray-500 text-sm mt-1">Tap to start chatting 💬</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
