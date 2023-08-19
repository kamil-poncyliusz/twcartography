import { handleAuthentication, handleLogout, handleRegistration } from "../../routes/router-handlers.js";
import { postRequest } from "./requests.js";
import { isValidLogin, isValidPassword } from "./validators.js";

const profileButton = document.getElementById("profile-button");
const profileWindow = document.getElementById("profile");
const loginForm = document.getElementById("login-form") as HTMLFormElement | null;
const logoutButton = document.getElementById("logout-button") as HTMLButtonElement | null;
const registerButton = document.getElementById("register-button") as HTMLButtonElement | null;
const loginInput = loginForm?.querySelector("#login") as HTMLInputElement | null;
const passwordInput = loginForm?.querySelector("#password") as HTMLInputElement | null;
const messageParagraph = document.getElementById("message") as HTMLParagraphElement | null;

const viewMessage = function (message: string) {
  if (!messageParagraph) return;
  messageParagraph.innerHTML = message;
  if (message === "") messageParagraph.classList.add("hidden");
  else messageParagraph.classList.remove("hidden");
};

const loginRequest = async function (e: Event) {
  e.preventDefault();
  if (!loginInput || !passwordInput) return;
  const login = loginInput.value;
  const password = passwordInput.value;
  if (!isValidLogin(login)) return loginInput.classList.add("is-invalid");
  else loginInput.classList.remove("is-invalid");
  if (!isValidPassword(password)) return passwordInput.classList.add("is-invalid");
  else passwordInput.classList.remove("is-invalid");
  const payload = {
    login: login,
    password: password,
  };
  const success: Awaited<ReturnType<typeof handleAuthentication>> = await postRequest("/auth", payload);
  console.log(success);
  if (!success) viewMessage("Nie udało się zalogować");
  else window.location.reload();
};

const registerRequest = async function (e: Event) {
  if (!loginInput || !passwordInput) return;
  const login = loginInput.value;
  const password = passwordInput.value;
  if (!isValidLogin(login)) return loginInput.classList.add("is-invalid");
  else loginInput.classList.remove("is-invalid");
  if (!isValidPassword(password)) return passwordInput.classList.add("is-invalid");
  else passwordInput.classList.remove("is-invalid");
  const payload = {
    login: login,
    password: password,
  };
  const message: Awaited<ReturnType<typeof handleRegistration>> = await postRequest("/register", payload);
  if (message === "success") viewMessage("Rejestracja udana");
  else viewMessage("Rejestracja nieudana");
};

const logoutRequest = async function (e: Event) {
  const success: Awaited<ReturnType<typeof handleLogout>> = await postRequest("/logout", {});
  if (success) window.location.reload();
  else console.log("Failed to logout");
};

const toggleProfileWindow = function (e: Event) {
  profileWindow?.classList.toggle("hidden");
};

profileButton?.addEventListener("click", toggleProfileWindow);
loginForm?.addEventListener("submit", loginRequest);
logoutButton?.addEventListener("click", logoutRequest);
registerButton?.addEventListener("click", registerRequest);
