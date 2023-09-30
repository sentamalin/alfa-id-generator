/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DigitalSeal } from "./DigitalSeal.js";

class DigitalSealV3 {
  #digitalseal = new DigitalSeal();
  get version() { return 0x02; }
  get authorityCode() { return this.#digitalseal.authorityCode; }
  set authorityCode(value) { this.#digitalseal.authorityCode = value; }
  get identifierCode() { return this.#digitalseal.identifierCode; }
  set identifierCode(value) { this.#digitalseal.identifierCode = value; }
  get certReference() { return this.#digitalseal.certReference; }
  set certReference(value) {
    if (value.length !== 5) {
      throw new RangeError(
        "Certificate reference must be a hex string of exactly 5 characters."
      );
    } else {
      this.#digitalseal.certReference = value;
    }
  }
  get issueDate() { return this.#digitalseal.issueDate; }
  set issueDate(value) { this.#digitalseal.issueDate = value; }
  get signatureDate() { return this.#digitalseal.signatureDate; }
  set signatureDate(value) { this.#digitalseal.signatureDate = value; }
  get featureDefinition() { return this.#digitalseal.featureDefinition; }
  set featureDefinition(value) { this.#digitalseal.featureDefinition = value; }
  get typeCategory() { return this.#digitalseal.typeCategory; }
  set typeCategory(value) { this.#digitalseal.typeCategory = value; }
  get features() { return this.#digitalseal.features; }
  set features(value) { this.#digitalseal.features = value; }
  get signature() { return this.#digitalseal.signature; }
  set signature(value) { this.#digitalseal.signature = value; }

  get headerZone() {
    let output = [];
    output.push(DigitalSeal.magic);
    output.push(this.version);
    output = output.concat(DigitalSeal.c40Encode(this.authorityCode.padEnd(3, "<")));
    output = output.concat(DigitalSeal.c40Encode(
      this.identifierCode +
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

  get messageZone() {
    let output = [];
    for (const [tag, value] of this.features) {
      output.push(tag);
      output.push(value.length);
      output = output.concat(value);
    }
    return output;
  }
  /** @param { number[] } value */
  set messageZone(value) {
    this.#setMessage(0, value);
  }

  get signatureZone() { return this.#digitalseal.signatureZone; }
  set signatureZone(value) { this.#digitalseal.signatureZone = value; }

  get unsignedSeal() {
    return this.headerZone.concat(this.messageZone);
  }
  /** @param { number[] } value */
  set unsignedSeal(value) {
    let start = 0;
    start = this.#setHeader(start, value);
    this.#setMessage(start, value);
  }

  get signedSeal() {
    return this.headerZone.concat(this.messageZone.concat(this.signatureZone));
  }
  /** @param { number[] } value */
  set signedSeal(value) {
    let start = 0;
    start = this.#setHeader(start, value);
    start = this.#setMessage(start, value);
    this.#setSignature(start, value);
  }

  /**
   * @param { number } start 
   * @param { number[] } value */
  #setHeader(start, value) {
    if (value[0] !== DigitalSeal.magic) {
      throw new TypeError(
        `Value '${value[0].toString(16).padStart(2, "0").toUpperCase()}' is not an ICAO Digital Seal (${DigitalSeal.magic.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    if (value[1] !== this.version) {
      throw new TypeError(
        `Value '${value[0].toString(16).padStart(2, "0").toUpperCase()}' is not version 3 of an ICAO Digital Seal (${this.version.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    start += 2;
    this.authority = DigitalSeal.c40Decode(value.slice(start, start + 2)).trim();
    start += 2;
    const idCertRef = DigitalSeal.c40Decode(value.slice(start, start + 6));
    this.identifierCode = idCertRef.substring(0, 4);
    this.certReference = idCertRef.substring(4);
    start += 6;
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
  /**
   * @param { number } start 
   * @param { number[] } value */
  #setMessage(start, value) {
    this.features.clear();
    while (start < value.length) {
      if (value[start] === DigitalSeal.signatureMarker) {
        break;
      }
      const tag = value[start];
      start += 1;
      const length = value[start];
      start += 1;
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
  /**
   * @param { number } start 
   * @param { number[] } value */
  #setSignature(start, value) {
    this.#digitalseal.setSignature(start, value);
  }

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
    }
  }
}

export { DigitalSealV3 };