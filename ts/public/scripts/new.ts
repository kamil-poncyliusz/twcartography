import GeneratorController from "./GeneratorController.js";
import SettingsTab from "./SettingsTab.js";
import SuggestionsTab from "./SuggestionsTab.js";
import MarkGroupsTab from "./MarkGroupsTab.js";
import Canvas from "./Canvas.js";

const showSettingsButton = document.getElementById("settings-button");
const showMarksButton = document.getElementById("marks-button");
const showAccountButton = document.getElementById("profile-button");
const worldSelection = document.getElementById("world-selection");
const turnInput = document.getElementById("turn-input") as HTMLInputElement;
const publishButton = document.getElementById("publish-button");

const changeSelectedWorld = function (e: Event) {
  const target = e.target as HTMLSelectElement;
  const world = parseInt(target.value);
  turnInput.value = "";
  turnInput.disabled = true;
  mapGenerator.fetchWorldInfo(world).then((result) => {
    if (result) {
      turnInput.disabled = false;
      // turnInput.setAttribute('min', '');
      // turnInput.setAttribute('max', '');
    }
  });
};
const changeTurn = function (e: Event) {
  const target = e.target as HTMLInputElement;
  const turn = parseInt(target.value);
  mapGenerator.changeTurn(turn).then((result) => {
    if (!result) {
      turnInput.classList.add("is-invalid");
      settings.disabled = true;
      return;
    }
    settings.update();
    settings.disabled = false;
    suggestions.render();
    markGroups.render();
    canvas.render();
    turnInput.classList.remove("is-invalid");
  });
};
const sendPublishRequest = async function () {
  const settings = mapGenerator.settings;
  const url = "http://localhost:8080/api/map/create";
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
if (showAccountButton)
  showAccountButton.addEventListener("click", function () {
    showTab("account-tab");
  });
if (publishButton) publishButton.addEventListener("click", sendPublishRequest);

turnInput.addEventListener("input", changeTurn);
if (worldSelection) worldSelection.addEventListener("change", changeSelectedWorld);
