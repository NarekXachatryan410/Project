import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeletePictureModal({ isOpen, onClose, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-[90%] max-w-sm p-8 text-center relative"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-500 p-4 rounded-full text-white shadow-lg animate-pulse">
                <Trash2 size={28} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete Picture</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your profile picture?
            </p>

            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold shadow-md hover:bg-gray-300 transition"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(239,68,68,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="px-6 py-2 rounded-xl bg-red-500 text-white font-semibold shadow-lg hover:bg-red-600 transition"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
