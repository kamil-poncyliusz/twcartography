import { MarkGroup, Tribe } from "../../../src/Types.js";
import GeneratorController from "./GeneratorController.js";
import { randomizeGroupColor } from "../utils.js";

const markGroupsTableBody = document.querySelector("#mark-groups table tbody") as HTMLTableSectionElement | null;

const findGroupName = function (element: Element) {
  const row = element.closest("tr");
  if (!row) return "";
  const groupNameInput = row.querySelector(".group-name > input") as HTMLInputElement | null;
  if (!groupNameInput) return "";
  return groupNameInput.value;
};

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

class MarkGroupsTab {
  #generator;
  constructor(generatorController: GeneratorController) {
    this.#generator = generatorController;
  }
  deleteMarkGroup = (e: Event) => {
    const deleteMarkGroupButton = e.target as HTMLButtonElement;
    const groupName = findGroupName(deleteMarkGroupButton);
    const isDeleted = this.#generator.deleteMarkGroup(groupName);
    if (!isDeleted) console.log("Failed to delete a mark group");
  };
  changeGroupColor = (e: Event) => {
    const colorInput = e.target as HTMLInputElement;
    const newColor = colorInput.value;
    const groupName = findGroupName(colorInput);
    const isGroupColorChanged = this.#generator.changeMarkGroupColor(groupName, newColor);
    if (!isGroupColorChanged) console.log("Failed to change a group color");
  };
  changeGroupName = (e: Event) => {
    const nameInput = e.target as HTMLInputElement;
    const newName = nameInput.value;
    const oldName = nameInput.dataset.oldName ?? "";
    const isGroupNameChanged = this.#generator.changeMarkGroupName(oldName, newName);
    if (isGroupNameChanged) nameInput.classList.remove("is-invalid");
    else nameInput.classList.add("is-invalid");
  };
  deleteMark = (e: Event) => {
    const deleteMarkButton = e.target as HTMLElement;
    const tribeTag = deleteMarkButton.textContent ?? "";
    const groupName = findGroupName(deleteMarkButton);
    const isMarkDeleted = this.#generator.deleteMark(groupName, tribeTag);
    if (!isMarkDeleted) console.log("Failed to delete a mark");
  };
  randomizeColor = (e: Event) => {
    e.preventDefault();
    const colorInput = e.target as HTMLInputElement;
    const groupName = findGroupName(colorInput);
    const newColor = randomizeGroupColor();
    const isGroupColorChanged = this.#generator.changeMarkGroupColor(groupName, newColor);
    if (!isGroupColorChanged) console.log("Failed to change a group color");
  };
  render() {
    const markGroups = this.#generator.markGroups;
    const tribes = this.#generator.tribes;
    if (!markGroupsTableBody) return;
    markGroupsTableBody.innerHTML = "";
    for (let group of markGroups) {
      const content = getMarkGroupRowInnerHTML(group, tribes);
      const newRow = document.createElement("tr");
      newRow.innerHTML = content;
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
