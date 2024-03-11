import { handleCreateUser } from "../../routes/api/user-handlers.js";
import { handleAuthentication, handleLogout } from "../../routes/handlers.js";
import { HttpMethod, httpRequest } from "./requests.js";
import { isValidLogin, isValidPassword } from "./validators.js";

const profileButton = document.getElementById("profile-button") as HTMLButtonElement;
const profileWindow = document.getElementById("profile") as HTMLDivElement;
const loginForm = document.getElementById("login-form") as HTMLFormElement | null;
const logoutButton = document.getElementById("logout-button") as HTMLButtonElement | null;
const registerButton = document.getElementById("register-button") as HTMLButtonElement | null;
const loginInput = loginForm?.querySelector("#login") as HTMLInputElement | null;
const passwordInput = loginForm?.querySelector("#password") as HTMLInputElement | null;
const messageParagraph = document.getElementById("message") as HTMLParagraphElement | null;

const viewMessage = function (message: string) {
  if (!messageParagraph) throw new Error("messageParagraph is null");
  messageParagraph.innerHTML = message;
  if (message === "") messageParagraph.classList.add("hidden");
  else messageParagraph.classList.remove("hidden");
};

const loginRequest = async function (e: Event) {
  e.preventDefault();
  if (!loginInput || !passwordInput) throw new Error("Login or password input is null");
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
  const method = HttpMethod.POST;
  const success: Awaited<ReturnType<typeof handleAuthentication>> = await httpRequest("/auth", method, payload);
  if (!success) viewMessage("Nie udało się zalogować");
  else window.location.reload();
};

const registerRequest = async function (e: Event) {
  if (!loginInput || !passwordInput) throw new Error("Login or password input is null");
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
  const method = HttpMethod.POST;
  const message: Awaited<ReturnType<typeof handleCreateUser>> = await httpRequest("/api/user", method, payload);
  if (message === "success") viewMessage("Rejestracja udana");
  else viewMessage("Rejestracja nieudana");
};

const logoutRequest = async function (e: Event) {
  const method = HttpMethod.POST;
  const success: Awaited<ReturnType<typeof handleLogout>> = await httpRequest("/logout", method, {});
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
