// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/** Return a Data URL from an uploaded file.
 * @param { File } file 
 */
function loadFileFromUpload(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      (e) => { resolve(e.target.result); },
      false
    );
    reader.readAsDataURL(file);
  });
}

export { loadFileFromUpload };