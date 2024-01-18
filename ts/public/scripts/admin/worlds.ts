import { handleCreateWorld, handleDeleteWorld } from "../../../routes/api/world-handlers.js";
import { HttpMethod, httpRequest } from "../requests.js";
import { isValidCreateWorldRequestPayload } from "../requests-validators.js";
import { isValidId } from "../validators.js";

const createWorldForm = document.querySelector("form") as HTMLFormElement;
const deleteWorldButtons = document.querySelectorAll(".delete-world-button");
const closeWorldButtons = document.querySelectorAll(".close-world-button");

const worldEndpoint = "/api/world";

const closeWorld = async function (e: Event) {
  const button = e.target as HTMLButtonElement;
  const worldId = parseInt(button.dataset.worldId ?? "");
  if (!isValidId(worldId)) throw new Error("Invalid world id");
  const currentTimestamp = Math.round(Date.now() / 1000);
  const method = HttpMethod.PATCH;
  const endpoint = `${worldEndpoint}/${worldId}`;
  const isClosed = await httpRequest(endpoint, method, { endTimestamp: currentTimestamp });
  if (isClosed) window.location.reload();
  else console.log("Failed to close world with ID", worldId);
};

const createWorld = async function (e: Event) {
  e.preventDefault();
  const serverInput = createWorldForm.querySelector("input[name='server']") as HTMLInputElement;
  const numInput = createWorldForm.querySelector("input[name='num']") as HTMLInputElement;
  const domainInput = createWorldForm.querySelector("input[name='domain']") as HTMLInputElement;
  const startTimestampInput = createWorldForm.querySelector("input[name='start-timestamp']") as HTMLInputElement;
  const endTimestampInput = createWorldForm.querySelector("input[name='end-timestamp']") as HTMLInputElement;
  const payload = {
    server: serverInput.value,
    num: numInput.value,
    domain: domainInput.value,
    startTimestamp: parseInt(startTimestampInput.value),
    endTimestamp: parseInt(endTimestampInput.value),
  };
  if (!isValidCreateWorldRequestPayload(payload)) return console.log("Invalid worldRequestPayload");
  const method = HttpMethod.POST;
  const isCreated: Awaited<ReturnType<typeof handleCreateWorld>> = await httpRequest(worldEndpoint, method, payload);
  if (!isCreated) console.log("Failed to create a world");
  else window.location.reload();
};

const deleteWorld = async function (e: Event) {
  const button = e.target as HTMLButtonElement;
  const worldId = parseInt(button.dataset.worldId ?? "");
  if (!isValidId(worldId)) throw new Error("Invalid world id");
  const payload = { id: worldId };
  const method = HttpMethod.DELETE;
  const endpoint = `${worldEndpoint}/${worldId}`;
  const isDeleted: Awaited<ReturnType<typeof handleDeleteWorld>> = await httpRequest(endpoint, method, payload);
  if (isDeleted) window.location.reload();
  else console.log("Failed to delete world with ID", worldId);
};

createWorldForm?.addEventListener("submit", createWorld);
deleteWorldButtons.forEach((button) => {
  button.addEventListener("click", deleteWorld);
});
closeWorldButtons.forEach((button) => {
  button.addEventListener("click", closeWorld);
});
