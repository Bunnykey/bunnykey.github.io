import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { SITE } from '../consts/site';

export async function GET() {
  const mark = await sharp(await readFile('public/favicon.svg')).resize(72, 72).png().toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#fafafa"/>
    <path d="M80 100H1120M80 530H1120" stroke="#dddddd"/>
    <text x="80" y="350" font-family="serif" font-size="86" fill="#252525">${SITE.englishName}</text>
    <text x="80" y="422" font-family="sans-serif" font-size="27" fill="#666666">Notes on life, music and technology.</text>
  </svg>`;
  const image = await sharp(Buffer.from(svg))
    .composite([{ input: mark, left: 80, top: 138 }])
    .png()
    .toBuffer();
  return new Response(image, { headers: { 'Content-Type': 'image/png' } });
}
