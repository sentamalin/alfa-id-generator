// SPDX-FileCopyrightText: Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: CC0-1.0

import { EventsMRVAViewModel } from "../lib/eventsmrva-viewmodel.js";

window.addEventListener("load", initViewModel, false);

let viewModel;
async function initViewModel() {
  viewModel = new EventsMRVAViewModel();
  await viewModel.initialize(document);
}
