// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { stringifyValidationArray } from "./stringify-validation-array.js";

/**
 * Given a string, check to see if it meets the requirements of an identifier
 *     code of a visible digital seal (VDS).
 * @param { string } string
 * @returns { string } An empty string if it meets validation, or a string
 *     which describes why the string isn't valid.
 */
export function validateIdentifierCode(string) {
  const errors = [];
  const countryCodeInvalid = /[^A-Z]/i;
  const signerCodeInvalid = /[^A-Z0-9]/i;
  const countryCode = string.slice(0, 2);
  const signerCode = string.slice(2);

  if (string.length !== 4) {
    errors.push(
      "full identifier code must be 4 characters long"
    );
  }
  if (countryCodeInvalid.test(countryCode)) {
    errors.push(
      "country code (characters 1-2) must use only characters A-Z"
    );
  }
  if (signerCodeInvalid.test(signerCode)) {
    errors.push(
      "signer code (characters 3-4) must use only characters A-Z or 0-9"
    );
  }

  return stringifyValidationArray(errors);
}
