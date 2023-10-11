// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Get a number for a length in the shortest BER/DER definite form.
 * @param { number[] } length
 * @example
 * // Returns 435
 * DigitalSeal.derLengthToLength([130, 1, 179]);
 */
export function derLengthToLength(length) {
  if (length[0] < 128) {
    return length[0];
  } else {
    if (length.length > 5) {
      throw new RangeError(
        "The definite long-form length value for this TLV is too big for " +
            "the context of ICAO 9303 Digital Seals."
      );
    }
    const NUM_OCTETS_STRING = length[0].toString(2);
    const NUM_OCTETS = parseInt(`0${NUM_OCTETS_STRING.slice(1)}`, 2);
    const lengthArray = length.slice(1, NUM_OCTETS + 1);
    let outputString = "";
    lengthArray.forEach((byte) => {
      outputString += byte.toString(2).padStart(8, "0");
    });
    return parseInt(outputString, 2);
  }
}
