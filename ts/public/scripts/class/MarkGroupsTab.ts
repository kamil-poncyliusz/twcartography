import { MarkGroup, Tribe } from "../../../src/Types.js";
import GeneratorController from "./GeneratorController.js";
import { randomizeGroupColor } from "../utils.js";

const markGroupsTableBody = document.querySelector("#mark-groups table tbody") as HTMLTableSectionElement | null;

const getMarkGroupIndex = function (element: Element): number {
  const row = element.closest("tr");
  if (!row) return -1;
  const index = parseInt(row.dataset.markGroupIndex ?? "");
  if (isNaN(index) || index < 0) return -1;
  return index;
};

const generateMarkGroupRowInnerHTML = function (group: MarkGroup, tribes: { [key: string]: Tribe }): string {
  let innerHTML = "";
  for (let tribeId of group.tribes) {
    const tribe = tribes[tribeId];
    innerHTML += `<button class='mark block-element delete-button' title='${tribe.name}'>${tribe.tag}</button>`;
  }
  const players = group.tribes.reduce((sum, tribeId) => sum + tribes[tribeId].players, 0);
  const villages = group.tribes.reduce((sum, tribeId) => sum + tribes[tribeId].villages.length, 0);
  const points = group.tribes.reduce((sum, tribeId) => sum + tribes[tribeId].points, 0);
  innerHTML = `<td class='group-tribes'><div>${innerHTML}</div></td>`;
  innerHTML += `<td class='group-name'><input type='text' value='${group.name}' placeholder='nazwa'></td>`;
  innerHTML += `<td><input type='color' title='Kliknij prawym aby wylosować kolor' value='${group.color}' style='background-color:${group.color};'></td>`;
  innerHTML += `<td>${group.tribes.length}</td><td>${players}</td><td>${villages}</td><td>${points}</td>`;
  innerHTML += `<td><button class='delete-group delete-button'>X</button></td>`;
  return innerHTML;
};

class MarkGroupsTab {
  #generator;
  constructor(generatorController: GeneratorController) {
    this.#generator = generatorController;
  }
  deleteMarkGroup = (e: Event) => {
    const button = e.target as HTMLButtonElement;
    const markGroupIndex = getMarkGroupIndex(button);
    const isDeleted = this.#generator.deleteMarkGroup(markGroupIndex);
    if (!isDeleted) console.log("Failed to delete a mark group");
  };
  changeGroupColor = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const newColor = input.value;
    const markGroupIndex = getMarkGroupIndex(input);
    const isGroupColorChanged = this.#generator.changeMarkGroupColor(markGroupIndex, newColor);
    if (!isGroupColorChanged) console.log("Failed to change a group color");
  };
  changeGroupName = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const newName = input.value;
    const markGroupIndex = getMarkGroupIndex(input);
    const isGroupNameChanged = this.#generator.changeMarkGroupName(markGroupIndex, newName);
    if (isGroupNameChanged) input.classList.remove("is-invalid");
    else input.classList.add("is-invalid");
  };
  deleteMark = (e: Event) => {
    const button = e.target as HTMLElement;
    const tribeTag = button.textContent ?? "";
    const markGroupIndex = getMarkGroupIndex(button);
    const isMarkDeleted = this.#generator.deleteMark(markGroupIndex, tribeTag);
    if (!isMarkDeleted) console.log("Failed to delete a mark");
  };
  randomizeColor = (e: Event) => {
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    const markGroupIndex = getMarkGroupIndex(input);
    const newColor = randomizeGroupColor();
    const isGroupColorChanged = this.#generator.changeMarkGroupColor(markGroupIndex, newColor);
    if (!isGroupColorChanged) console.log("Failed to change a group color");
  };
  render() {
    const markGroups = this.#generator.markGroups;
    const tribes = this.#generator.tribes;
    if (!markGroupsTableBody) return;
    markGroupsTableBody.innerHTML = "";
    for (let index = 0; index < markGroups.length; index++) {
      const group = markGroups[index];
      const newRow = document.createElement("tr");
      const rowContent = generateMarkGroupRowInnerHTML(group, tribes);
      newRow.innerHTML = rowContent;
      newRow.dataset.markGroupIndex = String(index);
      markGroupsTableBody.appendChild(newRow);
    }
    markGroupsTableBody.querySelectorAll(".mark").forEach((markButton) => {
      markButton.addEventListener("click", this.deleteMark);
    });
    markGroupsTableBody.querySelectorAll(".group-name input").forEach((nameInput) => {
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
}

export default MarkGroupsTab;
