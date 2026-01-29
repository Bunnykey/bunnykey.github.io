import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProjectsContent } from "@/components/projects/ProjectsContent";
import { getAllProjects } from "@/lib/projects";

export const revalidate = 60; // Revalidate every 60 seconds

async function ProjectsData() {
  const projects = await getAllProjects();
  return <ProjectsContent projects={projects} />;
}

function ProjectsSkeleton() {
  return (
    <div className="py-12">
      <Container>
        <div className="text-center mb-12">
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-10 w-40 mx-auto mb-4" />
          <Skeleton className="h-16 w-full max-w-2xl mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </Container>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsData />
    </Suspense>
  );
}
