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
	let foundFirst = false;
	const endIndex = rgb.findIndex(n => {
		// This color is not black.
		if(n !== '000000') {
			return false;
		}
		// We've now seen black for the first time.
		if(!foundFirst) {
			foundFirst = true;
			return false;
		}
		// Found black twice, this is definitely no longer palette colors.
		return true;
	});
	// Get all colors up to but not including the second black instance.
	return rgb.slice(0, endIndex);
}

module.exports = {
	getRGB,
	getPalette
};