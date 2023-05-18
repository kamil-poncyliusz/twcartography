const createTurnDataButtons = document.querySelectorAll("button.create-turn-data");

const createTurnData = async function (e: Event) {
  const target = e.target as HTMLButtonElement;
  const world = Number(target.dataset.world);
  const turn = Number(target.dataset.turn);
  const url = `http://${window.location.host}/api/world-data/create/${world}/${turn}`;
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "",
  });
  const message = await result.json();
  if (message) window.location.reload();
};

createTurnDataButtons.forEach((button) => {
  button.addEventListener("click", createTurnData);
});
