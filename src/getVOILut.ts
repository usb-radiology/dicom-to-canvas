/* eslint no-bitwise: 0 */

/**
 * Volume of Interest Lookup Table Function
 *
 * @typedef {Function} VOILUTFunction
 *
 * @param {Number} modalityLutValue
 * @returns {Number} transformed value
 * @memberof Objects
 */

function generateLinearVOILUT(windowWidth: number, windowCenter: number) {
  return function (modalityLutValue) {
    return ((modalityLutValue - windowCenter) / windowWidth + 0.5) * 255.0;
  };
}

/**
 * Generate a non-linear volume of interest lookup table
 *
 */
function generateNonLinearVOILUT(voiLUT: any /* LUT */, roundModalityLUTValues: boolean) {
  // We don't trust the voiLUT.numBitsPerEntry, mainly thanks to Agfa!
  const bitsPerEntry = Math.max(...voiLUT.lut).toString(2).length;
  const shift = bitsPerEntry - 8;
  const minValue = voiLUT.lut[0] >> shift;
  const maxValue = voiLUT.lut[voiLUT.lut.length - 1] >> shift;
  const maxValueMapped = voiLUT.firstValueMapped + voiLUT.lut.length - 1;

  return function (modalityLutValue) {
    if (modalityLutValue < voiLUT.firstValueMapped) {
      return minValue;
    } else if (modalityLutValue >= maxValueMapped) {
      return maxValue;
    }
    if (roundModalityLUTValues) {
      return voiLUT.lut[Math.round(modalityLutValue) - voiLUT.firstValueMapped] >> shift;
    }

    return voiLUT.lut[modalityLutValue - voiLUT.firstValueMapped] >> shift;
  };
}

/**
 * Retrieve a VOI LUT mapping function given the current windowing settings
 * and the VOI LUT for the image
 */
export default function (windowWidth: number, windowCenter: number, voiLUT: any /* LUT */, roundModalityLUTValues: boolean) {
  if (voiLUT) {
    return generateNonLinearVOILUT(voiLUT, roundModalityLUTValues);
  }

  return generateLinearVOILUT(windowWidth, windowCenter);
}
