// SPDX-FileCopyrightText: Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: CC0-1.0

import { EventsSealViewModel } from "../lib/eventsseal-viewmodel.js";

window.addEventListener("load", initViewModel, false);

let viewModel;
async function initViewModel() {
  viewModel = new EventsSealViewModel();
  await viewModel.initialize(document);
}
