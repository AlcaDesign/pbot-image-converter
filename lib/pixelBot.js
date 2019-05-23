// Convert from palette codes (typically RGB hex values) to PixelBot color
// codes. Set `outsideRangeDefault` to the default code if the hex code could
// not be found in the palette or it will throw a RangeError.
function mapHexToPbotCode(palette = [], data = [], outsideRangeDefault = null) {
	return data.map(n => {
		// Find the index of the color in the palette.
		const index = palette.indexOf(n);
		// This shouldn't get called in normal cases.
		if(index === -1) {
			if(!outsideRangeDefault) {
				throw new RangeError(
					`Could not find matching palette item for "${n}"`
				);
			}
			else {
				return outsideRangeDefault;
			}
		}
		// Convert index to ASCII text. 97-123 are lowercase alphabet.
		return String.fromCharCode(index + 97);
	});
}

// Break the pixel data into 4 panels.
function pixelDataToPanels(data = []) {
	// The resolution of the side of one panel.
	const panRes = 12;
	// The resolution of the side of the full bot.
	const res = panRes * 2;
	// The length of the data array.
	const { length } = data;
	// The resulti panel chunks.
	const panels = [ [], [], [], [] ];
	// Instead of iterating over every pixel, jump entire rows.
	for(let i = 0; i < length; i += res) {
		// Current pixel row.
		let t = i / res;
		// Current panel row, 0 or 1.
		let groupOffset = Math.floor(t / panRes) * 2;
		if(groupOffset > 2) {
			throw new Error('Whoa, that file is too long.');
		}
		// Grab the left panel data.
		let dataA = data.slice(i, i + panRes);
		// Grab the right panel data.
		let dataB = data.slice(i + panRes, i + panRes + panRes);
		// Every other row is flipped.
		if(Math.floor(t) % 2 === 1) {
			dataA.reverse();
			dataB.reverse();
		}
		// Push into the correct panel accumulator.
		panels[groupOffset].push(...dataA);
		panels[groupOffset + 1].push(...dataB);
	}
	return panels;
}

module.exports = {
	mapHexToPbotCode,
	pixelDataToPanels
};