import { handleCreateWorld } from "../../../routes/api-handlers.js";

const createWorldForm = document.querySelector("form") as HTMLFormElement;

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

createWorldForm.addEventListener("submit", createWorld);
