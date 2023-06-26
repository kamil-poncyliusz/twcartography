import GeneratorController from "./GeneratorController.js";
import SettingsTabController from "./SettingsTab.js";
import MarkGroupsTabController from "./MarkGroupsTab.js";
import CanvasController from "./CanvasController.js";

const suggestionsTableElement = document.querySelector("#mark-suggestions table") as Element;

class SuggestionsTabController {
  #generator: GeneratorController;
  #body;
  #suggestionsSearchInput;
  #settingsObject: SettingsTabController | undefined;
  #markGroupsObject: MarkGroupsTabController | undefined;
  #canvasObject: CanvasController | undefined;
  constructor(generatorObject: GeneratorController) {
    this.#generator = generatorObject;
    this.#body = suggestionsTableElement.querySelector("tbody") as HTMLTableSectionElement;
    this.#suggestionsSearchInput = suggestionsTableElement.querySelector("thead input") as HTMLInputElement;
    this.#suggestionsSearchInput.addEventListener("input", () => {
      this.render();
    });
  }
  set settingsObject(object: SettingsTabController) {
    this.#settingsObject = object;
  }
  set markGroupsObject(object: MarkGroupsTabController) {
    this.#markGroupsObject = object;
  }
  set canvasObject(object: CanvasController) {
    this.#canvasObject = object;
  }
  #addMark = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const cell = target.parentElement as HTMLTableCellElement;
    const row = cell.parentElement as HTMLTableRowElement;
    const suggestionTagCell = row.querySelector(".suggestion-tag") as HTMLTableCellElement;
    const tribeTag = suggestionTagCell.textContent as string;
    let selectedGroup = target.value;
    if (selectedGroup === "Utwórz grupę") {
      const groupName = tribeTag.replaceAll(",", ".").replaceAll(" ", "_");
      const isAdded = this.#generator.addMarkGroup({ name: groupName, color: "#FFFFFE", tribes: [] });
      if (!isAdded) return;
      selectedGroup = groupName;
    }
    const isAdded = this.#generator.addMark(tribeTag, selectedGroup);
    if (!isAdded) return;
    this.render();
    this.updateSettings();
    this.renderMarkGroups();
    this.renderCanvas();
  };
  render() {
    const tag = this.#suggestionsSearchInput.value;
    const suggestions = this.#generator.getSuggestions(tag, 30);
    if (!suggestions) return;
    this.#body.innerHTML = "";
    const groups = this.#generator.markGroups.map((group) => group.name);
    let groupOptions = "<option selected disabled hidden>Dodaj</option>";
    groupOptions += `<option>Utwórz grupę</option>`;
    for (let group of groups) {
      groupOptions += `<option>${group}</option>`;
    }
    for (let tribe of suggestions) {
      const newRow = document.createElement("tr");
      let rowContent = "";
      rowContent += `<td class='suggestion-name'>${tribe.name}</td><td class='suggestion-tag'>${tribe.tag}</td><td>${tribe.players}</td><td>${tribe.villages.length}</td><td>${tribe.points}</td>`;
      rowContent += `<td><select>${groupOptions}</select></td>`;
      newRow.innerHTML = rowContent;
      this.#body.appendChild(newRow);
    }
    this.#body.querySelectorAll("select").forEach((selectElement) => {
      selectElement.addEventListener("change", this.#addMark);
    });
  }
  updateSettings() {
    if (this.#settingsObject) this.#settingsObject.update();
  }
  renderMarkGroups() {
    if (this.#markGroupsObject) this.#markGroupsObject.render();
  }
  renderCanvas() {
    if (this.#canvasObject) this.#canvasObject.render();
  }
}

export default SuggestionsTabController;
