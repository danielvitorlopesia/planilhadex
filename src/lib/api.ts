import {
  SpreadsheetDetailData,
  SpreadsheetListItem,
} from "../types/spreadsheet";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function buildUrl(path: string): string {
  if (!API_BASE_URL) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Erro ${response.status}`;

    try {
      const data = await response.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // mantém a mensagem padrão
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getSpreadsheets(): Promise<SpreadsheetListItem[]> {
  const response = await fetch(buildUrl("/api/spreadsheets"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<SpreadsheetListItem[]>(response);
}

export async function getSpreadsheetById(id: string): Promise<SpreadsheetDetailData> {
  const response = await fetch(buildUrl(`/api/spreadsheets/${id}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<SpreadsheetDetailData>(response);
}
