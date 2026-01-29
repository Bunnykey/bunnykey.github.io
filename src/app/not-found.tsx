import { Container } from "@/components/layout/Container";
import { LinkButton } from "@/components/ui/Button";
import { HandwrittenText } from "@/components/effects/Highlighter";

export default function NotFound() {
  return (
    <div className="py-20">
      <Container className="text-center">
        <HandwrittenText className="text-accent-primary text-2xl mb-4 block">
          Oops!
        </HandwrittenText>
        <h1 className="text-6xl md:text-8xl font-bold text-text-primary mb-4">
          404
        </h1>
        <p className="text-xl text-text-secondary mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex justify-center gap-4">
          <LinkButton href="/">Go Home</LinkButton>
          <LinkButton href="/blog" variant="secondary">
            Read Blog
          </LinkButton>
        </div>
      </Container>
    </div>
  );
}
