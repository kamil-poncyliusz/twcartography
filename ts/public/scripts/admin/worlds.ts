import { handleCreateWorld, handleDeleteWorld } from "../../../routes/api-handlers.js";

const createWorldForm = document.querySelector("form") as HTMLFormElement;
const deleteWorldButtons = document.querySelectorAll(".delete-world-button");

const sendCreateWorldRequest = async function (server: string, num: string, domain: string, timestamp: number) {
  const url = `${window.location.origin}/api/world/create`;
  const body = JSON.stringify({
    server: server,
    num: num,
    domain: domain,
    timestamp: timestamp,
  });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });
  const createdMapId: Awaited<ReturnType<typeof handleCreateWorld>> = await response.json();
  return createdMapId;
};

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
  const form = e.target as HTMLFormElement;
  if (!form) return;
  const serverInput = form.querySelector("input[name='server']") as HTMLInputElement;
  const numInput = form.querySelector("input[name='num']") as HTMLInputElement;
  const domainInput = form.querySelector("input[name='domain']") as HTMLInputElement;
  const timestampInput = form.querySelector("input[name='start-timestamp']") as HTMLInputElement;
  if (!serverInput || !numInput || !domainInput || !timestampInput) return;
  const server = serverInput.value;
  const num = numInput.value;
  const domain = domainInput.value;
  const timestamp = parseInt(timestampInput.value);
  const result = await sendCreateWorldRequest(server, num, domain, timestamp);
  if (result === false) console.log("Failed to create a world");
  else window.location.reload();
};

const deleteWorld = async function (e: Event) {
  const target = e.target as HTMLButtonElement;
  const worldIdString = target.dataset.worldId;
  if (worldIdString === undefined) return;
  const worldId = parseInt(worldIdString);
  if (isNaN(worldId) || worldId < 1) return;
  const isDeleted = await sendDeleteWorldRequest(worldId);
  if (isDeleted) window.location.reload();
  else console.log("Failed to delete world with ID", worldId);
};

createWorldForm.addEventListener("submit", createWorld);
deleteWorldButtons.forEach((button) => {
  console.log("eventListener Added");
  button.addEventListener("click", deleteWorld);
});
