import { validateRoute } from './contract.mjs';

export const CMS_ROOT = 'https://app.pagescms.org/Bunnykey/bunnykey.github.io/main';
export const ACTIONS_URL = 'https://github.com/Bunnykey/bunnykey.github.io/actions/workflows/deploy.yml';
export const STATUS_URL = 'https://api.github.com/repos/Bunnykey/bunnykey.github.io/actions/runs?branch=main&event=push&per_page=5';

export function isSharedPreview(entry) {
  return entry.data.draft === true && entry.data.sharePreview === true;
}

export function postUrl(collection, entry) {
  validateRoute(collection, entry.slug);
  return `${isSharedPreview(entry) ? '/preview' : ''}/${collection}/${entry.slug}/`;
}

export function cmsCollectionUrl(collection, create = false) {
  validateRoute(collection, 'entry');
  return `${CMS_ROOT}/collection/${collection}${create ? '/new' : ''}`;
}

export function cmsEditUrl(collection, slug) {
  validateRoute(collection, slug);
  // Shared previews are Markdown; MDX is deliberately excluded from this CMS.
  return `${cmsCollectionUrl(collection)}/edit/${encodeURIComponent(`src/content/${collection}/${slug}.md`)}`;
}
