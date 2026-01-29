"use client";

import { motion } from "framer-motion";
import { Tag } from "@/components/ui/Tag";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface TechStackProps {
  tech: string[];
  className?: string;
}

export function TechStack({ tech, className }: TechStackProps) {
  return (
    <motion.div
      className={`flex flex-wrap gap-2 ${className}`}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {tech.map((item) => (
        <motion.div key={item} variants={staggerItem}>
          <Tag variant="secondary" size="md">
            {item}
          </Tag>
        </motion.div>
      ))}
    </motion.div>
  );
}
