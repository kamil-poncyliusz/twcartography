import { MarkGroup, Tribe } from "../../../src/Types.js";
import { randomizeGroupColor } from "../utils.js";
import CanvasController from "./CanvasController.js";
import GeneratorController from "./GeneratorController.js";
import SettingsTabController from "./SettingsTab.js";
import SuggestionsTabController from "./SuggestionsTab.js";

const markGroupsTableBody = document.querySelector("#mark-groups table tbody") as HTMLTableSectionElement | null;

const getMarkGroupRowInnerHTML = function (group: MarkGroup, tribes: { [key: string]: Tribe }) {
  let innerHTML = "";
  for (let tribeID of group.tribes) {
    const tribe = tribes[tribeID];
    innerHTML += `<button class='mark block-element delete-button' title='${tribe.name}'>${tribe.tag}</button>`;
  }
  const players = group.tribes.reduce((sum, tribeID) => sum + tribes[tribeID].players, 0);
  const villages = group.tribes.reduce((sum, tribeID) => sum + tribes[tribeID].villages.length, 0);
  const points = group.tribes.reduce((sum, tribeID) => sum + tribes[tribeID].points, 0);
  innerHTML = `<td class='group-tribes'>${innerHTML}</td>`;
  innerHTML += `<td class='group-name'><input type='text' class='fill-cell' value='${group.name}' data-old-name='${group.name}' placeholder='nazwa'></td>`;
  innerHTML += `<td><input type='color' class='fill-cell' title='Kliknij prawym aby wylosować kolor' value='${group.color}'></td>`;
  innerHTML += `<td>${group.tribes.length}</td><td>${players}</td><td>${villages}</td><td>${points}</td>`;
  innerHTML += `<td><button class='delete-group delete-button fill-cell'>X</button></td>`;
  return innerHTML;
};

class MarkGroupsTabController {
  #generator;
  #settingsObject: SettingsTabController | undefined;
  #suggestionsObject: SuggestionsTabController | undefined;
  #canvasObject: CanvasController | undefined;
  constructor(mapGeneratorObject: GeneratorController) {
    this.#generator = mapGeneratorObject;
  }
  set settingsObject(object: SettingsTabController) {
    this.#settingsObject = object;
  }
  set suggestionsObject(object: SuggestionsTabController) {
    this.#suggestionsObject = object;
  }
  set canvasObject(object: CanvasController) {
    this.#canvasObject = object;
  }
  render() {
    const groups = this.#generator.markGroups;
    const tribes = this.#generator.tribes;
    if (!markGroupsTableBody) return;
    markGroupsTableBody.innerHTML = "";
    for (let group of groups) {
      const newRow = document.createElement("tr");
      const content = getMarkGroupRowInnerHTML(group, tribes);
      newRow.innerHTML = content;
      markGroupsTableBody.appendChild(newRow);
    }
    markGroupsTableBody.querySelectorAll(".mark").forEach((mark) => {
      mark.addEventListener("click", this.deleteMark);
    });
    markGroupsTableBody.querySelectorAll(".group-name input").forEach((element) => {
      const nameInput = element as HTMLInputElement;
      nameInput.addEventListener("change", this.changeGroupName);
    });
    markGroupsTableBody.querySelectorAll("input[type=color]").forEach((colorInput) => {
      colorInput.addEventListener("change", this.changeGroupColor);
      colorInput.addEventListener("contextmenu", this.randomizeColor);
    });
    markGroupsTableBody.querySelectorAll(".delete-group").forEach((deleteGroupButton) => {
      deleteGroupButton.addEventListener("click", this.deleteMarkGroup);
    });
  }
  updateSettings() {
    if (this.#settingsObject) this.#settingsObject.update();
  }
  renderCanvas() {
    if (this.#canvasObject) this.#canvasObject.render();
  }
  renderSuggestions() {
    if (this.#suggestionsObject) this.#suggestionsObject.render();
  }
  deleteMarkGroup = (e: Event) => {
    const button = e.target as HTMLButtonElement;
    const cell = button.parentElement as HTMLTableCellElement;
    const row = cell.parentElement as HTMLTableRowElement;
    const nameCell = row.querySelector("td.group-name") as HTMLTableCellElement | null;
    if (!nameCell) return;
    const name = nameCell.textContent ?? "";
    const isDeleted = this.#generator.deleteMarkGroup(name);
    if (!isDeleted) return;
    this.render();
    this.updateSettings();
    this.renderSuggestions();
    this.renderCanvas();
  };
  changeGroupColor = (e: Event) => {
    const colorInput = e.target as HTMLInputElement;
    const color = colorInput.value;
    const cell = colorInput.parentElement as HTMLTableCellElement;
    const row = cell.parentElement as HTMLTableRowElement;
    const nameCell = row.querySelector(".group-name") as HTMLTableCellElement | null;
    if (!nameCell) return;
    const name = nameCell.textContent ?? "";
    const isChanged = this.#generator.changeMarkGroupColor(name, color);
    if (!isChanged) return;
    this.render();
    this.updateSettings();
    this.renderCanvas();
  };
  randomizeColor = (e: Event) => {
    e.preventDefault();
    const colorInput = e.target as HTMLInputElement;
    const cell = colorInput.parentElement as HTMLTableCellElement;
    const row = cell.parentElement as HTMLTableRowElement;
    const groupNameCell = row.querySelector(".group-name") as HTMLTableCellElement | null;
    if (!groupNameCell) return;
    const name = groupNameCell.textContent ?? "";
    const color = randomizeGroupColor();
    const isChanged = this.#generator.changeMarkGroupColor(name, color);
    if (!isChanged) return;
    this.render();
    this.updateSettings();
    this.renderCanvas();
  };
  deleteMark = (e: Event) => {
    const button = e.target as HTMLElement;
    const cell = button.parentElement as HTMLTableCellElement;
    const row = cell.parentElement as HTMLTableRowElement;
    const tribeTag = button.textContent as string;
    const nameCell = row.querySelector(".group-name") as HTMLTableCellElement | null;
    if (!nameCell) return;
    const groupName = nameCell.textContent ?? "";
    const isDeleted = this.#generator.deleteMark(groupName, tribeTag);
    if (!isDeleted) return;
    this.render();
    this.updateSettings();
    this.renderSuggestions();
    this.renderCanvas();
  };
  changeGroupName = (e: Event) => {
    const nameInput = e.target as HTMLInputElement;
    const newName = nameInput.value;
    const oldName = nameInput.dataset.oldName as string;
    const isChanged = this.#generator.changeMarkGroupName(oldName, newName);
    if (!isChanged) {
      nameInput.classList.add("is-invalid");
      return;
    }
    nameInput.classList.remove("is-invalid");
    nameInput.dataset.oldName = newName;
    this.renderSuggestions();
    this.renderCanvas();
  };
}

export default MarkGroupsTabController;
