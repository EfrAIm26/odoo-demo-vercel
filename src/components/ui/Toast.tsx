import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
