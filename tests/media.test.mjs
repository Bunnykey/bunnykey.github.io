import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMedia, renderMedia } from '../src/lib/media.mjs';
import remarkMedia from '../src/lib/remark-media.mjs';
test('media canonicalizes URLs and rejects deceptive hosts or unsafe schemes', () => {
  assert.equal(parseMedia('https://music.youtube.com/watch?v=dQw4w9WgXcQ&si=abc').provider,'YouTube');
  assert.equal(parseMedia('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=abc').height,152);
  for (const url of ['javascript:alert(1)','https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ','https://user@github.com/a/b','https://github.com:444/a/b','https://youtu.be/no']) assert.equal(parseMedia(url),null);
});
test('Astro transforms only embed fences and uses the shared renderer', () => {
 const url='https://github.com/Bunnykey/bunnykey.github.io';
 const tree={children:[{type:'code',lang:'embed',value:url},{type:'code',lang:'js',value:'x()'}]};
 remarkMedia()(tree);
 assert.equal(tree.children[0].data.hChildren[0].properties.dataProvider,'GitHub');
 assert.equal(tree.children[1].type,'code');
 assert.ok(!renderMedia('<img src=x onerror=alert(1)>').includes('<img'));
});
