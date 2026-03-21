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

export const SECTION_FALLBACKS = {
  home: "디지털 정원. AI, 크립토, 그리고 진화하는 아이디어를 정성스럽게 가꿉니다.",
  gardener: "The Gardener — 프로필, 소셜 링크, 연락처.",
  flora: "AI 런칭, 모델 변화, 에이전트 제품에 대한 큐레이션 노트.",
  nursery: "자라는 아이디어, 미완의 생각, 에버그린 노트.",
  seeds: "짧은 메모, 순간 포착, 씨앗 단계의 글.",
} as const;

export function toCanonicalUrl(pathname: string): string {
  const normalized =
    pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}/`;
  return `${SITE.siteUrl}${normalized}`;
}
