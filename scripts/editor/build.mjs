import { build } from 'esbuild';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { writeFile, copyFile, rm } from 'node:fs/promises';
await build({entryPoints:['scripts/editor/client/rich.js'],bundle:true,format:'esm',outfile:'scripts/editor/public/rich.bundle.js',minify:true});
await build({entryPoints:['node_modules/@radix-ui/themes/styles.css'],bundle:true,outfile:'scripts/editor/public/radix.css',minify:true});
const shellPath=new URL('./.shell-render.mjs',import.meta.url);
try {
 await build({entryPoints:['scripts/editor/client/shell.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:shellPath.pathname});
 const {default:Shell}=await import(shellPath.href+'?v='+Date.now());
 const body=renderToStaticMarkup(createElement(Shell));
 await writeFile(new URL('./public/index.html',import.meta.url),`<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bunnykey 글쓰기</title><link rel="stylesheet" href="/radix.css"><link rel="stylesheet" href="/design/reading.css"><link rel="stylesheet" href="/styles.css"></head><body>${body}<script type="module" src="/app.js"></script></body></html>\n`);
} finally {await rm(shellPath,{force:true});}
