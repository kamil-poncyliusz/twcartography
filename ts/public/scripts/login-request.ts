import { handleAuthentication } from "../../routes/router-handlers";

const loginRequest = async function (e: Event) {
  e.preventDefault();
  const target = e.target as HTMLFormElement;
  const loginInput = target.querySelector("#login") as HTMLInputElement;
  const passwordInput = target.querySelector("#password") as HTMLInputElement;
  const login = loginInput.value;
  const password = passwordInput.value;
  if (login.length < 2 || password.length < 8) return;
  const url = `${window.location.origin}/auth`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login: login,
      password: password,
    }),
  });
  const success: Awaited<ReturnType<typeof handleAuthentication>> = await response.json();
  if (!success) console.log("Login failed");
  else window.location.reload();
};

export default loginRequest;
