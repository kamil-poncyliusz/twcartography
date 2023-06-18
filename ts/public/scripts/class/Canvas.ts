import GeneratorController from "./GeneratorController";

const canvasElement = document.getElementById("map-canvas") as HTMLCanvasElement;

class CanvasController {
  #generator;
  autoRefresh: boolean = true;
  constructor(mapGeneratorObject: GeneratorController) {
    this.#generator = mapGeneratorObject;
    canvasElement.addEventListener("mousedown", this.dragStart);
    canvasElement.addEventListener("mouseup", this.dragEnd);
  }
  render() {
    if (this.autoRefresh) {
      const imageData = this.#generator.getMapImageData() as ImageData;
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
    const target = e.target as HTMLCanvasElement;
    target.removeEventListener("mousemove", this.dragMove);
  };
  dragMove = (e: MouseEvent) => {
    const canvas = e.target as HTMLCanvasElement;
    const offsetX = e.clientX - parseInt(canvas.dataset.dragX as string);
    const offsetY = e.clientY - parseInt(canvas.dataset.dragY as string);
    canvas.dataset.dragX = String(e.clientX);
    canvas.dataset.dragY = String(e.clientY);
    canvas.style.left = `${parseInt(canvas.style.left) + offsetX}px`;
    canvas.style.top = `${parseInt(canvas.style.top) + offsetY}px`;
  };
  dragStart = (e: MouseEvent) => {
    const canvas = e.target as HTMLCanvasElement;
    canvas.dataset.dragX = String(e.clientX);
    canvas.dataset.dragY = String(e.clientY);
    if (canvas.style.left === "") {
      canvas.style.left = "0px";
      canvas.style.top = "0px";
    }
    canvas.addEventListener("mousemove", this.dragMove);
  };
}

export default CanvasController;
