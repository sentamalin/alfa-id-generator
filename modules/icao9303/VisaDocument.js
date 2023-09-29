/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";

class VisaDocument {
  /* This stores properties specific to Visa Documents to compose on other objects. */

  #placeOfIssue;
  get placeOfIssue() { return this.#placeOfIssue; }
  set placeOfIssue(value) {
    this.#placeOfIssue = new String(value);
    this.#placeOfIssue.toVIZ = function() {
      return this.toUpperCase();
    }
  }
  
  #validFrom;
  get validFrom() { return this.#validFrom; }
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
  set numberOfEntries(value) {
    this.#numberOfEntries = new String(value);
    this.#numberOfEntries.toVIZ = function() {
      return this.toUpperCase();
    }
  }

  #type;
  get type() { return this.#type; }
  set type(value) {
    this.#type = new String(value);
    this.#type.toVIZ = function() {
      return this.toUpperCase();
    }
  }

  #additionalInfo;
  get additionalInfo() { return this.#additionalInfo; }
  set additionalInfo(value) {
    this.#additionalInfo = new String(value);
    this.#additionalInfo.toVIZ = function() {
      return this.toUpperCase();
    }
  }

  #passportNumber = "";
  get passportNumber() { return this.#passportNumber; }
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

  constructor() {
    this.placeOfIssue = "Zenith, UTO";
    this.validFrom = "2023-09-29";
    this.numberOfEntries = "Multiple";
    this.type = "Participant";
    this.additionalInfo = "None";
    this.passportNumber = "111222333";
  }
}

export { VisaDocument };