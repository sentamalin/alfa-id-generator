/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DigitalSeal } from "./DigitalSeal.js";

/** Stores properties and methods for ICAO 9303 visible digital
 *  seals (VDSs) version 4. Consult ICAO 9030 part 13 to see the
 *  differences between this version and other versions.
 * 
 *  `DigitalSealV4` is intended to be used to compose different kinds
 *  of MRTDs and not intended to be used directly.
 * 
 * @implements { DigitalSeal }
 * @mixes DigitalSeal
 * @mixin
 */
class DigitalSealV4 {
  #digitalseal = new DigitalSeal();

  /** A magic constant used to identify VDS version 3.
   * @readonly
   */
  static get version() { return 0x03; }

  /** A code identifying the authority who issued this seal.
   * @type { string }
   */
  get authorityCode() { return this.#digitalseal.authorityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set authorityCode(value) { this.#digitalseal.authorityCode = value; }

  /** A combination of a two-letter authority code and of two alphanumeric characters to identify a signer within the issuing authority.
   * @type { string }
   */
  get identifierCode() { return this.#digitalseal.identifierCode; }
  /** @param { string } value - A 4-character string consisting of the characters 0-9 and A-Z. */
  set identifierCode(value) { this.#digitalseal.identifierCode = value; }

  /** A hex-string that uniquely identifies a certificate for a given signer.
   * @type { string }
   */
  get certReference() { return this.#digitalseal.certReference; }
  /** @param { string } value - A hex string. */
  set certReference(value) { this.#digitalseal.certReference = value; }

  /** A date string on which the document was issued.
   * @type { string }
   */
  get issueDate() { return this.#digitalseal.issueDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set issueDate(value) { this.#digitalseal.issueDate = value; }

  /** A date string on which the seal was signed.
   * @type { string }
   */
  get signatureDate() { return this.#digitalseal.signatureDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set signatureDate(value) { this.#digitalseal.signatureDate = value; }

  /** A reference code to a document that defines the number and encoding of VDS features.
   * @type { number }
   */
  get featureDefinition() { return this.#digitalseal.featureDefinition; }
  /** @param { number } value - A number in the range of 0x01 - 0xFE. */
  set featureDefinition(value) { this.#digitalseal.featureDefinition = value; }

  /** A code defining the document type category to which the seal is attached.
   * @type { number }
   */
  get typeCategory() { return this.#digitalseal.typeCategory; }
  /** @param { number } value - A number in the range of 0x01 - 0xFE. Odd numbers in the range between 0x01 and 0xFD shall be used for ICAO-specified document type categories. */
  set typeCategory(value) { this.#digitalseal.typeCategory = value; }

  /** A store of digitally-encoded document features used to create the message zone.
   * @type { Map<number, number[]>}
   */
  get features() { return this.#digitalseal.features; }
  /** @param { Map<number, number[]> } value */
  set features(value) { this.#digitalseal.features = value; }

  /** The raw signature data generated by concatenating the header and message zone, hashing the result, and signing the hash with a cryptographic key.
   * @type { number[] }
   */
  get signature() { return this.#digitalseal.signature; }
  /** @param { number[] } value */
  set signature(value) { this.#digitalseal.signature = value; }

  /** The header zone of the VDS as defined by ICAO 9303 part 13.
   * @type { number[] }
   */
  get headerZone() {
    let output = [];
    output.push(DigitalSeal.magic);
    output.push(this.constructor.version);
    output = output.concat(DigitalSeal.c40Encode(this.authorityCode.padEnd(3, "<")));
    output = output.concat(DigitalSeal.c40Encode(
        this.identifierCode +
        this.certReference.length.toString(16).padStart(2, "0") +
        this.certReference
    ));
    output = output.concat(DigitalSeal.dateToBytes(this.issueDate));
    output = output.concat(DigitalSeal.dateToBytes(this.signatureDate));
    output.push(this.featureDefinition);
    output.push(this.typeCategory);
    return output;
  }
  /** @param { number[] } value */
  set headerZone(value) {
    this.#setHeader(0, value);
  }
  /** Given a point 'start' in an array 'value', extract the header data.
   * @param { number } start
   * @param { number[] } value
   * @returns { number } The point in the array where the method stopped reading. */
  #setHeader(start, value) {
    if (value[0] !== DigitalSeal.magic) {
      throw new TypeError(
        `Value '${value[0].toString(16).padStart(2, "0").toUpperCase()}' is not an ICAO Digital Seal (${DigitalSeal.magic.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    if (value[1] !== this.constructor.version) {
      throw new TypeError(
        `Value '${value[0].toString(16).padStart(2, "0").toUpperCase()}' is not version 4 of an ICAO Digital Seal (${this.constructor.version.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    start += 2;
    this.authorityCode = DigitalSeal.c40Decode(value.slice(start, start + 2)).trim();
    start += 2;
    const idLength = DigitalSeal.c40Decode(value.slice(start, start + 4));
    this.identifierCode = idLength.substring(0, 4);
    const certRefLength = parseInt(idLength.substring(4, 6), 16);
    let certRefC40Length = Math.floor(certRefLength / 3) * 2;
    const certRefModulus = certRefLength % 3;
    if (certRefModulus) {
      certRefC40Length += 2;
    }
    start += 4;
    const certRefDecode = DigitalSeal.c40Decode(value.slice(start, start + certRefC40Length));
    if (certRefLength !== certRefDecode.length) {
      throw new RangeError(
        `Length '${certRefLength}' of certificate reference does not match the actual length (${certRefDecode.length}).`
      );
    } else {
      this.certReference = certRefDecode;
    }
    start += certRefC40Length;
    this.issueDate = DigitalSeal.bytesToDate(value.slice(start, start + 3));
    start += 3;
    this.signatureDate = DigitalSeal.bytesToDate(value.slice(start, start + 3));
    start += 3;
    this.featureDefinition = value[start];
    start += 1;
    this.typeCategory = value[start];
    start += 1;
    return start;
  }

  /** The message zone of the VDS; a binary TLV representation of all key-values set in `this.features`.
   * @type { number[] }
   */
  get messageZone() {
    let output = [];
    for (const [tag, value] of this.features) {
      output.push(tag);
      output = output.concat(DigitalSeal.lengthToDERLength(value.length));
      output = output.concat(value);
    }
    return output;
  }
  /** @param { number[] } value */
  set messageZone(value) {
    this.#setMessage(0, value);
  }
  /** Given a point 'start' in an array 'value', extract the document feature data.
   * @param { number } start
   * @param { number[] } value
   * @returns { number } The point in the array where the method stopped reading. */
  #setMessage(start, value) {
    this.features.clear();
    while (start < value.length) {
      if (value[start] === DigitalSeal.signatureMarker) {
        break;
      }
      const tag = value[start];
      start += 1;
      const length = DigitalSeal.derLengthToLength(value.slice(start));
      start += DigitalSeal.lengthToDERLength(length).length;
      const slicedValue = value.slice(start, start + length);
      if (slicedValue.length !== length) {
        throw new RangeError(
          `Length '${length}' of document feature does not match the actual length (${slicedValue.length}).`
        );
      }
      this.features.set(tag, slicedValue);
      start += length;
    }
    return start;
  }

  /** The signature zone of the VDS as a TLV of the signature marker, its length in BER/DER definite length form, and the raw signature data.
   * @type { number[] }
   */
  get signatureZone() { return this.#digitalseal.signatureZone; }
  /** @param { number[] } value */
  set signatureZone(value) { this.#digitalseal.signatureZone = value; }

  /** A concatenation of the header zone and the message zone of the VDS.
   * @type { number[] }
   */
  get unsignedSeal() {
    return this.headerZone.concat(this.messageZone);
  }
  /** @param { number[] } value */
  set unsignedSeal(value) {
    let start = 0;
    start = this.#setHeader(start, value);
    this.#setMessage(start, value);
  }

  /** A concatenation of the header zone, the message zone, and the signature zone of the VDS.
   * @type { number[] }
   */
  get signedSeal() {
    return this.headerZone.concat(this.messageZone.concat(this.signatureZone));
  }
  /** @param { number[] } value */
  set signedSeal(value) {
    let start = 0;
    start = this.#setHeader(start, value);
    start = this.#setMessage(start, value);
    this.signature = DigitalSeal.setSignature(start, value);
  }

  /** Create a new DigitalSealV4.
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
   * @param { number[] } [opt.headerZone] - The header zone of the VDS as defined by ICAO 9303 part 13.
   * @param { number[] } [opt.messageZone] - The message zone of the VDS; a binary TLV representation of all key-values set in `this.features`.
   * @param { number[] } [opt.signatureZone] - The signature zone of the VDS as a TLV of the signature marker, its length in BER/DER definite length form, and the raw signature data.
   * @param { number[] } [opt.unsignedSeal] - A concatenation of the header zone and the message zone of the VDS.
   * @param { number[] } [opt.signedSeal] - A concatenation of the header zone, the message zone, and the signature zone of the VDS.
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
      if (opt.headerZone) { this.headerZone = opt.headerZone; }
      if (opt.messageZone) { this.messageZone = opt.messageZone; }
      if (opt.signatureZone) { this.signatureZone = opt.signatureZone; }
      if (opt.unsignedSeal) { this.unsignedSeal = opt.unsignedSeal; }
      if (opt.signedSeal) { this.signedSeal = opt.signedSeal; }
    }
  }
}

export { DigitalSealV4 };