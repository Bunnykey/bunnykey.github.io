"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusVariant =
    project.status === "Active"
      ? "success"
      : project.status === "Complete"
      ? "primary"
      : "default";

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card interactive className="h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <Tag size="sm" variant={statusVariant}>
              {project.status}
            </Tag>
            <div className="text-right">
              <span className="text-xs text-text-tertiary">{project.year}</span>
              <p className="text-xs text-text-tertiary">{project.category}</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-text-primary mb-2">
            {project.title}
          </h3>

          <p className="text-sm text-text-secondary mb-4 line-clamp-3">
            {project.description}
          </p>

          <div className="flex gap-2 flex-wrap">
            {project.tech.slice(0, 4).map((tech) => (
              <Tag key={tech} size="sm">
                {tech}
              </Tag>
            ))}
            {project.tech.length > 4 && (
              <Tag size="sm">+{project.tech.length - 4}</Tag>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
