const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (import.meta.env.DEV) {
    return "/api";
  }

  const { protocol, hostname } = window.location;
  const codespaceMatch = hostname.match(/^(.+)-\d+\.app\.github\.dev$/);

  if (codespaceMatch) {
    return `${protocol}//${codespaceMatch[1]}-5000.app.github.dev`;
  }

  return "http://localhost:5000";
};

const BASE_URL = getApiUrl();

type AuthData = {
  email: string;
  password: string;
};

type SessionData = {
  text: string;
  events: unknown[];
  analysis?: {
    label: string;
    confidence: number;
    avgInterval: number;
    pauseCount: number;
    backspaceCount: number;
    pasteCount: number;
  };
};

const parseJsonResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};

export const registerUser = async (data: AuthData) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return parseJsonResponse(res);
};

export const loginUser = async (data: AuthData) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await parseJsonResponse(res);
  localStorage.setItem("token", result.token);
  return result;
};

export const saveSession = async (data: SessionData) => {
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
