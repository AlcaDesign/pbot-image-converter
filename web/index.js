import { buildInputFile, execute } from 'wasm-imagemagick'
import { createPaletteFetcher } from '../lib/createPaletteFetcher.web';
import { getPalette, getRGB } from '../lib/color';
import { pixelDataToPanels, mapHexToPbotCode } from '../lib/pixelBot';
import { generate } from '../lib/command';
import { rleEncode, compress } from '../lib/encode'

import paletteFileUrl from '../assets/palette.raw';
import pbPaletteFileUrl from '../assets/pb-palette.png';

const elements = {
	fileInput: document.getElementById('file-select'),
	convertButton: document.getElementById('convert'),
	chatCommand: document.getElementById('chat-command')
}

window.addEventListener('load', async () => {
	elements.convertButton.addEventListener('click', convertImage);

	setElementsDisabled(false);
});

async function convertImage() {
	try {
		setElementsDisabled(true);

		const paletteFetcher = createPaletteFetcher(paletteFileUrl);
		const palette = await getPalette(paletteFetcher);
		// The wasm implementation's virtual filesystem doesn't seem to support
		// directories, so remove it here.
		const command = generate('file.jpg').replace('assets/pb-palette.png', 'pb-palette.png');

		const { outputFiles, exitCode } = await execute({
			inputFiles: [
				await buildInputFile(elements.fileInput.value, 'file.jpg'),
				await buildInputFile(pbPaletteFileUrl, 'pb-palette.png')
			],
			commands: [command]
		});

		if (exitCode !== 0 || outputFiles.length === 0) {
			throw new Error('Image conversion failed.');
		}

		// Convert Blob to ArrayBuffer.
		const img = await new Response(outputFiles[0].blob).arrayBuffer();
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
		elements.chatCommand.textContent = '!pbdz.' + buf.toString('base64');
	} catch (err) {
		elements.chatCommand.textContent = err.toString();
	}

	setElementsDisabled(false);
}

function setElementsDisabled(disabled) {
	for (const element of Object.values(elements)) {
		if (disabled) {
			element.setAttribute('disabled', '');
			continue;
		}

		element.removeAttribute('disabled');
	}
}
