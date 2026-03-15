import { SpreadsheetRecord } from "../../../services/spreadsheetService";
import {
  ServiceCompositionDraftRow,
  sanitizeServiceCompositionDraftRow,
} from "../utils/serviceCompositionCalculator";
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
