/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** Stores common properties and methods for all ICAO 9303 visible digital
 *  seals (VDSs).
 * 
 *  While `DigitalSeal` provides useful utility methods, the actual class
 *  is intended to be used to compose different VDS versions. It is not
 *  intended to be instantiated directly.
 * 
 * @mixin
 */
class DigitalSeal {
  /** Create a new `DigitalSeal`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.identifierCode] - A 4-character string consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.certReference] - A hex-string that uniquely identifies a certificate for a given signer.
   * @param { string } [opt.issueDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.signatureDate] - A calendar date string in YYYY-MM-DD format.
   * @param { number } [opt.featureDefinition] - A number in the range of 0x01 - 0xFE.
   * @param { number } [opt.typeCategory] - A number in the range of 0x01 - 0xFE. Odd numbers in the range between 0x01 and 0xFD shall be used for ICAO-specified document type categories.
   * @param { Map<number, number[]>} [opt.features] - A store of digitally-encoded document features used to create the message zone.
   * @param { number[] } [opt.signature] - The raw signature data generated by concatenating the header and message zone, hashing the result, and signing the hash with a cryptographic key.
   * @param { number[] } [opt.signatureZone] - The signature zone of the VDS as a TLV of the signature marker, its length in BER/DER definite length form, and the raw signature data.
   */
  constructor(opt) {
    if (opt) {
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.identifierCode) { this.identifierCode = opt.identifierCode; }
      if (opt.certReference) { this.certReference = opt.certReference; }
      if (opt.issueDate) { this.issueDate = opt.issueDate; }
      if (opt.signatureDate) { this.signatureDate = opt.signatureDate; }
      if (opt.featureDefinition) { this.featureDefinition = opt.featureDefinition; }
      if (opt.typeCategory) { this.typeCategory = opt.typeCategory; }
      if (opt.features) { this.features = opt.features; }
      if (opt.signature) { this.signature = opt.signature; }
      if (opt.signatureZone) { this.signatureZone = opt.signatureZone; }
    }
  }
  
  #authorityCode;
  /** A code identifying the authority who issued this seal.
   * @type { string }
   */
  get authorityCode() { return this.#authorityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set authorityCode(value) {
    if (value.length > 3) {
      throw new RangeError(
        "Issuing authority must be according to ICAO 9303-3 and be three letters or less."
      );
    } else {
      this.#authorityCode = value;
    }
  }

  #identifierCode;
  /** A combination of a two-letter authority code and of two alphanumeric characters to identify a signer within the issuing authority.
   * @type { string }
   */
  get identifierCode() { return this.#identifierCode; }
  /** @param { string } value - A 4-character string consisting of the characters 0-9 and A-Z. */
  set identifierCode(value) {
    if (value.length !== 4) {
      throw new RangeError(
        "Signer identifier must be a combination of a two-letter code of the issuing authority and of two alphanumeric characters to identify a signer within the defined issuing authority."
      );
    } else {
      this.#identifierCode = value;
    }
  }

  /** A hex-string that uniquely identifies a certificate for a given signer.
   *  @type { string }
   */
  certReference;

  #issueDate;
  /** A date string on which the document was issued.
   * @type { string }
   */
  get issueDate() { return this.#issueDate.toISOString().slice(0,10); }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set issueDate(value) {
    const date = new Date(`${value}T00:00:00`);
    if (date.toString() === "Invalid Date") {
      throw new TypeError(
        `Value '${value}' is not a valid date string.`
      );
    } else {
      this.#issueDate = date;
    }
  }

  #signatureDate;
  /** A date string on which the seal was signed.
   * @type { string }
   */
  get signatureDate() { return this.#signatureDate.toISOString().slice(0,10); }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set signatureDate(value) {
    const date = new Date(`${value}T00:00:00`);
    if (date.toString() === "Invalid Date") {
      throw new TypeError(
        `Value '${value}' is not a valid date string.`
      );
    } else {
      this.#signatureDate = date;
    }
  }

  #featureDefinition;
  /** A reference code to a document that defines the number and encoding of VDS features.
   * @type { number }
   */
  get featureDefinition() { return this.#featureDefinition; }
  /** @param { number } value - A number in the range of 0x01 - 0xFE. */
  set featureDefinition(value) {
    if (value <= 0 || value > 254) {
      throw new RangeError(
        "Document feature definition reference must be in the range between 1-254."
      );
    } else {
      this.#featureDefinition = value;
    }
  }

  #typeCategory;
  /** A code defining the document type category to which the seal is attached.
   * @type { number }
   */
  get typeCategory() { return this.#typeCategory; }
  /** @param { number } value - A number in the range of 0x01 - 0xFE. Odd numbers in the range between 0x01 and 0xFD shall be used for ICAO-specified document type categories. */
  set typeCategory(value) {
    if (value <= 0 || value > 254) {
      throw new RangeError(
        "Document type category must be in the range between 1-254."
      );
    } else {
      this.#typeCategory = value;
    }
  }

  /** A store of digitally-encoded document features used to create the message zone.
   * @type { Map<number, number[]>}
   */
  features = new Map();

  /** The raw signature data generated by concatenating the header and message zone, hashing the result, and signing the hash with a cryptographic key.
   * @type { number[] }
   */
  signature;

  /** The signature zone of the VDS as a TLV of the signature marker, its length in BER/DER definite length form, and the raw signature data.
   * @type { number[] }
   */
  get signatureZone() {
    let output = [];
    output.push(DigitalSeal.signatureMarker);
    output = output.concat(DigitalSeal.lengthToDERLength(this.signature.length));
    output = output.concat(this.signature);
    return output;
  }
  /** @param { number[] } value */
  set signatureZone(value) {
    this.signature = DigitalSeal.setSignature(0, value);
  }
  /** Given a point 'start' in an array 'value', extract the raw signature data.
   * @param { number } start 
   * @param { number[] } value
   */
  static setSignature(start, value) {
    if (value[start] !== DigitalSeal.signatureMarker) {
      throw new TypeError(
        `Value '${value[start].toString(16).padStart(2, "0").toUpperCase()}' does not match signature marker (${DigitalSeal.signatureMarker.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    start += 1;
    const length = DigitalSeal.derLengthToLength(value.slice(start));
    start += DigitalSeal.lengthToDERLength(length).length;
    if (value.slice(start).length !== length) {
      throw new RangeError(
        `Length '${length}' of signature does not match the actual length (${value.slice(start).length}).`
      );
    }
    return value.slice(start);
  }

  static #c40SHIFT1 = Symbol("c40SHIFT1");
  /** A filler character used when C40 encoding requires one more byte to complete a triple.
   * @readonly
   */
  static get c40SHIFT1() { return this.#c40SHIFT1; }

  /** A magic constant used to identify a byte array as a VDS.
   * @readonly
   */
  static get magic() { return 0xDC; }

  /** A magic constant used to identify the start of the signature zone.
   * @readonly
   */
  static get signatureMarker() { return 0xFF; }

  /** Encode a string using the C40 encoding scheme defined in ICAO 9303 part 13, which adds the use of the filler character '<' in the encoding scheme, into a number array.
   * @param { string } string - A string containing only A-Z, 0-9, <SPACE>, and the symbol '<'.
   * @example
   * // Returns [235, 4, 102, 169]
   * DigitalSeal.c40Encode("XK CD");
   */
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

  /** Decode a C40-encoded number array as defined in ICAO 9303 part 13 into a string. 
   * @param { number[] } c40
   * @example
   * // Returns "XKCD"
   * DigitalSeal.c40Decode([235, 17, 254, 69]);
   */
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

  /** Get the corresponding C40 value for a character.
   * @param { string | DigitalSeal.c40SHIFT1 } char - A-Z, 0-9, <SPACE>, the symbol '<', or `DigitalSeal.c40SHIFT1`.
   * @example
   * // Returns 17
   * DigitalSeal.#charToC40("D");
   */
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

  /** Get the corresponding character for a C40 value.
   * @param { number } char - A number in the range of 0-39.
   * @example
   * // Returns "D"
   * DigitalSeal.#c40ToChar(17);
   */
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

  /** Get the corresponding DataMatrix ASCII value for a character.
   * @param { string } char - A-Z, 0-9, <SPACE>, or the symbol '<'.
   * @example
   * // Returns 69
   * DigitalSeal.#charToDataMatrixASCII("D");
   */
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

  /** Get the corresponding character for a DataMatrix ASCII value.
   * @param { number } char - 33, 49-58, or 66-91.
   * @example
   * // Returns "D"
   * DigitalSeal.#dataMatrixASCIIToChar(69);
   */
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

  /** Get a corresponding byte array for a calendar date.
   * @param { string } date - A calendar date string in YYYY-MM-DD format.
   * @example
   * // Returns [49, 158, 245]
   * DigitalSeal.dateToBytes("1957-03-25");
   */
  static dateToBytes(date) {
    const dateFromString = new Date(`${date}T00:00:00`);
    const month = dateFromString.getMonth() + 1;
    const day = dateFromString.getDate();
    const year = dateFromString.getFullYear();
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

  /** Get a corresponding calendar date for a byte array.
   * @param { number[] } date - A `number` array of length 3.
   * @example
   * // Returns 1957-03-25
   * DigitalSeal.bytesToDate([49, 158, 245]);
   */
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
    const outputAsDate = new Date(`${year}-${month}-${day}T00:00:00`);
    return outputAsDate.toISOString().slice(0,10);
  }

  /** Get a length in the shortest BER/DER definite form for a number.
   * @param { number } length
   * @example
   * // Returns [130, 1, 179]
   * DigitalSeal.lengthToDERLength(435);
   */
  static lengthToDERLength(length) {
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
          "The definite long-form length value for this TLV is too big for the context of ICAO 9303 Digital Seals."
        );
      }
      output.push(parseInt(`1${(base2.length / 8).toString(2).padStart(7, "0")}`, 2));
      let b = [0, 0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < base2.length; i += 1) {
        b[i % 8] = base2[i];
        if((i + 1) % 8 === 0) {
          output.push(parseInt(
            `${b[0]}${b[1]}${b[2]}${b[3]}${b[4]}${b[5]}${b[6]}${b[7]}`, 2
          ));
        }
      }
      return output;
    }
  }

  /** Get a number for a length in the shortest BER/DER definite form.
   * @param { number[] } length
   * @example
   * // Returns 435
   * DigitalSeal.derLengthToLength([130, 1, 179]);
   */
  static derLengthToLength(length) {
    if (length[0] < 128) {
      return length[0];
    } else {
      if (length.length > 5) {
        throw new RangeError(
          "The definite long-form length value for this TLV is too big for the context of ICAO 9303 Digital Seals."
        );
      }
      const numOctetsString = length[0].toString(2);
      const numOctets = parseInt(`0${numOctetsString.slice(1)}`, 2);
      const lengthArray = length.slice(1, numOctets + 1);
      let outputString = "";
      for (let i = 0; i < lengthArray.length; i += 1) {
        outputString += lengthArray[i].toString(2).padStart(8, "0");
      }
      return parseInt(outputString, 2);
    }
  }
}

export { DigitalSeal };