export type InternalDecision =
  | "approved"
  | "approved_with_remarks"
  | "diligence_requested"
  | "rejected"
  | null;

export type InternalDecisionState = {
  decision: InternalDecision;
  despacho: string;
  decidedAt: string | null;
};

export type InternalDecisionMap = Record<string, InternalDecisionState>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export function getDecisionStorageKey(spreadsheetId?: string | null) {
  return `spreadsheet-detail:internal-decisions:${spreadsheetId || "unknown"}`;
}

export function readDecisionStateFromStorage(
  spreadsheetId?: string | null
): InternalDecisionMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(getDecisionStorageKey(spreadsheetId));
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    return parsed;
  } catch {
    return {};
  }
}

export function writeDecisionStateToStorage(
  spreadsheetId: string | null | undefined,
  value: InternalDecisionMap
) {
  if (typeof window === "undefined") return;
  if (!spreadsheetId) return;

  try {
    window.localStorage.setItem(
      getDecisionStorageKey(spreadsheetId),
      JSON.stringify(value)
    );
  } catch {
    // noop
  }
}

function normalizeInternalDecisionMap(payload: any): InternalDecisionMap {
  const source =
    payload?.data ??
    payload?.items ??
    payload?.decisions ??
    payload?.internalDecisions ??
    payload;

  if (Array.isArray(source)) {
    return source.reduce<InternalDecisionMap>((acc, item) => {
      const analysisId = String(
        item.analysisId ??
          item.analysis_id ??
          item.id ??
          ""
      ).trim();

      if (!analysisId) return acc;

      acc[analysisId] = {
        decision: (item.decision ?? item.status ?? null) as InternalDecision,
        despacho: item.despacho ?? item.dispatch ?? "",
        decidedAt:
          item.decidedAt ??
          item.decided_at ??
          item.updatedAt ??
          item.updated_at ??
          null,
      };

      return acc;
    }, {});
  }

  if (source && typeof source === "object") {
    const output: InternalDecisionMap = {};

    Object.entries(source).forEach(([analysisId, value]: [string, any]) => {
      if (!analysisId) return;

      output[analysisId] = {
        decision: (value?.decision ?? value?.status ?? null) as InternalDecision,
        despacho: value?.despacho ?? value?.dispatch ?? "",
        decidedAt:
          value?.decidedAt ??
          value?.decided_at ??
          value?.updatedAt ??
          value?.updated_at ??
          null,
      };
    });

    return output;
  }

  return {};
}

async function fetchOptionalJson<T = any>(url: string): Promise<T | null> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Falha ao carregar ${url}. Status ${response.status}. ${text || ""}`.trim()
    );
  }

  return response.json();
}

async function tryFetchFirstAvailable<T = any>(urls: string[]): Promise<T | null> {
  for (const url of urls) {
    try {
      const payload = await fetchOptionalJson<T>(url);
      if (payload !== null) {
        return payload;
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function tryMutateFirstAvailable(
  urls: string[],
  options: RequestInit
): Promise<boolean> {
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

      if (response.ok) {
        return true;
      }

      if (response.status === 404 || response.status === 405) {
        continue;
      }
    } catch {
      continue;
    }
  }

  return false;
}

export async function loadInternalDecisions(
  spreadsheetId: string
): Promise<{
  map: InternalDecisionMap;
  source: "backend" | "local";
}> {
  const payload = await tryFetchFirstAvailable([
    buildUrl(`/api/spreadsheets/${spreadsheetId}/internal-decisions`),
    buildUrl(`/api/spreadsheets/${spreadsheetId}/decisions`),
    buildUrl(`/api/internal-decisions?spreadsheetId=${spreadsheetId}`),
    buildUrl(`/api/decisions?spreadsheetId=${spreadsheetId}`),
  ]);

  if (payload) {
    const map = normalizeInternalDecisionMap(payload);
    writeDecisionStateToStorage(spreadsheetId, map);
    return { map, source: "backend" };
  }

  return {
    map: readDecisionStateFromStorage(spreadsheetId),
    source: "local",
  };
}

export async function saveInternalDecision(params: {
  spreadsheetId: string;
  analysisId: string;
  state: InternalDecisionState;
}): Promise<"backend" | "local"> {
  const { spreadsheetId, analysisId, state } = params;

  const body = JSON.stringify({
    spreadsheetId,
    analysisId,
    decision: state.decision,
    despacho: state.despacho,
    decidedAt: state.decidedAt,
  });

  const savedInBackend = await tryMutateFirstAvailable(
    [
      buildUrl(`/api/spreadsheets/${spreadsheetId}/internal-decisions`),
      buildUrl(`/api/spreadsheets/${spreadsheetId}/analyses/${analysisId}/internal-decision`),
      buildUrl(`/api/internal-decisions`),
      buildUrl(`/api/decisions`),
    ],
    {
      method: "POST",
      body,
    }
  );

  return savedInBackend ? "backend" : "local";
}

export async function deleteInternalDecision(params: {
  spreadsheetId: string;
  analysisId: string;
}): Promise<"backend" | "local"> {
  const { spreadsheetId, analysisId } = params;

  const removedInBackend = await tryMutateFirstAvailable(
    [
      buildUrl(`/api/spreadsheets/${spreadsheetId}/analyses/${analysisId}/internal-decision`),
      buildUrl(`/api/spreadsheets/${spreadsheetId}/internal-decisions/${analysisId}`),
      buildUrl(`/api/internal-decisions/${analysisId}?spreadsheetId=${spreadsheetId}`),
      buildUrl(`/api/decisions/${analysisId}?spreadsheetId=${spreadsheetId}`),
    ],
    {
      method: "DELETE",
    }
  );

  return removedInBackend ? "backend" : "local";
}
