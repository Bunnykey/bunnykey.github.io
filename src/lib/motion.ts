// Framer Motion animation presets from UI/UX spec
import type { Variants, Transition } from "framer-motion";

export const springPresets = {
  snappy: { stiffness: 400, damping: 30 },
  gentle: { stiffness: 200, damping: 20 },
  bouncy: { stiffness: 300, damping: 10 },
} as const;

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Stagger children animation
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08, // 80ms between items as per spec
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Card hover animation
export const cardHover: Variants = {
  rest: {
    y: 0,
    boxShadow: "0 1px 2px rgba(45, 45, 45, 0.08)",
  },
  hover: {
    y: -4,
    boxShadow: "0 10px 15px rgba(45, 45, 45, 0.08)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  tap: {
    scale: 0.98,
  },
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
    },
  },
};

// Mobile menu animation
export const mobileMenuVariants: Variants = {
  closed: {
    x: "100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
};

// Transition presets for direct use
export const transitions = {
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } as Transition,
  normal: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } as Transition,
  slow: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } as Transition,
  spring: { type: "spring", stiffness: 200, damping: 20 } as Transition,
  snappy: { type: "spring", stiffness: 400, damping: 30 } as Transition,
  bouncy: { type: "spring", stiffness: 300, damping: 10 } as Transition,
};
