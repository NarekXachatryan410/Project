import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmExitModal({ open, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-lg font-semibold text-gray-800">
              Are you sure you want to exit this group?
            </h2>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={onCancel}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                onClick={onConfirm}
              >
                Exit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}