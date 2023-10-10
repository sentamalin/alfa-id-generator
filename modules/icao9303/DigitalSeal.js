// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Stores common properties and methods for all ICAO 9303 visible digital seals
 *     (VDSs).
 * 
 * While `DigitalSeal` provides useful utility methods, the actual class is
 *     intended to be used to compose different VDS versions. It is not intended
 *     to be instantiated directly.
 */
class DigitalSeal {
  /**
   * Create a `DigitalSeal`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of
   *     the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned
   *     ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.identifierCode] - A 4-character string consisting of
   *     the characters 0-9 and A-Z.
   * @param { string } [opt.certReference] - A hex-string that uniquely
   *     identifies a certificate for a given signer.
   * @param { string } [opt.issueDate] - A calendar date string in YYYY-MM-DD
   *     format.
   * @param { string } [opt.signatureDate] - A calendar date string in
   *     YYYY-MM-DD format.
   * @param { number } [opt.featureDefinition] - A number in the range of
   *     0x01-0xFE.
   * @param { number } [opt.typeCategory] - A number in the range of 0x01-0xFE.
   *     Odd numbers in the range between 0x01 and 0xFD shall be used for
   *     ICAO-specified document type categories.
   * @param { Map<number, number[]>} [opt.features] - A store of
   *     digitally-encoded document features used to create the message zone.
   * @param { number[] } [opt.signatureData] - The raw signature data generated
   *     by concatenating the header and message zone, hashing the result, and
   *     signing the hash with a cryptographic key.
   * @param { number[] } [opt.signatureZone] - The signature zone of the VDS as
   *     a TLV of the signature marker, its length in BER/DER definite length
   *     form, and the raw signature data.
   */
  constructor(opt) {
    this.authorityCode = opt?.authorityCode ?? "UTO";
    this.identifierCode = opt?.identifierCode ?? "UTSS";
    this.certReference = opt?.certReference ?? "00000";
    this.issueDate = opt?.issueDate ?? "2007-04-15";
    this.signatureDate = opt?.signatureDate ?? "2007-04-15";
    this.featureDefinition = opt?.featureDefinition ?? 0x01;
    this.typeCategory = opt?.typeCategory ?? 0x01;
    this.features = opt?.features ?? new Map();
    this.signatureData = opt?.signatureData ?? Array(64).fill(0);

    if (opt?.signatureZone) { this.signatureZone = opt.signatureZone; }
  }
  
  #authorityCode;
  /**
   * A code identifying the authority who issued this seal.
   * @type { string }
   */
  get authorityCode() { return this.#authorityCode; }
  /**
   * @param { string } value - A 3-character string consisting of the letters
   *     A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges:
   *     AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   */
  set authorityCode(value) {
    if (value.length > 3) {
      throw new RangeError(
        "Issuing authority must be according to ICAO 9303-3 and be three " +
            "letters or less."
      );
    } else {
      this.#authorityCode = value;
    }
  }

  #identifierCode;
  /**
   * A combination of a two-letter authority code and of two alphanumeric
   *     characters to identify a signer within the issuing authority.
   * @type { string }
   */
  get identifierCode() { return this.#identifierCode; }
  /**
   * @param { string } value - A 4-character string consisting of the characters
   *     0-9 and A-Z.
   */
  set identifierCode(value) {
    if (value.length !== 4) {
      throw new RangeError(
        "Signer identifier must be a combination of a two-letter code of the " +
            "issuing authority and of two alphanumeric characters to identify" +
            " a signer within the defined issuing authority."
      );
    } else {
      this.#identifierCode = value;
    }
  }

  /**
   * A hex-string that uniquely identifies a certificate for a given signer.
   * @type { string }
   */
  certReference;

  #issueDate;
  /**
   * A date string on which the document was issued.
   * @type { string }
   */
  get issueDate() { return this.#issueDate.toISOString().slice(0,10); }
  /**
   * @param { string } value - A calendar date string in YYYY-MM-DD format.
   */
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
  /**
   * A date string on which the seal was signed.
   * @type { string }
   */
  get signatureDate() { return this.#signatureDate.toISOString().slice(0,10); }
  /**
   * @param { string } value - A calendar date string in YYYY-MM-DD format.
   */
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
  /**
   * A reference code to a document that defines the number and encoding of VDS
   *     features.
   * @type { number }
   */
  get featureDefinition() { return this.#featureDefinition; }
  /**
   * @param { number } value - A number in the range of 0x01-0xFE.
   */
  set featureDefinition(value) {
    if (value <= 0 || value > 254) {
      throw new RangeError(
        "Document feature definition reference must be in the range between " +
            "1-254."
      );
    } else {
      this.#featureDefinition = value;
    }
  }

  #typeCategory;
  /**
   * A code defining the document type category to which the seal is attached.
   * @type { number }
   */
  get typeCategory() { return this.#typeCategory; }
  /**
   * @param { number } value - A number in the range of 0x01 - 0xFE. Odd numbers
   *     in the range between 0x01 and 0xFD shall be used for ICAO-specified
   *     document type categories.
   */
  set typeCategory(value) {
    if (value <= 0 || value > 254) {
      throw new RangeError(
        "Document type category must be in the range between 1-254."
      );
    } else {
      this.#typeCategory = value;
    }
  }

  /**
   * A store of digitally-encoded document features used to create the message
   *     zone.
   * @type { Map<number, number[]>}
   */
  features;

  /**
   * The raw signature data generated by concatenating the header and message
   *     zone, hashing the result, and signing the hash with a cryptographic
   *     key.
   * @type { number[] }
   */
  signatureData;

  /**
   * The signature zone of the VDS as a TLV of the signature marker, its length
   *     in BER/DER definite length form, and the raw signature data.
   * @type { number[] }
   */
  get signatureZone() {
    let output = [];
    output.push(DigitalSeal.signatureMarker);
    output = output.concat(
      DigitalSeal.lengthToDERLength(this.signatureData.length)
    );
    output = output.concat(this.signatureData);
    return output;
  }
  /**
   * @param { number[] } value
   */
  set signatureZone(value) {
    this.signature = DigitalSeal.setSignature(0, value);
  }
  /**
   * Given a point 'start' in an array 'value', extract the raw signature data.
   * @param { number } start 
   * @param { number[] } value
   */
  static setSignature(start, value) {
    if (value[start] !== DigitalSeal.signatureMarker) {
      throw new TypeError(
        `Value '${value[start].toString(16).padStart(2, "0").toUpperCase()}' ` +
            `does not match signature marker (` +
            `${DigitalSeal.signatureMarker.toString(16).padStart(
              2, "0"
            ).toUpperCase()}).`
      );
    }
    start += 1;
    const LENGTH = DigitalSeal.derLengthToLength(value.slice(start));
    start += DigitalSeal.lengthToDERLength(LENGTH).length;
    if (value.slice(start).length !== LENGTH) {
      throw new RangeError(
        `Length '${LENGTH}' of signature does not match the actual length ` +
            `(${value.slice(start).length}).`
      );
    }
    return value.slice(start);
  }

  static #c40SHIFT1 = Symbol("c40SHIFT1");
  /**
   * A filler character used when C40 encoding requires one more byte to
   *     complete a triple.
   * @readonly
   */
  static get c40SHIFT1() { return this.#c40SHIFT1; }

  /**
   * A magic constant used to identify a byte array as a VDS.
   * @readonly
   */
  static get magic() { return 0xDC; }

  /**
   * A magic constant used to identify the start of the signature zone.
   * @readonly
   */
  static get signatureMarker() { return 0xFF; }

  /**
   * Encode a string using the C40 encoding scheme defined in ICAO 9303 part 13,
   *     which adds the use of the filler character '<' in the encoding scheme,
   *     into a number array.
   * @param { string } string - A string containing only A-Z, 0-9, <SPACE>, and
   *     the symbol '<'.
   * @example
   * // Returns [235, 4, 102, 169]
   * DigitalSeal.c40Encode("XK CD");
   */
  static c40Encode(string) {
    const output = [];
    let i16;
    let u1 = null;
    let u2 = null;
    let u3 = null;
    [...string].forEach((character, i) => {
      if (u1 === null && ((string.length - (i + 1)) === 0)) {
        output.push(0xFE);
        output.push(DigitalSeal.#charToDataMatrixASCII(character));
      } else if (u1 === null) {
        u1 = DigitalSeal.#charToC40(character);
      } else if (u2 === null) {
        u2 = DigitalSeal.#charToC40(character);
        if ((string.length - (i + 1)) === 0) {
          u3 = DigitalSeal.#charToC40(DigitalSeal.c40SHIFT1);
          i16 = (1600 * u1) + (40 * u2) + u3 + 1;
          output.push(Math.floor(i16 / 256));
          output.push(i16 % 256);
          i16 = null;
          u1 = null;
          u2 = null;
          u3 = null;
        }
      } else {
        u3 = DigitalSeal.#charToC40(character);
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
   * Decode a C40-encoded number array as defined in ICAO 9303 part 13 into a
   *     string. 
   * @param { number[] } c40
   * @example
   * // Returns "XKCD"
   * DigitalSeal.c40Decode([235, 17, 254, 69]);
   */
  static c40Decode(c40) {
    let output = "";
    let i1 = null;
    let i2 = null;
    c40.forEach((byte) => {
      if (i1 === null) {
        i1 = byte;
      } else {
        if (i1 === parseInt("0xFE")) {
          output += DigitalSeal.#dataMatrixASCIIToChar(byte);
        } else {
          i2 = byte;
          const I16 = (i1 * 256) + i2;
          const U1 = Math.floor((I16 - 1) / 1600);
          const U2 = Math.floor((I16 - (U1 * 1600) - 1) / 40);
          const U3 = I16 - (U1 * 1600) - (U2 * 40) - 1;
          output += DigitalSeal.#c40ToChar(U1);
          output += DigitalSeal.#c40ToChar(U2);
          if (DigitalSeal.#c40ToChar(U3) !== DigitalSeal.c40SHIFT1) {
            output += DigitalSeal.#c40ToChar(U3);
          }
        }
        i1 = null;
        i2 = null;
      }
    });
    return output;
  }

  /**
   * Get the corresponding C40 value for a character.
   * @param { string | DigitalSeal.c40SHIFT1 } char - A-Z, 0-9, <SPACE>, the
   *     symbol '<', or `DigitalSeal.c40SHIFT1`.
   * @example
   * // Returns 17
   * DigitalSeal.#charToC40("D");
   */
  static #charToC40(char) {
    if (char !== DigitalSeal.c40SHIFT1) {
      if (char.length !== 1) {
        throw new RangeError(
          "Input must be a string of one character or SHIFT1 " +
              "(DigitalSeal.c40SHIFT1)."
        );
      }
    }
    if (char === DigitalSeal.c40SHIFT1) {
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
                "(DigitalSeal.c40SHIFT1)."
          );
      }
    }
  }

  /**
   * Get the corresponding character for a C40 value.
   * @param { number } char - A number in the range of 0-39.
   * @example
   * // Returns "D"
   * DigitalSeal.#c40ToChar(17);
   */
  static #c40ToChar(char) {
    switch (char) {
      case 0:
        return DigitalSeal.c40SHIFT1;
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
   * Get the corresponding DataMatrix ASCII value for a character.
   * @param { string } char - A-Z, 0-9, <SPACE>, or the symbol '<'.
   * @example
   * // Returns 69
   * DigitalSeal.#charToDataMatrixASCII("D");
   */
  static #charToDataMatrixASCII(char) {
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

  /**
   * Get the corresponding character for a DataMatrix ASCII value.
   * @param { number } char - 33, 49-58, or 66-91.
   * @example
   * // Returns "D"
   * DigitalSeal.#dataMatrixASCIIToChar(69);
   */
  static #dataMatrixASCIIToChar(char) {
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

  /**
   * Get a corresponding byte array for a calendar date.
   * @param { string } date - A calendar date string in YYYY-MM-DD format.
   * @example
   * // Returns [49, 158, 245]
   * DigitalSeal.dateToBytes("1957-03-25");
   */
  static dateToBytes(date) {
    const dateFromString = new Date(`${date}T00:00:00`);
    const MONTH = dateFromString.getMonth() + 1;
    const DAY = dateFromString.getDate();
    const YEAR = dateFromString.getFullYear();
    const DATE_INTEGER = `${MONTH.toString().padStart(2, "0")}` +
        `${DAY.toString().padStart(2, "0")}${YEAR}`;
    const BASE_2 = parseInt(DATE_INTEGER, 10).toString(2).padStart(24, "0");
    const output = [];
    const b = [0, 0, 0, 0, 0, 0, 0, 0];
    [...BASE_2].forEach((character, i) => {
      b[i % 8] = character;
      if ((i + 1) % 8 === 0) {
        output.push(parseInt(
          `${b[0]}${b[1]}${b[2]}${b[3]}${b[4]}${b[5]}${b[6]}${b[7]}`, 2
        ));
      }
    });
    return output;
  }

  /**
   * Get a corresponding calendar date for a byte array.
   * @param { number[] } date - A `number` array of length 3.
   * @example
   * // Returns 1957-03-25
   * DigitalSeal.bytesToDate([49, 158, 245]);
   */
  static bytesToDate(date) {
    let base2 = "";
    date.forEach((byte) => {
      base2 += byte.toString(2).padStart(8, "0");
    });
    const DATE_INTEGER_STRING =
        parseInt(base2, 2).toString(10).padStart(8, "0");
    const MONTH = DATE_INTEGER_STRING.slice(0, 2);
    const DAY = DATE_INTEGER_STRING.slice(2, 4);
    const YEAR = DATE_INTEGER_STRING.slice(4);
    const outputAsDate = new Date(`${YEAR}-${MONTH}-${DAY}T00:00:00`);
    return outputAsDate.toISOString().slice(0,10);
  }

  /**
   * Get a length in the shortest BER/DER definite form for a number.
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

  /**
   * Get a number for a length in the shortest BER/DER definite form.
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
}

export { DigitalSeal };
