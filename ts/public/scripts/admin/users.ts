import { handleUpdateUserRank } from "../../../routes/api-handlers.js";
import { postRequest } from "../requests.js";

const selectElements = document.querySelectorAll("select.change-rank");

const changeUserRank = async function (e: Event) {
  const target = e.target as HTMLSelectElement;
  const idString = target.dataset.userId;
  const rankString = target.value;
  if (idString !== undefined && rankString !== undefined) {
    const id = parseInt(idString);
    const rank = parseInt(rankString);
    if (id >= 1 && rank >= 0) {
      const payload = { id: id, rank: rank };
      const response: Awaited<ReturnType<typeof handleUpdateUserRank>> = await postRequest("api/user/update/rank", payload);
      if (response) return window.location.reload();
      else {
        target.classList.add("is-invalid");
        console.log("Failed to change user rank");
      }
    }
  }
};

selectElements.forEach((selectElement) => {
  selectElement.addEventListener("change", changeUserRank);
});
