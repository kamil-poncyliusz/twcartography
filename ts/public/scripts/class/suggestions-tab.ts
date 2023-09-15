import GeneratorController from "./generator-controller.js";
import { randomizeGroupColor } from "../utils.js";
import { GROUP_NAME_FORBIDDEN_CHARACTERS } from "../constants.js";

const suggestionsTableBody = document.querySelector("#mark-suggestions tbody") as HTMLTableSectionElement;
const suggestionsSearchInput = document.querySelector("#mark-suggestions thead input") as HTMLInputElement;

const removeForbiddenCharactersFromGroupName = function (groupName: string): string {
  let result = groupName;
  const forbidden = GROUP_NAME_FORBIDDEN_CHARACTERS.split("");
  for (const character of forbidden) {
    result = result.replaceAll(character, "");
  }
  return result;
};

class SuggestionsTab {
  #generator: GeneratorController;
  constructor(generatorController: GeneratorController) {
    this.#generator = generatorController;
    suggestionsSearchInput.addEventListener("input", (e: Event) => {
      this.render();
    });
  }
  #addMark = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const row = target.closest("tr") as HTMLTableRowElement;
    const suggestionTagCell = row.querySelector(".suggestion-tag") as HTMLTableCellElement;
    const suggestionTribeTag = suggestionTagCell.textContent ?? "";
    let selectedGroupIndex = parseInt(target.value);
    if (!(selectedGroupIndex >= -1 && selectedGroupIndex < this.#generator.markGroups.length)) return target.classList.add("is-invalid");

    if (selectedGroupIndex === -1) {
      const groupName = removeForbiddenCharactersFromGroupName(suggestionTribeTag);
      const groupColor = randomizeGroupColor();
      const isMarkGroupAdded = this.#generator.addMarkGroup({ name: groupName, color: groupColor, tribes: [] });
      if (!isMarkGroupAdded) return console.log("Failed to create a new group");
      selectedGroupIndex = this.#generator.markGroups.length - 1;
    }
    const isMarkAdded = this.#generator.addMark(selectedGroupIndex, suggestionTribeTag);
    if (!isMarkAdded) return console.log("Failed to add a new mark");
  };
  render() {
    const tag = suggestionsSearchInput.value;
    const suggestions = this.#generator.getSuggestions(tag, 30);
    suggestionsTableBody.innerHTML = "";
    let groupOptions = "<option selected disabled hidden>Dodaj</option>";
    groupOptions += `<option value="-1"}">Utwórz grupę</option>`;
    for (let markGroupIndex = 0; markGroupIndex < this.#generator.markGroups.length; markGroupIndex++) {
      const markGroup = this.#generator.markGroups[markGroupIndex];
      groupOptions += `<option value="${markGroupIndex}">${markGroup.name}</option>`;
    }
    for (let tribe of suggestions) {
      const newRow = document.createElement("tr");
      let rowInnerHTML = "";
      rowInnerHTML += `<td class='suggestion-name'>${tribe.name}</td><td class='suggestion-tag'>${tribe.tag}</td>`;
      rowInnerHTML += `<td>${tribe.players}</td><td>${tribe.villages.length}</td><td>${tribe.points}</td>`;
      rowInnerHTML += `<td><select>${groupOptions}</select></td>`;
      newRow.innerHTML = rowInnerHTML;
      suggestionsTableBody.appendChild(newRow);
    }
    suggestionsTableBody.querySelectorAll("select").forEach((selectElement) => {
      selectElement.addEventListener("change", this.#addMark);
    });
  }
}

export default SuggestionsTab;
