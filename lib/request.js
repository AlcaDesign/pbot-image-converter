const http = require('http');
const https = require('https');
const urlUtils = require('url');

// Get a data stream for a URL.
function getStream(url = '') {
	const { protocol } = urlUtils.parse(url);
	const adapter = protocol === 'https:' ? https : http;
	return adapter.get(url);
}

module.exports = {
	getStream
};