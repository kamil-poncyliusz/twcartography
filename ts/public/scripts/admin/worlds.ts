import { handleCreateWorld, handleDeleteWorld } from "../../../routes/api-handlers.js";
import { postRequest } from "../requests.js";
import { isValidCreateWorldRequestPayload } from "../requests-validators.js";
import { isValidId } from "../validators.js";

const createWorldForm = document.querySelector("form") as HTMLFormElement;
const deleteWorldButtons = document.querySelectorAll(".delete-world-button");

const sendDeleteWorldRequest = async function (worldId: number) {
  const url = `${window.location.origin}/api/world/delete`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: worldId,
    }),
  });
  const success: Awaited<ReturnType<typeof handleDeleteWorld>> = await response.json();
  return success;
};

const createWorld = async function (e: Event) {
  e.preventDefault();
  const serverInput = createWorldForm.querySelector("input[name='server']") as HTMLInputElement;
  const numInput = createWorldForm.querySelector("input[name='num']") as HTMLInputElement;
  const domainInput = createWorldForm.querySelector("input[name='domain']") as HTMLInputElement;
  const timestampInput = createWorldForm.querySelector("input[name='start-timestamp']") as HTMLInputElement;
  const payload = {
    server: serverInput.value,
    num: numInput.value,
    domain: domainInput.value,
    timestamp: parseInt(timestampInput.value),
  };
  if (!isValidCreateWorldRequestPayload(payload)) return console.log("Invalid worldRequestPayload");
  const isCreated: Awaited<ReturnType<typeof handleCreateWorld>> = await postRequest("/api/world/create", payload);
  if (!isCreated) console.log("Failed to create a world");
  else window.location.reload();
};

const deleteWorld = async function (e: Event) {
  const button = e.target as HTMLButtonElement;
  const worldId = parseInt(button.dataset.worldId ?? "");
  if (!isValidId(worldId)) throw new Error("Invalid world id");
  const isDeleted = await sendDeleteWorldRequest(worldId);
  if (isDeleted) window.location.reload();
  else console.log("Failed to delete world with ID", worldId);
};

createWorldForm?.addEventListener("submit", createWorld);
deleteWorldButtons.forEach((button) => {
  button.addEventListener("click", deleteWorld);
});
