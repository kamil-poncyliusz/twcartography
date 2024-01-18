export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export const httpRequest = async function (endpoint: string, method: HttpMethod, payload?: { [key: string]: any }) {
  try {
    const url = `${window.location.origin}${endpoint}`;
    const body = method === HttpMethod.GET || method === HttpMethod.DELETE ? undefined : JSON.stringify(payload);
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return false;
  }
};
