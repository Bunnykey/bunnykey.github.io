import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-light bg-surface/50 mt-auto">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-lg text-text-primary hover:text-accent-primary transition-colors mb-3"
            >
              <span className="font-handwritten text-2xl text-accent-primary">
                B
              </span>
              <span>unnykey</span>
            </Link>
            <p className="text-sm text-text-secondary max-w-sm">
              Digital artifact curator and protocol developer. Building the
              future one iteration at a time.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3">Navigate</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-text-secondary hover:text-accent-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-text-secondary hover:text-accent-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-sm text-text-secondary hover:text-accent-primary transition-colors"
                >
                  Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/Bunnykey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-accent-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border-light flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-tertiary">
            © {currentYear} Bunnykey. All rights reserved.
          </p>
          <p className="text-xs text-text-tertiary font-handwritten text-lg">
            Built with care ✨
          </p>
        </div>
      </Container>
    </footer>
  );
}
