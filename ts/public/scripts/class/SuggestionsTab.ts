import GeneratorController from "./GeneratorController.js";
import { randomizeGroupColor } from "../utils.js";

const suggestionsTableBody = document.querySelector("#mark-suggestions tbody") as HTMLTableSectionElement | null;
const suggestionsSearchInput = document.querySelector("#mark-suggestions thead input") as HTMLInputElement | null;

class SuggestionsTab {
  #generator: GeneratorController;
  constructor(generatorController: GeneratorController) {
    this.#generator = generatorController;
    suggestionsSearchInput?.addEventListener("input", (e: Event) => {
      this.render();
    });
  }
  #addMark = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const row = target.closest("tr") as HTMLTableRowElement;
    const suggestionTagCell = row.querySelector(".suggestion-tag") as HTMLTableCellElement;
    const suggestionTribeTag = suggestionTagCell.textContent ?? "";
    let selectedGroupName = target.value;
    if (selectedGroupName === "Utwórz grupę") {
      const groupName = suggestionTribeTag.replaceAll(",", ".").replaceAll(" ", "_");
      const groupColor = randomizeGroupColor();
      const isMarkGroupAdded = this.#generator.addMarkGroup({ name: groupName, color: groupColor, tribes: [] });
      if (!isMarkGroupAdded) return console.log("Failed to create a new group");
      selectedGroupName = groupName;
    }
    const isMarkAdded = this.#generator.addMark(selectedGroupName, suggestionTribeTag);
    if (!isMarkAdded) return console.log("Failed to add a new mark");
  };
  render() {
    if (!suggestionsTableBody) return;
    const tag = suggestionsSearchInput ? suggestionsSearchInput.value : "";
    const suggestions = this.#generator.getSuggestions(tag, 30);
    suggestionsTableBody.innerHTML = "";
    const groupNames = this.#generator.markGroups.map((group) => group.name);
    let groupOptions = "<option selected disabled hidden>Dodaj</option>";
    groupOptions += `<option>Utwórz grupę</option>`;
    for (let groupName of groupNames) {
      groupOptions += `<option>${groupName}</option>`;
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
