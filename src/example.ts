import * as fs from "fs";
import * as path from "path";
import * as canvas from "canvas";
import { createCanvas } from "./dicom-to-canvas";

const dicomFilePath = "/media/vic/ddd/data.rapmed.net/dicom/case-of-the-day/010-Open_Book/010-Open_Book.dcm";

async function main() {

  const { dir, name } = path.parse(dicomFilePath);
  const uuid = path.join(dir, name);

  const pngFilePath = uuid + ".png";
  const jpegFilePath = uuid + ".jpg";

  const cv = createCanvas(dicomFilePath);

  const pngStream = createPngStream(cv);
  fs.writeFileSync(pngFilePath, pngStream.read());
  console.log(`created ${pngFilePath}`);

  /*
  await createJpegAsync(cv, jpegFilePath);
  console.log(`created ${jpegFilePath}`);
  */

  /*
  const jpegStream = createJpegStream(cv);
  fs.writeFileSync(jpegFilePath, jpegStream.read());
  */
}


function createPngStream(cv: canvas.Canvas) {
  const stream = cv.createPNGStream({ compressionLevel: 6, filters: cv.PNG_FILTER_NONE });
  return stream;
}

function createJpegStream(cv: canvas.Canvas) {
  const stream = cv.createJPEGStream({ quality: 0.8 });
  return stream;
}

async function createJpegAsync(cv: canvas.Canvas, outputFilePath: string) {
  const u = cv.toDataURL("image/jpeg");
  const Image = canvas.Image;
  const img = new Image();
  img.src = u;

  img.onerror = err => { throw err };
  img.onload = () => {
    try {
      let ca = canvas.createCanvas(img.width, img.height);
      let ctx = ca.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const stream = ca.createJPEGStream();
      fs.writeFileSync(outputFilePath, stream.read());
    } catch (err) {
      console.error(err);
    }
  };
}

main();

export { }