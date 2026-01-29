import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { HomeContent } from "@/components/home/HomeContent";
import { getRecentPosts } from "@/lib/posts";
import { getFeaturedProjects } from "@/lib/projects";

export const revalidate = 60; // Revalidate every 60 seconds

async function HomeData() {
  const [recentPosts, featuredProjects] = await Promise.all([
    getRecentPosts(3),
    Promise.resolve(getFeaturedProjects(3)),
  ]);

  return (
    <HomeContent recentPosts={recentPosts} featuredProjects={featuredProjects} />
  );
}

function HomeSkeleton() {
  return (
    <div className="py-12 md:py-20">
      <Container>
        {/* Hero skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-16 w-full mb-6" />
          <Skeleton className="h-12 w-2/3 mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>

        {/* Posts skeleton */}
        <div className="mb-20">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>

        {/* Projects skeleton */}
        <div className="mb-20">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeData />
    </Suspense>
  );
}
