"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Highlighter, HandwrittenText } from "@/components/effects/Highlighter";
import { formatDate } from "@/lib/utils";
import {
  staggerContainer,
  staggerItem,
  springPresets,
} from "@/lib/motion";
import { Post, Project, SavedBook } from "@/types";

interface HomeContentProps {
  recentPosts: Post[];
  featuredProjects: Project[];
  recentBooks: SavedBook[];
}

export function HomeContent({ recentPosts, featuredProjects, recentBooks }: HomeContentProps) {
  return (
    <div className="py-12 md:py-20">
      {/* Hero Section */}
      <Container>
        <motion.section
          className="text-center max-w-3xl mx-auto mb-20"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem}>
            <HandwrittenText
              as="p"
              className="text-accent-primary text-2xl mb-4"
              tilted
            >
              Welcome to the archive
            </HandwrittenText>
          </motion.div>

          <motion.h1
            variants={staggerItem}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6"
          >
            Digital artifacts &{" "}
            <Highlighter animate color="amber">
              protocol experiments
            </Highlighter>
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto"
          >
            Exploring the intersection of design and code. Building systems that
            bridge the gap between human intent and digital execution.
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="flex flex-wrap justify-center gap-4"
          >
            <LinkButton href="/blog" size="lg">
              Read the Blog
            </LinkButton>
            <LinkButton href="/projects" variant="secondary" size="lg">
              View Projects
            </LinkButton>
          </motion.div>
        </motion.section>

        {/* Recent Posts Section */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", ...springPresets.gentle }}
        >
          <div className="flex justify-between items-end mb-8">
            <div>
              <HandwrittenText className="text-accent-primary text-lg">
                Fresh thoughts
              </HandwrittenText>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                Recent Posts
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-sm text-accent-primary hover:underline hidden sm:block"
            >
              View all posts →
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <motion.div key={post.id} variants={staggerItem}>
                  <Link href={`/blog/${post.slug}`}>
                    <Card interactive className="h-full">
                      <CardContent className="p-6">
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {post.tags.slice(0, 2).map((tag) => (
                            <Tag key={tag} size="sm" variant="primary">
                              {tag}
                            </Tag>
                          ))}
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-text-tertiary">
                          <span>{formatDate(post.date)}</span>
                          {post.readTime && <span>{post.readTime}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-text-secondary">
                  No posts yet. Check back soon!
                </p>
              </div>
            )}
          </motion.div>

          <Link
            href="/blog"
            className="text-sm text-accent-primary hover:underline block text-center mt-6 sm:hidden"
          >
            View all posts →
          </Link>
        </motion.section>

        {/* Featured Projects Section */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", ...springPresets.gentle }}
        >
          <div className="flex justify-between items-end mb-8">
            <div>
              <HandwrittenText className="text-accent-secondary text-lg">
                Building things
              </HandwrittenText>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                Featured Projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-sm text-accent-primary hover:underline hidden sm:block"
            >
              View all projects →
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {featuredProjects.map((project) => (
              <motion.div key={project.id} variants={staggerItem}>
                <Link href={`/projects/${project.id}`}>
                  <Card interactive className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Tag
                          size="sm"
                          variant={
                            project.status === "Active"
                              ? "success"
                              : project.status === "Complete"
                              ? "primary"
                              : "default"
                          }
                        >
                          {project.status}
                        </Tag>
                        <span className="text-xs text-text-tertiary">
                          {project.year}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {project.title}
                      </h3>
                      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {project.tech.slice(0, 3).map((tech) => (
                          <Tag key={tech} size="sm">
                            {tech}
                          </Tag>
                        ))}
                        {project.tech.length > 3 && (
                          <Tag size="sm">+{project.tech.length - 3}</Tag>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <Link
            href="/projects"
            className="text-sm text-accent-primary hover:underline block text-center mt-6 sm:hidden"
          >
            View all projects →
          </Link>
        </motion.section>

        {/* Recent Books Section */}
        {recentBooks.length > 0 && (
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", ...springPresets.gentle }}
          >
            <div className="flex justify-between items-end mb-8">
              <div>
                <HandwrittenText className="text-accent-tertiary text-lg">
                  Reading list
                </HandwrittenText>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                  Recent Books
                </h2>
              </div>
              <Link
                href="/books"
                className="text-sm text-accent-primary hover:underline hidden sm:block"
              >
                Search more books →
              </Link>
            </div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {recentBooks.map((book) => (
                <motion.div key={book.id} variants={staggerItem}>
                  <Card interactive className="h-full">
                    <div className="aspect-[3/4] relative bg-surface-raised overflow-hidden flex items-center justify-center">
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                      )}
                      {book.status && (
                        <div className="absolute top-1 right-1">
                          <Tag
                            size="sm"
                            variant={
                              book.status === "완료"
                                ? "success"
                                : book.status === "읽는 중"
                                ? "warning"
                                : "default"
                            }
                          >
                            {book.status}
                          </Tag>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-xs font-medium text-text-primary line-clamp-2 mb-0.5">
                        {book.title}
                      </h3>
                      <p className="text-xs text-text-tertiary line-clamp-1">
                        {book.author}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <Link
              href="/books"
              className="text-sm text-accent-primary hover:underline block text-center mt-6 sm:hidden"
            >
              Search more books →
            </Link>
          </motion.section>
        )}

        {/* About Section */}
        <motion.section
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", ...springPresets.gentle }}
        >
          <Card className="bg-surface/50">
            <CardContent className="p-8 md:p-12">
              <HandwrittenText className="text-accent-tertiary text-xl mb-4 block">
                A little about me
              </HandwrittenText>
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Hi, I&apos;m Bunnykey
              </h2>
              <p className="text-text-secondary mb-6">
                Digital artifact curator and protocol developer. Specializing in
                autonomous systems, glassmorphic interfaces, and the
                intersection of design and code. Building the future one
                iteration at a time.
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="https://github.com/Bunnykey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-accent-primary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </Container>
    </div>
  );
}
