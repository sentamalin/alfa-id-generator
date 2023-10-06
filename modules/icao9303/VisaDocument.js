/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";

/** Stores properties specific to machine-readable visa documents.
 * 
 *  `VisaDocument` is intended to be used to compose different kinds
 *  of machine-readable visa documents. It is not intended to be
 *  instantiated directly.
 * 
 * @mixin
 */
class VisaDocument {
  /** Create a new `VisaDocument`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.placeOfIssue] - Location where the visa was issued.
   * @param { string } [opt.validFrom] - A calendar date string in YYYY-MM-DD format.
   * @param { string | number } [opt.numberOfEntries] - 0 or any string denotes an unlimited number of entries.
   * @param { string } [opt.visaType] - A type/name/description for this visa.
   * @param { string } [opt.additionalInfo] - Additional textual information.
   * @param { string } [opt.passportNumber] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { boolean } [opt.usePassportInMRZ] - Use `this.passportNumber` instead of `this.number` in the Machine-Readable Zone (MRZ).
   */
  constructor(opt) {
    this.placeOfIssue = "Zenith, UTO";
    this.validFrom = "2023-09-29";
    this.numberOfEntries = "Multiple";
    this.visaType = "Participant";
    this.additionalInfo = "None";
    this.passportNumber = "111222333";

    if (opt) {
      if (opt.placeOfIssue) { this.placeOfIssue = opt.placeOfIssue; }
      if (opt.validFrom) { this.validFrom = opt.validFrom; }
      if (opt.numberOfEntries) { this.numberOfEntries = opt.numberOfEntries; }
      if (opt.visaType) { this.visaType = opt.visaType; }
      if (opt.additionalInfo) { this.additionalInfo = opt.additionalInfo; }
      if (opt.passportNumber) { this.passportNumber = opt.passportNumber; }
      if (opt.usePassportInMRZ) { this.usePassportInMRZ = opt.usePassportInMRZ; }
    }
  }
  
  #placeOfIssue;
  /** Location where the visa was issued.
   * @type { String }
   */
  get placeOfIssue() { return this.#placeOfIssue; }
  /** @param { string } value */
  set placeOfIssue(value) {
    this.#placeOfIssue = new String(value);
    this.#placeOfIssue.toVIZ = VisaDocument.#setThisToUppercase;
  }
  
  #validFrom;
  /** Starting date on which the visa is valid.
   * @type { Date }
   */
  get validFrom() { return this.#validFrom; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set validFrom(value) {
    let test = new Date(`${value}T00:00:00`);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Valid From (validFrom) must be a valid date string."
      );
    } else {
      this.#validFrom = test;
      this.#validFrom.toVIZ = VisaDocument.#validFromToVIZ;
    }
  }

  #numberOfEntries;
  /** Maximum number of entries this visa allows.
   * @type { String }
   */
  get numberOfEntries() { return this.#numberOfEntries; }
  /** @param { string | number } value - 0 or any string denotes an unlimited number of entries. */
  set numberOfEntries(value) {
    this.#numberOfEntries = new String(value);
    this.#numberOfEntries.toVIZ = VisaDocument.#setThisToUppercase;
  }

  #visaType;
  /** The textual type/name/description for this visa.
   * @type { String }
  */
  get visaType() { return this.#visaType; }
  /** @param { string } value */
  set visaType(value) {
    this.#visaType = new String(value);
    this.#visaType.toVIZ = VisaDocument.#setThisToUppercase;
  }

  #additionalInfo;
  /** Additional textual information to include with this visa.
   * @type { String }
   */
  get additionalInfo() { return this.#additionalInfo; }
  /** @param { string } value */
  set additionalInfo(value) {
    this.#additionalInfo = new String(value);
    this.#additionalInfo.toVIZ = VisaDocument.#setThisToUppercase;
  }

  #passportNumber;
  /** The identity document number for which this visa is issued.
   * @type { String }
   */
  get passportNumber() { return this.#passportNumber; }
  /** @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z. */
  set passportNumber(value) {
    if (value.toString().length > 9) {
      throw new RangeError(
        "Passport number (passportNumber) must be no more than 9 characters."
      );
    } else {
      this.#passportNumber = new String(value.toString());
      this.#passportNumber.toMRZ = VisaDocument.#passportNumberToMRZ;
      this.#passportNumber.toVIZ = VisaDocument.#setThisToUppercase;
    }
  }

  /** Use `this.passportNumber` instead of `this.number` in the Machine-Readable Zone (MRZ).
   * @type { boolean }
   */
  usePassportInMRZ;

  /* Functions to be assigned to properties `toMRZ` and `toVIZ` when set. */
  static #setThisToUppercase = function() {
    return this.toUpperCase();
  }
  static #passportNumberToMRZ = function() {
    return TravelDocument.padMRZString(this, 9);
  }
  static #validFromToVIZ = function() {
    return TravelDocument.dateToVIZ(this);
  }
}

export { VisaDocument };
