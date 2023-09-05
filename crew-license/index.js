import { CrewLicenseViewModel } from "/modules/CrewLicenseViewModel.js";

window.addEventListener("load", initViewModel, false);

let viewModel;
async function initViewModel() {
  viewModel = new CrewLicenseViewModel();
  await viewModel.initialize(document);
}