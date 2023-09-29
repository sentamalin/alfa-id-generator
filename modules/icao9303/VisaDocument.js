/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";

class VisaDocument {
  /* This stores properties specific to Visa Documents to compose on other objects. */

  #placeOfIssue;
  get placeOfIssue() { return this.#placeOfIssue; }
  get placeOfIssueVIZ() { return this.#placeOfIssue.toUpperCase(); }
  set placeOfIssue(value) {
    this.#placeOfIssue = new String(value);
    this.#placeOfIssue.toVIZ = function() {
      return this.toUpperCase();
    }
  }
  
  #validFrom;
  get validFrom() { return this.#validFrom; }
  get validFromVIZ() { return TravelDocument.dateToVIZ(this.#validFrom).toUpperCase(); }
  set validFrom(value) {
    let test = new Date(`${value}T00:00:00`);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Valid From (validFrom) must be a valid date string."
      );
    } else {
      this.#validFrom = test;
      this.#validFrom.toVIZ = function() {
        return TravelDocument.dateToVIZ(this);
      }
    }
  }

  #numberOfEntries;
  get numberOfEntries() { return this.#numberOfEntries; }
  get numberOfEntriesVIZ() { return this.#numberOfEntries.toUpperCase(); }
  set numberOfEntries(value) {
    this.#numberOfEntries = new String(value);
    this.#numberOfEntries.toVIZ = function() {
      return this.toUpperCase();
    }
  }

  #type;
  get type() { return this.#type; }
  get typeVIZ() { return this.#type.toUpperCase(); }
  set type(value) {
    this.#type = new String(value);
    this.#type.toVIZ = function() {
      return this.toUpperCase();
    }
  }

  #additionalInfo;
  get additionalInfo() { return this.#additionalInfo; }
  get additionalInfoVIZ() { return this.#additionalInfo.toUpperCase(); }
  set additionalInfo(value) {
    this.#additionalInfo = new String(value);
    this.#additionalInfo.toVIZ = function() {
      return this.toUpperCase();
    }
  }

  #passportNumber = "";
  get passportNumber() { return this.#passportNumber; }
  get passportNumberMRZ() { return TravelDocument.padMRZString(this.#passportNumber, 9); }
  get passportNumberVIZ() { return this.#passportNumber.toUpperCase(); }
  set passportNumber(value) {
    if (value.toString().length > 9) {
      throw new RangeError(
        "Passport number (passportNumber) must be no more than 9 characters."
      );
    } else {
      this.#passportNumber = new String(value.toString());
      this.#passportNumber.toMRZ = function() {
        return TravelDocument.padMRZString(this, 9);
      }
      this.#passportNumber.toVIZ = function() {
        return this.toUpperCase();
      }
    }
  }
  usePassportInMRZ;
}

export { VisaDocument };