// Load native modules.
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Load lib functions.
const { getRGB, getPalette } = require('./lib/color');
const { saveImage, convertImage } = require('./lib/image');
const { pixelDataToPanels } = require('./lib/pixelBot');
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
	// Convert HEX pixel data into PBot palette characters.
	const pbotData = data.map(n => {
		// Find the index of the color in the palette.
		const index = palette.indexOf(n);
		// This shouldn't get called in normal cases.
		if(index === -1) {
			throw `Could not find matching palette item for "${n}"`;
			// return ' ';
			// return 'e';
		}
		// Convert index to ASCII text. 97-123 are lowercase alphabet.
		return String.fromCharCode(index + 97);
	});
	// Convert the pixel data to panels, map to RLE, join with periods.
	const rle = pixelDataToPanels(pbotData).map(rleEncode).join('.');
	// Compress the RLE data.
	const buf = await compress(rle);
	// Log chat command.
	console.log('!pbdz.' + buf.toString('base64'));
})()
// Log any errors.
.catch(console.error);