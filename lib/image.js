const childProcess = require('child_process');
const fs = require('fs');

const { getStream } = require('./request');
const command = require('./command');

// Save an image from a URL to disk.
function saveImage(url = '', filePath = '') {
	return new Promise((resolve, reject) =>
		getStream(url)
		.on('response', res =>
			res.pipe(fs.createWriteStream(filePath))
			.on('error', err => reject(err))
			.on('close', () => resolve())
		)
	);
}

// Run the conversion command on the image.
function convertImage(filePath = '-') {
	const com = command.generate(filePath);
	return new Promise((resolve, reject) =>
		childProcess.exec(com, (err, stdout, stderr) =>
			err ? reject(err) : resolve({ stdout, stderr })
		)
	);
}

module.exports = {
	saveImage,
	convertImage
};