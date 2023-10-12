// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { VDS_SIGNATURE_MARKER } from "./vds-signature-marker.js";
import { derLengthToLength } from "./der-length-to-length.js";
import { lengthToDERLength } from "./length-to-der-length.js";

/**
 * Given a point 'start' in an array 'value', extract the raw signature data.
 * @param { number } start 
 * @param { number[] } value
 */
export function setSignatureZone(start, value) {
  if (value[start] !== VDS_SIGNATURE_MARKER) {
    throw new TypeError(
      `Value '${value[start].toString(16).padStart(2, "0").toUpperCase()}' ` +
          `does not match signature marker (` +
          `${VDS_SIGNATURE_MARKER.toString(16).padStart(
            2, "0"
          ).toUpperCase()}).`
    );
  }
  start += 1;
  const LENGTH = derLengthToLength(value.slice(start));
  start += lengthToDERLength(LENGTH).length;
  if (value.slice(start).length !== LENGTH) {
    throw new RangeError(
      `Length '${LENGTH}' of signature does not match the actual length ` +
          `(${value.slice(start).length}).`
    );
  }
  return value.slice(start);
}
