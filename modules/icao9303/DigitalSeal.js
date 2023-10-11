// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { VDS_SIGNATURE_MARKER } from "./utilities/vds-signature-marker.js";

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
    output.push(VDS_SIGNATURE_MARKER);
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
    if (value[start] !== VDS_SIGNATURE_MARKER) {
      throw new TypeError(
        `Value '${value[start].toString(16).padStart(2, "0").toUpperCase()}' ` +
            `does not match signature marker (` +
            `${VDS_SIGNATURE_MARKER.toString(16).padStart(
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
