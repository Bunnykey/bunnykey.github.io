export type SectionKey = "flora" | "nursery" | "seeds";

export const SECTION_INDEX_CONFIG: Record<
  SectionKey,
  {
    pageTitle: string;
    heading: string;
    intro: string;
    emptyMessage: string;
    accentClass: string;
  }
> = {
  flora: {
    pageTitle: "Flora - The Greenhouse",
    heading: "Flora",
    intro: "AI 런칭, 모델 변화, 에이전트 제품, 그리고 생태계가 실제로 어디로 향하는지에 대한 큐레이션 노트.",
    emptyMessage: "No flora posts yet.",
    accentClass: "text-secondary",
  },
  nursery: {
    pageTitle: "Nursery - The Greenhouse",
    heading: "Nursery",
    intro: "자라는 아이디어, 미완의 생각, 그리고 계속 진화하는 에버그린 노트.",
    emptyMessage: "No nursery notes yet.",
    accentClass: "text-secondary",
  },
  seeds: {
    pageTitle: "Seeds - The Greenhouse",
    heading: "Seeds",
    intro: "짧은 메모, 순간 포착, 그리고 더 큰 조각이 되기 전의 씨앗들.",
    emptyMessage: "No seeds yet.",
    accentClass: "text-tertiary",
  },
};

export const NURSERY_STAGE_EMOJI: Record<string, string> = {
  seed: "🌱",
  growing: "🌿",
  evergreen: "🌳",
};

export function formatArchiveDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function sortByDateDesc<T extends { data: { date: Date } }>(items: T[]): T[] {
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function filterPublished<T extends { data: { draft?: boolean } }>(items: T[]): T[] {
  if (import.meta.env.PROD) {
    return items.filter((item) => !item.data.draft);
  }
  return items;
}
