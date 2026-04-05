export const SECTION_KEYS = ["flora", "nursery", "seeds"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_INDEX_CONFIG: Record<
  SectionKey,
  {
    pageTitle: string;
    heading: string;
    description: string;
    emptyMessage: string;
    accentClass: string;
  }
> = {
  flora: {
    pageTitle: "Flora - The Greenhouse",
    heading: "Flora",
    description: "AI 런칭, 모델 변화, 에이전트 제품에 대한 큐레이션 노트.",
    emptyMessage: "No flora posts yet.",
    accentClass: "text-accent",
  },
  nursery: {
    pageTitle: "Nursery - The Greenhouse",
    heading: "Nursery",
    description: "자라는 아이디어, 미완의 생각, 에버그린 노트.",
    emptyMessage: "No nursery notes yet.",
    accentClass: "text-accent",
  },
  seeds: {
    pageTitle: "Seeds - The Greenhouse",
    heading: "Seeds",
    description: "짧은 메모, 순간 포착, 씨앗 단계의 글.",
    emptyMessage: "No seeds yet.",
    accentClass: "text-earth",
  },
};

export const NURSERY_STAGE_EMOJI: Record<string, string> = {
  seed: "🌱",
  growing: "🌿",
  evergreen: "🌳",
};

export const NURSERY_STAGE_DOTS: Record<string, { filled: number; total: number; label: string }> = {
  seed: { filled: 1, total: 3, label: "seed" },
  growing: { filled: 2, total: 3, label: "growing" },
  evergreen: { filled: 3, total: 3, label: "evergreen" },
};

export function formatArchiveDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function sortByDateDesc<T extends { data: { date: Date } }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function filterPublished<T extends { data: { draft?: boolean } }>(items: T[]): T[] {
  if (import.meta.env.PROD) {
    return items.filter((item) => !item.data.draft);
  }
  return items;
}
