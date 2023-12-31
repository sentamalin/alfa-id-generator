// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { VDS_SIGNATURE_MARKER } from "./utilities/vds-signature-marker.js";
import { lengthToDERLength } from "./utilities/length-to-der-length.js";
import { setSignatureZone } from "./utilities/set-signature-zone.js";
import { validateMRZString } from "./utilities/validate-mrz-string.js"
import { validateIdentifierCode } from "./utilities/validate-identifier-code.js";
import { validateHexString } from "./utilities/validate-hex-string.js";

/**
 * Stores common properties and methods for all ICAO 9303 visible digital seals
 *     (VDSs).
 * 
 * `DigitalSeal` is intended to be used to compose different VDS versions. It is
 *     not intended to be instantiated directly.
 */
export class DigitalSeal {
  /**
   * Create a `DigitalSeal`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of
   *     the characters A-Z, 0-9, ' ', or <. A code from ISO-3166-1,
   *     ICAO 9303-3, or these user-assigned ranges are recommended: AAA-AAZ,
   *     QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.identifierCode] - A 4-character string consisting of
   *     the characters 0-9 and A-Z.
   * @param { string } [opt.certReference] - A hex-string that uniquely
   *     identifies a certificate for a given signer.
   * @param { string | Date } [opt.issueDate] - A calendar date string in
   *     YYYY-MM-DD format or a `Date` object.
   * @param { string | Date } [opt.signatureDate] - A calendar date string in
   *     YYYY-MM-DD format or a `Date` object.
   * @param { number } [opt.featureDefinition] - A number in the range of
   *     0x01-0xFE.
   * @param { number } [opt.typeCategory] - A number in the range of 0x01-0xFE.
   *     Odd numbers in the range between 0x01 and 0xFD shall be used for
   *     ICAO-specified document type categories.
   * @param { Map<number, number[]> } [opt.features] - A store of
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
   * @param { string } value - A 3-character string consisting of the characters
   *     A-Z, 0-9, ' ', or <. A code from ISO-3166-1, ICAO 9303-3, or these
   *     user-assigned ranges are recommended: AAA-AAZ, QMA-QZZ, XAA-XZZ, or
   *     ZZA-ZZZ.
   */
  set authorityCode(value) {
    const isInvalid = validateMRZString(value, {
      minimum: 1,
      maximum: 3
    });
    if (isInvalid) {
      throw new RangeError(
        `Value set on 'authorityCode' has errors: ${isInvalid}`
      );
    }
    this.#authorityCode = value.toUpperCase();
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
    const isInvalid = validateIdentifierCode(value);
    if (isInvalid) {
      throw new RangeError(
        `Value set on 'identifierCode' has errors: ${isInvalid}`
      );
    }
    this.#identifierCode = value.toUpperCase();
  }

  #certReference;
  /**
   * A hex-string that uniquely identifies a certificate for a given signer.
   * @type { string }
   */
  get certReference() { return this.#certReference; }
  /**
   * @param { string } value - A hexadecimal string.
   */
  set certReference(value) {
    const isInvalid = validateHexString(value);
    if (isInvalid) {
      throw new RangeError(
        `Value set on 'certReference' has errors: ${isInvalid}`
      );
    }
    this.#certReference = value.toUpperCase();
  }

  #issueDate;
  /**
   * A date string on which the document was issued.
   * @type { Date }
   */
  get issueDate() { return this.#issueDate; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` object.
   */
  set issueDate(value) {
    const date = typeof value === "string" ? new Date(`${value}T00:00:00`)
        : new Date(value);
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
   * @type { Date }
   */
  get signatureDate() { return this.#signatureDate; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` object.
   */
  set signatureDate(value) {
    const date = typeof value === "string" ? new Date(`${value}T00:00:00`)
        : new Date(value);
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
      lengthToDERLength(this.signatureData.length)
    );
    output = output.concat(this.signatureData);
    return output;
  }
  /**
   * @param { number[] } value
   */
  set signatureZone(value) {
    this.signature = setSignatureZone(0, value);
  }
}
