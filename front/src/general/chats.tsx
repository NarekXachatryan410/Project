import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Axios } from "../api/api";
import { Search, Trash2 } from "lucide-react";
import type { IUser } from "../lib/types";
import DeleteChatModal from "../modals/deleteChat";

interface IChatPreview {
  _id: string;
  from: IUser;
  to: IUser;
  text: string;
  createdAt: string;
  read: boolean;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<IChatPreview[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Load chats
  useEffect(() => {
    Axios.get("/chats")
      .then((res) => {
        setCurrentUserId(res.data.currentUserId);
        setChats(res.data.chats || []);
      })
      .catch((err) => console.error("Failed to load chats", err))
      .finally(() => setLoading(false));
  }, []);

  // Search users dynamically
  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    const timeout = setTimeout(() => {
      Axios.get("/chats/search/" + search)
        .then((res) => setUsers(res.data.users || []))
        .catch(() => console.error("Search failed"));
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  function formatTime(iso: string) {
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  // Open modal
  const handleOpenModal = (chatId: string) => {
    setSelectedChatId(chatId);
    setModalOpen(true);
    setOpenMenuId(null); // close context menu
  };

  // Delete chat
  const handleDeleteChat = async () => {
    if (!selectedChatId) return;

    try {
      await Axios.delete(`/chats/chat/${selectedChatId}`);
      setChats((prev) => prev.filter((c) => {
        const otherUserId = currentUserId == c.from._id ? c.to._id : c.from._id
        return otherUserId.toString() != selectedChatId
      }));
    } catch (err) {
      alert("Failed to delete chat");
    } finally {
      setModalOpen(false);
      setSelectedChatId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-200 relative overflow-hidden">
      {/* floating blobs */}
      <motion.div
        className="absolute -top-48 -left-32 w-[600px] h-[600px] bg-emerald-400 rounded-full blur-3xl opacity-25"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-48 -right-32 w-[600px] h-[600px] bg-green-300 rounded-full blur-3xl opacity-25"
        animate={{ scale: [1, 1.1, 1], rotate: [0, -180, -360] }}
        transition={{ duration: 14, repeat: Infinity }}
      />

      {/* Header */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 pt-8 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Chats
          </h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 shadow-inner border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      </div>

      {/* Chats / Search Results */}
      <div className="relative z-10 max-w-3xl mx-auto mt-6 px-5 pb-10">
        {loading ? (
          <div className="text-center text-gray-500 mt-20 text-lg">
            Loading chats...
          </div>
        ) : search.trim() && users.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            {users.map((u) => (
              <motion.div
                key={u._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-white/40 cursor-pointer hover:bg-white/90 transition"
                onClick={() => navigate(`/profile/chat/${u._id}`)}
              >
                <img
                  src={
                    u.picture
                      ? import.meta.env.VITE_BASE + u.picture
                      : import.meta.env.VITE_DEFAULT_PIC
                  }
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                  alt={u.name}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {u.name} {u.surname}
                  </h3>
                  <p className="text-sm text-gray-500">@{u.login}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : chats.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-lg">
            No chats yet 😴
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            {chats.map((chat) => {
              const otherUser =
                chat.from._id === currentUserId ? chat.to : chat.from;
              const isMenuOpen = openMenuId === chat._id;

              return (
                <div key={chat._id} className="relative cursor-pointer">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-white/40 cursor-pointer hover:bg-white/90 transition"
                    onClick={() => navigate(`/profile/chat/${otherUser._id}`)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setOpenMenuId(isMenuOpen ? null : chat._id);
                    }}
                  >
                    <div className="relative">
                      <img
                        src={
                          otherUser.picture
                            ? import.meta.env.VITE_BASE + otherUser.picture
                            : import.meta.env.VITE_DEFAULT_PIC
                        }
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                        alt={otherUser.name}
                      />
                      {!chat.read && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white shadow" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {otherUser.name} {otherUser.surname}
                        </h3>
                        <span className="text-xs text-gray-400 ml-2 shrink-0">
                          {formatTime(chat.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.text || "📎 Attachment"}
                      </p>
                    </div>
                  </motion.div>

                  {/* Context Menu */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute top-12 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden"
                      >
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-red-100 text-red-600"
                          onClick={() => {
                            const otherUserId = currentUserId == chat.from._id ? chat.to._id : chat.from._id
                            handleOpenModal(otherUserId.toString())
                          }}
                        >
                          <Trash2 size={16} /> Delete Chat
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Delete Chat Modal */}
      <DeleteChatModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={handleDeleteChat}
      />
    </div>
  );
}