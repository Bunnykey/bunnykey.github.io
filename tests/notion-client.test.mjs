import test from 'node:test';
import assert from 'node:assert/strict';

import { queryDataSource } from '../src/content/notion-client.mjs';

test('queryDataSource resolves a legacy database id through its single child data source', async (t) => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  const legacyDatabaseId = '123456781234123412341234567890ab';
  const realDataSourceId = '87654321-4321-4321-4321-ba0987654321';

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (url, init = {}) => {
    const path = new URL(url).pathname;
    calls.push({
      path,
      method: init.method || 'GET',
      body: init.body ? JSON.parse(init.body) : undefined,
    });

    if (path === `/v1/data_sources/${legacyDatabaseId}/query`) {
      return new Response('object_not_found', { status: 404 });
    }

    if (path === `/v1/databases/${legacyDatabaseId}`) {
      return Response.json({
        data_sources: [{ id: realDataSourceId, name: 'AI' }],
      });
    }

    if (path === `/v1/data_sources/${realDataSourceId}/query`) {
      return Response.json({
        results: [{ id: 'page-1' }],
        has_more: false,
        next_cursor: null,
      });
    }

    throw new Error(`Unexpected fetch call: ${path}`);
  };

  const results = await queryDataSource(legacyDatabaseId, 'test-token');

  assert.deepEqual(results, [{ id: 'page-1' }]);
  assert.deepEqual(calls, [
    {
      path: `/v1/data_sources/${legacyDatabaseId}/query`,
      method: 'POST',
      body: {},
    },
    {
      path: `/v1/databases/${legacyDatabaseId}`,
      method: 'GET',
      body: undefined,
    },
    {
      path: `/v1/data_sources/${realDataSourceId}/query`,
      method: 'POST',
      body: {},
    },
  ]);
});

test('queryDataSource keeps using the resolved child data source across pagination', async (t) => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  const legacyDatabaseId = '123456781234123412341234567890ab';
  const realDataSourceId = '87654321-4321-4321-4321-ba0987654321';

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (url, init = {}) => {
    const path = new URL(url).pathname;
    calls.push({
      path,
      method: init.method || 'GET',
      body: init.body ? JSON.parse(init.body) : undefined,
    });

    if (path === `/v1/data_sources/${legacyDatabaseId}/query`) {
      return new Response('object_not_found', { status: 404 });
    }

    if (path === `/v1/databases/${legacyDatabaseId}`) {
      return Response.json({
        data_sources: [{ id: realDataSourceId, name: 'AI' }],
      });
    }

    if (path === `/v1/data_sources/${realDataSourceId}/query` && !init.body) {
      throw new Error('Expected pagination payload');
    }

    if (
      path === `/v1/data_sources/${realDataSourceId}/query` &&
      JSON.parse(init.body).start_cursor === undefined
    ) {
      return Response.json({
        results: [{ id: 'page-1' }],
        has_more: true,
        next_cursor: 'cursor-2',
      });
    }

    if (
      path === `/v1/data_sources/${realDataSourceId}/query` &&
      JSON.parse(init.body).start_cursor === 'cursor-2'
    ) {
      return Response.json({
        results: [{ id: 'page-2' }],
        has_more: false,
        next_cursor: null,
      });
    }

    throw new Error(`Unexpected fetch call: ${path}`);
  };

  const results = await queryDataSource(legacyDatabaseId, 'test-token');

  assert.deepEqual(results, [{ id: 'page-1' }, { id: 'page-2' }]);
  assert.deepEqual(calls, [
    {
      path: `/v1/data_sources/${legacyDatabaseId}/query`,
      method: 'POST',
      body: {},
    },
    {
      path: `/v1/databases/${legacyDatabaseId}`,
      method: 'GET',
      body: undefined,
    },
    {
      path: `/v1/data_sources/${realDataSourceId}/query`,
      method: 'POST',
      body: {},
    },
    {
      path: `/v1/data_sources/${realDataSourceId}/query`,
      method: 'POST',
      body: { start_cursor: 'cursor-2' },
    },
  ]);
});

test('queryDataSource rejects a legacy database id that maps to multiple child data sources', async (t) => {
  const originalFetch = globalThis.fetch;
  const legacyDatabaseId = '123456781234123412341234567890ab';

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;

    if (path === `/v1/data_sources/${legacyDatabaseId}/query`) {
      return new Response('object_not_found', { status: 404 });
    }

    if (path === `/v1/databases/${legacyDatabaseId}`) {
      return Response.json({
        data_sources: [
          { id: '87654321-4321-4321-4321-ba0987654321', name: 'AI' },
          { id: '11111111-2222-3333-4444-555555555555', name: 'Archive' },
        ],
      });
    }

    throw new Error(`Unexpected fetch call: ${path}`);
  };

  await assert.rejects(
    () => queryDataSource(legacyDatabaseId, 'test-token'),
    /multiple data sources/i,
  );
});

test('queryDataSource preserves the original 400 error without attempting legacy fallback', async (t) => {
  const originalFetch = globalThis.fetch;
  const dataSourceId = 'bad-data-source-id';

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;

    if (path === `/v1/data_sources/${dataSourceId}/query`) {
      return new Response('bad_request', { status: 400 });
    }

    throw new Error(`Unexpected fetch call: ${path}`);
  };

  await assert.rejects(
    () => queryDataSource(dataSourceId, 'test-token'),
    /Notion API 400: bad_request/,
  );
});

test('queryDataSource queries a direct data source id without search fallback', async (t) => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  const dataSourceId = '87654321-4321-4321-4321-ba0987654321';

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (url, init = {}) => {
    const path = new URL(url).pathname;
    calls.push({
      path,
      method: init.method || 'GET',
      body: init.body ? JSON.parse(init.body) : undefined,
    });

    if (path === `/v1/data_sources/${dataSourceId}/query`) {
      return Response.json({
        results: [{ id: 'page-2' }],
        has_more: false,
        next_cursor: null,
      });
    }

    throw new Error(`Unexpected fetch call: ${path}`);
  };

  const results = await queryDataSource(dataSourceId, 'test-token');

  assert.deepEqual(results, [{ id: 'page-2' }]);
  assert.deepEqual(calls, [
    {
      path: `/v1/data_sources/${dataSourceId}/query`,
      method: 'POST',
      body: {},
    },
  ]);
});
