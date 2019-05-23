const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	entry: {
		index: './web/index.js',
	},
	output: {
		filename: '[name].[hash].bundle.js',
		path: path.join(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.(png|raw)$/,
				use: 'file-loader',
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'web/index.html')
		}),
		new CopyPlugin([
			{
				from: path.join(__dirname, 'node_modules/wasm-imagemagick/dist/magick.*'),
				to: path.join(__dirname, 'dist'),
				flatten: true
			}
		])
	]
}