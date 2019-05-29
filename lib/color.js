const fs = require('fs');
const path = require('path');

// Convert a buffer into chunked HEX strings.
function getRGB(buffer = Buffer.of(), chunkSize = 4) {
	const result = [];
	for(let i = 0; i < buffer.length;) {
		const slc = buffer.slice(i, i += chunkSize);
		result.push(slc.toString('hex'));
	}
	return result;
}

// Load the palette colors from disk.
async function getPalette() {
	// Read the palette colors.
	const paletteFilePath = path.join(__dirname, '../assets/palette.raw');
	const img = await fs.promises.readFile(paletteFilePath);
	const rgb = getRGB(img);
	// Find the end of the palette colors.
	const endIndex = rgb.findIndex(n => {
		// This color is full alpha.
		return n === 'ffffff00';
	});
	// Get all colors up to and including the first alpha.
	return rgb.slice(0, endIndex + 1);
}

/**
 * Load `pb-palette.png` for use with the ImageMagick wasm library.
 *
 * @returns {Promise<import('wasm-imagemagick').MagickInputFile>}
 */
async function getPaletteFile() {
	const filename = 'pb-palette.png';
	const fileData = await fs.promises.readFile(
		path.resolve(__dirname, `../assets/${filename}`),
		'binary'
	);

	return {
		name: filename,
		content: Buffer.from(fileData, 'binary')
	}
}

module.exports = {
	getRGB,
	getPalette,
	getPaletteFile,
};