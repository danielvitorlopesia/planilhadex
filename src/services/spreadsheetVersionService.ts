import {
  SpreadsheetRecord,
  getSpreadsheetById,
  updateSpreadsheet,
} from "./spreadsheetService";

export const SPREADSHEET_VERSION_STORAGE_KEY = "custopublico_spreadsheet_versions";

export type SpreadsheetVersionRecord = {
  id: string;
  spreadsheetId: string;
  versionNumber: number;
  createdAt: string;
  label: string;
  reason: string;
  source: "manual_snapshot" | "before_edit" | "before_comparison" | "auto_save";
  rows: SpreadsheetRecord["rows"];
  monthlyBaseValue?: number;
  metadata?: Record<string, unknown>;
};

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeReadStorage(): SpreadsheetVersionRecord[] {
  if (!hasBrowserStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(SPREADSHEET_VERSION_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteStorage(records: SpreadsheetVersionRecord[]) {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(
    SPREADSHEET_VERSION_STORAGE_KEY,
    JSON.stringify(records)
  );
}

function buildId(prefix = "sheetver") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function nowIso() {
  return new Date().toISOString();
}

function cloneRows(rows: SpreadsheetRecord["rows"]): SpreadsheetRecord["rows"] {
  return rows.map((row) => ({
    ...row,
    trainingTags: Array.isArray(row.trainingTags) ? [...row.trainingTags] : [],
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? { ...(row.metadata as Record<string, unknown>) }
        : row.metadata,
  }));
}

function getVersionsForSpreadsheetInternal(spreadsheetId: string) {
  return safeReadStorage()
    .filter((record) => record.spreadsheetId === spreadsheetId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
}

function getNextVersionNumber(spreadsheetId: string) {
  const existing = getVersionsForSpreadsheetInternal(spreadsheetId);
  if (existing.length === 0) {
    return 1;
  }
  return Math.max(...existing.map((item) => item.versionNumber)) + 1;
}

export function listSpreadsheetVersions(
  spreadsheetId: string
): SpreadsheetVersionRecord[] {
  return getVersionsForSpreadsheetInternal(spreadsheetId);
}

export function getSpreadsheetVersionById(
  versionId: string
): SpreadsheetVersionRecord | null {
  const records = safeReadStorage();
  return records.find((record) => record.id === versionId) ?? null;
}

export function getLatestSpreadsheetVersion(
  spreadsheetId: string
): SpreadsheetVersionRecord | null {
  const versions = getVersionsForSpreadsheetInternal(spreadsheetId);
  return versions[0] ?? null;
}

export function createSpreadsheetVersionSnapshot(args: {
  spreadsheetId: string;
  label?: string;
  reason?: string;
  source?: SpreadsheetVersionRecord["source"];
}): SpreadsheetVersionRecord {
  const spreadsheet = getSpreadsheetById(args.spreadsheetId);

  if (!spreadsheet) {
    throw new Error("Planilha não encontrada para geração de snapshot.");
  }

  const versionNumber = getNextVersionNumber(spreadsheet.id);

  const versionRecord: SpreadsheetVersionRecord = {
    id: buildId("sheetver"),
    spreadsheetId: spreadsheet.id,
    versionNumber,
    createdAt: nowIso(),
    label:
      args.label?.trim() ||
      `Versão ${versionNumber}`,
    reason:
      args.reason?.trim() ||
      "Snapshot gerado para preservar estado anterior da planilha.",
    source: args.source || "manual_snapshot",
    rows: cloneRows(spreadsheet.rows),
    monthlyBaseValue: spreadsheet.monthlyBaseValue,
    metadata:
      spreadsheet.metadata && typeof spreadsheet.metadata === "object"
        ? { ...(spreadsheet.metadata as Record<string, unknown>) }
        : {},
  };

  const current = safeReadStorage();
  safeWriteStorage([versionRecord, ...current]);

  return versionRecord;
}

export function createSpreadsheetVersionSnapshotBeforeUpdate(args: {
  spreadsheetId: string;
  reason?: string;
  label?: string;
}) {
  return createSpreadsheetVersionSnapshot({
    spreadsheetId: args.spreadsheetId,
    label: args.label || "Snapshot pré-atualização",
    reason:
      args.reason ||
      "Versão gerada automaticamente antes de atualização relevante da planilha.",
    source: "before_edit",
  });
}

export function createSpreadsheetVersionSnapshotBeforeComparison(args: {
  spreadsheetId: string;
  reason?: string;
  label?: string;
}) {
  return createSpreadsheetVersionSnapshot({
    spreadsheetId: args.spreadsheetId,
    label: args.label || "Baseline de comparação",
    reason:
      args.reason ||
      "Versão gerada para servir de linha de base comparativa.",
    source: "before_comparison",
  });
}

export function restoreSpreadsheetVersion(versionId: string): SpreadsheetRecord | null {
  const version = getSpreadsheetVersionById(versionId);

  if (!version) {
    return null;
  }

  const spreadsheet = getSpreadsheetById(version.spreadsheetId);

  if (!spreadsheet) {
    return null;
  }

  const updated = updateSpreadsheet(spreadsheet.id, {
    rows: cloneRows(version.rows),
    monthlyBaseValue: version.monthlyBaseValue,
    metadata: {
      ...(spreadsheet.metadata ?? {}),
      ...(version.metadata ?? {}),
      restoredFromVersionId: version.id,
      restoredFromVersionNumber: version.versionNumber,
      previousSpreadsheetId: spreadsheet.id,
      previousVersionRows: cloneRows(spreadsheet.rows),
      versionRestoreTimestamp: nowIso(),
    },
  });

  return updated;
}

export function linkSpreadsheetToPreviousVersion(args: {
  spreadsheetId: string;
  versionId: string;
}): SpreadsheetRecord | null {
  const spreadsheet = getSpreadsheetById(args.spreadsheetId);
  const version = getSpreadsheetVersionById(args.versionId);

  if (!spreadsheet || !version) {
    return null;
  }

  return updateSpreadsheet(spreadsheet.id, {
    metadata: {
      ...(spreadsheet.metadata ?? {}),
      comparisonBaselineVersionId: version.id,
      comparisonBaselineVersionNumber: version.versionNumber,
      previousVersionRows: cloneRows(version.rows),
      comparisonBaselineLinkedAt: nowIso(),
    },
  });
}

export function buildSpreadsheetVersionHistorySummary(spreadsheetId: string) {
  const versions = listSpreadsheetVersions(spreadsheetId);

  return {
    spreadsheetId,
    versionCount: versions.length,
    latestVersionNumber: versions[0]?.versionNumber ?? 0,
    latestVersionId: versions[0]?.id ?? null,
    versions: versions.map((version) => ({
      id: version.id,
      versionNumber: version.versionNumber,
      label: version.label,
      reason: version.reason,
      source: version.source,
      createdAt: version.createdAt,
      rowCount: version.rows.length,
      monthlyBaseValue: version.monthlyBaseValue ?? 0,
    })),
  };
}

export function deleteSpreadsheetVersion(versionId: string) {
  const current = safeReadStorage();
  const next = current.filter((record) => record.id !== versionId);
  safeWriteStorage(next);
}

export function clearAllSpreadsheetVersions() {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(SPREADSHEET_VERSION_STORAGE_KEY);
}
