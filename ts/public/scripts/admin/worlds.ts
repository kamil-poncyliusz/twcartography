import { handleCreateWorld, handleDeleteWorld } from "../../../routes/api-handlers.js";
import { postRequest } from "../requests.js";
import { isValidID, isValidWorldCreatePayload } from "../validators.js";

const createWorldForm = document.querySelector("form");
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
  const form = createWorldForm;
  if (!form) return;
  const serverInput = form.querySelector("input[name='server']") as HTMLInputElement | null;
  const numInput = form.querySelector("input[name='num']") as HTMLInputElement | null;
  const domainInput = form.querySelector("input[name='domain']") as HTMLInputElement | null;
  const timestampInput = form.querySelector("input[name='start-timestamp']") as HTMLInputElement | null;
  if (!serverInput || !numInput || !domainInput || !timestampInput) return;
  const payload = {
    server: serverInput.value,
    num: numInput.value,
    domain: domainInput.value,
    timestamp: parseInt(timestampInput.value),
  };
  if (!isValidWorldCreatePayload(payload)) return;
  const isCreated: Awaited<ReturnType<typeof handleCreateWorld>> = await postRequest("/api/world/create", payload);
  if (!isCreated) console.log("Failed to create a world");
  else window.location.reload();
};

const deleteWorld = async function (e: Event) {
  const button = e.target as HTMLButtonElement;
  const worldID = parseInt(button.dataset.worldId ?? "");
  if (!isValidID(worldID)) return;
  const isDeleted = await sendDeleteWorldRequest(worldID);
  if (isDeleted) window.location.reload();
  else console.log("Failed to delete world with ID", worldID);
};

if (createWorldForm) createWorldForm.addEventListener("submit", createWorld);
deleteWorldButtons.forEach((button) => {
  button.addEventListener("click", deleteWorld);
});
