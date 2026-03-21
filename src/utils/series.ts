type SupportedCollection = 'flora' | 'nursery' | 'seeds';

type SeriesMetadata = {
  name: string;
  title: string;
  order: number;
};

export type SeriesEntry = {
  slug: string;
  data: {
    title: string;
    series?: SeriesMetadata;
  };
};

export function getSeriesPostsFromEntries<T extends SeriesEntry>(
  entries: readonly T[],
  seriesName: string,
): T[] {
  return entries
    .filter((entry) => entry.data.series?.name === seriesName)
    .sort((left, right) => {
      const leftOrder = left.data.series?.order ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.data.series?.order ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    });
}

export function getSeriesNavigationFromEntries<T extends SeriesEntry>(
  entries: readonly T[],
  currentOrder: number,
): {
  previous: T | undefined;
  next: T | undefined;
} {
  const currentIndex = entries.findIndex(
    (entry) => entry.data.series?.order === currentOrder,
  );

  if (currentIndex === -1) {
    return {
      previous: undefined,
      next: undefined,
    };
  }

  return {
    previous: entries[currentIndex - 1],
    next: entries[currentIndex + 1],
  };
}

export async function getSeriesPosts(
  collection: SupportedCollection,
  seriesName: string,
) {
  const { getCollection } = await import('astro:content');
  const entries = await getCollection(collection);
  return getSeriesPostsFromEntries(entries, seriesName);
}

export async function getSeriesNavigation(
  collection: SupportedCollection,
  seriesName: string,
  currentOrder: number,
) {
  const entries = await getSeriesPosts(collection, seriesName);
  return getSeriesNavigationFromEntries(entries, currentOrder);
}
