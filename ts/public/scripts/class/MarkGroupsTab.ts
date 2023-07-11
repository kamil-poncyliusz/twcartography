import { randomizeGroupColor } from "../utils.js";
import CanvasController from "./CanvasController.js";
import GeneratorController from "./GeneratorController.js";
import SettingsTabController from "./SettingsTab.js";
import SuggestionsTabController from "./SuggestionsTab.js";

const markGroupsTableElement = document.querySelector("#mark-groups table") as HTMLTableElement | null;

class MarkGroupsTabController {
  #generator;
  #body;
  #settingsObject: SettingsTabController | undefined;
  #suggestionsObject: SuggestionsTabController | undefined;
  #canvasObject: CanvasController | undefined;
  constructor(mapGeneratorObject: GeneratorController) {
    this.#generator = mapGeneratorObject;
    if (markGroupsTableElement) this.#body = markGroupsTableElement.querySelector("tbody") as HTMLTableSectionElement;
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
    const body = this.#body;
    const groups = this.#generator.markGroups;
    const tribes = this.#generator.tribes;
    if (!body) return;
    body.innerHTML = "";
    for (let group of groups) {
      const newRow = document.createElement("tr");
      let content = "";
      for (let tribeID of group.tribes) {
        const tribe = tribes[tribeID];
        content += `<p class='mark label-button delete-button' title='${tribe.name}'>${tribe.tag}</p>`;
      }
      const players = group.tribes.reduce((sum, tribeID) => sum + tribes[tribeID].players, 0);
      const villages = group.tribes.reduce((sum, tribeID) => sum + tribes[tribeID].villages.length, 0);
      const points = group.tribes.reduce((sum, tribeID) => sum + tribes[tribeID].points, 0);
      content = `<td class='group-tribes'>${content}</td><td class='group-name'>${group.name}</td>`;
      content += `<td><input type='color' title='Kliknij prawym aby wylosować kolor' value='${group.color}'></td>`;
      content += `<td>${group.tribes.length}</td><td>${players}</td><td>${villages}</td><td>${points}</td>`;
      content += `<td><button class='delete-group delete-button'>X</button></td>`;
      newRow.innerHTML = content;
      body.appendChild(newRow);
    }
    body.querySelectorAll(".mark").forEach((mark) => {
      mark.addEventListener("click", this.deleteMark);
    });
    body.querySelectorAll(".group-name").forEach((nameCell) => {
      nameCell.addEventListener("click", this.groupNameClick);
    });
    body.querySelectorAll("input[type=color]").forEach((colorInput) => {
      colorInput.addEventListener("change", this.changeGroupColor);
      colorInput.addEventListener("contextmenu", this.randomizeColor);
    });
    body.querySelectorAll(".delete-group").forEach((deleteGroupButton) => {
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
  groupNameClick = (e: Event) => {
    const cell = e.target as HTMLTableCellElement;
    const name = cell.textContent ?? "";
    cell.innerHTML = `<input type="text" value="${name}">`;
    const input = cell.firstChild as HTMLInputElement;
    input.dataset.oldName = name;
    input.focus();
    input.addEventListener("focusout", this.changeGroupName);
  };
  changeGroupName = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const newName = input.value;
    const oldName = input.dataset.oldName as string;
    const isChanged = this.#generator.changeMarkGroupName(oldName, newName);
    if (!isChanged) {
      //
    }
    this.render();
    this.renderSuggestions();
    this.renderCanvas();
  };
}

export default MarkGroupsTabController;
