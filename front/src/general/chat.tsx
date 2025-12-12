import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon, ArrowLeft, Edit, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Axios } from "../api/api";
import type { IMessage, IUser } from "../lib/types";
import io, { type Socket } from "socket.io-client";

export default function ChatPage() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [myself, setMyself] = useState<IUser | null>(null);
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const userRes = await Axios.get("/account/" + id);
      setUser(userRes.data.user);

      const meRes = await Axios.get("/account/me");
      setMyself(meRes.data.user);

      const chatRes = await Axios.get("/chats/" + id);
      const msgs: IMessage[] = chatRes.data.messages;
      setMessages(msgs);

      if (meRes.data.user?._id) {
        const unreadMessages = msgs.filter((m) => m.to === meRes.data.user._id && !m.read).map((m) => m._id);
        if (unreadMessages.length > 0) {
          socketRef.current?.emit("message_read", {
            messageIds: unreadMessages,
            from: meRes.data.user._id,
            to: id,
          });

          setMessages((prev) =>
            prev.map((m) => (unreadMessages.includes(m._id) ? { ...m, read: true } : m))
          );
        }
      }
    };
    fetchData();
  }, [id]);

  
  //socket setup
  useEffect(() => {
    socketRef.current = io("http://localhost:4010", { transports: ["websocket"], withCredentials: true });
    
    socketRef.current.on("receive_message", (msg: IMessage) => setMessages((prev) => [...prev, msg]));
    socketRef.current.on("message_deleted", (msgId: string) => setMessages((prev) => prev.filter((m) => m._id !== msgId)));
    socketRef.current.on("message_edited", (data: IMessage) =>
      setMessages((prev) => prev.map((m) => (m._id === data._id ? { ...m, text: data.text } : m)))
  );
  socketRef.current.on("message_read", (data: { messageIds: string[] }) =>
    setMessages((prev) => prev.map((m) => (data.messageIds.includes(m._id) ? { ...m, read: true } : m)))
);

return () => socketRef.current?.disconnect();
}, []);

//join the user
useEffect(() => {
  if(myself?._id) {
    socketRef.current?.emit("join", myself._id)
  }
}, [myself])

  // Scroll to bottom
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".message-bubble")) setContextMenu(null);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1500);
  };

  const isMine = (msg: IMessage) => msg.from == myself?._id;

  const sendMessage = async () => {
    if (!text.trim() && !attachment) return;
    if (!user?._id || !myself?._id) return;

    let attachmentUrl: string | undefined = undefined;

    if (attachment) {
      const formData = new FormData()
      formData.append("attachment", attachment)
      
      try {
        const res = await Axios.patch('/chats/upload', formData)
        attachmentUrl = import.meta.env.VITE_BASE + res.data.url
      } catch (error) {
        setToast("Failed to upload the file")
        return
      }
    }

    emitMessage(attachmentUrl)
  };

  const emitMessage = async (attachmentUrl?: string) => {
    const newMsg = {
      from: myself!._id,
      to: user!._id,
      text: text.trim(),
      attachment: attachmentUrl,
      createdAt: new Date().toISOString(),
      read: false,
    };


    setMessages((prev) => [...prev, newMsg]);
    socketRef.current?.emit("send_message", newMsg);

    setText("");
    setAttachment(null);
  };

  const handleDelete = (msgId: string) => {
    socketRef.current?.emit("delete_message", msgId);
    setMessages((prev) => prev.filter((m) => m._id !== msgId));
    if (editingMsgId === msgId) { setEditingMsgId(null); setText(""); }
  };

  const handleEdit = (msgId: string) => {
    const msg = messages.find((m) => m._id === msgId);
    if (!msg) return;
    setEditingMsgId(msgId);
    setText(msg.text);
  };

  const saveEdit = () => {
    if (!editingMsgId) return;
    const msg = messages.find((m) => m._id === editingMsgId);
    if (!msg) return;
    socketRef.current?.emit("edit_message", { ...msg, text });
    setMessages((prev) => prev.map((m) => (m._id === editingMsgId ? { ...m, text } : m)));
    setEditingMsgId(null);
    setText("");
  };

  const handleCopy = async (msgId: string) => {
    const msg = messages.find((m) => m._id === msgId);
    if (!msg?.text) return;
    await navigator.clipboard.writeText(msg.text);
    showToast("Copied to clipboard");
    setContextMenu(null);
  };

  const handleAttachmentClick = () => fileInputRef.current?.click();
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setAttachment(e.target.files[0]);
  };
  const removeAttachment = () => setAttachment(null);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 via-green-100 to-green-50 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg sticky top-0 z-20 backdrop-blur-md rounded-b-xl">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-green-700 transition shadow-md">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img
          src={user?.picture ? import.meta.env.VITE_BASE + user.picture : import.meta.env.VITE_DEFAULT_PIC}
          alt={user?.name}
          className="w-14 h-14 rounded-full border-2 border-white shadow-lg"
        />
        <div>
          <h2 className="font-bold text-lg">{user?.name} {user?.surname}</h2>
          <span className="text-sm text-green-200">@{user?.login}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg) => {
          const mine = isMine(msg);
          return (
            <div
              key={msg._id}
              className={`flex items-end gap-3 ${mine ? "justify-end" : "justify-start"}`}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (mine) setContextMenu({ id: msg._id, x: e.clientX, y: e.clientY });
              }}
            >
              {!mine && (
                <img
                  src={user?.picture ? import.meta.env.VITE_BASE + user.picture : import.meta.env.VITE_DEFAULT_PIC}
                  alt="user"
                  className="w-10 h-10 rounded-full shadow-md cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => navigate("/profile/account/" + user?._id)}
                />
              )}

              {/* Bubble */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message-bubble relative p-5 text-base rounded-3xl shadow-xl max-w-[75%] break-words transition-transform duration-200
                  ${mine
                    ? "bg-gradient-to-br from-green-500 to-green-400 text-white rounded-br-none hover:scale-[1.05]"
                    : "bg-white/80 text-gray-900 backdrop-blur-md rounded-bl-none hover:scale-[1.05]"
                  }`}
              >
                <p>{msg.text}</p>
                {msg.attachment && (
                  <img src={msg.attachment} alt="attachment" className="mt-3 w-56 h-56 object-cover rounded-lg shadow-md" />
                )}
                {mine && (
                  <span className="absolute bottom-1 right-3 text-xs text-white/80">{msg.read ? "Seen" : "Sent"}</span>
                )}
              </motion.div>

              {mine && (
                <img
                  src={myself?.picture ? import.meta.env.VITE_BASE + myself.picture : import.meta.env.VITE_DEFAULT_PIC}
                  alt="me"
                  className="w-10 h-10 rounded-full shadow-md cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => navigate("/profile")}
                />
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 flex flex-col gap-2 border-t border-green-300 bg-white/80 shadow-inner backdrop-blur-lg rounded-t-xl">
        {attachment && (
          <div className="flex items-center justify-between bg-white/90 rounded-xl p-2 shadow-md">
            <span className="truncate text-sm">{attachment.name}</span>
            <button onClick={removeAttachment} className="p-1 rounded-full hover:bg-gray-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button onClick={handleAttachmentClick} className="p-2 hover:bg-green-100 rounded-full transition shadow-md">
            <ImageIcon className="w-6 h-6 text-green-600" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleAttachmentChange} />
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" ? (editingMsgId ? saveEdit() : sendMessage()) : null}
            className="flex-1 bg-green-50/50 border border-green-300 rounded-full px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 backdrop-blur-sm"
          />
          <button
            onClick={editingMsgId ? saveEdit : sendMessage}
            className="bg-green-500 hover:bg-green-600 rounded-full p-3 transition shadow-lg"
          >
            {editingMsgId ? <Edit className="w-6 h-6 text-white" /> : <Send className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x }}
            className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <button className="block w-full px-5 py-3 text-left hover:bg-gray-100" onClick={() => handleEdit(contextMenu.id)}>✏️ Edit</button>
            <button className="block w-full px-5 py-3 text-left text-blue-600 hover:bg-blue-50" onClick={() => handleCopy(contextMenu.id)}>📋 Copy</button>
            <button className="block w-full px-5 py-3 text-left text-red-600 hover:bg-red-50" onClick={() => handleDelete(contextMenu.id)}>🗑 Delete</button>
            <button className="block w-full px-5 py-3 text-left hover:bg-gray-100" onClick={() => {setContextMenu(null); setEditingMsgId(null); setText("")}}>✖ Cancel</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-semibold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}