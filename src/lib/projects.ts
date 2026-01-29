import { Project, ProjectsData, NotionProject } from "@/types";
import projectsJson from "@/../../data/projects.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog-api.sapphire7558.workers.dev";

// Cast to unknown first to avoid TypeScript strict checking on JSON imports
const staticData = projectsJson as unknown as ProjectsData;

// Transform Notion API response to our Project type
function transformNotionProject(notionProject: NotionProject): Project {
  return {
    id: notionProject.id,
    title: notionProject.title,
    year: notionProject.year || new Date().getFullYear().toString(),
    category: notionProject.category || "Web App",
    status: (notionProject.status as "Active" | "Complete" | "Conceptual") || "Active",
    description: notionProject.description || "",
    longDescription: notionProject.longDescription || notionProject.description || "",
    tech: notionProject.tech || [],
    features: notionProject.features ? notionProject.features.split(",").map((f) => f.trim()) : [],
    image: notionProject.image || "/images/placeholder-project.svg",
    links: {
      demo: notionProject.demoLink || null,
      source: notionProject.sourceLink || null,
      docs: notionProject.docsLink || null,
    },
    metrics: {},
  };
}

// Fetch all projects from the API (with fallback to static JSON)
export async function getAllProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      const projects: NotionProject[] = data.projects || [];
      return projects.map(transformNotionProject);
    }
  } catch (error) {
    console.log("Projects API not available, using static data");
  }

  // Fallback to static JSON data
  return staticData.projects;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const projects = await getAllProjects();
  return projects.find((project) => project.id === id);
}

export async function getProjectsByCategory(category: string): Promise<Project[]> {
  const projects = await getAllProjects();
  return projects.filter((project) => project.category === category);
}

export async function getProjectsByStatus(
  status: "Active" | "Complete" | "Conceptual"
): Promise<Project[]> {
  const projects = await getAllProjects();
  return projects.filter((project) => project.status === status);
}

export async function getFeaturedProjects(count: number = 3): Promise<Project[]> {
  const projects = await getAllProjects();
  // Prioritize Active projects, then Complete, then Conceptual
  const statusOrder = { Active: 0, Complete: 1, Conceptual: 2 };
  return [...projects]
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    .slice(0, count);
}

export async function getAllCategories(): Promise<string[]> {
  const projects = await getAllProjects();
  const categories = new Set<string>();
  projects.forEach((project) => {
    categories.add(project.category);
  });
  return Array.from(categories).sort();
}

export async function getAllTech(): Promise<string[]> {
  const projects = await getAllProjects();
  const tech = new Set<string>();
  projects.forEach((project) => {
    project.tech.forEach((t) => tech.add(t));
  });
  return Array.from(tech).sort();
}

// Synchronous versions for compatibility (uses static data)
export function getAllProjectsSync(): Project[] {
  return staticData.projects;
}

export function getProjectByIdSync(id: string): Project | undefined {
  return staticData.projects.find((project) => project.id === id);
}

export function getFeaturedProjectsSync(count: number = 3): Project[] {
  const statusOrder = { Active: 0, Complete: 1, Conceptual: 2 };
  return [...staticData.projects]
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    .slice(0, count);
}
