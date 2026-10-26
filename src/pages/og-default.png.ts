import sharp from 'sharp';

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#fafafa"/>
    <path d="M80 100H1120M80 530H1120" stroke="#dddddd"/>
    <text x="80" y="175" font-family="sans-serif" font-size="22" fill="#666666">BUNNYKEY</text>
    <text x="80" y="350" font-family="serif" font-size="86" fill="#252525">The Greenhouse</text>
    <text x="80" y="422" font-family="sans-serif" font-size="27" fill="#666666">Notes on life, music and technology.</text>
  </svg>`;
  return new Response(await sharp(Buffer.from(svg)).png().toBuffer(), {headers: {'Content-Type': 'image/png'}});
}
