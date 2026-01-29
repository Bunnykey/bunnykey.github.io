"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { HandwrittenText } from "@/components/effects/Highlighter";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Project } from "@/types";

interface ProjectsContentProps {
  projects: Project[];
}

export function ProjectsContent({ projects }: ProjectsContentProps) {
  return (
    <div className="py-12">
      <Container>
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <HandwrittenText className="text-accent-secondary text-xl mb-2 block">
            Things I've built
          </HandwrittenText>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Projects
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            A collection of experiments, tools, and systems exploring the
            intersection of design and development.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {projects.length > 0 ? (
            projects.map((project) => (
              <motion.div key={project.id} variants={staggerItem}>
                <ProjectCard project={project} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-text-secondary">
                No projects yet. Check back soon!
              </p>
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
}
