import { handleRegistration } from "../../routes/router-handlers.js";
import loginRequest from "./login-request.js";

const profileButton = document.getElementById("profile-button") as HTMLButtonElement;
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const registerButton = document.getElementById("register-button");

const register = async function (e: Event) {
  if (!loginForm) return;
  const loginInput = loginForm.querySelector("#login") as HTMLInputElement;
  const passwordInput = loginForm.querySelector("#password") as HTMLInputElement;
  if (!loginInput || !passwordInput) return;
  const login = loginInput.value;
  const password = passwordInput.value;
  if (login.length < 2 || password.length < 8) return;
  const url = `${window.location.origin}/register`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login: login, password: password }),
  });
  const message: Awaited<ReturnType<typeof handleRegistration>> = await response.json();
  console.log(message === true ? "Successfully registered an account" : message);
};

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
if (registerButton) registerButton.addEventListener("click", register);
