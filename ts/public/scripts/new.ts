import GeneratorController from "./class/GeneratorController.js";
import SettingsTab from "./class/SettingsTab.js";
import SuggestionsTab from "./class/SuggestionsTab.js";
import MarkGroupsTab from "./class/MarkGroupsTab.js";
import Canvas from "./class/Canvas.js";
import "./nav-bar.js";

const showSettingsButton = document.getElementById("settings-button");
const showMarksButton = document.getElementById("marks-button");
const publishButton = document.getElementById("publish-button");

const sendPublishRequest = async function () {
  const settings = mapGenerator.settings;
  const url = `http://${window.location.host}/api/map/create`;
  const body = JSON.stringify(settings);
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });
  response = await response.json();
  console.log(response);
};
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

const mapGenerator = new GeneratorController();

const settings = new SettingsTab(mapGenerator);
const suggestions = new SuggestionsTab(mapGenerator);
const markGroups = new MarkGroupsTab(mapGenerator);
const canvas = new Canvas(mapGenerator);
settings.canvasObject = canvas;
settings.markGroupsObject = markGroups;
settings.suggestionsObject = suggestions;
suggestions.settingsObject = settings;
suggestions.canvasObject = canvas;
suggestions.markGroupsObject = markGroups;
markGroups.settingsObject = settings;
markGroups.canvasObject = canvas;
markGroups.suggestionsObject = suggestions;
settings.init();

if (showSettingsButton)
  showSettingsButton.addEventListener("click", function () {
    showTab("settings-tab");
  });
if (showMarksButton)
  showMarksButton.addEventListener("click", function () {
    showTab("marks-tab");
  });
if (publishButton) publishButton.addEventListener("click", sendPublishRequest);
