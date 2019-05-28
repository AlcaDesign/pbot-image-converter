const fs = require('fs');
const path = require('path');
const pkgDir = require('pkg-dir');
const jsdom = require('jsdom');
const fetch = require('node-fetch');

/**
 * Mapping of modules which should be made available in the JSDOM environment.
 * Web requests in the JSDOM environment will be redirected to these files from
 * node_modules.
 *
 * @type {Array<{
 *    moduleName: string;
 *    directoryName: string;
 *    filename: string;
 * }>}
 */
const moduleResources = [
	// Dependency of jsdom-worker.
	{
		moduleName: 'mitt',
		directoryName: 'dist',
		filename: 'mitt.umd.js'
	},
	// Polyfill web worker support in JSDOM.
	{
		moduleName: 'jsdom-worker',
		directoryName: 'dist',
		filename: 'jsdom-inline-worker.umd.js'
	},
	// ImageMagick library.
	{
		moduleName: 'wasm-imagemagick',
		directoryName: 'dist/bundles',
		filename: 'wasm-imagemagick.umd-es5.js'
	}
]

// Provide a url to the JSDOM document so that it doesn't default to
// about:config and cause web request errors.
const jsdomUrl = 'http://localhost';

// Virtual browser page contents.
const html = `
<!DOCTYPE html>
<html>
	<body>
	<script>global = window;</script>
	${moduleResources.map(m => `<script src="${jsdomUrl}/${m.filename}"></script>`)}
	</body>
</html>
`;

/**
 * @typedef {object} ImageMagickInstanceOptions
 * @property {boolean} [enableRequestLogging]
 */

/**
 * Create an instance of ImageMagick.
 *
 * @param {ImageMagickInstanceOptions} [options]
 */
async function createImageMagickInstance(options = {}) {
	/** @type {ImageMagickInstanceOptions} */
	const config = {
		enableRequestLogging: false,
		...options
	};

	// Forward console logs from the virtual environment to Node's console.
	const virtualConsole = new jsdom.VirtualConsole();
	virtualConsole.sendTo(console);

	// Load page resources from node_modules.
	const resources = await createResourceLoader(config);

	const dom = new jsdom.JSDOM(html, {
		// Enable execution of scripts in the virtual environment.
		runScripts: 'dangerously',
		url: jsdomUrl,
		virtualConsole,
		resources,
		// Polyfill the Fetch API. Wrap Fetch in an interceptor to redirect
		// requests for the ImageMagick webworker and wasm bundles to
		// node_modules.
		beforeParse: window => {
			window.fetch = createFetchInterceptor(config);
		}
	});

	// Wait a bit to allow ImageMagick to initialize.
	await new Promise((resolve, reject) => {
		let timeout = 5000 / 100; // 5 seconds.
		let interval = setInterval(() => {
			if (timeout === 0) {
				clearInterval(interval);
				reject('ImageMagick initialization timed out.')
				return;
			}

			if (dom.window['wasm-imagemagick']) {
				clearInterval(interval);
				resolve();
				return;
			}

			timeout -= 1;
		}, 100);
	})

	return {
		/**
		 * Image Magick API.
		 *
		 * @type {typeof import('wasm-imagemagick')}
		 */
		imageMagick: dom.window['wasm-imagemagick'],

		/**
		 * Dispose of any event loops or timers so the Node process can exit
		 * cleanly.
		 */
		dispose: () => {
			dom.window.close();
		}
	}
}

/**
 * Create a resource loader for JSDOM which is able to access files belonging to
 * the ImageMagick wasm library.
 *
 * @param {ImageMagickInstanceOptions} config
 * @returns {Promise<import('jsdom').ResourceLoader>}
 * @see https://github.com/jsdom/jsdom#advanced-configuration
 */
async function createResourceLoader(config) {
	return new (class extends jsdom.ResourceLoader {
		/**
		 * @param {string} url
		 * @param {import('jsdom').FetchOptions} options
		 * @returns {Promise<Buffer>}
		 */
		async fetch(url, options) {
			if (config.enableRequestLogging) {
				console.log('ResourceLoader request for url:', url);
			}

			const moduleResource = moduleResources.find(
				m => `${jsdomUrl}/${m.filename}` === url
			);

			// If the request matches one of the registered node_module bundles
			// then serve it from the file system.
			if (moduleResource) {
				return fs.promises.readFile(
					getPathToModuleFile(
						moduleResource.moduleName,
						moduleResource.directoryName,
						moduleResource.filename
					)
				);
			}

			// Fallback to default resource fetching behavior.
			return super.fetch(url, options);
		}
	})();
}

/**
 * Get the path to a file in the specified module.
 *
 * @param {string} moduleName The NPM module name.
 * @param {string} directoryName Directory in the module where the target file resides.
 * @param {string} filename The target filename.
 * @returns {string}
 */
function getPathToModuleFile(moduleName, directoryName, filename) {
	const moduleDir = pkgDir.sync(require.resolve(moduleName));
	const filePath = path.join(moduleDir, directoryName, filename);

	if (!fs.existsSync(filePath)) {
		throw new Error(`Unable to acquire file from library: ${filename}`);
	}

	return filePath;
}

/**
 * Create a Fetch API interceptor which provides the contents of the web worker
 * and wasm files from node_modules. Other web requests are handled normally.
 *
 * @param {ImageMagickInstanceOptions} config
 */
function createFetchInterceptor(config) {
	const webWorkerScriptSrc = fs.readFileSync(
		getPathToModuleFile('wasm-imagemagick', 'dist', 'magick.js'),
		'utf8'
	);

	// A mock Fetch response with the web worker script contents.
	const webWorkerScriptResponseLike = Promise.resolve({
		ok: true,
		text: () => Promise.resolve(webWorkerScriptSrc)
	});

	const wasmSrc = fs.readFileSync(
		getPathToModuleFile('wasm-imagemagick', 'dist', 'magick.wasm'),
		'binary'
	);

	// A mock Fetch response with the wasm file contents.
	const wasmSrcResponseLike = Promise.resolve({
		ok: true,
		arrayBuffer: () => Buffer.from(wasmSrc, 'binary')
	});

	/**
	 * @param {Parameters<typeof fetch>[0]} input
	 * @param {Parameters<typeof fetch>[1]} [init]
	 */
	const fetchInterceptor = (input, init) => {
		if (config.enableRequestLogging) {
			console.log('fetchInterceptor: url:', input);
		}

		if (input === 'magick.js') {
			return webWorkerScriptResponseLike;
		} else if (input === 'magick.wasm') {
			return wasmSrcResponseLike;
		}

		return fetch(input, init);
	};

	return fetchInterceptor;
}

module.exports = {
	createImageMagickInstance
}