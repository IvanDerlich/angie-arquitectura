const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a 256x1 palette image with Angie's colors
const width = 256;
const height = 1;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Angie's palette colors
const colors = [
  '#E8DCCB', // Beige claro
  '#C9A98C', // Beige oscuro  
  '#7FA7C9', // Azul
  '#F8F6F2', // Blanco roto
  '#2F4A63'  // Azul oscuro
];

// Create gradient across the palette
const gradient = ctx.createLinearGradient(0, 0, width, 0);
colors.forEach((color, i) => {
  gradient.addColorStop(i / (colors.length - 1), color);
});

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Save to file
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('assets/landscape-palette.png', buffer);
console.log('Palette created: assets/landscape-palette.png');
