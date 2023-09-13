import GeneratorController from "./class/GeneratorController.js";
import "./navbar.js";

const showSettingsButton = document.getElementById("settings-button");
const showMarksButton = document.getElementById("marks-button");
const showCaptionsButton = document.getElementById("captions-button");

const showTab = function (tabClassName: string) {
  const allWindows = Array.from(document.querySelectorAll("#controls-wrapper > div"));
  const windowsToShow = Array.from(document.querySelectorAll(`#controls-wrapper > .${tabClassName}`));
  const hideAll = windowsToShow[0].classList.contains("hidden") ? false : true;
  allWindows.forEach((element) => {
    element.classList.add("hidden");
  });
  if (!hideAll)
    windowsToShow.forEach((element) => {
      element.classList.remove("hidden");
    });
};

const generatorController = new GeneratorController();

showSettingsButton?.addEventListener("click", () => {
  showTab("settings-tab");
});
showMarksButton?.addEventListener("click", () => {
  showTab("marks-tab");
});
showCaptionsButton?.addEventListener("click", () => {
  showTab("captions-tab");
});
