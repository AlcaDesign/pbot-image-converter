const zlib = require('zlib');

// Gzip compress some data using deflate.
function compress(data = '') {
	return new Promise((resolve, reject) =>
		zlib.deflate(data, (err, buf) =>
			err ? reject(err) : resolve(buf)
		)
	);
}

// Run-length encode some data, either string or Array.
function rleEncode(data = []) {
	// Work from back to front.
	return data ? [].reduceRight.call(data, (p, n, i) => {
		// If n matches the previous data or the previous data is empty.
		if(p[0][0] === n || !p[0].length) {
			// Increase the count
			p[0] += n;
		}
		else {
			// End the last sequence with the length then character.
			p[1] += p[0].length + p[0][0];
			// Starting a new data run.
			p[0] = n;
		}
		// Reached the end (start) of the data.
		if(i === 0) {
			// Put together the last RLE
			return p[1] + p[0].length + p[0][0];
		}
		// Return the accumulator.
		return p;
		// [ current run, result encoding ]
	}, [ '', '' ]) : data;
}

module.exports = {
	compress,
	rleEncode
};