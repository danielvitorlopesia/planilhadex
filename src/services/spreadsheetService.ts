import {
  DomainScenarioKey,
  LocalSpreadsheet,
  SpreadsheetCreationDraft,
  SpreadsheetRow as BaseSpreadsheetRow,
  SpreadsheetTrainingProfile,
} from "../types/spreadsheetModels";
import {
  DOMAIN_SCENARIOS,
  getDomainScenario,
} from "../mocks/domainScenarioCatalog";
import { getModelTemplateByType } from "../mocks/modelTemplatesMocks";

export type SpreadsheetRow = BaseSpreadsheetRow & {
  metadata?: Record<string, unknown>;
};

export type SpreadsheetRecord = Omit<LocalSpreadsheet, "rows" | "metadata"> & {
  rows: SpreadsheetRow[];
  metadata?: Record<string, unknown>;
};

export type SpreadsheetEditorDraft = {
  contractingAgency?: string;
  contractReference?: string;
  unitName?: string;
  lotName?: string;
  referenceDate?: string;
  municipality?: string;
  state?: string;
  cboCode?: string;
  professionalCategory?: string;
  cctReference?: string;
  taxRegime?: string;
  objectDescription?: string;
  domainScenario?: string;
  headcount?: string | number;
  monthlyBaseValue?: string | number;
  mainShift?: string;
  workScale?: string;
  weeklyHours?: string;
  monthlyHours?: string;
  salaryBase?: string | number;
  nightAdditional?: string | number;
  hazardAdditional?: string | number;
  mealAllowance?: string | number;
  transportAllowance?: string | number;
  mandatoryBenefitsNotes?: string;
  notes?: string;
};

export type SpreadsheetVersionHistoryEntry = {
  id: string;
  versionNumber: number;
  label: string;
  createdAt: string;
  reason: string;
  origin: string;
  spreadsheetId: string;
  previousSpreadsheetId?: string;
  rows: SpreadsheetRow[];
  monthlyBaseValue?: number;
  headcount?: number;
  notes?: string;
  editorModule?: string;
  lastEditedSection?: string;
};

export type SpreadsheetSnapshotOptions = {
  reason: string;
  origin:
    | "auto_snapshot"
    | "manual_snapshot"
    | "pre_update"
    | "restore"
    | "baseline"
    | "local"
    | "api";
  label?: string;
  notes?: string;
  editorModule?: string;
  lastEditedSection?: string;
};

export type UpdateSpreadsheetOptions = {
  createSnapshot?: boolean;
  snapshot?: SpreadsheetSnapshotOptions;
};

export const STORAGE_KEY = "custopublico_spreadsheets";
const SEEDED_FLAG_KEY = "custopublico_spreadsheets_seeded_v2";
const MAX_VERSION_HISTORY = 30;

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeReadStorage(): SpreadsheetRecord[] {
  if (!hasBrowserStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SpreadsheetRecord[]) : [];
  } catch {
    return [];
  }
}

function safeWriteStorage(spreadsheets: SpreadsheetRecord[]) {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(spreadsheets));
}

function buildId(prefix = "sheet") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function isoNow() {
  return new Date().toISOString();
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function humanDateTime() {
  return new Date().toLocaleString("pt-BR");
}

function buildSortTimestamp() {
  return Date.now();
}

function parseNumericInput(value: string | number | undefined | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const normalized = String(value).replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cloneRows(rows: SpreadsheetRow[]): SpreadsheetRow[] {
  return rows.map((row) => ({
    ...row,
    id: row.id ?? buildId("row"),
    subtotal: Number((Number(row.quantidade || 0) * Number(row.valorUnitario || 0)).toFixed(2)),
    trainingTags: [...(row.trainingTags ?? [])],
    metadata: isRecord(row.metadata) ? { ...row.metadata } : undefined,
  }));
}

function cloneVersionHistory(
  history: SpreadsheetVersionHistoryEntry[] | undefined
): SpreadsheetVersionHistoryEntry[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.map((entry) => ({
    ...entry,
    rows: cloneRows(entry.rows ?? []),
  }));
}

function readVersionHistory(spreadsheet: SpreadsheetRecord): SpreadsheetVersionHistoryEntry[] {
  const raw = spreadsheet.metadata?.versionHistory;
  if (!Array.isArray(raw)) {
    return [];
  }

  return cloneVersionHistory(raw as SpreadsheetVersionHistoryEntry[]);
}

function getCurrentVersionNumber(spreadsheet: SpreadsheetRecord): number {
  const explicit = spreadsheet.metadata?.versionNumber;
  if (typeof explicit === "number" && Number.isFinite(explicit)) {
    return explicit;
  }

  const history = readVersionHistory(spreadsheet);
  const maxFromHistory = history.reduce((max, item) => {
    const value =
      typeof item.versionNumber === "number" && Number.isFinite(item.versionNumber)
        ? item.versionNumber
        : 0;
    return Math.max(max, value);
  }, 0);

  return maxFromHistory > 0 ? maxFromHistory + 1 : 1;
}

function buildTrainingProfile(domainScenarioKey: DomainScenarioKey): SpreadsheetTrainingProfile {
  const scenario = DOMAIN_SCENARIOS[domainScenarioKey];

  return {
    domainScenarioKey,
    domainScenarioLabel: scenario.label,
    interpretationTags: [...scenario.interpretationTags],
    expectedDocuments: [...scenario.expectedDocuments],
    expectedCostDrivers: [...scenario.expectedCostDrivers],
    validationFocus: [...scenario.validationFocus],
    readingHints: [...scenario.readingHints],
  };
}

function buildTitleFromDraft(draft: SpreadsheetCreationDraft) {
  const scenario = getDomainScenario(draft.domainScenario);
  const baseLabel =
    String(draft.title || "").trim() ||
    scenario?.label ||
    getModelTemplateByType(draft.modelType)?.title;
  const unit = String(draft.unitName || "").trim();
  const lot = String(draft.lotName || "").trim();

  return [baseLabel, unit, lot].filter(Boolean).join(" - ");
}

function buildDescriptionFromDraft(draft: SpreadsheetCreationDraft) {
  const scenario = getDomainScenario(draft.domainScenario);

  if (String(draft.description || "").trim()) {
    return String(draft.description).trim();
  }

  if (String(draft.objectDescription || "").trim()) {
    return String(draft.objectDescription).trim();
  }

  return (
    scenario?.summary ||
    "Planilha inicial gerada a partir de modelo-base do CustoPúblico com estrutura de exemplo para elaboração, leitura e análise futura."
  );
}

function buildRowsForDraft(draft: SpreadsheetCreationDraft): SpreadsheetRow[] {
  const scenario = getDomainScenario(draft.domainScenario);
  const baseRows = (scenario?.seedRows ?? []) as SpreadsheetRow[];

  if (!baseRows.length) {
    return [];
  }

  const headcount = Number(
    draft.headcount || scenario?.defaultDraftValues.headcount || 1
  );
  const scenarioDefaultHeadcount = Number(
    scenario?.defaultDraftValues.headcount || headcount || 1
  );
  const factor =
    headcount > 0 && scenarioDefaultHeadcount > 0
      ? headcount / scenarioDefaultHeadcount
      : 1;

  return cloneRows(
    baseRows.map((row) => {
      const isScaledByHeadcount =
        row.categoria === "Mão de obra" ||
        row.categoria === "Equipe operacional" ||
        row.categoria === "Benefícios" ||
        row.categoria === "Insumos";

      const quantity = isScaledByHeadcount
        ? Math.max(1, Math.round(Number(row.quantidade || 0) * factor))
        : Number(row.quantidade || 0);

      return {
        ...row,
        quantidade: quantity,
        subtotal: Number((quantity * Number(row.valorUnitario || 0)).toFixed(2)),
      };
    })
  );
}

function withUpdatedTimestamp(spreadsheet: SpreadsheetRecord): SpreadsheetRecord {
  return {
    ...spreadsheet,
    updatedAt: humanDateTime(),
    metadata: {
      ...(spreadsheet.metadata ?? {}),
      sortTimestamp: buildSortTimestamp(),
    },
  };
}

function buildSeedExample(domainScenarioKey: DomainScenarioKey): SpreadsheetRecord {
  const scenario = DOMAIN_SCENARIOS[domainScenarioKey];
  const rows = cloneRows((scenario.seedRows ?? []) as SpreadsheetRow[]);

  return {
    id: `seed_${domainScenarioKey}`,
    title: scenario.exampleTitle,
    description: `${scenario.summary} Exemplo nativo do sistema para demonstração, leitura analítica e treinamento lógico inicial.`,
    status: "Exemplo nativo",
    category: scenario.defaultCategory,
    updatedAt: humanDateTime(),
    modelType: scenario.defaultDraftValues.modelType || scenario.recommendedModels[0],
    domainScenario: domainScenarioKey,
    rows,
    source: "seed_example",
    isSeedExample: true,
    contractReference: "EXEMPLO-NATIVO",
    contractingAgency: "CustoPúblico - Biblioteca de cenários",
    unitName: "Ambiente demonstrativo",
    lotName: "Lote de referência",
    referenceDate: isoToday(),
    headcount: Number(scenario.defaultDraftValues.headcount || 1),
    monthlyBaseValue: rows.reduce((sum, row) => sum + Number(row.subtotal || 0), 0),
    notes:
      "Exemplo inicial do domínio para uso em demonstração, criação de novas planilhas, leitura comparativa e evolução da lógica analítica do sistema.",
    trainingProfile: buildTrainingProfile(domainScenarioKey),
    metadata: {
      origin: "native_domain_example",
      recommendedModels: [...scenario.recommendedModels],
      serviceFamily: scenario.serviceFamily,
      sortTimestamp: buildSortTimestamp(),
      localDraftOverride: false,
      versionNumber: 1,
      versionHistory: [],
    },
  };
}

function buildInitialEditorDraftFromCreation(
  draft: SpreadsheetCreationDraft,
  rows: SpreadsheetRow[]
): SpreadsheetEditorDraft {
  const firstLaborRow = rows.find(
    (row) =>
      row.categoria.toLowerCase().includes("mão de obra") ||
      row.categoria.toLowerCase().includes("equipe operacional")
  );

  const mealAllowanceRow = rows.find((row) =>
    row.item.toLowerCase().includes("alimentação")
  );

  const transportAllowanceRow = rows.find((row) =>
    row.item.toLowerCase().includes("transporte")
  );

  return {
    contractingAgency: String(draft.contractingAgency || ""),
    contractReference: String(draft.contractReference || ""),
    unitName: String(draft.unitName || ""),
    lotName: String(draft.lotName || ""),
    referenceDate: String(draft.referenceDate || isoToday()),
    municipality: String(draft.municipality || ""),
    state: String(draft.state || ""),
    cboCode: String(draft.cboCode || ""),
    professionalCategory:
      String(draft.professionalCategory || "") || String(firstLaborRow?.item || ""),
    cctReference: String(draft.cctReference || ""),
    taxRegime: String(draft.taxRegime || "lucro_presumido"),
    objectDescription:
      String(draft.objectDescription || "") || String(draft.description || ""),
    domainScenario: String(draft.domainScenario || ""),
    headcount:
      draft.headcount !== undefined
        ? draft.headcount
        : rows.reduce((sum, row) => sum + Number(row.quantidade || 0), 0),
    monthlyBaseValue:
      draft.monthlyBaseValue !== undefined
        ? draft.monthlyBaseValue
        : rows.reduce((sum, row) => sum + Number(row.subtotal || 0), 0),
    mainShift: String(draft.mainShift || ""),
    workScale: String(draft.workScale || ""),
    weeklyHours: String(draft.weeklyHours || ""),
    monthlyHours: String(draft.monthlyHours || ""),
    salaryBase:
      draft.salaryBase !== undefined
        ? draft.salaryBase
        : Number(firstLaborRow?.valorUnitario || 0),
    nightAdditional: draft.nightAdditional ?? "",
    hazardAdditional: draft.hazardAdditional ?? "",
    mealAllowance:
      draft.mealAllowance !== undefined
        ? draft.mealAllowance
        : Number(mealAllowanceRow?.valorUnitario || 0),
    transportAllowance:
      draft.transportAllowance !== undefined
        ? draft.transportAllowance
        : Number(transportAllowanceRow?.valorUnitario || 0),
    mandatoryBenefitsNotes: String(draft.mandatoryBenefitsNotes || ""),
    notes: String(draft.notes || ""),
  };
}

function buildSnapshotEntry(
  spreadsheet: SpreadsheetRecord,
  options: SpreadsheetSnapshotOptions
): SpreadsheetVersionHistoryEntry {
  const currentVersionNumber = getCurrentVersionNumber(spreadsheet);

  return {
    id: buildId("version"),
    versionNumber: currentVersionNumber,
    label:
      options.label ||
      `Versão ${currentVersionNumber}`,
    createdAt: isoNow(),
    reason: options.reason,
    origin: options.origin,
    spreadsheetId: spreadsheet.id,
    previousSpreadsheetId: safeString(spreadsheet.metadata?.previousSpreadsheetId) || undefined,
    rows: cloneRows(spreadsheet.rows),
    monthlyBaseValue:
      typeof spreadsheet.monthlyBaseValue === "number"
        ? spreadsheet.monthlyBaseValue
        : undefined,
    headcount:
      typeof spreadsheet.headcount === "number"
        ? spreadsheet.headcount
        : undefined,
    notes: options.notes,
    editorModule: options.editorModule,
    lastEditedSection: options.lastEditedSection,
  };
}

function appendSnapshotToSpreadsheet(
  spreadsheet: SpreadsheetRecord,
  options: SpreadsheetSnapshotOptions
): SpreadsheetRecord {
  const existingHistory = readVersionHistory(spreadsheet);
  const snapshot = buildSnapshotEntry(spreadsheet, options);
  const nextHistory = [snapshot, ...existingHistory].slice(0, MAX_VERSION_HISTORY);

  return {
    ...spreadsheet,
    metadata: {
      ...(spreadsheet.metadata ?? {}),
      versionNumber: snapshot.versionNumber + 1,
      previousSpreadsheetId: spreadsheet.id,
      previousVersionRows: cloneRows(spreadsheet.rows),
      versionHistory: nextHistory,
      lastSnapshotAt: snapshot.createdAt,
      lastSnapshotReason: options.reason,
      lastSnapshotOrigin: options.origin,
      baselineVersionId:
        spreadsheet.metadata?.baselineVersionId ?? snapshot.id,
    },
  };
}

export function createSpreadsheetSnapshot(
  id: string,
  options: SpreadsheetSnapshotOptions
): SpreadsheetRecord | null {
  const current = getSpreadsheetById(id);

  if (!current) {
    return null;
  }

  const withSnapshot = appendSnapshotToSpreadsheet(current, options);
  return saveSpreadsheet(withSnapshot);
}

export function restoreSpreadsheetVersion(
  spreadsheetId: string,
  versionId: string
): SpreadsheetRecord | null {
  const current = getSpreadsheetById(spreadsheetId);

  if (!current) {
    return null;
  }

  const history = readVersionHistory(current);
  const target = history.find((item) => item.id === versionId);

  if (!target) {
    return null;
  }

  const currentWithRestoreSnapshot = appendSnapshotToSpreadsheet(current, {
    reason: `Snapshot automático antes da restauração da ${target.label}`,
    origin: "restore",
    label: `Pré-restauração de ${target.label}`,
    notes: "Snapshot gerado automaticamente antes da restauração local.",
  });

  const restored: SpreadsheetRecord = {
    ...currentWithRestoreSnapshot,
    rows: cloneRows(target.rows),
    monthlyBaseValue:
      typeof target.monthlyBaseValue === "number"
        ? target.monthlyBaseValue
        : currentWithRestoreSnapshot.monthlyBaseValue,
    headcount:
      typeof target.headcount === "number"
        ? target.headcount
        : currentWithRestoreSnapshot.headcount,
    updatedAt: humanDateTime(),
    metadata: {
      ...(currentWithRestoreSnapshot.metadata ?? {}),
      restoredFromVersionId: target.id,
      restoredFromVersionNumber: target.versionNumber,
      restoredAt: isoNow(),
      sortTimestamp: buildSortTimestamp(),
      localDraftOverride: true,
    },
  };

  return saveSpreadsheet(restored);
}

export function ensureSeedExamples(): SpreadsheetRecord[] {
  const existing = safeReadStorage();

  if (!hasBrowserStorage()) {
    return existing;
  }

  const alreadySeeded = window.localStorage.getItem(SEEDED_FLAG_KEY) === "true";
  const existingIds = new Set(existing.map((sheet) => sheet.id));

  const missingSeeds = (Object.keys(DOMAIN_SCENARIOS) as DomainScenarioKey[])
    .filter((key) => !existingIds.has(`seed_${key}`))
    .map((key) => buildSeedExample(key));

  if (!alreadySeeded && missingSeeds.length > 0) {
    const next = [...missingSeeds, ...existing];
    safeWriteStorage(next);
    window.localStorage.setItem(SEEDED_FLAG_KEY, "true");
    return next;
  }

  if (alreadySeeded && missingSeeds.length > 0) {
    const next = [...missingSeeds, ...existing];
    safeWriteStorage(next);
    return next;
  }

  return existing;
}

function getSortTimestamp(spreadsheet: SpreadsheetRecord) {
  const raw = spreadsheet.metadata?.sortTimestamp;
  return typeof raw === "number" ? raw : 0;
}

export function getStoredSpreadsheets(): SpreadsheetRecord[] {
  return ensureSeedExamples().sort((left, right) => {
    const leftWeight = left.isSeedExample ? 1 : 0;
    const rightWeight = right.isSeedExample ? 1 : 0;

    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }

    return getSortTimestamp(right) - getSortTimestamp(left);
  });
}

export const getAllSpreadsheets = getStoredSpreadsheets;
export const listLocalSpreadsheets = getStoredSpreadsheets;

export function getSpreadsheetById(id: string): SpreadsheetRecord | undefined {
  return getStoredSpreadsheets().find((spreadsheet) => spreadsheet.id === id);
}

export function saveSpreadsheet(
  spreadsheet: SpreadsheetRecord
): SpreadsheetRecord {
  const current = getStoredSpreadsheets().filter((item) => item.id !== spreadsheet.id);
  const persisted = withUpdatedTimestamp(spreadsheet);
  const next = [persisted, ...current];
  safeWriteStorage(next);
  return persisted;
}

export function createSpreadsheetFromModel(
  draft: SpreadsheetCreationDraft
): SpreadsheetRecord {
  const template = getModelTemplateByType(draft.modelType);

  if (!template) {
    throw new Error(`Modelo de planilha inválido: ${draft.modelType}`);
  }

  const scenario = getDomainScenario(draft.domainScenario);
  const mergedDraft = {
    ...scenario?.defaultDraftValues,
    ...draft,
  } as SpreadsheetCreationDraft;

  const rows = buildRowsForDraft(mergedDraft);
  const monthlyBaseValue =
    parseNumericInput(mergedDraft.monthlyBaseValue) ||
    rows.reduce((sum, row) => sum + Number(row.subtotal || 0), 0);

  const spreadsheet: SpreadsheetRecord = {
    id: buildId("sheet"),
    title: buildTitleFromDraft(mergedDraft),
    description: buildDescriptionFromDraft(mergedDraft),
    status: "Em elaboração",
    category: String(mergedDraft.category || scenario?.defaultCategory || template.title),
    updatedAt: humanDateTime(),
    modelType: mergedDraft.modelType,
    domainScenario: mergedDraft.domainScenario as DomainScenarioKey | undefined,
    rows,
    source: "local",
    contractReference: String(mergedDraft.contractReference || ""),
    contractingAgency: String(mergedDraft.contractingAgency || ""),
    unitName: String(mergedDraft.unitName || ""),
    lotName: String(mergedDraft.lotName || ""),
    referenceDate: String(mergedDraft.referenceDate || isoToday()),
    headcount: parseNumericInput(mergedDraft.headcount),
    monthlyBaseValue,
    notes: String(mergedDraft.notes || ""),
    trainingProfile:
      mergedDraft.domainScenario &&
      mergedDraft.domainScenario in DOMAIN_SCENARIOS
        ? buildTrainingProfile(mergedDraft.domainScenario as DomainScenarioKey)
        : undefined,
    metadata: {
      origin: "local_model_creation",
      templateTitle: template.title,
      mainBlocks: template.mainBlocks,
      useCases: template.useCases,
      domainScenarioSummary: scenario?.summary,
      sortTimestamp: buildSortTimestamp(),
      localDraftOverride: false,
      editorDraft: buildInitialEditorDraftFromCreation(mergedDraft, rows),
      versionNumber: 1,
      versionHistory: [],
    },
  };

  return saveSpreadsheet(spreadsheet);
}

export function updateSpreadsheet(
  id: string,
  patch: Partial<SpreadsheetRecord>,
  options?: UpdateSpreadsheetOptions
): SpreadsheetRecord | null {
  const current = getSpreadsheetById(id);

  if (!current) {
    return null;
  }

  const shouldCreateSnapshot = options?.createSnapshot === true;

  const baseSpreadsheet = shouldCreateSnapshot
    ? appendSnapshotToSpreadsheet(
        current,
        options?.snapshot ?? {
          reason: "Snapshot automático antes de atualização relevante",
          origin: "auto_snapshot",
          label: "Snapshot automático",
        }
      )
    : current;

  const nextRows = Array.isArray(patch.rows) ? patch.rows : baseSpreadsheet.rows;
  const recalculatedMonthlyBaseValue =
    patch.monthlyBaseValue !== undefined
      ? Number(patch.monthlyBaseValue)
      : nextRows.reduce((sum, row) => sum + Number(row.subtotal || 0), 0);

  const next: SpreadsheetRecord = {
    ...baseSpreadsheet,
    ...patch,
    rows: nextRows,
    monthlyBaseValue: Number.isFinite(recalculatedMonthlyBaseValue)
      ? recalculatedMonthlyBaseValue
      : baseSpreadsheet.monthlyBaseValue,
    metadata: {
      ...(baseSpreadsheet.metadata ?? {}),
      ...(patch.metadata ?? {}),
    },
  };

  return saveSpreadsheet(next);
}

export function updateSpreadsheetEditorDraft(
  id: string,
  draft: SpreadsheetEditorDraft
): SpreadsheetRecord | null {
  const current = getSpreadsheetById(id);

  if (!current) {
    return null;
  }

  const parsedHeadcount = parseNumericInput(draft.headcount);
  const parsedMonthlyBaseValue = parseNumericInput(draft.monthlyBaseValue);

  const next: SpreadsheetRecord = {
    ...current,
    contractingAgency:
      draft.contractingAgency !== undefined
        ? String(draft.contractingAgency)
        : current.contractingAgency,
    contractReference:
      draft.contractReference !== undefined
        ? String(draft.contractReference)
        : current.contractReference,
    unitName:
      draft.unitName !== undefined ? String(draft.unitName) : current.unitName,
    lotName:
      draft.lotName !== undefined ? String(draft.lotName) : current.lotName,
    referenceDate:
      draft.referenceDate !== undefined
        ? String(draft.referenceDate)
        : current.referenceDate,
    domainScenario:
      draft.domainScenario !== undefined &&
      draft.domainScenario in DOMAIN_SCENARIOS
        ? (draft.domainScenario as DomainScenarioKey)
        : current.domainScenario,
    headcount:
      draft.headcount !== undefined ? parsedHeadcount : current.headcount,
    monthlyBaseValue:
      draft.monthlyBaseValue !== undefined
        ? parsedMonthlyBaseValue
        : current.monthlyBaseValue,
    notes: draft.notes !== undefined ? String(draft.notes) : current.notes,
    description:
      draft.objectDescription !== undefined
        ? String(draft.objectDescription)
        : current.description,
    trainingProfile:
      draft.domainScenario &&
      draft.domainScenario in DOMAIN_SCENARIOS
        ? buildTrainingProfile(draft.domainScenario as DomainScenarioKey)
        : current.trainingProfile,
    metadata: {
      ...(current.metadata ?? {}),
      localDraftOverride: true,
      editorDraft: {
        ...(typeof current.metadata?.editorDraft === "object" &&
        current.metadata?.editorDraft !== null
          ? (current.metadata.editorDraft as Record<string, unknown>)
          : {}),
        ...draft,
      },
    },
  };

  return saveSpreadsheet(next);
}

export function deleteSpreadsheet(id: string) {
  const next = getStoredSpreadsheets().filter(
    (spreadsheet) => spreadsheet.id !== id
  );
  safeWriteStorage(next);
}

export function resetLocalSpreadsheets() {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(SEEDED_FLAG_KEY);
}

export function getDomainScenarioExamples() {
  return (Object.keys(DOMAIN_SCENARIOS) as DomainScenarioKey[]).map((key) =>
    buildSeedExample(key)
  );
}
