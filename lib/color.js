// Convert a buffer into chunked HEX strings.
function getRGB(buffer = Buffer.of(), chunkSize = 4) {
	const result = [];
	for(let i = 0; i < length;) {
		const slc = buffer.slice(i, i += chunkSize);
		result.push(bufferToHex(slc));
	}
	return result;
}

// Load the palette colors from disk.
async function getPalette(paletteFetcher) {
	// Read the palette colors.
	const img = await paletteFetcher();
	const rgb = getRGB(img);
	// Find the end of the palette colors.
	const endIndex = rgb.findIndex(n => {
		// This color is full alpha.
		return n === 'ffffff00';
	});
	// Get all colors up to and including the first alpha.
	return rgb.slice(0, endIndex + 1);
}

// Convert buffer to a hex string using a browser safe method.
function bufferToHex(buffer) {
	return Array
		.from(new Uint8Array(buffer))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
}

module.exports = {
	getRGB,
	getPalette
};