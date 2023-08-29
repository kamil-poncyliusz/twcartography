import { Caption } from "../../../src/Types.js";
import GeneratorController from "./GeneratorController.js";

const captionsTableBody = document.querySelector("#captions table tbody") as HTMLTableSectionElement | null;

const generateCaptionRowInnerHTML = function (caption: Caption): string {
  let innerHTML = `<td><input type='text' class='caption-text' value="${caption.text}"></td>`;
  innerHTML += `<td><input type='color' class='caption-color' value="${caption.color}"></td>`;
  innerHTML += `<td><input type='number' class='caption-font-size' value="${caption.fontSize}"></td>`;
  innerHTML += `<td><input type='number' class='caption-x' value="${caption.x}"></td>`;
  innerHTML += `<td><input type='number' class='caption-y' value="${caption.y}"></td>`;
  innerHTML += `<td><button class='delete-button delete-caption'>X</button></td>`;
  return innerHTML;
};

const getCaptionIndex = function (element: HTMLElement): number {
  const captionRow = element.closest("tr");
  if (!captionRow) return -1;
  const indexString = captionRow.dataset.captionIndex;
  const index = parseInt(indexString ?? "");
  if (isNaN(index) || index < 0) return -1;
  return index;
};

class CaptionsTab {
  #generator: GeneratorController;
  constructor(generatorController: GeneratorController) {
    this.#generator = generatorController;
    this.render();
  }
  addCaption = (e: Event) => {
    if (!captionsTableBody) return;
    const newCaptionColorInput = captionsTableBody.querySelector("#captions .new-caption-color") as HTMLInputElement | null;
    const newCaptionFontSizeInput = captionsTableBody.querySelector("#captions .new-caption-font-size") as HTMLInputElement | null;
    const newCaptionTextInput = captionsTableBody.querySelector("#captions .new-caption-text") as HTMLInputElement | null;
    const newCaptionXInput = captionsTableBody.querySelector("#captions .new-caption-x") as HTMLInputElement | null;
    const newCaptionYInput = captionsTableBody.querySelector("#captions .new-caption-y") as HTMLInputElement | null;
    if (!newCaptionColorInput || !newCaptionFontSizeInput || !newCaptionTextInput || !newCaptionXInput || !newCaptionYInput) return;
    const caption: Caption = {
      color: newCaptionColorInput.value,
      fontSize: parseInt(newCaptionFontSizeInput.value),
      text: newCaptionTextInput.value,
      x: parseInt(newCaptionXInput.value),
      y: parseInt(newCaptionYInput.value),
    };
    const isCaptionAdded = this.#generator.addCaption(caption);
    if (!isCaptionAdded) console.log("Failed to add a new caption");
  };
  changeCaptionColor = (e: Event) => {
    const colorInput = e.target as HTMLInputElement;
    const newColor = colorInput.value;
    const captionIndex = getCaptionIndex(colorInput);
    const isColorChanged = this.#generator.changeCaptionColor(captionIndex, newColor);
    if (!isColorChanged) colorInput.classList.add("is-invalid");
  };
  changeCaptionFontSize = (e: Event) => {
    const fontSizeInput = e.target as HTMLInputElement;
    const newFontSize = parseInt(fontSizeInput.value);
    const captionIndex = getCaptionIndex(fontSizeInput);
    const isFontSizeChanged = this.#generator.changeCaptionFontSize(captionIndex, newFontSize);
    if (!isFontSizeChanged) fontSizeInput.classList.add("is-invalid");
  };
  changeCaptionText = (e: Event) => {
    const textInput = e.target as HTMLInputElement;
    const newText = textInput.value;
    const captionIndex = getCaptionIndex(textInput);
    const isTextChanged = this.#generator.changeCaptionText(captionIndex, newText);
    if (!isTextChanged) textInput.classList.add("is-invalid");
  };
  changeCaptionX = (e: Event) => {
    const xInput = e.target as HTMLInputElement;
    const newX = parseInt(xInput.value);
    const captionIndex = getCaptionIndex(xInput);
    const isXChanged = this.#generator.changeCaptionX(captionIndex, newX);
    if (!isXChanged) xInput.classList.add("is-invalid");
  };
  changeCaptionY = (e: Event) => {
    const yInput = e.target as HTMLInputElement;
    const newY = parseInt(yInput.value);
    const captionIndex = getCaptionIndex(yInput);
    const isYChanged = this.#generator.changeCaptionY(captionIndex, newY);
    if (!isYChanged) yInput.classList.add("is-invalid");
  };
  deleteCaption = (e: Event) => {
    const target = e.target as HTMLButtonElement;
    const captionIndex = getCaptionIndex(target);
    this.#generator.deleteCaption(captionIndex);
  };
  render() {
    if (!captionsTableBody) return;
    const captions = this.#generator.captions;
    captionsTableBody.innerHTML = "";
    for (let i = 0; i < captions.length; i++) {
      const caption = captions[i];
      const newRow = document.createElement("tr");
      newRow.dataset.captionIndex = String(i);
      const rowContent = generateCaptionRowInnerHTML(caption);
      newRow.innerHTML = rowContent;
      captionsTableBody.appendChild(newRow);
    }
    const newCaptionRow = document.createElement("tr");
    let rowContent = "<td><input type='text' class='new-caption-text'></td>";
    rowContent += "<td><input type='color' class='new-caption-color' value='#FFFFFF'></td>";
    rowContent += "<td><input type='number' class='new-caption-font-size' value='10'></td>";
    rowContent += "<td><input type='number' class='new-caption-x' value='0'></td>";
    rowContent += "<td><input type='number' class='new-caption-y' value='0'></td>";
    rowContent += "<td><button class='add-new-caption'>+</button></td>";
    newCaptionRow.innerHTML = rowContent;
    captionsTableBody.appendChild(newCaptionRow);
    const addNewCaptionButton = newCaptionRow.querySelector(".add-new-caption") as HTMLButtonElement | null;
    addNewCaptionButton?.addEventListener("click", this.addCaption);
    const deleteCaptionButtons = captionsTableBody.querySelectorAll(".delete-caption");
    deleteCaptionButtons.forEach((deleteCaptionButton) => {
      deleteCaptionButton.addEventListener("click", this.deleteCaption);
    });
    const changeCaptionColorInputs = captionsTableBody.querySelectorAll(".caption-color");
    changeCaptionColorInputs.forEach((changeCaptionColorInput) => {
      changeCaptionColorInput.addEventListener("change", this.changeCaptionColor);
    });
    const changeCaptionFontSizeInputs = captionsTableBody.querySelectorAll(".caption-font-size");
    changeCaptionFontSizeInputs.forEach((changeCaptionFontSizeInput) => {
      changeCaptionFontSizeInput.addEventListener("change", this.changeCaptionFontSize);
    });
    const changeCaptionTextInputs = captionsTableBody.querySelectorAll(".caption-text");
    changeCaptionTextInputs.forEach((changeCaptionTextInput) => {
      changeCaptionTextInput.addEventListener("change", this.changeCaptionText);
    });
    const changeCaptionXInputs = captionsTableBody.querySelectorAll(".caption-x");
    changeCaptionXInputs.forEach((changeCaptionXInput) => {
      changeCaptionXInput.addEventListener("change", this.changeCaptionX);
    });
    const changeCaptionYInputs = captionsTableBody.querySelectorAll(".caption-y");
    changeCaptionYInputs.forEach((changeCaptionYInput) => {
      changeCaptionYInput.addEventListener("change", this.changeCaptionY);
    });
  }
}

export default CaptionsTab;
