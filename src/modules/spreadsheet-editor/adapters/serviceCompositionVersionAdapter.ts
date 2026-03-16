import { SpreadsheetRecord } from "../../../services/spreadsheetService";
import { ServiceCompositionDraftRow } from "../utils/serviceCompositionCalculator";
import {
  compareServiceCompositionVersions,
  ServiceCompositionComparisonResult,
} from "../engine/serviceCompositionComparisonEngine";

type SpreadsheetRow = SpreadsheetRecord["rows"][number];

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function inferServiceCompositionCategory(
  rawCategory?: string
): ServiceCompositionDraftRow["category"] {
  const value = String(rawCategory || "").toLowerCase();

  if (
    value.includes("equipe operacional") ||
    value.includes("equipe técnica") ||
    value.includes("equipe tecnica") ||
    value.includes("mão de obra") ||
    value.includes("mao de obra")
  ) {
    return "Equipe técnica / operacional";
  }

  if (
    value.includes("material") ||
    value.includes("insumo") ||
    value.includes("uniforme") ||
    value.includes("epi")
  ) {
    return "Materiais e insumos";
  }

  if (
    value.includes("equipamento") ||
    value.includes("máquina") ||
    value.includes("maquina") ||
    value.includes("utensílio") ||
    value.includes("utensilio")
  ) {
    return "Equipamentos";
  }

  if (value.includes("logística") || value.includes("logistica")) {
    return "Logística operacional";
  }

  if (value.includes("apoio")) {
    return "Apoio operacional";
  }

  return "Materiais e insumos";
}

function inferRecurrenceTypeFromPeriodicity(
  periodicity?: string
): ServiceCompositionDraftRow["recurrenceType"] {
  if (periodicity === "sob_demanda") {
    return "sob_demanda";
  }

  return "recorrente";
}

function sanitizeServiceCompositionDraftRow(
  input?: Partial<ServiceCompositionDraftRow>
): ServiceCompositionDraftRow {
  const periodicity = (
    safeString(input?.periodicity, "mensal") || "mensal"
  ) as ServiceCompositionDraftRow["periodicity"];

  const recurrenceType = (
    safeString(
      input?.recurrenceType,
      inferRecurrenceTypeFromPeriodicity(periodicity)
    ) || "recorrente"
  ) as ServiceCompositionDraftRow["recurrenceType"];

  const depreciationMethod = (
    safeString(input?.depreciationMethod, "nao_aplica") || "nao_aplica"
  ) as ServiceCompositionDraftRow["depreciationMethod"];

  const category = inferServiceCompositionCategory(
    safeString(input?.category) || "Materiais e insumos"
  );

  const usefulLifeMonths =
    depreciationMethod === "rateio_linear"
      ? Math.max(1, safeNumber(input?.usefulLifeMonths, 12))
      : 0;

  return {
    id:
      safeString(input?.id) ||
      `svc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    item: safeString(input?.item) || "Novo componente",
    category,
    recurrenceType,
    serviceUnit: safeString(input?.serviceUnit) || "unidade",
    periodicity,
    quantity: Math.max(0, safeNumber(input?.quantity, 1)),
    unitCost: Math.max(0, safeNumber(input?.unitCost, 0)),
    productivityFactor: Math.max(0, safeNumber(input?.productivityFactor, 1)),
    allocationFactor: Math.max(0, safeNumber(input?.allocationFactor, 1)),
    depreciationMethod,
    usefulLifeMonths,
    status: safeString(input?.status) || "Pendente",
    consumptionBasis: safeString(input?.consumptionBasis),
    technicalJustification: safeString(input?.technicalJustification),
  };
}

export function isServiceCompositionSpreadsheetRow(row: SpreadsheetRow) {
  const category = String(row.categoria || "").toLowerCase();
  const item = String(row.item || "").toLowerCase();
  const trainingTags = Array.isArray(row.trainingTags) ? row.trainingTags : [];

  return (
    category.includes("material") ||
    category.includes("insumo") ||
    category.includes("equipamento") ||
    category.includes("logística") ||
    category.includes("logistica") ||
    category.includes("apoio operacional") ||
    category.includes("uniforme") ||
    category.includes("epi") ||
    category.includes("consumo") ||
    item.includes("equipamento") ||
    item.includes("uniforme") ||
    item.includes("epi") ||
    trainingTags.includes("service_composition_editable")
  );
}

export function spreadsheetRowToServiceCompositionDraftRow(
  row: SpreadsheetRow
): ServiceCompositionDraftRow {
  const metadata = isRecord(row.metadata) ? row.metadata : {};

  return sanitizeServiceCompositionDraftRow({
    id: safeString(row.id),
    item: safeString(row.item),
    category: safeString(row.categoria),
    recurrenceType:
      safeString(metadata.recurrenceType) ||
      safeString(metadata.demandType) ||
      "recorrente",
    serviceUnit: safeString(metadata.serviceUnit, "unidade"),
    periodicity: safeString(metadata.periodicity, "mensal"),
    quantity: safeNumber(row.quantidade, 0),
    unitCost: safeNumber(row.valorUnitario, 0),
    productivityFactor: safeNumber(metadata.productivityFactor, 1),
    allocationFactor: safeNumber(metadata.allocationFactor, 1),
    depreciationMethod: safeString(metadata.depreciationMethod, "nao_aplica"),
    usefulLifeMonths: safeNumber(metadata.usefulLifeMonths, 0),
    status: safeString(row.status, "Pendente"),
    consumptionBasis: safeString(metadata.consumptionBasis),
    technicalJustification:
      safeString(metadata.technicalJustification) ||
      safeString(row.memoriaCalculo),
  });
}

export function spreadsheetRowsToServiceCompositionDraftRows(
  rows: SpreadsheetRow[]
): ServiceCompositionDraftRow[] {
  return rows
    .filter(isServiceCompositionSpreadsheetRow)
    .map((row) => spreadsheetRowToServiceCompositionDraftRow(row));
}

export function spreadsheetToServiceCompositionDraftRows(
  spreadsheet: SpreadsheetRecord | null | undefined
): ServiceCompositionDraftRow[] {
  if (!spreadsheet) {
    return [];
  }

  return spreadsheetRowsToServiceCompositionDraftRows(spreadsheet.rows);
}

export function compareServiceCompositionSpreadsheets(args: {
  previousSpreadsheet: SpreadsheetRecord | null | undefined;
  currentSpreadsheet: SpreadsheetRecord | null | undefined;
}): ServiceCompositionComparisonResult {
  const previousRows = spreadsheetToServiceCompositionDraftRows(
    args.previousSpreadsheet
  );
  const currentRows = spreadsheetToServiceCompositionDraftRows(
    args.currentSpreadsheet
  );

  return compareServiceCompositionVersions({
    previousRows,
    currentRows,
  });
}

export function hasServiceCompositionData(
  spreadsheet: SpreadsheetRecord | null | undefined
) {
  if (!spreadsheet) {
    return false;
  }

  return spreadsheet.rows.some((row) => isServiceCompositionSpreadsheetRow(row));
}

export function buildServiceCompositionComparisonContext(args: {
  previousSpreadsheet: SpreadsheetRecord | null | undefined;
  currentSpreadsheet: SpreadsheetRecord | null | undefined;
}) {
  const previousRows = spreadsheetToServiceCompositionDraftRows(
    args.previousSpreadsheet
  );
  const currentRows = spreadsheetToServiceCompositionDraftRows(
    args.currentSpreadsheet
  );

  const comparison = compareServiceCompositionVersions({
    previousRows,
    currentRows,
  });

  return {
    previousRows,
    currentRows,
    comparison,
    hasPreviousRows: previousRows.length > 0,
    hasCurrentRows: currentRows.length > 0,
    hasComparableData: previousRows.length > 0 || currentRows.length > 0,
  };
}
