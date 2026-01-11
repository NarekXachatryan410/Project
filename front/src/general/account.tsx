import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, UserX } from "lucide-react";
import { Axios } from "../api/api";
import type { IUser } from "../lib/types";

export default function AccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        // Fetch user info
        const res = await Axios.get(`/account/${id}`);
        setUser(res.data.user);

        // Check if already blocked
        const blockedRes = await Axios.get(`/account/blocked/${id}`);
        setBlocked(blockedRes.data.blocked);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Loading user...
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        {error}
      </div>
    );

  const handleBlockToggle = async (userId: number) => {
    try {
      if (blocked) {
        // Unblock
        await Axios.delete(`/account/unblock/${userId}`);
        setBlocked(false);
      } else {
        await Axios.patch(`/account/block/${userId}`);
        setBlocked(true);
      }
    } catch (err: any) {
      console.error("Block/Unblock error:", err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-200 relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* User card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl p-10 flex flex-col items-center w-full max-w-md"
      >
        {/* Avatar */}
        <div className="relative w-36 h-36 rounded-full overflow-hidden border-[5px] border-[#25D366] shadow-lg mb-5">
          <img
            src={
              !user.picture
                ? import.meta.env.VITE_DEFAULT_PIC
                : import.meta.env.VITE_BASE + user.picture
            }
            className="w-full h-full"
          />
        </div>

        {/* Name & username */}
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          {user.name} {user.surname}
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">@{user.login}</p>

        {/* Buttons */}
        <div className="flex gap-4">
          {/* Message Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-[#1daa57] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() =>
              !blocked &&
              navigate("/profile/chat/" + user._id, { state: { user } })
            }
            disabled={blocked}
          >
            <MessageCircle className="w-5 h-5" />
            Message
          </motion.button>

          {/* Block/Unblock Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full shadow-lg font-semibold transition ${
              blocked
                ? "bg-gray-400 text-white hover:bg-gray-400 cursor-pointer"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            onClick={() => handleBlockToggle(user._id)}
          >
            <UserX className="w-5 h-5" />
            {blocked ? "Unblock" : "Block"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}