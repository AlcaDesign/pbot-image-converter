const os = require('os');
const path = require('path');

function generateCommand(filePath = '-') {
	// Generate this command:
	// convert img.png -scale 24x24 -remap assets/pb-palette.png RGB:img.raw
	const palettePNG = path.join(__dirname, '../assets/pb-palette.png');
	const size = '24x24';
	// If on Windows, use "magick convert" instead of "convert".
	const base = (os.platform() === 'win32' ? 'magick ' : '') + 'convert';
	// Default to black color.
	const bg = '-background black';
	// Center the image.
	const grav = '-gravity center';
	// Scale down/up to <size>.
	const scale = `-scale ${size}`;
	// Expand canvas to <size>.
	const extent = `-extent ${size}`;
	// Map pixel colors to the palette.
	const remap = `-remap ${palettePNG}`;
	// Write raw RGB data to disk/stdout.
	const out = `RGB:${filePath}${filePath === '-' ? '' : '.raw'}`;
	// Put the command together.
	return [ base, filePath, bg, grav, scale, extent, remap, out ].join(' ');
}

module.exports = {
	generate: generateCommand
};