import GeneratorController from "./GeneratorController";

const canvasElement = document.getElementById("map-canvas") as HTMLCanvasElement | null;

class CanvasController {
  #generatorController;
  autoRefresh: boolean = true;
  constructor(generatorControllerObject: GeneratorController) {
    this.#generatorController = generatorControllerObject;
    if (!canvasElement) return;
    canvasElement.addEventListener("mousedown", this.dragStart);
    canvasElement.addEventListener("mouseup", this.dragEnd);
  }
  render() {
    if (this.autoRefresh) {
      const imageData = this.#generatorController.getMapImageData();
      if (!imageData || !canvasElement) return;
      const ctx = canvasElement.getContext("2d");
      canvasElement.width = imageData.width;
      canvasElement.height = imageData.width;
      if (ctx) ctx.putImageData(imageData, 0, 0);
    }
  }
  forceRender() {
    this.autoRefresh = true;
    this.render();
    this.autoRefresh = false;
  }
  dragEnd = (e: Event) => {
    const canvas = e.target as HTMLCanvasElement;
    canvas.removeEventListener("mousemove", this.dragMove);
  };
  dragMove = (e: MouseEvent) => {
    const canvas = e.target as HTMLCanvasElement;
    const oldX = parseInt(canvas.dataset.positionX ?? "");
    const oldY = parseInt(canvas.dataset.positionY ?? "");
    const newX = e.clientX;
    const newY = e.clientY;
    if (isNaN(oldX) || isNaN(oldY)) return;
    const shiftX = newX - oldX;
    const shiftY = newY - oldY;
    canvas.dataset.positionX = String(newX);
    canvas.dataset.positionY = String(newY);
    canvas.style.left = `${parseInt(canvas.style.left) + shiftX}px`;
    canvas.style.top = `${parseInt(canvas.style.top) + shiftY}px`;
  };
  dragStart = (e: MouseEvent) => {
    const canvas = e.target as HTMLCanvasElement;
    canvas.dataset.positionX = String(e.clientX);
    canvas.dataset.positionY = String(e.clientY);
    if (canvas.style.left === "") {
      canvas.style.left = "0px";
      canvas.style.top = "0px";
    }
    canvas.addEventListener("mousemove", this.dragMove);
    canvas.addEventListener("mouseleave", this.dragEnd);
  };
}

export default CanvasController;
