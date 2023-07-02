import { handleCreateTurnData } from "../../../routes/api-handlers.js";
import { postRequest } from "../requests.js";
import { isValidID, isValidTurn } from "../validators.js";

const createTurnDataButtons = document.querySelectorAll("button.create-turn-data");

const createTurnData = async function (e: Event) {
  const target = e.target as HTMLButtonElement;
  const world = parseInt(target.dataset.world ?? "");
  const turn = parseInt(target.dataset.turn ?? "");
  if (!isValidID(world) || !isValidTurn(turn)) return;
  const payload = {
    world: world,
    turn: turn,
  };
  const endpoint = `/api/world-data/create`;
  const isCreated: Awaited<ReturnType<typeof handleCreateTurnData>> = await postRequest(endpoint, payload);
  if (isCreated) window.location.reload();
  else console.log("Failed to create turn data");
};

createTurnDataButtons.forEach((button) => {
  button.addEventListener("click", createTurnData);
});
