const createTurnDataButtons = document.querySelectorAll("button.create-turn-data");

const createTurnData = async function (e: Event) {
  const target = e.target as HTMLButtonElement;
  const world = Number(target.dataset.world);
  const turn = Number(target.dataset.turn);
  const url = `${window.location.origin}/api/world-data/create/${world}/${turn}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "",
  });
  const isCreated: boolean = await response.json();
  if (isCreated) window.location.reload();
  else console.log("Failed to create turn data");
};

createTurnDataButtons.forEach((button) => {
  button.addEventListener("click", createTurnData);
});
