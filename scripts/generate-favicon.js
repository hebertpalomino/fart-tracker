const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, 32, 32);

  // Draw emoji
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💨', 16, 16);

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), buffer);
}

generateFavicon();
