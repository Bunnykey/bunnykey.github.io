import { Editor, Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import { Markdown } from '@tiptap/markdown';
import { parseMedia, renderMedia } from '../../../src/lib/media.mjs';

const Media = Node.create({
  name:'media', group:'block', atom:true, draggable:true,
  addAttributes() { return { url:{default:''} }; },
  parseHTML() { return [{tag:'div[data-media-url]', getAttrs:el=>({url:el.dataset.mediaUrl})}]; },
  renderHTML({node}) { return ['div', {'data-media-url':node.attrs.url}, node.attrs.url]; },
  markdownTokenizer: {
    name:'media', level:'block', start:src=>src.indexOf('```embed'),
    tokenize(src) { const m = /^```embed\s*\n([^\n]+)\n```(?:\n|$)/.exec(src); if (m) return {type:'media',raw:m[0],url:m[1]}; },
  },
  parseMarkdown(token) { return {type:'media',attrs:{url:token.url}}; },
  renderMarkdown(node) { return '```embed\n'+node.attrs.url+'\n```'; },
  addNodeView() { return ({node}) => { const dom=document.createElement('div'); dom.contentEditable='false'; dom.innerHTML=renderMedia(node.attrs.url); return {dom}; }; },
});
export function createRich(element, onChange, upload) {
  return new Editor({
    element, extensions:[StarterKit, Image, TableKit, Media, Markdown], content:'', contentType:'markdown',
    editorProps: {
      attributes:{role:'textbox','aria-label':'본문 작성','aria-multiline':'true',class:'prose studio-document journal-prose'},
      handlePaste(view,event) {
        const file = [...(event.clipboardData?.files || [])].find(f=>f.type.startsWith('image/'));
        if(file) { event.preventDefault(); upload(file); return true; }
        const url=event.clipboardData?.getData('text/plain')?.trim();
        if(parseMedia(url || '')) { view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.media.create({url}))); return true; }
        return false;
      },
    },
    onUpdate:({editor})=>onChange(editor.getMarkdown()),
  });
}

export { slugify } from '../../../src/lib/publishing/contract.mjs';
