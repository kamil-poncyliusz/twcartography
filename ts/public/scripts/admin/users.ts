import { handleUpdateUserRank } from "../../../routes/api-handlers.js";

const selectElements = document.querySelectorAll("select.change-rank");

const changeUserRank = async function (e: Event) {
  const target = e.target as HTMLSelectElement;
  const idString = target.dataset.userId;
  const rankString = target.value;
  if (idString !== undefined && rankString !== undefined) {
    const id = parseInt(idString);
    const rank = parseInt(rankString);
    if (id >= 1 && rank >= 0) {
      const url = `${window.location.origin}/api/user/update/rank`;
      const payload = { id: id, rank: rank };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const success: Awaited<ReturnType<typeof handleUpdateUserRank>> = await response.json();
      if (success) return window.location.reload();
    }
  }
  target.classList.add("is-invalid");
};

selectElements.forEach((selectElement) => {
  selectElement.addEventListener("change", changeUserRank);
});
