import { useState } from "react";
import { motion } from "framer-motion";
import { Axios } from "../api/api";
import { useOutletContext } from "react-router-dom";
import type { IOutletContext } from "../lib/types";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { user, setUser } = useOutletContext<IOutletContext>();

  // 🟢 UPDATE USERNAME
  const handleUpdateUsername = async () => {
    if (!username.trim()) return setMessage("Username cannot be empty");
    try {
      setLoading(true);
      const res = await Axios.patch("/account/update-username", { login: username });
      setMessage(res.data.message || "Username updated successfully");
      setUser({ ...user, login: username });
      setUsername("");
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 UPDATE NAME & SURNAME
  const handleUpdateNameSurname = async () => {
    if (!name.trim() && !surname.trim())
      return setMessage("Please fill name or surname");
    try {
      setLoading(true);
      const res = await Axios.patch("/account/update-name-surname", { name, surname });
      setMessage(res.data.message || "Name and surname updated successfully");
      setUser({ ...user, name: name ? name : user.surname, surname: surname ? surname : user.surname });
      setName("");
      setSurname("");
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("Failed to update name/surname");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 UPDATE PASSWORD
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return setMessage("All password fields are required");
    if (newPassword !== confirmPassword)
      return setMessage("Passwords do not match");

    try {
      setLoading(true);
      const res = await Axios.patch("/account/update-password", {
        currentPassword,
        newPassword,
      });
      setMessage(res.data.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-200 via-teal-100 to-emerald-300 flex flex-col items-center justify-start relative overflow-hidden">
      {/* Floating lights */}
      <motion.div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-emerald-400/40 rounded-full blur-3xl opacity-50"
        animate={{ x: [0, 40, 0], y: [0, 60, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[800px] h-[800px] bg-teal-500/40 rounded-full blur-3xl opacity-40"
        animate={{ x: [0, -50, 0], y: [0, -60, 0] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
      />

      {/* Title */}
      <motion.h1
        className="text-5xl font-extrabold mt-16 mb-14 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 drop-shadow-sm"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        Account Settings
      </motion.h1>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-10 w-full max-w-6xl px-8 pb-24">
        {/* Username Card */}
        <AnimatedCard title="Change Username">
          <AnimatedInput
            placeholder="New username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <NeonButton
            text={loading ? "Updating..." : "Update Username"}
            onClick={handleUpdateUsername}
            disabled={loading}
          />
        </AnimatedCard>

        {/* Name + Surname Card */}
        <AnimatedCard title="Update Name & Surname">
          <AnimatedInput
            placeholder="New name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <AnimatedInput
            placeholder="New surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
          <NeonButton
            text={loading ? "Updating..." : "Update Name & Surname"}
            onClick={handleUpdateNameSurname}
            disabled={loading}
          />
        </AnimatedCard>

        {/* Password Card */}
        <AnimatedCard title="Change Password">
          <AnimatedInput
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <AnimatedInput
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <AnimatedInput
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <NeonButton
            text={loading ? "Updating..." : "Update Password"}
            onClick={handleUpdatePassword}
            disabled={loading}
          />
        </AnimatedCard>
      </div>

      {/* Status Message */}
      {message && (
        <motion.p
          className="mt-10 text-center text-gray-700 text-lg backdrop-blur-md bg-white/40 px-6 py-3 rounded-2xl shadow-md border border-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

// 🟢 Reusable Animated Card
const AnimatedCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <motion.div
    className="bg-white/30 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-white/40 hover:border-emerald-300/50 transition-all duration-500 flex flex-col justify-between"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.9 }}
    whileHover={{ scale: 1.02 }}
  >
    <h2 className="text-2xl font-semibold text-gray-700 mb-8">{title}</h2>
    <div className="space-y-6">{children}</div>
  </motion.div>
);

// 🟩 Neon Button
const NeonButton = ({
  text,
  onClick,
  disabled,
}: {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(16,185,129,0.6)" }}
    whileTap={{ scale: 0.95 }}
    disabled={disabled}
    onClick={onClick}
    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-emerald-300/50 transition-all text-lg"
  >
    {text}
  </motion.button>
);

// 🧊 Animated Input
const AnimatedInput = ({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) => (
  <motion.input
    whileFocus={{ scale: 1.02, boxShadow: "0 0 25px rgba(16,185,129,0.4)" }}
    type={type}
    placeholder={placeholder}
    className="w-full p-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 text-gray-700 text-lg bg-white/70 shadow-sm placeholder:text-gray-400 transition-all"
    value={value}
    onChange={onChange}
  />
);
