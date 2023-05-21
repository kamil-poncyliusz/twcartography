import loginRequest from "./login-request.js";

const profileButton = document.getElementById("profile-button") as HTMLButtonElement;
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");

const logout = async function (e: Event) {
  const url = `${window.location.origin}/logout`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const success: boolean = await response.json();
  if (success) window.location.reload();
};

profileButton.addEventListener("click", function (e: Event) {
  const target = e.target as HTMLButtonElement;
  const profile = target.nextSibling as HTMLDivElement;
  profile.classList.toggle("hidden");
});
if (loginForm) loginForm.addEventListener("submit", loginRequest);
if (logoutButton) logoutButton.addEventListener("click", logout);
