import React from 'react';
import { config, collection, fields } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';
import { renderMedia } from './src/lib/media.mjs';

// This collection intentionally cannot edit any published post.
export default config({
  storage: { kind: 'local' },
  locale: 'ko-KR',
  ui: { brand: { name: 'Bunnykey · 글쓰기 시험' } },
  collections: {
    trial: collection({
      label: '시험용 글',
      path: 'writing-trial/posts/*',
      slugField: 'title',
      entryLayout: 'content',
      format: { contentField: 'body' },
      previewUrl: '/writing-preview/{slug}/',
      schema: {
        title: fields.slug({
          name: { label: '제목', validation: { isRequired: true } },
          slug: { label: '글 주소', description: '영문 소문자, 숫자, 하이픈으로 입력하세요.',
            validation: { pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: '예: a-song-for-today' } } },
        }),
        date: fields.date({ label: '날짜', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
        summary: fields.text({ label: '짧은 소개', multiline: true }),
        body: fields.mdx({
          label: '본문',
          options: {
            heading: [2, 3],
            image: { directory: 'writing-trial/assets', publicPath: '/writing-assets/' },
          },
          components: {
            Media: block({
              label: '음악 · 영상 · GitHub',
              description: 'Spotify, YouTube 또는 GitHub 주소를 넣으세요.',
              schema: { url: fields.url({ label: '주소', validation: { isRequired: true } }) },
              ContentView: ({ value }) => <div dangerouslySetInnerHTML={{ __html: renderMedia(value.url || '') }} />,
            }),
          },
        }),
      },
    }),
  },
});
