import { SECTION_INDEX_CONFIG, type SectionKey } from './sections';

export const SITE = {
  name: "The Greenhouse",
  siteUrl: "https://bunnykey.github.io",
  defaultDescription:
    "The Greenhouse — AI 분석, 디지털 가든, 그리고 진화하는 아이디어를 정성스럽게 가꿉니다.",
  defaultOgImage: "/og-default.svg",
  pinnedRoutes: [
    "/",
    "/gardener/",
    "/flora/",
    "/nursery/",
    "/seeds/",
  ],
} as const;

export const PAGE_DESCRIPTIONS = {
  home: "디지털 정원. AI, 크립토, 그리고 진화하는 아이디어를 정성스럽게 가꿉니다.",
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
