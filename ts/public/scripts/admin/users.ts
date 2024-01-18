import { handleUpdateUser } from "../../../routes/api/user-handlers.js";
import { HttpMethod, httpRequest } from "../requests.js";
import { isValidId, isValidUserRank } from "../validators.js";

const selectElements = document.querySelectorAll("select.change-rank");

const changeUserRank = async function (e: Event) {
  const selectElement = e.target as HTMLSelectElement;
  const id = parseInt(selectElement.dataset.userId ?? "");
  const rank = parseInt(selectElement.value);
  if (!isValidId(id)) throw new Error("Invalid user id");
  if (!isValidUserRank(rank)) throw new Error("Invalid user rank");
  const payload = { updatedFields: { rank: rank } };
  const method = HttpMethod.PATCH;
  const endpoint = `/api/user/${id}`;
  const response: Awaited<ReturnType<typeof handleUpdateUser>> = await httpRequest(endpoint, method, payload);
  if (response) return window.location.reload();
  else {
    selectElement.classList.add("is-invalid");
    console.log("Failed to change user rank");
  }
};

selectElements.forEach((selectElement) => {
  selectElement.addEventListener("change", changeUserRank);
});
