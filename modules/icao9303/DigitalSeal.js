/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

class DigitalSeal {
  static c40Encode(string) {}
  static c40Decode(string) {}
  /** @param { string } char */
  static charToC40(char) {
    let output;
    switch (char.toUpperCase()) {
      case "SHIFT1":
        output = 0;
        break;
      case " ":
      case "<":
        output = 3;
        break;
      case "0":
        output = 4;
        break;
      case "1":
        output = 5;
        break;
      case "2":
        output = 6;
        break;
      case "3":
        output = 7;
        break;
      case "4":
        output = 8;
        break;
      case "5":
        output = 9;
        break;
      case "6":
        output = 10;
        break;
      case "7":
        output = 11;
        break;
      case "8":
        output = 12;
        break;
      case "9":
        output = 13;
        break;
      case "A":
        output = 14;
        break;
      case "B":
        output = 15;
        break;
      case "C":
        output = 16;
        break;
      case "D":
        output = 17;
        break;
      case "E":
        output = 18;
        break;
      case "F":
        output = 19;
        break;
      case "G":
        output = 20;
        break;
      case "H":
        output = 21;
        break;
      case "I":
        output = 22;
        break;
      case "J":
        output = 23;
        break;
      case "K":
        output = 24;
        break;
      case "L":
        output = 25;
        break;
      case "M":
        output = 26;
        break;
      case "N":
        output = 27;
        break;
      case "O":
        output = 28;
        break;
      case "P":
        output = 29;
        break;
      case "Q":
        output = 30;
        break;
      case "R":
        output = 31;
        break;
      case "S":
        output = 32;
        break;
      case "T":
        output = 33;
        break;
      case "U":
        output = 34;
        break;
      case "V":
        output = 35;
        break;
      case "W":
        output = 36;
        break;
      case "X":
        output = 37;
        break;
      case "Y":
        output = 38;
        break;
      case "Z":
        output = 39;
        break;
      default:
        throw new TypeError(
          "Characters in Digital Seals may only contain the characters 0-9, A-Z, <SPACE>, and the symbol '<'."
        );
    }
    return output;
  }
  /** @param { number } char  */
  static c40ToChar(char) {
    let output;
    switch (char) {
      case 0:
        output = "SHIFT1";
        break;
      case 3:
        output = " ";
        break;
      case 4:
        output = "0";
        break;
      case 5:
        output = "1";
        break;
      case 6:
        output = "2";
        break;
      case 7:
        output = "3";
        break;
      case 8:
        output = "4";
        break;
      case 9:
        output = "5";
        break;
      case 10:
        output = "6";
        break;
      case 11:
        output = "7";
        break;
      case 12:
        output = "8";
        break;
      case 13:
        output = "9";
        break;
      case 14:
        output = "A";
        break;
      case 15:
        output = "B";
        break;
      case 16:
        output = "C";
        break;
      case 17:
        output = "D";
        break;
      case 18:
        output = "E";
        break;
      case 19:
        output = "F";
        break;
      case 20:
        output = "G";
        break;
      case 21:
        output = "H";
        break;
      case 22:
        output = "I";
        break;
      case 23:
        output = "J";
        break;
      case 24:
        output = "K";
        break;
      case 25:
        output = "L";
        break;
      case 26:
        output = "M";
        break;
      case 27:
        output = "N";
        break;
      case 28:
        output = "O";
        break;
      case 29:
        output = "P";
        break;
      case 30:
        output = "Q";
        break;
      case 31:
        output = "R";
        break;
      case 32:
        output = "S";
        break;
      case 33:
        output = "T";
        break;
      case 34:
        output = "U";
        break;
      case 35:
        output = "V";
        break;
      case 36:
        output = "W";
        break;
      case 37:
        output = "X";
        break;
      case 38:
        output = "Y";
        break;
      case 39:
        output = "Z";
        break;
      default:
        throw new RangeError(
          "A C40 value in Digital Seals must be in the range of 3-39."
        );
    }
    return output;
  }
  /** @param { string } char */
  static charToDataMatrixASCII(char) {
    if (char.length !== "1") {
      throw new RangeError(
        "Input must be one character containing 0-9, A-Z, <SPACE>, and the symbol '<'."
      );
    }
    let output;
    switch (char.toUpperCase()) {
      case " ":
      case "<":
        output = 33;
        break;
      case "0":
        output = 49;
        break;
      case "1":
        output = 50;
        break;
      case "2":
        output = 51;
        break;
      case "3":
        output = 52;
        break;
      case "4":
        output = 53;
        break;
      case "5":
        output = 54;
        break;
      case "6":
        output = 55;
        break;
      case "7":
        output = 56;
        break;
      case "8":
        output = 57;
        break;
      case "9":
        output = 58;
        break;
      case "A":
        output = 66;
        break;
      case "B":
        output = 67;
        break;
      case "C":
        output = 68;
        break;
      case "D":
        output = 69;
        break;
      case "E":
        output = 70;
        break;
      case "F":
        output = 71;
        break;
      case "G":
        output = 72;
        break;
      case "H":
        output = 73;
        break;
      case "I":
        output = 74;
        break;
      case "J":
        output = 75;
        break;
      case "K":
        output = 76;
        break;
      case "L":
        output = 77;
        break;
      case "M":
        output = 78;
        break;
      case "N":
        output = 79;
        break;
      case "O":
        output = 80;
        break;
      case "P":
        output = 81;
        break;
      case "Q":
        output = 82;
        break;
      case "R":
        output = 83;
        break;
      case "S":
        output = 84;
        break;
      case "T":
        output = 85;
        break;
      case "U":
        output = 86;
        break;
      case "V":
        output = 87;
        break;
      case "W":
        output = 88;
        break;
      case "X":
        output = 89;
        break;
      case "Y":
        output = 90;
        break;
      case "Z":
        output = 91;
        break;
      default:
        throw new TypeError(
          "Characters in Digital Seals may only contain the characters 0-9, A-Z, <SPACE>, and the symbol '<'."
        );
    }
    return output;
  }
  /** @param { number } char */
  static dataMatrixASCIIToChar(char) {
    let output;
    switch (char) {
      case 33:
        output = " ";
        break;
      case 49:
        output = "0";
        break;
      case 50:
        output = "1";
        break;
      case 51:
        output = "2";
        break;
      case 52:
        output = "3";
        break;
      case 53:
        output = "4";
        break;
      case 54:
        output = "5";
        break;
      case 55:
        output = "6";
        break;
      case 56:
        output = "7";
        break;
      case 57:
        output = "8";
        break;
      case 58:
        output = "9";
        break;
      case 66:
        output = "A";
        break;
      case 67:
        output = "B";
        break;
      case 68:
        output = "C";
        break;
      case 69:
        output = "D";
        break;
      case 70:
        output = "E";
        break;
      case 71:
        output = "F";
        break;
      case 72:
        output = "G";
        break;
      case 73:
        output = "H";
        break;
      case 74:
        output = "I";
        break;
      case 75:
        output = "J";
        break;
      case 76:
        output = "K";
        break;
      case 77:
        output = "L";
        break;
      case 78:
        output = "M";
        break;
      case 79:
        output = "N";
        break;
      case 80:
        output = "O";
        break;
      case 81:
        output = "P";
        break;
      case 82:
        output = "Q";
        break;
      case 83:
        output = "R";
        break;
      case 84:
        output = "S";
        break;
      case 85:
        output = "T";
        break;
      case 86:
        output = "U";
        break;
      case 87:
        output = "V";
        break;
      case 88:
        output = "W";
        break;
      case 89:
        output = "X";
        break;
      case 90:
        output = "Y";
        break;
      case 91:
        output = "Z";
        break;
      default:
        throw new RangeError(
          "A DataMatrix ASCII value in Digital Seals must be 33, 49-58, or 66-91."
        );
    }
    return output;
  }
}

export { DigitalSeal };