import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, X } from "lucide-react";
import type { IUser, IGroup } from "../lib/types";
import { Axios } from "../api/api";
import { useNavigate } from "react-router-dom";
import ConfirmExitModal from "../modals/exitGroup";

export default function GroupsPage() {
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [error, setError] = useState("");
  const [confirmExit, setConfirmExit] = useState(false);
  const [groupToExit, setGroupToExit] = useState<IGroup | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Axios.get("/groups")
      .then((res) => setGroups(res.data.groups))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await Axios.get("/users");
        setUsers(res.data.users);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    fetchUsers();
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return setError("Name is required");
    if (selectedUsers.length === 0)
      return alert("Please select at least one user!");

    try {
      const res = await Axios.post("/groups/create", {
        name: groupName,
        members: selectedUsers,
      });
      setGroups((prev) => [...prev, res.data.group]);
      setShowModal(false);
      setGroupName("");
      setSelectedUsers([]);
      setError("");
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleExitGroup = async (groupId: string) => {
    try {
      await Axios.delete(`/groups/${groupId}/exit`);
      setGroups((prev) => prev.filter((g) => g._id.toString() !== groupId.toString()));
    } catch (err) {
      console.error("Failed to exit group", err);
      alert("Cannot exit group!");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ECE5DD] to-[#D1CFCB] py-10 px-6 font-sans">
      {/*  EXIT MODAL  */}
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">Groups</h1>

          <motion.button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:bg-green-700 hover:scale-105 active:scale-95 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle size={22} /> New Group
          </motion.button>
        </header>

        {/* Groups List */}
        {groups.length === 0 ? (
          <p className="text-gray-600 italic text-center mt-10">
            No groups yet. Create your first one!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <motion.div
                key={group._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-5 flex flex-col justify-between"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {group.members?.length ?? 0} members
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button
                    className="text-green-600 hover:text-green-700 font-medium"
                    onClick={() => navigate("/profile/groups/" + group._id)}
                  >
                    Open Chat
                  </button>
                  <button
                    className="text-red-600 hover:text-red-700 font-medium"
                    onClick={() => setGroupToExit(group)}
                  >
                    Exit
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={22} />
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Create New Group
              </h2>

              <div className="space-y-4">
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                {/* User Selection */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Add Members
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {users.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => toggleUser(user._id.toString())}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition border ${
                          selectedUsers.includes(user._id.toString())
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                        }`}
                      >
                        <img
                          src={
                            user.picture
                              ? import.meta.env.VITE_BASE + user.picture
                              : import.meta.env.VITE_DEFAULT_PIC
                          }
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">{user.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    className="ml-3 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {groupToExit && (
        <ConfirmExitModal
          open={!!groupToExit}
          onCancel={() => setGroupToExit(null)}
          onConfirm={() => {
            handleExitGroup(groupToExit._id);
            setGroupToExit(null);
          }}
        />
      )}
    </main>
  );
}
