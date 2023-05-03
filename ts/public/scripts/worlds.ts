const createWorldForm = document.querySelector("form");

const sendCreateWorldRequest = async function (server: string, num: string, domain: string, timestamp: number) {
  const url = "http://localhost:8080/api/world/create";
  const worldFields = {
    server: server,
    num: num,
    domain: domain,
    timestamp: timestamp,
  };
  const body = JSON.stringify(worldFields);
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });
  const parsedResult = await result.json();
  return parsedResult;
};

const createWorld = async function (e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  if (!form) return;
  const serverInput = form.querySelector("input[name='server']") as HTMLInputElement;
  const numInput = form.querySelector("input[name='num']") as HTMLInputElement;
  const domainInput = form.querySelector("input[name='domain']") as HTMLInputElement;
  const timestampInput = form.querySelector("input[name='start-timestamp']") as HTMLInputElement;
  if (!serverInput || !numInput || !domainInput || !timestampInput) return;
  const server = serverInput.value;
  const num = numInput.value;
  const domain = domainInput.value;
  const timestamp = parseInt(timestampInput.value);
  const result = await sendCreateWorldRequest(server, num, domain, timestamp);
  console.log(result);
};

createWorldForm?.addEventListener("submit", createWorld);
