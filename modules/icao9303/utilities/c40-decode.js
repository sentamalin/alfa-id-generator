// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { C40SHIFT1 } from "./c40-shift1.js";

/**
 * Decode a C40-encoded number array as defined in ICAO 9303 part 13 into a
 *     string. 
 * @param { number[] } c40
 * @example
 * // Returns "XKCD"
 * c40Decode([235, 17, 254, 69]);
 */
export function c40Decode(c40) {
  let output = "";
  let i1 = null;
  let i2 = null;
  c40.forEach((byte) => {
    if (i1 === null) {
      i1 = byte;
    } else {
      if (i1 === parseInt("0xFE")) {
        output += dataMatrixASCIIToChar(byte);
      } else {
        i2 = byte;
        const I16 = (i1 * 256) + i2;
        const U1 = Math.floor((I16 - 1) / 1600);
        const U2 = Math.floor((I16 - (U1 * 1600) - 1) / 40);
        const U3 = I16 - (U1 * 1600) - (U2 * 40) - 1;
        output += c40ToChar(U1);
        output += c40ToChar(U2);
        if (c40ToChar(U3) !== C40SHIFT1) {
          output += c40ToChar(U3);
        }
      }
      i1 = null;
      i2 = null;
    }
  });
  return output;
}

/**
 * Get the corresponding character for a C40 value.
 * @param { number } char - A number in the range of 0-39.
 * @example
 * // Returns "D"
 * c40ToChar(17);
 */
function c40ToChar(char) {
  switch (char) {
    case 0:
      return C40SHIFT1;
    case 3:
      return " ";
    case 4:
      return "0";
    case 5:
      return "1";
    case 6:
      return "2";
    case 7:
      return "3";
    case 8:
      return "4";
    case 9:
      return "5";
    case 10:
      return "6";
    case 11:
      return "7";
    case 12:
      return "8";
    case 13:
      return "9";
    case 14:
      return "A";
    case 15:
      return "B";
    case 16:
      return "C";
    case 17:
      return "D";
    case 18:
      return "E";
    case 19:
      return "F";
    case 20:
      return "G";
    case 21:
      return "H";
    case 22:
      return "I";
    case 23:
      return "J";
    case 24:
      return "K";
    case 25:
      return "L";
    case 26:
      return "M";
    case 27:
      return "N";
    case 28:
      return "O";
    case 29:
      return "P";
    case 30:
      return "Q";
    case 31:
      return "R";
    case 32:
      return "S";
    case 33:
      return "T";
    case 34:
      return "U";
    case 35:
      return "V";
    case 36:
      return "W";
    case 37:
      return "X";
    case 38:
      return "Y";
    case 39:
      return "Z";
    default:
      throw new RangeError(
        "A C40 value in Digital Seals must be 0 or in the range of 3-39."
      );
  }
}

/**
 * Get the corresponding character for a DataMatrix ASCII value.
 * @param { number } char - 33, 49-58, or 66-91.
 * @example
 * // Returns "D"
 * dataMatrixASCIIToChar(69);
 */
function dataMatrixASCIIToChar(char) {
  switch (char) {
    case 33:
      return " ";
    case 49:
      return "0";
    case 50:
      return "1";
    case 51:
      return "2";
    case 52:
      return "3";
    case 53:
      return "4";
    case 54:
      return "5";
    case 55:
      return "6";
    case 56:
      return "7";
    case 57:
      return "8";
    case 58:
      return "9";
    case 66:
      return "A";
    case 67:
      return "B";
    case 68:
      return "C";
    case 69:
      return "D";
    case 70:
      return "E";
    case 71:
      return "F";
    case 72:
      return "G";
    case 73:
      return "H";
    case 74:
      return "I";
    case 75:
      return "J";
    case 76:
      return "K";
    case 77:
      return "L";
    case 78:
      return "M";
    case 79:
      return "N";
    case 80:
      return "O";
    case 81:
      return "P";
    case 82:
      return "Q";
    case 83:
      return "R";
    case 84:
      return "S";
    case 85:
      return "T";
    case 86:
      return "U";
    case 87:
      return "V";
    case 88:
      return "W";
    case 89:
      return "X";
    case 90:
      return "Y";
    case 91:
      return "Z";
    default:
      throw new RangeError(
        "A DataMatrix ASCII value in Digital Seals must be 33, 49-58, or " +
            "66-91."
      );
  }
}
