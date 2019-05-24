// Load native modules.
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Load lib functions.
const { getRGB, getPalette } = require('./lib/color');
const { saveImage, convertImage } = require('./lib/image');
const { pixelDataToPanels, mapHexToPbotCode } = require('./lib/pixelBot');
const { compress, rleEncode } = require('./lib/encode');

// Get the arguments from the CLI.
const argv = process.argv.slice(2);

// Give instructions.
if(!argv.length) {
	console.log('Please put a URL as the first argument.');
	return;
}

// Run an async IIFE.
(async () => {
	const palette = await getPalette();
	// TODO: Remove dependence on file system
	const uuid = crypto.randomBytes(16).toString('hex');
	const filePath = path.join(os.tmpdir(), uuid);
	await saveImage(argv[0], filePath);
	await convertImage(filePath);
	const img = await fs.promises.readFile(filePath + '.raw');
	// const img = await loadAndConvertImage(argv[0]);
	// console.log(img.toString('hex'));
	const data = getRGB(img);
	// Delete the temp files
	await fs.promises.unlink(filePath);
	await fs.promises.unlink(filePath + '.raw');
	// Convert RGB hex values into PBot palette characters.
	const pbotData = mapHexToPbotCode(palette, data, 'e');
	// Convert the pixel data to panels.
	const panels = pixelDataToPanels(pbotData);
	// Map panels to RLE, join with periods.
	const rle = panels.map(rleEncode).join('.');
	// Compress the RLE data.
	const buf = await compress(rle);
	// Log chat command.
	console.log('!pbdz.' + buf.toString('base64'));
})()
// Log any errors.
.catch(console.error);