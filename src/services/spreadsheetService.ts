import {
  DomainScenarioKey,
  LocalSpreadsheet,
  SpreadsheetCreationDraft,
  SpreadsheetRow,
  SpreadsheetTrainingProfile,
} from "../types/spreadsheetModels";
import {
  DOMAIN_SCENARIOS,
  getDomainScenario,
} from "../mocks/domainScenarioCatalog";
import { getModelTemplateByType } from "../mocks/modelTemplatesMocks";

export const STORAGE_KEY = "custopublico_spreadsheets";
const SEEDED_FLAG_KEY = "custopublico_spreadsheets_seeded_v2";

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeReadStorage(): LocalSpreadsheet[] {
  if (!hasBrowserStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
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

function safeWriteStorage(spreadsheets: LocalSpreadsheet[]) {
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

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function humanDateTime() {
  return new Date().toLocaleString("pt-BR");
}

function buildSortTimestamp() {
  return Date.now();
}

function cloneRows(rows: SpreadsheetRow[]): SpreadsheetRow[] {
  return rows.map((row) => ({
    ...row,
    id: row.id ?? buildId("row"),
    subtotal: Number((row.quantidade * row.valorUnitario).toFixed(2)),
    trainingTags: [...(row.trainingTags ?? [])],
  }));
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
    draft.title?.trim() ||
    scenario?.label ||
    getModelTemplateByType(draft.modelType)?.title;
  const unit = draft.unitName?.trim();
  const lot = draft.lotName?.trim();

  return [baseLabel, unit, lot].filter(Boolean).join(" - ");
}

function buildDescriptionFromDraft(draft: SpreadsheetCreationDraft) {
  const scenario = getDomainScenario(draft.domainScenario);

  if (draft.description?.trim()) {
    return draft.description.trim();
  }

  return (
    scenario?.summary ||
    "Planilha inicial gerada a partir de modelo-base do CustoPúblico com estrutura de exemplo para elaboração, leitura e análise futura."
  );
}

function buildRowsForDraft(draft: SpreadsheetCreationDraft): SpreadsheetRow[] {
  const scenario = getDomainScenario(draft.domainScenario);
  const baseRows = scenario?.seedRows ?? [];

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
        ? Math.max(1, Math.round(row.quantidade * factor))
        : row.quantidade;

      return {
        ...row,
        quantidade: quantity,
        subtotal: Number((quantity * row.valorUnitario).toFixed(2)),
      };
    })
  );
}

function buildSeedExample(domainScenarioKey: DomainScenarioKey): LocalSpreadsheet {
  const scenario = DOMAIN_SCENARIOS[domainScenarioKey];
  const rows = cloneRows(scenario.seedRows);

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
    monthlyBaseValue: rows.reduce((sum, row) => sum + row.subtotal, 0),
    notes:
      "Exemplo inicial do domínio para uso em demonstração, criação de novas planilhas, leitura comparativa e evolução da lógica analítica do sistema.",
    trainingProfile: buildTrainingProfile(domainScenarioKey),
    metadata: {
      origin: "native_domain_example",
      serviceFamily: scenario.serviceFamily,
      recommendedModels: [...scenario.recommendedModels],
      sortTimestamp: buildSortTimestamp(),
    },
  };
}

export function ensureSeedExamples(): LocalSpreadsheet[] {
  const existing = safeReadStorage();

  if (!hasBrowserStorage()) {
    return existing;
  }

  const alreadySeeded =
    window.localStorage.getItem(SEEDED_FLAG_KEY) === "true";
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

function getSortTimestamp(spreadsheet: LocalSpreadsheet) {
  const raw = spreadsheet.metadata?.sortTimestamp;
  return typeof raw === "number" ? raw : 0;
}

export function getStoredSpreadsheets(): LocalSpreadsheet[] {
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

export function getSpreadsheetById(id: string): LocalSpreadsheet | undefined {
  return getStoredSpreadsheets().find((spreadsheet) => spreadsheet.id === id);
}

export function saveSpreadsheet(
  spreadsheet: LocalSpreadsheet
): LocalSpreadsheet {
  const current = getStoredSpreadsheets().filter(
    (item) => item.id !== spreadsheet.id
  );
  const next = [spreadsheet, ...current];
  safeWriteStorage(next);
  return spreadsheet;
}

export function createSpreadsheetFromModel(
  draft: SpreadsheetCreationDraft
): LocalSpreadsheet {
  const template = getModelTemplateByType(draft.modelType);

  if (!template) {
    throw new Error(`Modelo de planilha inválido: ${draft.modelType}`);
  }

  const scenario = getDomainScenario(draft.domainScenario);
  const rows = buildRowsForDraft({
    ...scenario?.defaultDraftValues,
    ...draft,
  });

  const spreadsheet: LocalSpreadsheet = {
    id: buildId("sheet"),
    title: buildTitleFromDraft({ ...scenario?.defaultDraftValues, ...draft }),
    description: buildDescriptionFromDraft({
      ...scenario?.defaultDraftValues,
      ...draft,
    }),
    status: "Em elaboração",
    category: draft.category || scenario?.defaultCategory || template.title,
    updatedAt: humanDateTime(),
    modelType: draft.modelType,
    domainScenario: draft.domainScenario,
    rows,
    source: "local",
    contractReference: String(draft.contractReference || ""),
    contractingAgency: String(draft.contractingAgency || ""),
    unitName: String(draft.unitName || ""),
    lotName: String(draft.lotName || ""),
    referenceDate: String(draft.referenceDate || isoToday()),
    headcount: Number(
      draft.headcount || scenario?.defaultDraftValues.headcount || 0
    ),
    monthlyBaseValue:
      Number(draft.monthlyBaseValue || 0) ||
      rows.reduce((sum, row) => sum + row.subtotal, 0),
    notes: String(draft.notes || ""),
    trainingProfile: draft.domainScenario
      ? buildTrainingProfile(draft.domainScenario)
      : undefined,
    metadata: {
      origin: "local_model_creation",
      templateTitle: template.title,
      mainBlocks: template.mainBlocks,
      useCases: template.useCases,
      domainScenarioSummary: scenario?.summary,
      sortTimestamp: buildSortTimestamp(),
    },
  };

  return saveSpreadsheet(spreadsheet);
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
