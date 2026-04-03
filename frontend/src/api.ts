const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const parseJsonResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};

export const registerUser = async (data: any) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseJsonResponse(res);
};

export const loginUser = async (data: any) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await parseJsonResponse(res);
  localStorage.setItem("token", result.token);
  return result;
};

export const saveSession = async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || ""
    },
    body: JSON.stringify(data)
  });

  return parseJsonResponse(res);
};
