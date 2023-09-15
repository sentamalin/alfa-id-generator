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
  set placeOfIssue(value) { this.#placeOfIssue = value; }
  
  #validFrom;
  get validFrom() { return this.#validFrom.toISOString().slice(0,10); }
  get validFromVIZ() { return TravelDocument.dateToVIZ(this.#validFrom).toUpperCase(); }
  set validFrom(value) {
    let test = new Date(`${value}T00:00:00`);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Valid From (validFrom) must be a valid date string."
      );
    }
    else { this.#validFrom = test; }
  }

  #numberOfEntries;
  get numberOfEntries() { return this.#numberOfEntries; }
  get numberOfEntriesVIZ() { return this.#numberOfEntries.toUpperCase(); }
  set numberOfEntries(value) { this.#numberOfEntries = value; }

  #type;
  get type() { return this.#type; }
  get typeVIZ() { return this.#type.toUpperCase(); }
  set type(value) { this.#type = value; }

  #additionalInfo;
  get additionalInfo() { return this.#additionalInfo; }
  get additionalInfoVIZ() { return this.#additionalInfo.toUpperCase(); }
  set additionalInfo(value) { this.#additionalInfo = value; }

  #passportNumber = "";
  get passportNumber() { return this.#passportNumber; }
  get passportNumberMRZ() { return TravelDocument.padMRZString(this.#passportNumber, 9); }
  get passportNumberVIZ() { return this.#passportNumber.toUpperCase(); }
  set passportNumber(value) {
    if (value.toString().length > 9) {
      throw new RangeError(
        "Passport number (passportNumber) must be no more than 9 characters."
      );
    }
    else { this.#passportNumber = value.toString(); }
  }
  #usePassportInMRZ;
  get usePassportInMRZ() { return this.#usePassportInMRZ; }
  set usePassportInMRZ(value) { this.#usePassportInMRZ = value; }
}

export { VisaDocument };