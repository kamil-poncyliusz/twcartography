import { handleUpdateUserRank } from "../../../routes/api-handlers.js";
import { postRequest } from "../requests.js";
import { isValidId, isValidUserRank } from "../validators.js";

const selectElements = document.querySelectorAll("select.change-rank");

const changeUserRank = async function (e: Event) {
  const selectElement = e.target as HTMLSelectElement;
  const id = parseInt(selectElement.dataset.userId ?? "");
  const rank = parseInt(selectElement.value);
  if (!isValidId(id) || !isValidUserRank(rank)) return;
  const payload = { id: id, rank: rank };
  const response: Awaited<ReturnType<typeof handleUpdateUserRank>> = await postRequest("/api/user/update/rank", payload);
  if (response) return window.location.reload();
  else {
    selectElement.classList.add("is-invalid");
    console.log("Failed to change user rank");
  }
};

selectElements.forEach((selectElement) => {
  selectElement.addEventListener("change", changeUserRank);
});
