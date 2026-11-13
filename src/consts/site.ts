import { SECTION_INDEX_CONFIG, type SectionKey } from "./sections";

export const SITE = {
  name: "버니사이드",
  siteUrl: "https://bunnykey.github.io",
  defaultDescription: "버니사이드 — 일상과 음악, 기술을 기록합니다.",
  defaultOgImage: "/og-default.png",
  pinnedRoutes: ["/", "/gardener/", "/workbench/", "/music/tiers/"],
} as const;

export const PAGE_DESCRIPTIONS = {
  home: "일상과 음악, 기술을 기록합니다.",
  gardener: "The Gardener — 프로필, 소셜 링크, 연락처.",
} as const;

export function sectionDescription(key: SectionKey): string {
  return SECTION_INDEX_CONFIG[key].description;
}

export function toCanonicalUrl(pathname: string): string {
  const normalized =
    pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}/`;
  return `${SITE.siteUrl}${normalized}`;
}
