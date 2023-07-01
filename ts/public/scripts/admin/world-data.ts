import { handleCreateTurnData } from "../../../routes/api-handlers.js";
import { postRequest } from "../requests.js";

const createTurnDataButtons = document.querySelectorAll("button.create-turn-data");

const createTurnData = async function (e: Event) {
  const target = e.target as HTMLButtonElement;
  const world = Number(target.dataset.world);
  const turn = Number(target.dataset.turn);
  const endpoint = `/api/world-data/create/${world}/${turn}`;
  const isCreated: Awaited<ReturnType<typeof handleCreateTurnData>> = await postRequest(endpoint, {});
  if (isCreated) window.location.reload();
  else console.log("Failed to create turn data");
};

createTurnDataButtons.forEach((button) => {
  button.addEventListener("click", createTurnData);
});
