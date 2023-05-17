import CanvasController from "./Canvas";
import GeneratorController from "./GeneratorController";
import SettingsTabController from "./SettingsTab";
import SuggestionsTabController from "./SuggestionsTab";

const markGroupsTableElement = document.querySelector("#mark-groups table") as Element;

class MarkGroupsTabController {
  #generator;
  #body;
  #settingsObject: SettingsTabController | undefined;
  #suggestionsObject: SuggestionsTabController | undefined;
  #canvasObject: CanvasController | undefined;
  constructor(mapGeneratorObject: GeneratorController) {
    this.#generator = mapGeneratorObject;
    this.#body = markGroupsTableElement.querySelector("tbody") as HTMLTableSectionElement;
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
    body.innerHTML = "";
    for (let group of groups) {
      const newRow = document.createElement("tr");
      let content = "";
      for (let tribeId of group.tribes) {
        const tribe = tribes[tribeId];
        content += `<p class='mark label-button delete-button' title='${tribe.name}'>${tribe.tag}</p>`;
      }
      const players = group.tribes.reduce((sum, tribeId) => sum + tribes[tribeId].players, 0);
      const villages = group.tribes.reduce((sum, tribeId) => sum + tribes[tribeId].villages.length, 0);
      const points = group.tribes.reduce((sum, tribeId) => sum + tribes[tribeId].points, 0);
      content = `<td class='group-tribes'>${content}</td><td class='group-name'>${group.name}</td><td><input type='color' value='${group.color}'></td>`;
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
    const target = e.target as HTMLButtonElement;
    const cell = target.parentElement as HTMLTableCellElement;
    const row = cell.parentElement as HTMLTableRowElement;
    const nameCell = row.querySelector(".group-name") as HTMLTableCellElement;
    const name = nameCell.textContent as string;
    const result = this.#generator.deleteMarkGroup(name);
    if (!result) return;
    this.render();
    this.updateSettings();
    this.renderSuggestions();
    this.renderCanvas();
  };
  changeGroupColor = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const color = target.value;
    const cell = target.parentElement as HTMLTableCellElement;
    const row = cell.parentElement as HTMLTableRowElement;
    const nameCell = row.querySelector(".group-name") as HTMLTableCellElement;
    const name = nameCell.textContent as string;
    const result = this.#generator.changeMarkGroupColor(name, color);
    if (!result) return;
    this.render();
    this.updateSettings();
    this.renderCanvas();
  };
  deleteMark = (e: Event) => {
    const target = e.target as HTMLElement;
    const cell = target.parentElement as HTMLTableCellElement;
    const row = cell.parentElement as HTMLTableRowElement;
    const tribeTag = target.textContent as string;
    const nameCell = row.querySelector(".group-name") as HTMLTableCellElement;
    const groupName = nameCell.textContent as string;
    const result = this.#generator.deleteMark(groupName, tribeTag);
    if (!result) return;
    this.render();
    this.updateSettings();
    this.renderSuggestions();
    this.renderCanvas();
  };
  groupNameClick = (e: Event) => {
    const target = e.target as HTMLTableCellElement;
    const name = target.textContent as string;
    target.innerHTML = `<input type="text" value="${name}">`;
    const input = target.firstChild as HTMLInputElement;
    input.dataset.oldName = name;
    input.focus();
    input.addEventListener("focusout", this.changeGroupName);
  };
  changeGroupName = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const name = target.value;
    const oldName = target.dataset.oldName as string;
    const result = this.#generator.changeMarkGroupName(oldName, name);
    if (result) {
      //
    }
    this.render();
  };
}

export default MarkGroupsTabController;
