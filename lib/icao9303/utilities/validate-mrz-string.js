// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Given a string, checks to see if it meets the requirements to be used in a
 *     document's machine-readable zone (MRZ).
 * @param { string } string - The string to validate.
 * @param { Object } [opt] - An options object.
 * @param { number } [opt.minimum] - The minimum length of the string.
 * @param { number } [opt.maximum] - The maximum length of the string.
 * @returns { string } An empty string if it meets validation, or a string
 *     which describes why the string isn't valid, which may be: it doesn't meet
 *     the set minimum or maximum ranges, or it uses a character that's invalid
 *     in the MRZ.
 */
export function validateMRZString(string, opt) {
  const errors = [];
  const minimum = opt?.minimum ?? null;
  const maximum = opt?.maximum ?? null;
  const invalidCharacters = /[^A-Z0-9<\s]/i;

  if (minimum !== null) {
    if (string.length < minimum) {
      errors.push(`length must be at least ${minimum} characters`);
    }
  }
  if (maximum !== null) {
    if (string.length > maximum) {
      errors.push(`length must not be more than ${maximum} characters`);
    }
  }
  if (invalidCharacters.test(string)) {
    errors.push("must only use the characters A-Z, 0-9, ' ', or '<'");
  }

  if (errors.length === 0) {
    return "";
  } else {
    let output = "";
    errors.forEach((error, i) => {
      if (i === 0) {
        output += error[0].toUpperCase();
        output += error.slice(1);
        output += (i + 1) === errors.length ? "." : "; ";
      } else {
        output += (i + 1) === errors.length ? "and " : "";
        output += error;
        output += (i + 1) === errors.length ? "." : "; ";
      }
    });
    return output;
  }
}
