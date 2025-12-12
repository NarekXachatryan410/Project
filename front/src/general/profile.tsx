import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, LogOut, Trash2 } from "lucide-react";
import type { IUser } from "../lib/types";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Axios } from "../api/api";
import LogoutModal from "../modals/logoutModal";
import DeletePictureModal from "../modals/deletePicModal";

interface IContext {
  user: IUser;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

export default function ProfilePage() {
  const { user, setUser } = useOutletContext<IContext>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState(user?.picture || import.meta.env.VITE_DEFAULT_PIC);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) {
    return (
      <div className="flex-1 flex justify-center items-center text-gray-600 text-xl animate-pulse">
        Loading your profile...
      </div>
    );
  }

  const handleCameraClick = () => fileInputRef.current?.click();

  // ✅ Upload new picture
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("picture", file);

    try {
      setLoading(true);
      const res = await Axios.patch("/account/upload", formData);
      if (res.data.url) {
        setPreview(res.data.url);
        setUser({ ...user, picture: res.data.url });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete picture (confirmed)
  const handleDeletePictureConfirm = async () => {
    try {
      setLoading(true);
      await Axios.patch("/account/picture/delete");
      setPreview(import.meta.env.VITE_DEFAULT_PIC);
      setUser({ ...user, picture: import.meta.env.VITE_DEFAULT_PIC });
    } catch (err) {
      console.error("Delete picture failed:", err);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // ✅ Confirm logout
  const handleLogoutConfirm = async () => {
    try {
      await Axios.post("/logout");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-green-200 relative flex justify-center items-center p-6 overflow-hidden">
      {/* Background animation */}
      <motion.div
        className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-green-400 rounded-full blur-3xl opacity-40"
        animate={{ x: [0, 50, 0], y: [0, 60, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[1000px] h-[1000px] bg-emerald-400 rounded-full blur-3xl opacity-35"
        animate={{ x: [0, -60, 0], y: [0, -70, 0], rotate: [0, -180, -360] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-[1000px] flex flex-col md:flex-row gap-8 items-center"
      >
        {/* Profile Picture */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <motion.img
            src={
              preview.startsWith("blob:")
                ? preview
                : preview.startsWith("http")
                ? preview
                : import.meta.env.VITE_BASE + preview
            }
            className={`rounded-full object-cover w-48 h-48 border-4 border-[#25D366] shadow-xl ${
              loading ? "opacity-50 animate-pulse" : "transition-all duration-500 hover:scale-105"
            }`}
          />
          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCameraClick}
            className="absolute bottom-2 right-2 bg-[#25D366] p-3 rounded-full shadow-lg hover:bg-[#1daa57] transition"
          >
            <Camera className="w-5 h-5 text-white" />
          </motion.button>
          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.2, rotate: -15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeleteModal(true)}
            className="absolute top-2 right-2 bg-red-500 p-3 rounded-full shadow-lg hover:bg-red-600 transition"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </motion.button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        {/* User Info */}
        <div className="flex-1 flex flex-col justify-center gap-6 items-center md:items-start">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-extrabold text-gray-800"
          >
            {user.name} {user.surname}
          </motion.h2>

          <div className="flex flex-col gap-4 w-[300px]">
            {[ 
              { id: "1", label: "First Name", value: user.name },
              { id: "2", label: "Surname", value: user.surname },
              { id: "3", label: "Username", value: user.login },
            ].map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md flex justify-between items-center"
              >
                <div>
                  <h3 className="text-sm text-gray-500">{item.label}</h3>
                  <p className="text-lg text-gray-800 font-medium">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(16,185,129,0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLogoutModal(true)}
            className="mt-6 w-[300px] flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-full shadow-lg hover:bg-[#1daa57] transition font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Modals */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />

      <DeletePictureModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePictureConfirm}
      />
    </div>
  );
}
