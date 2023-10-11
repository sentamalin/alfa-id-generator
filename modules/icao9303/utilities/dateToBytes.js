// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Get a corresponding byte array for a calendar date.
 * @param { string } date - A calendar date string in YYYY-MM-DD format.
 * @example
 * // Returns [49, 158, 245]
 * dateToBytes("1957-03-25");
 */
export function dateToBytes(date) {
  const dateFromString = new Date(`${date}T00:00:00`);
  const MONTH = dateFromString.getMonth() + 1;
  const DAY = dateFromString.getDate();
  const YEAR = dateFromString.getFullYear();
  const DATE_INTEGER = `${MONTH.toString().padStart(2, "0")}` +
      `${DAY.toString().padStart(2, "0")}${YEAR}`;
  const BASE_2 = parseInt(DATE_INTEGER, 10).toString(2).padStart(24, "0");
  const output = [];
  const b = [0, 0, 0, 0, 0, 0, 0, 0];
  [...BASE_2].forEach((character, i) => {
    b[i % 8] = character;
    if ((i + 1) % 8 === 0) {
      output.push(parseInt(
        `${b[0]}${b[1]}${b[2]}${b[3]}${b[4]}${b[5]}${b[6]}${b[7]}`, 2
      ));
    }
  });
  return output;
}
