import {
  SpreadsheetDetailData,
  SpreadsheetListItem,
} from "../types/spreadsheet";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function buildUrl(path: string): string {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawText);
    } catch {
      throw new Error("A API retornou JSON inválido.");
    }
  }

  if (!rawText.trim()) {
    return null;
  }

  throw new Error(
    `A API não retornou JSON. Resposta recebida: ${rawText.slice(0, 180)}`
  );
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message?: string }).message || `Erro ${response.status}`)
        : `Erro ${response.status}`;

    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail?: string }).detail || "")
        : "";

    throw new Error(detail ? `${message} ${detail}` : message);
  }

  return data as T;
}

type SpreadsheetApiShape = SpreadsheetListItem & {
  spreadsheet_uuid?: string | null;
  spreadsheetId?: string | null;
  spreadsheet_id?: string | null;
  real_id?: string | null;
  realId?: string | null;
};

function normalizeSpreadsheetIds<T extends SpreadsheetApiShape>(item: T): T {
  const resolvedSpreadsheetId =
    item.spreadsheet_id ??
    item.spreadsheetId ??
    item.spreadsheet_uuid ??
    item.real_id ??
    item.realId ??
    null;

  return {
    ...item,
    spreadsheet_id: resolvedSpreadsheetId,
    spreadsheetId: resolvedSpreadsheetId,
  };
}

export async function getSpreadsheets(): Promise<SpreadsheetListItem[]> {
  const response = await fetch(buildUrl("/api/spreadsheets"), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await handleResponse<SpreadsheetApiShape[]>(response);
  return data.map(normalizeSpreadsheetIds);
}

export async function getSpreadsheetById(id: string): Promise<SpreadsheetDetailData> {
  const response = await fetch(buildUrl(`/api/spreadsheets/${id}`), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await handleResponse<SpreadsheetApiShape & SpreadsheetDetailData>(response);
  return normalizeSpreadsheetIds(data);
}
