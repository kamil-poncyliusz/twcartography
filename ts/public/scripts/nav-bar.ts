import { handleAuthentication, handleLogout, handleRegistration } from "../../routes/router-handlers.js";
import { postRequest } from "./requests.js";

const profileButton = document.getElementById("profile-button") as HTMLButtonElement;
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const registerButton = document.getElementById("register-button");

const loginRequest = async function (e: Event) {
  e.preventDefault();
  const target = e.target as HTMLFormElement;
  const loginInput = target.querySelector("#login") as HTMLInputElement;
  const passwordInput = target.querySelector("#password") as HTMLInputElement;
  const login = loginInput.value;
  const password = passwordInput.value;
  if (login.length < 2 || password.length < 8) return;
  const payload = {
    login: login,
    password: password,
  };
  const success: Awaited<ReturnType<typeof handleAuthentication>> = await postRequest("auth", payload);
  if (!success) console.log("Login failed");
  else window.location.reload();
};

const registerRequest = async function (e: Event) {
  if (!loginForm) return;
  const loginInput = loginForm.querySelector("#login") as HTMLInputElement;
  const passwordInput = loginForm.querySelector("#password") as HTMLInputElement;
  if (!loginInput || !passwordInput) return;
  const login = loginInput.value;
  const password = passwordInput.value;
  if (login.length < 2 || password.length < 8) return;
  const payload = {
    login: login,
    password: password,
  };
  const message: Awaited<ReturnType<typeof handleRegistration>> = await postRequest("register", payload);
  if (message === true) console.log("Successfully registered an account");
  else console.log(message);
};

const logoutRequest = async function (e: Event) {
  const success: Awaited<ReturnType<typeof handleLogout>> = await postRequest("logout", {});
  if (success) window.location.reload();
  else console.log("Failed to logout");
};

profileButton.addEventListener("click", function (e: Event) {
  const target = e.target as HTMLButtonElement;
  const profile = target.nextSibling as HTMLDivElement;
  profile.classList.toggle("hidden");
});
if (loginForm) loginForm.addEventListener("submit", loginRequest);
if (logoutButton) logoutButton.addEventListener("click", logoutRequest);
if (registerButton) registerButton.addEventListener("click", registerRequest);
