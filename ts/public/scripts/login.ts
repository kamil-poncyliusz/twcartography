const loginInput: HTMLInputElement = <HTMLInputElement>document.getElementById("login");
const passwordInput: HTMLInputElement = <HTMLInputElement>document.getElementById("password");
const submitButton = document.getElementById("submit");

async function handleSubmitButtonClick(e: Event) {
  e.preventDefault();
  const login = loginInput.value;
  const password = passwordInput.value;
  if (login.length < 3 || password.length < 8) return;
  const url = "http://localhost:8080/auth";
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
  const message = await response.json();
  if (!message.success) console.log("Nie");
  else {
    console.log(message.token);
    //
  }
}

if (submitButton) submitButton.addEventListener("click", handleSubmitButtonClick);
