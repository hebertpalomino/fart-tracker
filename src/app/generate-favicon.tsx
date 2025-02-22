import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const icon = new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'black',
        }}
      >
        💨
      </div>
    ),
    {
      width: 32,
      height: 32,
    }
  );

  const buffer = await icon.arrayBuffer();
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), Buffer.from(buffer));
  
  return new Response('Favicon generated', { status: 200 });
}
