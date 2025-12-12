import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Users, MessageCircle } from "lucide-react";
import { Axios } from "../api/api";
import type { IUser } from "../lib/types";

export default function AccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return;
    Axios.get(`/account/${id}`)
      .then((res) => setUser(res.data.user))
      .catch((err) => setError(err.response?.data?.error))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Loading user...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-200 relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Animated background blobs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-400 rounded-full blur-3xl opacity-30"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-green-300 rounded-full blur-3xl opacity-30"
        animate={{ scale: [1, 1.15, 1], rotate: [0, -180, -360], opacity: [0.2, 0.4, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* User card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl p-10 flex flex-col items-center w-full max-w-md"
      >
        {/* Avatar with status indicator */}
        <div className="relative w-36 h-36 rounded-full overflow-hidden border-[5px] border-[#25D366] shadow-lg mb-5">
          <img
            src={!user.picture ? import.meta.env.VITE_DEFAULT_PIC : import.meta.env.VITE_BASE + user.picture}
            className="w-full h-full"
          />
        </div>

        {/* Name and username */}
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          {user.name} {user.surname}
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">@{user.login}</p>

        {/* Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-[#1daa57] transition font-semibold"
            onClick={() => navigate("/profile/chat/" + user._id, { state: { user } })}
          >
            <MessageCircle className="w-5 h-5" />
            Message
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
