// Load lib functions.
const { getRGB, getPalette } = require('./lib/color');
const { saveImage, convertImage } = require('./lib/image');
const { pixelDataToPanels, mapHexToPbotCode } = require('./lib/pixelBot');
const { compress, rleEncode } = require('./lib/encode');

module.exports = {
	getRGB,
	getPalette,
	saveImage,
	convertImage,
	pixelDataToPanels,
	mapHexToPbotCode,
	compress,
	rleEncode
};