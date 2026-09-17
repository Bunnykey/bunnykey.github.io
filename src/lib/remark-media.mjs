import { fromHtml } from 'hast-util-from-html';
import { renderMedia } from './media.mjs';
export default function remarkMedia() {
  return (tree) => {
    function walk(node) {
      if (!node.children) return;
      node.children = node.children.map(child => {
        if (child.type === 'code' && child.lang === 'embed') return { type:'paragraph', children:[], data:{ hName:'div', hChildren:fromHtml(renderMedia(child.value), {fragment:true}).children } };
        walk(child); return child;
      });
    }
    walk(tree);
  };
}
