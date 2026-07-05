"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Route transitions: short fade + 8px vertical slide (§3).
 * Subtle by design — reduced motion is handled globally in globals.css.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
