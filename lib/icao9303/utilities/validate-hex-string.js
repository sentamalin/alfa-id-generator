// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { stringifyValidationArray } from "./stringify-validation-array.js";

/**
 * Check to see if a string is a hexadecimal string.
 * @param { string } string - The string to validate
 * @param { Object } [opt] - An options object.
 * @param { number } [opt.minimum] - The minimum length of the string.
 * @param { number } [opt.maximum] - The maximum length of the string.
 * @returns { string } An empty string if it meets validation or a string
 *     which describes why the string isn't valid.
 */
export function validateHexString(string, opt) {
  const errors = [];
  const minimum = opt?.minimum ?? null;
  const maximum = opt?.maximum ?? null;
  const invalidCharacters = /[^0-9A-F]/i;

  if (minimum !== null) {
    if (string.length < minimum) {
      errors.push(
        `length must be at least ${minimum} character${minimum === 1 ? "":"s"}`
      );
    }
  }
  if (maximum !== null) {
    if (string.length > maximum) {
      errors.push(
        `length must be less than ${maximum} character${maximum === 1 ? "":"s"}`
      );
    }
  }
  if (invalidCharacters.test(string)) {
    errors.push("must only use the characters 0-9 or A-F");
  }

  return stringifyValidationArray(errors);
}
