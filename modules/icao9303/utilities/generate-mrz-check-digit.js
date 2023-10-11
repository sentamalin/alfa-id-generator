// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Generate a check digit for a Machine-Readable Zone (MRZ) string.
 * @param { string } string
 * @example
 * // Returns "9"
 * generateMRZCheckDigit("362142069");
 */
export function generateMRZCheckDigit(string) {
  const weight = [7, 3, 1];
  let value = 0;
  [...string].forEach((character, i) => {
    let currentValue;
    const CURRENT_WEIGHT = weight[i % 3];
    switch (character) {
      case " ":
        // Fall Through
      case "<":
        // Fall Through
      case "0":
        currentValue = 0;
        break;
      case "1":
        currentValue = 1;
        break;
      case "2":
        currentValue = 2;
        break;
      case "3":
        currentValue = 3;
        break;
      case "4":
        currentValue = 4;
        break;
      case "5":
        currentValue = 5;
        break;
      case "6":
        currentValue = 6;
        break;
      case "7":
        currentValue = 7;
        break;
      case "8":
        currentValue = 8;
        break;
      case "9":
        currentValue = 9;
        break;
      case "A":
        currentValue = 10;
        break;
      case "B":
        currentValue = 11;
        break;
      case "C":
        currentValue = 12;
        break;
      case "D":
        currentValue = 13;
        break;
      case "E":
        currentValue = 14;
        break;
      case "F":
        currentValue = 15;
        break;
      case "G":
        currentValue = 16;
        break;
      case "H":
        currentValue = 17;
        break;
      case "I":
        currentValue = 18;
        break;
      case "J":
        currentValue = 19;
        break;
      case "K":
        currentValue = 20;
        break;
      case "L":
        currentValue = 21;
        break;
      case "M":
        currentValue = 22;
        break;
      case "N":
        currentValue = 23;
        break;
      case "O":
        currentValue = 24;
        break;
      case "P":
        currentValue = 25;
        break;
      case "Q":
        currentValue = 26;
        break;
      case "R":
        currentValue = 27;
        break;
      case "S":
        currentValue = 28;
        break;
      case "T":
        currentValue = 29;
        break;
      case "U":
        currentValue = 30;
        break;
      case "V":
        currentValue = 31;
        break;
      case "W":
        currentValue = 32;
        break;
      case "X":
        currentValue = 33;
        break;
      case "Y":
        currentValue = 34;
        break;
      case "Z":
        currentValue = 35;
        break;
      default:
        throw new TypeError(
          `Character '${character}' is not a valid character in the MRZ.`
        );
    }
    value += currentValue * CURRENT_WEIGHT;
  });
  return (value % 10).toString();
}
