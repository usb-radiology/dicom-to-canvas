
import * as fs from "fs";
import * as dicomParser from 'dicom-parser';
import * as canvas from 'canvas';

import getVOILut from './getVOILut';

function createCanvas(dicomFilePath: string) {

  let dicomFileAsBuffer = fs.readFileSync(dicomFilePath);
  let dataSet = dicomParser.parseDicom(dicomFileAsBuffer);
  let tags = dicomParser.explicitDataSetToJS(dataSet);

  let w = parseInt(tags['x00280011']);   // width
  let h = parseInt(tags['x00280010']);   // height
  let invert = tags['x00280004'] === 'MONOCHROME1' ? true : false;   // whether the image is inverted
  let windowCenter = parseInt(tags['x00281050']);   // window center
  let windowWidth = parseInt(tags['x00281051']);   // window width

  let pixelData = dataSet.elements.x7fe00010;
  let pixelDataBuffer = dicomParser.sharedCopy(dicomFileAsBuffer, pixelData.dataOffset, pixelData.length);

  // create canvas
  const cv = canvas.createCanvas(w, h);

  const ctx = cv.getContext('2d', { pixelFormat: 'A8' })    // Grayscale image
  const uint16 = new Uint16Array(pixelDataBuffer.buffer, pixelDataBuffer.byteOffset, pixelDataBuffer.byteLength / Uint16Array.BYTES_PER_ELEMENT);   // Get the pixel array of uint16
  let voiLUT;
  const lut = getLut(uint16, windowWidth, windowCenter, invert, voiLUT); // Get grayscale array
  const uint8 = new Uint8ClampedArray(uint16.length);   // Eight bit grayscale pixel array
  
  // Replace the corresponding pixels with grayscale
  for (let i = 0, len = uint16.length; i < len; i++) {
    uint8[i] = lut.lutArray[uint16[i]];
  }

  const image = canvas.createImageData(uint8, w, h);
  ctx.putImageData(image, 0, 0);

  return cv;
}

function getLut(data: Uint16Array, windowWidth: number, windowCenter: number, invert: boolean, voiLUT: any) {
  let minPixelValue = 0;
  let maxPixelValue = 0;
  for (let i = 0, len = data.length; i < len; i++) {
    if (minPixelValue > data[i]) {
      minPixelValue = data[i];
    }
    if (maxPixelValue < data[i]) {
      maxPixelValue = data[i];
    }
  }
  let offset = Math.min(minPixelValue, 0);
  let lutArray = new Uint8ClampedArray(maxPixelValue - offset + 1);
  const vlutfn = getVOILut(windowWidth, windowCenter, voiLUT, true);
  if (invert === true) {
    for (let storedValue = minPixelValue; storedValue <= maxPixelValue; storedValue++) {
      lutArray[storedValue + (-offset)] = 255 - vlutfn(storedValue);
    }
  } else {
    for (let storedValue = minPixelValue; storedValue <= maxPixelValue; storedValue++) {
      lutArray[storedValue + (-offset)] = vlutfn(storedValue);
    }
  }
  return {
    minPixelValue: minPixelValue,
    maxPixelValue: maxPixelValue,
    lutArray: lutArray,
  };
}

export { createCanvas };