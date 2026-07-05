"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Small animated line-art glyphs that sit beside page titles:
 * - LaptopGlyph (Work): lid opens from the hinge, terminal cursor blinks
 * - SpotlightGlyph (About): a corner light swings its beam onto a pair of
 *   comedy/tragedy theatre masks, which brighten as the light lands
 * - BookGlyph (Writing): covers swing open, text lines draw themselves in
 *
 * All stroke `currentColor` — pass `text-accent` via className. Reduced
 * motion renders the final state with no animation.
 */

const svgProps = {
  viewBox: "0 0 48 48",
  fill: "none",
  "aria-hidden": true,
} as const;

const openEase = [0.22, 1, 0.36, 1] as const;

export function LaptopGlyph({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <svg {...svgProps} className={className}>
      {/* Lid — opens up from the hinge at the base */}
      <motion.g
        style={{ transformBox: "fill-box", originX: 0.5, originY: 1 }}
        initial={reduced ? false : { scaleY: 0.08, opacity: 0.5 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.7, ease: openEase }}
      >
        <rect
          x="11"
          y="10"
          width="26"
          height="24"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.08"
        />
        {/* Prompt chevron + blinking cursor on screen */}
        <path
          d="M15.5 16.5l3 2.5-3 2.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.rect
          x="21.5"
          y="18"
          width="5"
          height="2"
          rx="1"
          fill="currentColor"
          animate={reduced ? { opacity: 1 } : { opacity: [1, 1, 0, 0, 1] }}
          transition={
            reduced
              ? undefined
              : { delay: 1.2, duration: 1.2, repeat: Infinity, ease: "linear" }
          }
        />
      </motion.g>
      {/* Base / keyboard deck */}
      <path
        d="M8 34h32l3.5 4.5a1 1 0 0 1-.8 1.6H5.3a1 1 0 0 1-.8-1.6L8 34Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
    </svg>
  );
}

export function SpotlightGlyph({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <svg {...svgProps} className={className}>
      {/* Beam — swings from the corner lamp onto the masks, overshooting
          slightly before settling, pivoting at its apex */}
      <motion.path
        d="M7 7 47 13 22 47 Z"
        fill="currentColor"
        style={{ transformBox: "fill-box", originX: 0, originY: 0 }}
        initial={reduced ? false : { rotate: 40, opacity: 0 }}
        animate={
          reduced
            ? { rotate: 0, opacity: 0.13 }
            : { rotate: [40, -6, 0], opacity: [0, 0.13, 0.13] }
        }
        transition={
          reduced
            ? undefined
            : {
                rotate: {
                  delay: 0.5,
                  duration: 0.9,
                  ease: "easeInOut",
                  times: [0, 0.75, 1],
                },
                opacity: { delay: 0.5, duration: 0.9, times: [0, 0.2, 1] },
              }
        }
      />
      {/* Tragedy mask — back left; hangs dim, brightens as the light lands */}
      <motion.g
        style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
        initial={reduced ? false : { opacity: 0, rotate: -16, x: -2 }}
        animate={
          reduced
            ? { opacity: 1, rotate: -8, x: 0 }
            : { opacity: [0, 0.45, 0.45, 1], rotate: -8, x: 0 }
        }
        transition={
          reduced
            ? undefined
            : {
                opacity: {
                  delay: 0.2,
                  duration: 1.5,
                  times: [0, 0.25, 0.72, 1],
                },
                default: { delay: 0.2, duration: 0.5, ease: openEase },
              }
        }
      >
        <path
          d="M13.5 15.5c0-3.6 2.8-5.8 6.3-5.8s6.3 2.2 6.3 5.8v4.4c0 4.4-2.8 8.2-6.3 8.2s-6.3-3.8-6.3-8.2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M16.6 17.2c.7-.9 1.9-.9 2.6 0M20.4 17.2c.7-.9 1.9-.9 2.6 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Frown */}
        <motion.path
          d="M17 24c1.6-1.7 4.2-1.7 5.8 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.55, duration: 0.35 }}
        />
      </motion.g>
      {/* Comedy mask — front right; same treatment, a beat behind */}
      <motion.g
        style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
        initial={reduced ? false : { opacity: 0, rotate: 16, x: -2 }}
        animate={
          reduced
            ? { opacity: 1, rotate: 8, x: 0 }
            : { opacity: [0, 0.45, 0.45, 1], rotate: 8, x: 0 }
        }
        transition={
          reduced
            ? undefined
            : {
                opacity: {
                  delay: 0.3,
                  duration: 1.55,
                  times: [0, 0.25, 0.72, 1],
                },
                default: { delay: 0.3, duration: 0.5, ease: openEase },
              }
        }
      >
        <path
          d="M25.5 24.5c0-3.6 2.8-5.8 6.3-5.8s6.3 2.2 6.3 5.8v4.4c0 4.4-2.8 8.2-6.3 8.2s-6.3-3.8-6.3-8.2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M28.6 26.2c.7-.9 1.9-.9 2.6 0M32.4 26.2c.7-.9 1.9-.9 2.6 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Smile */}
        <motion.path
          d="M29 31.5c1.6 1.7 4.2 1.7 5.8 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.7, duration: 0.35 }}
        />
      </motion.g>
      {/* Corner lamp housing, angled down toward the stage */}
      <g transform="rotate(45 6 6)">
        <rect
          x="2.5"
          y="1.5"
          width="7"
          height="9"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.08"
        />
      </g>
    </svg>
  );
}

export function BookGlyph({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <svg {...svgProps} className={className}>
      {/* Spine */}
      <path
        d="M24 13v25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Left cover — swings open from the spine */}
      <motion.g
        style={{ transformBox: "fill-box", originX: 1, originY: 0.5 }}
        initial={reduced ? false : { scaleX: 0.06, opacity: 0.5 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.6, ease: openEase }}
      >
        <path
          d="M24 13c-4-3-12-3.5-17-1.8V36c5-1.7 13-1.2 17 1.8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <motion.path
          d="M11 19c3-.7 7-.6 9.5.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.95, duration: 0.4 }}
        />
        <motion.path
          d="M11 24.5c3-.7 7-.6 9.5.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        />
      </motion.g>
      {/* Right cover — swings open a beat later */}
      <motion.g
        style={{ transformBox: "fill-box", originX: 0, originY: 0.5 }}
        initial={reduced ? false : { scaleX: 0.06, opacity: 0.5 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.6, ease: openEase }}
      >
        <path
          d="M24 13c4-3 12-3.5 17-1.8V36c-5-1.7-13-1.2-17 1.8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <motion.path
          d="M37 19c-3-.7-7-.6-9.5.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.05, duration: 0.4 }}
        />
        <motion.path
          d="M37 24.5c-3-.7-7-.6-9.5.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        />
      </motion.g>
    </svg>
  );
}
