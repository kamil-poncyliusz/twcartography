const createWorldDataButtons = document.querySelectorAll("button.create-world-data");

const createWorldData = async function (e: Event) {
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

createWorldDataButtons.forEach((button) => {
  button.addEventListener("click", createWorldData);
});
