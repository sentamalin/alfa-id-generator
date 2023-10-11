// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Get a corresponding calendar date for a byte array.
 * @param { number[] } date - A `number` array of length 3.
 * @example
 * // Returns 1957-03-25
 * bytesToDate([49, 158, 245]);
 */
export function bytesToDate(date) {
  let base2 = "";
  date.forEach((byte) => {
    base2 += byte.toString(2).padStart(8, "0");
  });
  const DATE_INTEGER_STRING =
      parseInt(base2, 2).toString(10).padStart(8, "0");
  const MONTH = DATE_INTEGER_STRING.slice(0, 2);
  const DAY = DATE_INTEGER_STRING.slice(2, 4);
  const YEAR = DATE_INTEGER_STRING.slice(4);
  return outputAsDate = new Date(`${YEAR}-${MONTH}-${DAY}T00:00:00`);
}
