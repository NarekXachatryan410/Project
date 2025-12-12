import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Axios } from "../api/api";

export default function MakeNewPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirm) {
      setError("Please fill both fields.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const res = await Axios.patch(`/reset-password`, { password });
      if (res.data.success) {
        setSuccess("Password updated successfully!");
        setTimeout(() => navigate("/profile"), 1700); // redirect to login
      } else {
        setError(res.data.error || "Something went wrong.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-100 to-green-200 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create New Password
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#25D366] text-white py-3 rounded-full shadow-lg hover:bg-[#1daa57] transition font-semibold"
          >
            {loading ? "Updating..." : "Update Password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
