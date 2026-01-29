import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Tag } from "@/components/ui/Tag";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { TechStack } from "@/components/projects/TechStack";
import { MetricsDisplay } from "@/components/projects/MetricsDisplay";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { HandwrittenText } from "@/components/effects/Highlighter";
import { getProjectById, getAllProjects } from "@/lib/projects";
import type { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} | Bunnykey Archive`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "website",
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const statusVariant =
    project.status === "Active"
      ? "success"
      : project.status === "Complete"
      ? "primary"
      : "default";

  const hasLinks =
    project.links.demo || project.links.source || project.links.docs;

  return (
    <div className="py-12">
      <Container size="md">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to projects
        </Link>

        {/* Project header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Tag variant={statusVariant} size="md">
              {project.status}
            </Tag>
            <span className="text-sm text-text-tertiary">{project.year}</span>
            <span className="text-sm text-text-tertiary">·</span>
            <span className="text-sm text-text-tertiary">
              {project.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            {project.title}
          </h1>

          <p className="text-lg text-text-secondary">{project.description}</p>
        </header>

        {/* Links */}
        {hasLinks && (
          <div className="flex flex-wrap gap-3 mb-8">
            {project.links.demo && (
              <LinkButton href={project.links.demo} external>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                    clipRule="evenodd"
                  />
                </svg>
                Live Demo
              </LinkButton>
            )}
            {project.links.source && (
              <LinkButton href={project.links.source} variant="secondary" external>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Source Code
              </LinkButton>
            )}
            {project.links.docs && (
              <LinkButton href={project.links.docs} variant="ghost" external>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                </svg>
                Documentation
              </LinkButton>
            )}
          </div>
        )}

        {/* Metrics */}
        {Object.keys(project.metrics).length > 0 && (
          <section className="mb-12">
            <HandwrittenText className="text-accent-primary text-lg mb-4 block">
              By the numbers
            </HandwrittenText>
            <MetricsDisplay metrics={project.metrics} />
          </section>
        )}

        {/* Long Description */}
        <section className="mb-12">
          <MarkdownRenderer content={project.longDescription} />
        </section>

        {/* Features */}
        {project.features.length > 0 && (
          <section className="mb-12">
            <HandwrittenText className="text-accent-secondary text-lg mb-4 block">
              Key features
            </HandwrittenText>
            <Card className="bg-surface/50">
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {project.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-text-secondary"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 text-accent-tertiary flex-shrink-0 mt-0.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Tech Stack */}
        <section className="mb-12">
          <HandwrittenText className="text-accent-tertiary text-lg mb-4 block">
            Tech stack
          </HandwrittenText>
          <TechStack tech={project.tech} />
        </section>

        {/* Back to projects */}
        <div className="text-center">
          <LinkButton href="/projects" variant="secondary">
            ← Back to all projects
          </LinkButton>
        </div>
      </Container>
    </div>
  );
}
