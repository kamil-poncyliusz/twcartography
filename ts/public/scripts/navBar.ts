import loginRequest from "./loginRequest.js";

const profileButton = document.getElementById("profile-button") as HTMLButtonElement;
const loginForm = document.getElementById("login-form");

profileButton.addEventListener("click", function (e: Event) {
  const target = e.target as HTMLButtonElement;
  const profile = target.nextSibling as HTMLDivElement;
  profile.classList.toggle("hidden");
});
if (loginForm) loginForm.addEventListener("submit", loginRequest);
