import "./navbar.js";
import GeneratorController from "./class/generator-controller.js";

const showSettingsButton = document.getElementById("settings-button") as HTMLButtonElement;
const showMarksButton = document.getElementById("marks-button") as HTMLButtonElement;
const showCaptionsButton = document.getElementById("captions-button") as HTMLButtonElement;

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

window.addEventListener("beforeunload", (event) => {
  const isGeneratorUsed = generatorController.settings.world !== 0 && generatorController.settings.day !== "";
  if (isGeneratorUsed) event.preventDefault();
});
