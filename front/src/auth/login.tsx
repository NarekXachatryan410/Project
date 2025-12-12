import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Axios } from "../api/api";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    Axios.post("/login", { login, password })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        navigate("/profile");
      })
      .catch((err) => setError(err.response?.data?.error || "Something went wrong"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-100 to-green-200 relative overflow-hidden">

      {/* Animated background orbs */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-10 left-10 w-64 h-64 bg-green-400 rounded-full blur-3xl opacity-40"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl opacity-40"
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full border border-white/30"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center mb-6"
        >
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-green-400/40"
          >
            WA
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-800 mt-4">Welcome Back 👋</h2>
          <p className="text-gray-600 mt-1 text-sm">Log in to continue chatting</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-red-500 font-medium mb-4 bg-red-50 border border-red-200 rounded-xl py-2"
          >
            {error}
          </motion.p>
        )}

        {/* Form */}
        <form className="space-y-5 relative" onSubmit={handleSubmit}>
          {/* Username / Email */}
          <motion.input
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            type="text"
            placeholder="Username or Email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/60 backdrop-blur-sm 
                       focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition-all
                       placeholder:text-gray-400 text-gray-800"
          />

          {/* Password */}
          <motion.div className="relative">
            <motion.input
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/60 backdrop-blur-sm 
                         focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition-all
                         placeholder:text-gray-400 text-gray-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-green-600 font-medium"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </motion.div>

          {/* Forgot Password */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <Link
              to="/forgot-password"
              className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16,185,129,0.6)" }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-br from-green-500 to-emerald-600 
                       text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl 
                       transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-600 mt-6"
        >
          Don’t have an account?{" "}
          <Link
            to="/"
            className="text-green-600 font-semibold hover:underline hover:text-green-700 transition"
          >
            Sign Up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
