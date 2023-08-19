import GeneratorController from "./class/GeneratorController.js";
import "./navbar.js";

const showSettingsButton = document.getElementById("settings-button");
const showMarksButton = document.getElementById("marks-button");

const showTab = function (tabClassName: string) {
  const divsToHide = Array.from(document.querySelectorAll("#controls-wrapper > div"));
  const divsToShow = Array.from(document.querySelectorAll(`#controls-wrapper > .${tabClassName}`));
  const hideAll = divsToShow[0].classList.contains("hidden") ? false : true;
  divsToHide.forEach((element) => {
    element.classList.add("hidden");
  });
  if (!hideAll)
    divsToShow.forEach((element) => {
      element.classList.remove("hidden");
    });
};

const generatorController = new GeneratorController();

showSettingsButton?.addEventListener("click", function () {
  showTab("settings-tab");
});
showMarksButton?.addEventListener("click", function () {
  showTab("marks-tab");
});
