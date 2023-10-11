// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { normalizeMRZString } from "./normalize-mrz-string.js";
import { padMRZString } from "./pad-mrz-string.js";

/**
 * Normalize and pad optional data for the optional data area of a
 *     Machine-Readable Zone (MRZ) of a given character length.
 * @param { string } data - Optional data to include in the Machine-Readable
 *     Zone (MRZ). Valid characters are from the ranges 0-9 and A-Z.
 * @param { number } length - The number of characters available for the
 *     optional data in a Machine-Readable Zone (MRZ).
 * @example
 * // Returns "EXAMPLE<<<<<<<"
 * optionalDataMRZ("EXAMPLE", 14);
 */
export function optionalDataMRZ(data, length) {
  const NORMALIZED_DATA = normalizeMRZString(data);
  if (NORMALIZED_DATA.length > length) {
    console.warn(
      `Optional data (optionalData) is longer than ${length} and will be ` +
          `truncated.`
    );
  }
  return padMRZString(
    NORMALIZED_DATA.substring(0,length), length
  );
}
