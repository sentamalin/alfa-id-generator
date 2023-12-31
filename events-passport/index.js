// SPDX-FileCopyrightText: Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: CC0-1.0

import { EventsPassportViewModel } from "../lib/eventspassport-viewmodel.js";

window.addEventListener("load", initViewModel, false);

let viewModel;
async function initViewModel() {
  viewModel = new EventsPassportViewModel();
  await viewModel.initialize(document);
}
