import { handleAuthentication, handleLogout, handleRegistration } from "../../routes/router-handlers.js";
import { postRequest } from "./requests.js";
import { isValidLogin, isValidPassword } from "./validators.js";

const profileButton = document.getElementById("profile-button");
const profile = document.getElementById("profile");
const loginForm = document.getElementById("login-form") as HTMLFormElement | null;
const logoutButton = document.getElementById("logout-button") as HTMLButtonElement | null;
const registerButton = document.getElementById("register-button") as HTMLButtonElement | null;
const loginInput = loginForm?.querySelector("#login") as HTMLInputElement | null;
const passwordInput = loginForm?.querySelector("#password") as HTMLInputElement | null;

const loginRequest = async function (e: Event) {
  e.preventDefault();
  if (!loginInput || !passwordInput) return;
  const login = loginInput.value;
  const password = passwordInput.value;
  if (!isValidLogin(login) || !isValidPassword(password)) return;
  const payload = {
    login: login,
    password: password,
  };
  const success: Awaited<ReturnType<typeof handleAuthentication>> = await postRequest("/auth", payload);
  if (!success) console.log("Login failed");
  else window.location.reload();
};

const registerRequest = async function (e: Event) {
  if (!loginInput || !passwordInput) return;
  const login = loginInput.value;
  const password = passwordInput.value;
  if (!isValidLogin(login) || !isValidPassword(password)) return;
  const payload = {
    login: login,
    password: password,
  };
  const message: Awaited<ReturnType<typeof handleRegistration>> = await postRequest("/register", payload);
  if (message === "success") console.log("Successfully registered an account");
  else console.log(message);
};

const logoutRequest = async function (e: Event) {
  const success: Awaited<ReturnType<typeof handleLogout>> = await postRequest("/logout", {});
  if (success) window.location.reload();
  else console.log("Failed to logout");
};

const toggleProfileWindow = function (e: Event) {
  if (profile) profile.classList.toggle("hidden");
};

if (profileButton) profileButton.addEventListener("click", toggleProfileWindow);
if (loginForm) loginForm.addEventListener("submit", loginRequest);
if (logoutButton) logoutButton.addEventListener("click", logoutRequest);
if (registerButton) registerButton.addEventListener("click", registerRequest);
