import { motion } from "framer-motion";
import { X } from "lucide-react";

interface DeleteMessageModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteMessageModal({
  open,
  onClose,
  onConfirm,
}: DeleteMessageModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 shadow-xl w-80 text-center relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-2">Delete Message?</h2>
        <p className="text-gray-600 text-sm mb-5">
          Are you sure you want to delete this message? This action cannot be undone.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
