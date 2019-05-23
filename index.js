// Load lib functions.
const { getRGB, getPalette } = require('./lib/color');
const { saveImage, convertImage } = require('./lib/image');
const { pixelDataToPanels } = require('./lib/pixelBot');
const { compress, rleEncode } = require('./lib/encode');

module.exports = {
	getRGB,
	getPalette,
	saveImage,
	convertImage,
	pixelDataToPanels,
	compress,
	rleEncode
};