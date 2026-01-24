# Design System: Personal Archive of Bunnykey

## 1. Visual Theme & Atmosphere
The archive embodies a **Modern Luxury Minimalism** aesthetic, blending high-end editorial sophistication with a futuristic digital edge. The atmosphere is "Glassmorphic"—relying on translucent layers, soft blurs, and crisp typography to create a sense of depth and weightless elegance. It feels curated, quiet, and premium.

## 2. Color Palette & Roles
*   **Deep Graphite (#1A1A1B):** The foundational base. Used for primary backgrounds and deep structural elements to provide a rich, dark canvas.
*   **Neon Teal (#00F2FF):** The high-energy accent. Reserved for interactive elements, focus states, and key highlights to create a striking contrast against the graphite.
*   **Frosted Glass (rgba(255, 255, 255, 0.05)):** The textural layer. Used for cards and navigation panels with a heavy backdrop-blur (20px) to achieve the glassmorphism effect.
*   **Pure White (#FFFFFF):** Primary typography and high-contrast icons for maximum legibility.
*   **Muted Silver (#8E8E93):** Secondary information and metadata, providing a subtle hierarchy.

## 3. Typography Rules
*   **Headers:** Large, bold sans-serif with tight letter-spacing. Headings should feel like headlines in a high-fashion magazine—authoritative and clean.
*   **Body:** Clean, legible sans-serif with generous line-height for a comfortable reading experience.
*   **Monospace:** Used sparingly for metadata and technical details, reinforcing the "archive" nature.

## 4. Component Stylings
*   **Buttons:** Sharp, squared-off edges (#00F2FF) for a precise, architectural feel. No shadows; the glow comes from the vibrant color itself.
*   **Cards/Containers:** "Glassmorphic" panels with 1px semi-transparent borders and subtle, sharp corners.
*   **Navigation:** A minimalist grid layout with large hover-state transitions that emphasize the Neon Teal accents.

## 6. Blog & Content Styling
*   **Article Typography:** Serif accents for long-form readability (if desired) or strict, high-contrast Sans-serif.
*   **Tags/Categories:** Small, monospace labels with thin 1px Neon Teal borders.
*   **Search Bar:** A single, full-width translucent line that expands into a glassmorphic input field.
*   **Comments:** Deep Graphite nested panels with Neon Teal vertical threads to show hierarchy.
*   **Author Profile:** Circular placeholder with a Neon Teal ring, accompanied by minimal metadata in Muted Silver.

## 7. Interactive Components
*   **Terminal Interface:** A fixed or docked glassmorphic window using Mono-spaced fonts exclusively. Use a 1px Neon Teal prompt cursor (`_`). Background should be slightly darker than the base Graphite to suggest depth.
*   **Theme Switcher:** A minimalist toggle (circle or line) that shifts the base Graphite to a high-contrast Off-White while preserving Neon Teal as the primary accent.
