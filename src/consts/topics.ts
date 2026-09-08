export const TOPICS = {
  life: { label: '일상', description: '생활과 생각의 기록' },
  food: { label: '요리', description: '먹고 만들고 발견한 것들' },
  music: { label: '음악', description: '듣고 남기고 싶은 순간들' },
  travel: { label: '여행', description: '장소와 장면의 기록' },
  tech: { label: '기술', description: '도구와 배움에 관한 글' },
  notes: { label: '기록', description: '짧지만 남겨둘 이야기' },
} as const;

export type TopicKey = keyof typeof TOPICS;

export function topicFor(category?: string): TopicKey {
  return category && category in TOPICS ? category as TopicKey : 'notes';
}
