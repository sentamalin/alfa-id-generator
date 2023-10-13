// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Given a string[] from a validation function, stringify the errors into a
 *     human-readable result with punctuation and capitalization.
 * @param { string[] } errors
 */
export function stringifyValidationArray(errors) {
  if (errors.length === 0) {
    return "";
  }
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
