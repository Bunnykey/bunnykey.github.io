import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { getAllPosts, getAllTags, getAuthorById } from "@/lib/posts";
import { BlogContent } from "@/components/blog/BlogContent";
import { Skeleton } from "@/components/ui/Skeleton";

export const revalidate = 60; // Revalidate every 60 seconds

async function BlogData() {
  const [posts, tags] = await Promise.all([getAllPosts(), getAllTags()]);

  // Attach author info to posts
  const postsWithAuthor = posts.map((post) => ({
    ...post,
    author: getAuthorById(post.authorId || "bunnykey"),
  }));

  return <BlogContent initialPosts={postsWithAuthor} allTags={tags} />;
}

function BlogSkeleton() {
  return (
    <div className="py-12">
      <Container>
        <div className="text-center mb-12">
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-10 w-32 mx-auto mb-4" />
          <Skeleton className="h-16 w-full max-w-2xl mx-auto" />
        </div>
        <div className="mb-8 space-y-4">
          <Skeleton className="h-12 max-w-md" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </Container>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <BlogData />
    </Suspense>
  );
}
