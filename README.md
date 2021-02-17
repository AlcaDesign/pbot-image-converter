# PixelBot Image Converter

A Node.js package and CLI tool to convert images into commands to control
[Laboratory424][lab424]'s chat-enabled LED matrix display.

## Install

- Install [Node.js][njs] on your system.
- Install [ImageMagick][im] on your system and add it to your environment path.
- Git clone the repository and change into the directory:

```bash
$ git clone git@github.com:AlcaDesign/pbot-image-converter.git
$ cd pbot-image-converter
```

## Usage

### CLI

```bash
$ node cli.js <url>
<resulting Twitch command>
```

### Package

```js
const pbot = require('pbot-image-converter');
```

## Useful ImageMagick commands

### Update palette raw

```bash
$ convert ./assets/pb-palette.png RGBA:./assets/palette.raw
```

## Browser Build

* Start development server: `npm run start`
* Build: `npm run build`

## TODO

- Skip using the file system. See ["Command-line Processing"][clp] on
	imagemagick.org
- Add detailed documents on how to use as a library.


[lab424]: https://twitch.tv/laboratory424
[njs]: https://nodejs.org
[im]: https://imagemagick.org/
[clp]: https://imagemagick.org/script/command-line-processing.php