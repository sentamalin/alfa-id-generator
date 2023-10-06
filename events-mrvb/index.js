/* 
 * SPDX-FileCopyrightText: Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: CC0-1.0
 */

import { EventsMRVBViewModel } from "./EventsMRVBViewModel.js";

window.addEventListener("load", initViewModel, false);

let viewModel;
async function initViewModel() {
  viewModel = new EventsMRVBViewModel();
  await viewModel.initialize(document);
}
