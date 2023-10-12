// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Get a length in the shortest BER/DER definite form for a number.
 * @param { number } length
 * @example
 * // Returns [130, 1, 179]
 * DigitalSeal.lengthToDERLength(435);
 */
export function lengthToDERLength(length) {
  if (length < 128) {
    return [length];
  } else {
    const output = [];
    let base2 = length.toString(2);
    if (base2.length % 8 !== 0) {
      base2 = base2.padStart((Math.floor(base2.length / 8) + 1) * 8, "0");
    }
    if (base2.length / 8 > 4) {
      throw new RangeError(
        "The definite long-form length value for this TLV is too big for " +
            "the context of ICAO 9303 Digital Seals."
      );
    }
    output.push(
      parseInt(`1${(base2.length / 8).toString(2).padStart(7, "0")}`, 2)
    );
    const b = [0, 0, 0, 0, 0, 0, 0, 0];
    [...base2].forEach((bit, i) => {
      b[i % 8] = bit;
      if ((i + 1) % 8 === 0) {
        output.push(parseInt(
          `${b[0]}${b[1]}${b[2]}${b[3]}${b[4]}${b[5]}${b[6]}${b[7]}`, 2
        ));
      }
    });
    return output;
  }
}
