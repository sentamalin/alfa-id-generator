/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DigitalSeal } from "./DigitalSeal.js";

class DigitalSealV4 {
  #digitalseal = new DigitalSeal();
  get version() { return 0x03; }
  get authority() { return this.#digitalseal.authority; }
  set authority(value) { this.#digitalseal.authority = value; }
  get identifier() { return this.#digitalseal.identifier; }
  set identifier(value) { this.#digitalseal.identifier = value; }
  get certReference() { return this.#digitalseal.certReference; }
  set certReference(value) { this.#digitalseal.certReference = value; }
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
    output = output.concat(DigitalSeal.c40Encode(this.authority.padEnd(3, "<")));
    output = output.concat(DigitalSeal.c40Encode(
        this.identifier +
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
    if (value[0] !== DigitalSeal.magic) {
      throw new TypeError(
        `Value '${value[0].toString(16).padStart(2, "0").toUpperCase()}' is not an ICAO Digital Seal (${DigitalSeal.magic.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    if (value[1] !== this.version) {
      throw new TypeError(
        `Value '${value[0].toString(16).padStart(2, "0").toUpperCase()}' is not version 4 of an ICAO Digital Seal (${this.version.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    this.authority = DigitalSeal.c40Decode(value.slice(2, 4)).trim();
    const idCert = DigitalSeal.c40Decode(value.slice(4, value.length - 8));
    this.identifier = idCert.substring(0, 4);
    const length = parseInt(idCert.substring(4, 6), 16);
    if (length !== idCert.substring(6).length) {
      throw new RangeError(
        `Length '${length}' of certificate reference does not match the actual length (${idCert.substring(6).length}).`
      );
    } else {
      this.certReference = idCert.substring(6);
    }
    this.issueDate = DigitalSeal.bytesToDate(value.slice(value.length - 8, value.length - 5));
    this.signatureDate = DigitalSeal.bytesToDate(value.slice(value.length - 5, value.length - 2));
    this.featureDefinition = value[value.length - 2];
    this.typeCategory = value[value.length - 1];
  }

  get messageZone() {
    let output = [];
    for (const [tag, value] of this.features) {
      output.push(tag);
      output = output.concat(DigitalSeal.intToDER(value.length));
      output = output.concat(value);
    }
    return output;
  }
  /** @param { number[] } value */
  set messageZone(value) {
    this.features.clear();
    let start = 0;
    while (start < value.length) {
      const tag = value[start];
      start += 1;
      const length = DigitalSeal.derToInt(value.slice(start, start + value[start + 1] + 2));
      start += value[start + 1] + 2;
      const slicedValue = value.slice(start, start + length);
      if (slicedValue.length !== length) {
        throw new RangeError(
          `Length '${length}' of document feature does not match the actual length (${slicedValue.length}).`
        );
      }
      this.features.set(tag, slicedValue);
      start += length;
    }
  }

  get signatureZone() { return this.#digitalseal.signatureZone; }
  set signatureZone(value) { this.#digitalseal.signatureZone = value; }

  get unsignedSeal() {
    return this.headerZone.concat(this.messageZone);
  }
  /** @param { number[] } value */
  set unsignedSeal(value) {
    if (value[0] !== DigitalSeal.magic) {
      throw new TypeError(
        `Value '${value[0].toString(16).padStart(2, "0").toUpperCase()}' is not an ICAO Digital Seal (${DigitalSeal.magic.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    if (value[1] !== this.version) {
      throw new TypeError(
        `Value '${value[0].toString(16).padStart(2, "0").toUpperCase()}' is not version 4 of an ICAO Digital Seal (${this.version.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    let start = 2;
    this.authority = DigitalSeal.c40Decode(value.slice(start, start + 2)).trim();
    start += 2;
    const idLength = DigitalSeal.c40Decode(value.slice(start, start + 4));
    this.identifier = idLength.substring(0, 4);
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

    this.features.clear();
    while (start < value.length) {
      const tag = value[start];
      start += 1;
      const length = DigitalSeal.derToInt(value.slice(start, start + value[start + 1] + 2));
      start += value[start + 1] + 2;
      const slicedValue = value.slice(start, start + length);
      if (slicedValue.length !== length) {
        throw new RangeError(
          `Length '${length}' of document feature does not match the actual length (${slicedValue.length}).`
        );
      }
      this.features.set(tag, slicedValue);
      start += length;
    }
  }

  get signedSeal() {
    return this.headerZone.concat(this.messageZone.concat(this.signatureZone));
  }
  /** @param { number[] } value */
  set signedSeal(value) {
    if (value[0] !== DigitalSeal.magic) {
      throw new TypeError(
        `Value '${value[0].toString(16).padStart(2, "0").toUpperCase()}' is not an ICAO Digital Seal (${DigitalSeal.magic.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    if (value[1] !== this.version) {
      throw new TypeError(
        `Value '${value[0].toString(16).padStart(2, "0").toUpperCase()}' is not version 4 of an ICAO Digital Seal (${this.version.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    let start = 2;
    this.authority = DigitalSeal.c40Decode(value.slice(start, start + 2)).trim();
    start += 2;
    const idLength = DigitalSeal.c40Decode(value.slice(start, start + 4));
    this.identifier = idLength.substring(0, 4);
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
  
    this.features.clear();
    while (start < value.length) {
      if (value[start] === DigitalSeal.signatureMarker) {
        break;
      }
      const tag = value[start];
      start += 1;
      const length = DigitalSeal.derToInt(value.slice(start, start + value[start + 1] + 2));
      start += value[start + 1] + 2;
      const slicedValue = value.slice(start, start + length);
      if (slicedValue.length !== length) {
        throw new RangeError(
          `Length '${length}' of document feature does not match the actual length (${slicedValue.length}).`
        );
      }
      this.features.set(tag, slicedValue);
      start += length;
    }

    if (value[start] !== DigitalSeal.signatureMarker) {
      throw new TypeError(
        `Value '${value[start].toString(16).padStart(2, "0").toUpperCase()}' does not match signature marker (${DigitalSeal.signatureMarker.toString(16).padStart(2, "0").toUpperCase()}).`
      );
    }
    start += 1;
    const sigLength = DigitalSeal.derToInt(value.slice(start, start + value[start + 1] + 2));
    start += value[start + 1] + 2;
    if (value.slice(start).length !== sigLength) {
      throw new RangeError(
        `Length '${sigLength}' of signature does not match the actual length (${value.slice(start).length}).`
      );
    }
    this.signature = value.slice(start);
  }

  constructor(opt) {
    if (opt) {
      if (opt.authority) { this.authority = opt.authority; }
      if (opt.identifier) { this.identifier = opt.identifier; }
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

export { DigitalSealV4 };