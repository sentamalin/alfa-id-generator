/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

class DigitalSeal {
  static #c40SHIFT1 = Symbol("c40SHIFT1");
  static get c40SHIFT1() { return this.#c40SHIFT1; }
  static get magic() { return 0xDC; }
  authority;
  identifier;
  certReference;
  issueDate;
  signatureDate;
  featureDefinition;
  typeCategory;
  features = [];
  static get signatureMagic() { return 0xFF; }
  signature;

  /** @param { string } string */
  static c40Encode(string) {
    let output = [];
    let i16, u1 = null, u2 = null, u3 = null;
    for (let i = 0; i < string.length; i += 1) {
      if (u1 === null && ((string.length - (i + 1)) === 0)) {
        output.push(0xFE);
        output.push(DigitalSeal.#charToDataMatrixASCII(string[i]));
      } else if (u1 === null) {
        u1 = DigitalSeal.#charToC40(string[i]);
      } else if (u2 === null) {
        u2 = DigitalSeal.#charToC40(string[i]);
        if ((string.length - (i + 1)) === 0) {
          u3 = DigitalSeal.#charToC40(DigitalSeal.c40SHIFT1);
          i16 = (1600 * u1) + (40 * u2) + u3 + 1;
          output.push(Math.floor(i16 / 256));
          output.push(i16 % 256);
        }
      } else {
        u3 = DigitalSeal.#charToC40(string[i]);
        i16 = (1600 * u1) + (40 * u2) + u3 + 1;
        output.push(Math.floor(i16 / 256));
        output.push(i16 % 256);
        i16 = null, u1 = null, u2 = null, u3 = null;
      }
    }
    return output;
  }
  /** @param { number[] } c40 */
  static c40Decode(c40) {
    let output = "";
    let i1 = null, i2 = null;
    for (let i = 0; i < c40.length; i += 1) {
      if (i1 === null) {
        i1 = c40[i];
      } else {
        if (i1 === parseInt("0xFE")) {
          output += DigitalSeal.#dataMatrixASCIIToChar(c40[i]);
        }
        else {
          i2 = c40[i];
          const i16 = (i1 * 256) + i2;
          const u1 = Math.floor((i16 - 1) / 1600);
          const u2 = Math.floor((i16 - (u1 * 1600) -1) / 40);
          const u3 = i16 - (u1 * 1600) - (u2 * 40) - 1;
          output += DigitalSeal.#c40ToChar(u1);
          output += DigitalSeal.#c40ToChar(u2);
          if (DigitalSeal.#c40ToChar(u3) !== DigitalSeal.c40SHIFT1) {
            output += DigitalSeal.#c40ToChar(u3);
          }
        }
        i1 = null, i2 = null;
      }
    }
    return output;
  }
  /** @param { string | DigitalSeal.c40SHIFT1 } char */
  static #charToC40(char) {
    if (char !== DigitalSeal.c40SHIFT1) {
      if (char.length !== 1) {
        throw new RangeError(
          "Input must be a string of one character or SHIFT1 (DigitalSeal.c40SHIFT1)."
        );
      }
    }
    let output;
    if (char === DigitalSeal.c40SHIFT1) {
      output = 0;
    }
    else {
      switch (char.toUpperCase()) {
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
            "Characters in Digital Seals may only contain the characters 0-9, A-Z, <SPACE>, the symbol '<', or SHIFT1 (DigitalSeal.c40SHIFT1)."
          );
      }
    }
    return output;
  }
  /** @param { number } char  */
  static #c40ToChar(char) {
    let output;
    switch (char) {
      case 0:
        output = DigitalSeal.c40SHIFT1;
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
          "A C40 value in Digital Seals must be 0 or in the range of 3-39."
        );
    }
    return output;
  }
  /** @param { string } char */
  static #charToDataMatrixASCII(char) {
    if (char.length !== 1) {
      throw new RangeError(
        "Input must be one character containing 0-9, A-Z, <SPACE>, or the symbol '<'."
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
          "Characters in Digital Seals may only contain the characters 0-9, A-Z, <SPACE>, or the symbol '<'."
        );
    }
    return output;
  }
  /** @param { number } char */
  static #dataMatrixASCIIToChar(char) {
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
  /** @param { Date } date */
  static dateToBytes(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const dateInteger = `${month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}${year}`;
    const base2 = parseInt(dateInteger, 10).toString(2).padStart(24, "0");
    const output = [], b = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < base2.length; i += 1) {
      b[i % 8] = base2[i];
      if ((i + 1) % 8 === 0) {
        output.push(parseInt(
          `${b[0]}${b[1]}${b[2]}${b[3]}${b[4]}${b[5]}${b[6]}${b[7]}`, 2
        ));
      }
    }
    return output;
  }
  /** @param { number[] } date */
  static bytesToDate(date) {
    let base2 = "";
    for (let i = 0; i < date.length; i += 1) {
      const byteString = date[i].toString(2).padStart(8, "0");
      base2 += byteString;
    }
    const dateIntegerString = parseInt(base2, 2).toString(10).padStart(8, "0");
    const month = dateIntegerString.slice(0, 2);
    const day = dateIntegerString.slice(2, 4);
    const year = dateIntegerString.slice(4);
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }
  /** @param { number } number */
  static intToDER(number) {
    let output = [];
    output.push(0x02);
    let base2 = number.toString(2);
    let isNegative = false;
    if (number < 0) {
      isNegative = true;
      base2 = base2.slice(1);
    }
    if (base2.length % 8 !== 0) {
      base2 = base2.padStart((Math.floor(base2.length / 8) + 1) * 8, "0");
    }
    if (base2[0] === "1") {
      base2 = base2.padStart(base2.length + 8, "0");
    }
    output.push(Math.floor(base2.length / 8));
    let transformed = "";
    if (isNegative) {
      for (let i = 0; i < base2.length; i += 1) {
        if (base2[i] === "0") {
          transformed += "1";
        } else {
          transformed += "0";
        }
      }
      transformed = (parseInt(transformed, 2) + 1).toString(2);
    } else {
      transformed = base2;
    }
    let b = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < transformed.length; i += 1) {
      b[i % 8] = transformed[i];
      if ((i + 1) % 8 === 0) {
        output.push(parseInt(
          `${b[0]}${b[1]}${b[2]}${b[3]}${b[4]}${b[5]}${b[6]}${b[7]}`, 2
        ));
      }
    }
    return output;
  }
  /** @param { number[] } tlv */
  static derToInt(tlv) {
    if (tlv[0] !== parseInt("0x02")) {
      throw new TypeError(
        `TLV tag '0x${tlv[0].toString(16).padStart(2, "0").toUpperCase()}' is not a valid DER integer tag (0x02).`
      );
    }
    if (tlv[1] !== (tlv.length - 2)) {
      throw new RangeError(
        `TLV length (${tlv[1]}) and actual length (${tlv.length - 2}) of value do not match.`
      );
    }
    let base2 = "";
    for (let i = 2; i < tlv.length; i += 1) {
      const byteString = tlv[i].toString(2).padStart(8, "0");
      base2 += byteString;
    }
    let transformed = "";
    let isNegative = false;
    if (base2[0] === "1") {
      isNegative = true;
      base2 = (parseInt(base2, 2) - 1).toString(2);
      for (let i = 0; i < base2.length; i += 1) {
        if (base2[i] === "0") {
          transformed += "1";
        } else {
          transformed += "0";
        }
      }
    } else {
      transformed = base2;
    }
    const output = parseInt(transformed, 2);
    if (isNegative) {
      return -output;
    } else {
      return output;
    }
  }
  /** @param { number[] } signature */
  static ecdsaSignatureToDER(signature) {
    let output = [];
    output.push(0x30);
    const rDER = DigitalSeal.intToDER(signature[0]);
    const sDER = DigitalSeal.intToDER(signature[1]);
    output.push(rDER.length + sDER.length);
    for (let i = 0; i < rDER.length; i += 1) {
      output.push(rDER[i]);
    }
    for (let i = 0; i < sDER.length; i += 1) {
      output.push(sDER[i]);
    }
    return output;
  }
  /** @param { number[] } tlv */
  static derToECDSASignature(tlv) {
    if (tlv[0] !== parseInt("0x30")) {
      throw new TypeError(
        `TLV tag '0x${tlv[0].toString(16).padStart(2, "0").toUpperCase()}' is not a valid DER ECDSA Signature tag (0x30).`
      );
    }
    if (tlv[1] !== (tlv.length - 2)) {
      throw new RangeError(
        `TLV length (${tlv[1]}) and actual length (${tlv.length - 2}) of value do not match.`
      );
    }
    let output = [];
    let start = 2;
    do {
      const length = tlv[start + 1];
      output.push(DigitalSeal.derToInt(tlv.slice(start, start + length + 2)));
      start = start + length + 2;
    } while (start < tlv.length);
    return output;
  }
}

export { DigitalSeal };