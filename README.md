# dicom-to-canvas

If you are looking to convert dicom images to jpeg or png on the server using Node.js then this package allows you to convert dicom pixel data into a `canvas` object. Creating respective images from the `canvas` object is very straightforward.

## api

Take a dicom file and return the canvas with the image: `createCanvas(filePath: string): canvas`.

## example

The following example takes a provided dicom at `/path/to/dicom/example.dcm` and outputs `/path/to/dicom/example.jpg`, `/path/to/dicom/example.png`:

```js
import * as fs from "fs";
import * as path from "path";
import * as canvas from "canvas";
import { createCanvas } from "./dicom-to-canvas";

const dicomFilePath = "/path/to/dicom/example.dcm";

async function main() {

  const { dir, name } = path.parse(dicomFilePath);
  const uuid = path.join(dir, name);

  const pngFilePath = uuid + ".png";
  const jpegFilePath = uuid + ".jpg";

  const cv = createCanvas(dicomFilePath);

  const pngStream = createPngStream(cv);
  fs.writeFileSync(pngFilePath, pngStream.read());
  console.log(`created ${pngFilePath}`);
  
  const jpegStream = createJpegStream(cv);
  fs.writeFileSync(jpegFilePath, jpegStream.read());
  console.log(`created ${jpegFilePath}`);
}


function createPngStream(cv: canvas.Canvas) {
  const stream = cv.createPNGStream({ compressionLevel: 6, filters: cv.PNG_FILTER_NONE });
  return stream;
}

function createJpegStream(cv: canvas.Canvas) {
  const stream = cv.createJPEGStream({ quality: 0.8 });
  return stream;
}

main();

export { }
```

## Credits

Many thanks go to the team at https://github.com/cornerstonejs for the wonderful viewer and all associated dicom utilities.

## License

MIT