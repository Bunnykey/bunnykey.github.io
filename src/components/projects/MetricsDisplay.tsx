"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface MetricsDisplayProps {
  metrics: Record<string, string>;
}

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  const entries = Object.entries(metrics);

  if (entries.length === 0) return null;

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {entries.map(([key, value]) => (
        <motion.div key={key} variants={staggerItem}>
          <Card className="bg-surface/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent-primary mb-1">
                {value}
              </p>
              <p className="text-sm text-text-tertiary capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
