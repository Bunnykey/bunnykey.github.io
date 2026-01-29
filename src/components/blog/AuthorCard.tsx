"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import type { Author } from "@/types";

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Card className="bg-surface/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <span className="text-2xl font-handwritten text-accent-primary">
                {author.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary">{author.name}</h3>
            <p className="text-sm text-text-tertiary mb-2">{author.role}</p>
            <p className="text-sm text-text-secondary line-clamp-2">
              {author.bio}
            </p>
            {Object.keys(author.links).length > 0 && (
              <div className="flex gap-3 mt-3">
                {author.links.github && (
                  <a
                    href={author.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-tertiary hover:text-accent-primary transition-colors"
                    aria-label="GitHub"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                )}
                {author.links.site && (
                  <a
                    href={author.links.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-tertiary hover:text-accent-primary transition-colors"
                    aria-label="Website"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M16.555 5.412a8.028 8.028 0 00-3.503-2.81 14.899 14.899 0 011.663 4.472 8.547 8.547 0 001.84-1.662zM13.326 7.825a13.43 13.43 0 00-2.413-5.773 8.087 8.087 0 00-1.826 0 13.43 13.43 0 00-2.413 5.773A8.473 8.473 0 0010 8.5c1.18 0 2.304-.24 3.326-.675zM6.514 9.376A9.98 9.98 0 0010 10c1.226 0 2.4-.22 3.486-.624a13.54 13.54 0 01-.351 3.759A13.54 13.54 0 0110 13.5c-1.18 0-2.304-.24-3.135-.365a13.54 13.54 0 01-.351-3.759zM3.445 5.412a8.547 8.547 0 001.84 1.662 14.899 14.899 0 011.663-4.472 8.028 8.028 0 00-3.503 2.81zM3.019 6.813A8.028 8.028 0 002 10c0 1.15.243 2.247.681 3.24a13.568 13.568 0 012.305-4.083 9.988 9.988 0 01-1.967-2.344zM16.981 6.813a9.988 9.988 0 01-1.967 2.344 13.568 13.568 0 012.305 4.083A8.028 8.028 0 0018 10a8.028 8.028 0 00-.681-3.24z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
