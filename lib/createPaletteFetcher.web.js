function createPaletteFetcher(paletteFileUrl) {
	return async () => {
		const response = await fetch(paletteFileUrl);
		const buffer = await response.arrayBuffer();
		return buffer;
	};
}

module.exports = {
	createPaletteFetcher
};