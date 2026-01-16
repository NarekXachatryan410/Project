import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Axios } from "../api/api";
import { Send, Image as ImageIcon, ArrowLeft } from "lucide-react";
import type { IUser, IGroupMessage, IGroup } from "../lib/types";
import { useParams, useNavigate } from "react-router-dom";
import { io, type Socket } from "socket.io-client";

export default function GroupPage() {
  const { id: groupId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<IGroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [group, setGroup] = useState<IGroup | null>(null);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    messageId: string | null;
  } | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  // ---------------- INIT USER + SOCKET ----------------
  useEffect(() => {
    if (!groupId) return;

    const init = async () => {
      try {
        // Fetch current user
        const res = await Axios.get("/account/me");
        setCurrentUser(res.data.user);

        // Connect socket
        const socket = io("http://localhost:4010", {
          withCredentials: true,
          transports: ["websocket"],
        });
        socketRef.current = socket;

        socketRef.current.on("connect", () => {
          socket.emit("join_group", groupId);
        });

        // Listen for new messages
        socketRef.current.on("receive_group_message", (msg: IGroupMessage) => {
          if (msg.groupId.toString() !== groupId.toString()) return;
          setMessages((prev) => [...prev, msg]);
        });

        socketRef.current.on("group_message_deleted", ({ id }) => {
          setMessages((prev) => prev.filter((msg) => msg._id !== id));
        });

        socketRef.current.on(
          "group_message_edited",
          (updatedMsg: IGroupMessage) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === updatedMsg._id
                  ? { ...msg, text: updatedMsg.text, edited: true }
                  : msg
              )
            );
          }
        );
      } catch (err) {
        console.error(err);
      }
    };

    init();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [groupId]);

  // ---------------- FETCH GROUP INFO + MESSAGES ----------------
  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      try {
        const res = await Axios.get(`/groups/${groupId}`);
        setGroup(res.data.group);

        const messagesRes = await Axios.get(`/groups/${groupId}/messages`);
        const normalized: IGroupMessage[] = messagesRes.data.messages.map(
          (m: IGroupMessage) => ({
            ...m,
            sender:
              typeof m.sender === "string"
                ? { _id: m.sender, name: "Unknown", surname: "" }
                : m.sender,
          })
        );
        setMessages(normalized);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGroup();
  }, [groupId]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- ATTACHMENT UPLOAD ----------------
  const uploadAttachment = async (file: File) => {
    const formData = new FormData();
    formData.append("attachment", file);
    try {
      const res = await Axios.patch("/groups/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const isMine = (msg: IGroupMessage) => msg.sender._id === currentUser?._id;

  // ---------------- SEND / EDIT MESSAGE ----------------
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    if (!currentUser || !groupId) return;

    let attachmentUrl: string | undefined;
    if (attachment) {
      attachmentUrl = await uploadAttachment(attachment);
      if (!attachmentUrl) return;
    }

    const payload: IGroupMessage = {
      sender: currentUser,
      groupId,
      text: newMessage,
      attachment: attachmentUrl
        ? import.meta.env.VITE_BASE + attachmentUrl
        : "",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, payload]); // Optimistic UI
    socketRef.current?.emit("send_group_message", payload);

    setNewMessage("");
    setAttachment(null);
  };

  // ---------------- DELETE MESSAGE ----------------
  const handleDelete = (id: string) => {
    socketRef.current?.emit("delete_group_message", { id, groupId });
    setMessages((prev) => prev.filter((msg) => msg._id !== id));
    setContextMenu(null);
  };

  // ---------------- START EDITING ----------------
  const handleEdit = (id: string) => {
    const msg = messages.find((message) => message._id === id);
    if (!msg) return;
    setEditingMsgId(id);
    setNewMessage(msg.text);
  };

  const saveEdit = () => {
    if (!editingMsgId) return;
    const msg = messages.find((m) => m._id === editingMsgId);
    if (!msg) return;
    socketRef.current?.emit("edit_group_message", { ...msg, text: newMessage });
    setMessages((prev) =>
      prev.map((m) => (m._id === editingMsgId ? { ...m, text: newMessage } : m))
    );
    setEditingMsgId(null);
    setNewMessage("");
  };

  const handleCopyMessage = async (msgId: string) => {
    const msg = messages.find((message) => message._id == msgId);
    if (!msg) return;
    await navigator.clipboard.writeText(msg.text);
    setToast("Copied To Clipboard");
    setTimeout(() => {
      setToast(null);
    }, 1900);
    setContextMenu(null);
  };

  const handleAttachmentClick = () => fileInputRef.current?.click();
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setAttachment(e.target.files[0]);
  };
  const removeAttachment = () => setAttachment(null);

  return (
    <div className="flex flex-col h-screen bg-[#ECE5DD]">
      {/* Header */}
      <header className="bg-green-600 text-white px-6 py-4 shadow-md flex flex-col gap-1 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-green-700 transition shadow-md w-9"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">{group?.name || "Loading..."}</h2>
        <span className="text-sm opacity-80">
          {group?.members?.length || 0} members
        </span>
      </header>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#F8F8F8]">
        {messages.map((msg) => {
          const mine = isMine(msg);
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col max-w-[70%] ${
                mine ? "ml-auto items-end" : "mr-auto items-start"
              }`}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({ x: e.pageX, y: e.pageY, messageId: msg._id });
              }}
            >
              {/* Sender info */}
              {!mine && (
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={
                      msg.sender.picture
                        ? import.meta.env.VITE_BASE + msg.sender.picture
                        : import.meta.env.VITE_DEFAULT_PIC
                    }
                    className="w-6 h-6 rounded-full object-cover cursor-pointer"
                    onClick={() =>
                      navigate("/profile/account/" + msg.sender._id)
                    }
                  />
                  <span className="text-xs text-gray-500">
                    {msg.sender.name} {msg.sender.surname}
                  </span>
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`rounded-2xl p-4 shadow-md break-words ${
                  mine
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                {msg.attachment && (
                  <img
                    src={msg.attachment}
                    alt="attachment"
                    onClick={() => window.open(msg.attachment, "_blank")}
                    className="cursor-pointer mt-2 w-56 h-56 object-cover rounded-lg shadow-sm"
                  />
                )}
              </div>

              {/* Message meta */}
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>
      {/* Input */}
      <div className="p-4 border-t border-gray-300 bg-white flex items-center gap-2">
        {attachment && (
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg shadow-sm">
            <span className="truncate max-w-xs">{attachment.name}</span>
            <button
              onClick={removeAttachment}
              className="text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
          </div>
        )}
        <button
          onClick={handleAttachmentClick}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ImageIcon className="w-6 h-6 text-gray-600" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleAttachmentChange}
        />
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          onKeyDown={(e) =>
            e.key === "Enter" &&
            (editingMsgId ? saveEdit() : handleSendMessage())
          }
        />
        <button
          onClick={editingMsgId ? saveEdit : handleSendMessage}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition"
        >
          <Send size={20} />
        </button>
      </div>
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.14 }}
            className="fixed z-[9999] w-52 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg rounded-2xl border border-neutral-200/50 dark:border-neutral-700/40 shadow-[0_6px_30px_-4px_rgba(0,0,0,0.25)] overflow-hidden select-none"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => {
                handleDelete(contextMenu.messageId!);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-3.5 text-sm font-medium flex items-center gap-3 hover:bg-red-500/10 hover:text-red-600 active:scale-[0.97]"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Delete Message
            </button>

            <button
              onClick={() => {
                handleEdit(contextMenu.messageId!);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-3.5 text-sm font-medium flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-600 active:scale-[0.97]"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Edit Message
            </button>

            <button
              onClick={() => {
                handleCopyMessage(contextMenu.messageId!);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-3.5 text-sm font-medium flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-600 active:scale-[0.97]"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Copy Message
            </button>

            <button
              onClick={() => setContextMenu(null)}
              className="w-full text-left px-4 py-3.5 text-sm font-medium flex items-center gap-3 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 active:scale-[0.97]"
            >
              <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full"></span>
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
