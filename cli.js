// Load lib functions.
const { getRGB, getPalette, getPaletteFile } = require('./lib/color');
const { pixelDataToPanels, mapHexToPbotCode } = require('./lib/pixelBot');
const { compress, rleEncode } = require('./lib/encode');
const { createImageMagickInstance } = require('./lib/imageMagick')
const { generate } = require("./lib/command");

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
	const { imageMagick, FileReader, dispose } = await createImageMagickInstance();

	const paletteFile = await getPaletteFile();
	const imgFile = await imageMagick.buildInputFile(argv[0]);

	const imgResult = await imageMagick.executeAndReturnOutputFile({
		inputFiles: [paletteFile, imgFile],
		commands: generate(imgFile.name)
	});
	dispose();

	// Convert Blob to Buffer.
	const img = await new Promise(resolve => {
		const fileReader = new FileReader();
		fileReader.onload = event => {
			resolve(Buffer.from(event.target.result, 'binary'));
		};
		fileReader.readAsBinaryString(imgResult.blob);
	});

	const data = getRGB(img);
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