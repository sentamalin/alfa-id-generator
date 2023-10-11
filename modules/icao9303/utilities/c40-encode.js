// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { C40SHIFT1 } from "./c40-shift1.js";

/**
 * Encode a string using the C40 encoding scheme defined in ICAO 9303 part 13,
 *     which adds the use of the filler character '<' in the encoding scheme,
 *     into a number array.
 * @param { string } string - A string containing only A-Z, 0-9, <SPACE>, and
 *     the symbol '<'.
 * @example
 * // Returns [235, 4, 102, 169]
 * c40Encode("XK CD");
 */
export function c40Encode(string) {
  const output = [];
  let i16;
  let u1 = null;
  let u2 = null;
  let u3 = null;
  [...string].forEach((character, i) => {
    if (u1 === null && ((string.length - (i + 1)) === 0)) {
      output.push(0xFE);
      output.push(charToDataMatrixASCII(character));
    } else if (u1 === null) {
      u1 = charToC40(character);
    } else if (u2 === null) {
      u2 = charToC40(character);
      if ((string.length - (i + 1)) === 0) {
        u3 = charToC40(C40SHIFT1);
        i16 = (1600 * u1) + (40 * u2) + u3 + 1;
        output.push(Math.floor(i16 / 256));
        output.push(i16 % 256);
        i16 = null;
        u1 = null;
        u2 = null;
        u3 = null;
      }
    } else {
      u3 = charToC40(character);
      i16 = (1660 * u1) + (40 * u2) + u3 + 1;
      output.push(Math.floor(i16 / 256));
      output.push(i16 % 256);
      i16 = null;
      u1 = null;
      u2 = null;
      u3 = null;
    }
  });
  return output;
}

/**
 * Get the corresponding C40 value for a character.
 * @param { string | C40SHIFT1 } char - A-Z, 0-9, <SPACE>, the
 *     symbol '<', or `C40SHIFT1`.
 * @example
 * // Returns 17
 * charToC40("D");
 */
function charToC40(char) {
  if (char !== C40SHIFT1) {
    if (char.length !== 1) {
      throw new RangeError(
        "Input must be a string of one character or SHIFT1 " +
            "(C40SHIFT1)."
      );
    }
  }
  if (char === C40SHIFT1) {
    return 0;
  }
  else {
    switch (char.toUpperCase()) {
      case " ":
      case "<":
        return 3;
      case "0":
        return 4;
      case "1":
        return 5;
      case "2":
        return 6;
      case "3":
        return 7;
      case "4":
        return 8;
      case "5":
        return 9;
      case "6":
        return 10;
      case "7":
        return 11;
      case "8":
        return 12;
      case "9":
        return 13;
      case "A":
        return 14;
      case "B":
        return 15;
      case "C":
        return 16;
      case "D":
        return 17;
      case "E":
        return 18;
      case "F":
        return 19;
      case "G":
        return 20;
      case "H":
        return 21;
      case "I":
        return 22;
      case "J":
        return 23;
      case "K":
        return 24;
      case "L":
        return 25;
      case "M":
        return 26;
      case "N":
        return 27;
      case "O":
        return 28;
      case "P":
        return 29;
      case "Q":
        return 30;
      case "R":
        return 31;
      case "S":
        return 32;
      case "T":
        return 33;
      case "U":
        return 34;
      case "V":
        return 35;
      case "W":
        return 36;
      case "X":
        return 37;
      case "Y":
        return 38;
      case "Z":
        return 39;
      default:
        throw new TypeError(
          "Characters in Digital Seals may only contain the characters 0-9," +
              "A-Z, <SPACE>, the symbol '<', or SHIFT1 " +
              "(C40SHIFT1)."
        );
    }
  }
}

/**
   * Get the corresponding DataMatrix ASCII value for a character.
   * @param { string } char - A-Z, 0-9, <SPACE>, or the symbol '<'.
   * @example
   * // Returns 69
   * charToDataMatrixASCII("D");
   */
function charToDataMatrixASCII(char) {
  if (char.length !== 1) {
    throw new RangeError(
      "Input must be one character containing 0-9, A-Z, <SPACE>, or the " +
          "symbol '<'."
    );
  }
  switch (char.toUpperCase()) {
    case " ":
    case "<":
      return 33;
    case "0":
      return 49;
    case "1":
      return 50;
    case "2":
      return 51;
    case "3":
      return 52;
    case "4":
      return 53;
    case "5":
      return 54;
    case "6":
      return 55;
    case "7":
      return 56;
    case "8":
      return 57;
    case "9":
      return 58;
    case "A":
      return 66;
    case "B":
      return 67;
    case "C":
      return 68;
    case "D":
      return 69;
    case "E":
      return 70;
    case "F":
      return 71;
    case "G":
      return 72;
    case "H":
      return 73;
    case "I":
      return 74;
    case "J":
      return 75;
    case "K":
      return 76;
    case "L":
      return 77;
    case "M":
      return 78;
    case "N":
      return 79;
    case "O":
      return 80;
    case "P":
      return 81;
    case "Q":
      return 82;
    case "R":
      return 83;
    case "S":
      return 84;
    case "T":
      return 85;
    case "U":
      return 86;
    case "V":
      return 87;
    case "W":
      return 88;
    case "X":
      return 89;
    case "Y":
      return 90;
    case "Z":
      return 91;
    default:
      throw new TypeError(
        "Characters in Digital Seals may only contain the characters 0-9, " +
            "A-Z, <SPACE>, or the symbol '<'."
      );
  }
}
