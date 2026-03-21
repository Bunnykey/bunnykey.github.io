const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2025-09-03';

function createHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

async function notionFetch(path, token, init = {}) {
  const response = await fetch(`${NOTION_API_BASE}${path}`, {
    ...init,
    headers: {
      ...createHeaders(token),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`Notion API ${response.status}: ${text}`);
    error.status = response.status;
    error.body = text;
    throw error;
  }

  return response.json();
}

async function resolveLegacyDatabaseId(databaseId, token) {
  const database = await notionFetch(`/databases/${databaseId}`, token);
  const dataSources = database.data_sources || [];

  if (dataSources.length === 1) {
    return dataSources[0].id;
  }

  if (dataSources.length > 1) {
    throw new Error(
      `Legacy Notion database ID maps to multiple data sources; configure a data source ID instead: ${databaseId}`,
    );
  }

  return undefined;
}

export async function queryDataSource(dataSourceId, token) {
  const results = [];
  let nextCursor = undefined;
  let resolvedDataSourceId = dataSourceId;

  do {
    const payload = nextCursor ? { start_cursor: nextCursor } : {};
    let json;

    try {
      json = await notionFetch(`/data_sources/${resolvedDataSourceId}/query`, token, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      const shouldResolveLegacyId =
        !nextCursor &&
        resolvedDataSourceId === dataSourceId &&
        error.status === 404;

      if (!shouldResolveLegacyId) {
        throw error;
      }

      let fallbackId;
      try {
        fallbackId = await resolveLegacyDatabaseId(dataSourceId, token);
      } catch (fallbackError) {
        if (fallbackError.status === 404) {
          throw error;
        }
        throw fallbackError;
      }

      if (!fallbackId || fallbackId === resolvedDataSourceId) {
        throw error;
      }

      resolvedDataSourceId = fallbackId;
      json = await notionFetch(`/data_sources/${resolvedDataSourceId}/query`, token, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    results.push(...(json.results || []));
    nextCursor = json.has_more ? json.next_cursor : undefined;
  } while (nextCursor);

  return results;
}

export async function fetchBlockChildren(blockId, token) {
  const results = [];
  let nextCursor = undefined;

  do {
    const query = nextCursor ? `?start_cursor=${nextCursor}` : '';
    const json = await notionFetch(`/blocks/${blockId}/children${query}`, token);
    results.push(...(json.results || []));
    nextCursor = json.has_more ? json.next_cursor : undefined;
  } while (nextCursor);

  return results;
}

export async function fetchBlockTree(blockId, token) {
  const blocks = await fetchBlockChildren(blockId, token);
  const withChildren = [];

  for (const block of blocks) {
    if (block.has_children) {
      withChildren.push({
        ...block,
        children: await fetchBlockTree(block.id, token),
      });
    } else {
      withChildren.push(block);
    }
  }

  return withChildren;
}
