import { handleCreateServer, handleDeleteServer } from "../../../routes/api/server-handlers.js";
import { CreateServerRequestPayload } from "../../../src/types.js";
import { isValidCreateServerRequestPayload } from "../requests-validators.js";
import { HttpMethod, httpRequest } from "../requests.js";
import { isValidDomain, isValidId } from "../validators.js";

const createServerForm = document.querySelector("form") as HTMLFormElement;
const serverStatusButtons = document.querySelectorAll(".server-status-button");
const deleteServerButtons = document.querySelectorAll(".delete-server-button");

const serverEndpoint = "/api/server";

const changeServerStatus = async function (e: Event) {
  const button = e.target as HTMLButtonElement;
  const serverId = parseInt(button.dataset.serverId ?? "");
  if (!isValidId(serverId)) throw new Error("Invalid server id");
  const currentTimestamp = Math.round(Date.now() / 1000);
  const method = HttpMethod.PATCH;
  const endpoint = `${serverEndpoint}/${serverId}`;
  const isClosed = await httpRequest(endpoint, method, { endTimestamp: currentTimestamp });
  if (isClosed) window.location.reload();
  else console.log("Failed to change server status with ID", serverId);
};

const createServer = async function (e: Event) {
  e.preventDefault();
  const nameInput = createServerForm.querySelector("input[name='name']") as HTMLInputElement;
  const domainInput = createServerForm.querySelector("input[name='domain']") as HTMLInputElement;
  const updateHourInput = createServerForm.querySelector("input[name='update-hour']") as HTMLInputElement;
  const domain = domainInput.value;
  const payload: CreateServerRequestPayload = {
    name: nameInput.value,
    domain: isValidDomain(domain) ? domain : null,
    updateHour: parseInt(updateHourInput.value),
  };
  if (!isValidCreateServerRequestPayload(payload)) return console.log("Invalid payload");
  const method = HttpMethod.POST;
  const isCreated: Awaited<ReturnType<typeof handleCreateServer>> = await httpRequest(serverEndpoint, method, payload);
  if (!isCreated) console.log("Failed to create a server");
  else window.location.reload();
};

const deleteServer = async function (e: Event) {
  const button = e.target as HTMLButtonElement;
  const serverId = parseInt(button.dataset.serverId ?? "");
  if (!isValidId(serverId)) throw new Error("Invalid server id");
  const method = HttpMethod.DELETE;
  const endpoint = `${serverEndpoint}/${serverId}`;
  const isDeleted: Awaited<ReturnType<typeof handleDeleteServer>> = await httpRequest(endpoint, method);
  if (isDeleted) window.location.reload();
  else console.log("Failed to delete server with ID", serverId);
};

createServerForm?.addEventListener("submit", createServer);
deleteServerButtons.forEach((button) => {
  button.addEventListener("click", deleteServer);
});
serverStatusButtons.forEach((button) => {
  button.addEventListener("click", changeServerStatus);
});
