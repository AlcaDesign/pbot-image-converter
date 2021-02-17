const fs = require('fs');
const path = require('path');

function createPaletteFetcher() {
	return async () => {
		const paletteFilePath = path.join(__dirname, '../assets/palette.raw');
		const img = await fs.promises.readFile(paletteFilePath);
		return img;
	};
}

module.exports = {
	createPaletteFetcher
};