import { SECTION_INDEX_CONFIG, type SectionKey } from "./sections.ts";

export const SITE = {
  name: "버니사이드",
  englishName: "Bunnyside",
  favicon: "/favicon.svg?v=3",
  siteUrl: "https://bunnykey.github.io",
  defaultDescription: "버니사이드 — 일상과 음악, 기술을 기록합니다.",
  defaultOgImage: "/og-default.png",
  pinnedRoutes: ["/", "/gardener/", "/workbench/", "/music/tiers/"],
} as const;

export const PAGE_DESCRIPTIONS = {
  home: "일상과 음악, 기술을 기록합니다.",
  gardener: "버니사이드 블로그와 운영자 Bunnykey의 연락처를 소개합니다.",
} as const;

export function sectionDescription(key: SectionKey): string {
  return SECTION_INDEX_CONFIG[key].description;
}

export function toCanonicalUrl(pathname: string): string {
  const normalized =
    pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}/`;
  return `${SITE.siteUrl}${normalized}`;
}
