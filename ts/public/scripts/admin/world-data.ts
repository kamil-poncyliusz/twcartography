import { handleCreateTurnData } from "../../../routes/api-handlers.js";
import { postRequest } from "../requests.js";
import { isValidID, isValidTurn } from "../validators.js";

const createTurnDataButtons = document.querySelectorAll("button.create-turn-data");

const createTurnData = async function (e: Event) {
  const button = e.target as HTMLButtonElement;
  const worldID = parseInt(button.dataset.world ?? "");
  const turn = parseInt(button.dataset.turn ?? "");
  if (!isValidID(worldID) || !isValidTurn(turn)) return;
  const payload = {
    world: worldID,
    turn: turn,
  };
  const endpoint = `/api/world-data/create`;
  const isCreated: Awaited<ReturnType<typeof handleCreateTurnData>> = await postRequest(endpoint, payload);
  console.log(isCreated);
  if (isCreated) window.location.reload();
  else console.log("Failed to create turn data");
};

createTurnDataButtons.forEach((button) => {
  button.addEventListener("click", createTurnData);
});
