import { SpreadsheetRecord } from "../../../services/spreadsheetService";
import {
  ServiceCompositionRow,
  summarizeServiceCompositionRows,
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

function inferServiceCompositionCategory(rawCategory?: string): string {
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

function inferDemandTypeFromPeriodicity(
  periodicity?: string
): ServiceCompositionRow["demandType"] {
  if (periodicity === "sob_demanda") {
    return "sob_demanda";
  }

  if (periodicity === "eventual") {
    return "eventual";
  }

  return "recorrente";
}

function sanitizeServiceCompositionRow(
  input?: Partial<ServiceCompositionRow>
): ServiceCompositionRow {
  const periodicity = safeString(input?.periodicity, "mensal") || "mensal";

  const demandType =
    (safeString(
      input?.demandType,
      inferDemandTypeFromPeriodicity(periodicity)
    ) as ServiceCompositionRow["demandType"]) || "recorrente";

  const depreciationCriteria =
    safeString(input?.depreciationCriteria, "nao_aplica") || "nao_aplica";

  const category = inferServiceCompositionCategory(
    safeString(input?.categoria) || "Materiais e insumos"
  );

  const monthlyFactor = Math.max(0, safeNumber(input?.monthlyFactor, 1) || 1);

  return {
    id:
      safeString(input?.id) ||
      `svc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    item: safeString(input?.item) || "Novo componente",
    categoria: category,
    demandType,
    serviceUnit: safeString(input?.serviceUnit) || "unidade",
    periodicity,
    quantidade: Math.max(0, safeNumber(input?.quantidade, 1)),
    valorUnitario: Math.max(0, safeNumber(input?.valorUnitario, 0)),
    productivityFactor: Math.max(
      0,
      safeNumber(input?.productivityFactor, 1) || 1
    ),
    monthlyFactor,
    depreciationCriteria,
    status: safeString(input?.status) || "Pendente",
    consumptionBase: safeString(input?.consumptionBase),
    technicalJustification: safeString(input?.technicalJustification),
    memoriaCalculo: safeString(input?.memoriaCalculo),
    origem: safeString(input?.origem) || "edição local",
    automatico: Boolean(input?.automatico),
    subtotal: Math.max(0, safeNumber(input?.subtotal, 0)),
    trainingTags: Array.isArray(input?.trainingTags)
      ? [...input.trainingTags]
      : [],
    metadata: isRecord(input?.metadata) ? { ...input.metadata } : {},
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

export function spreadsheetRowToServiceCompositionRow(
  row: SpreadsheetRow
): ServiceCompositionRow {
  const metadata = isRecord(row.metadata) ? row.metadata : {};

  return sanitizeServiceCompositionRow({
    id: safeString(row.id),
    item: safeString(row.item),
    categoria: safeString(row.categoria),
    demandType:
      (safeString(metadata.demandType) as ServiceCompositionRow["demandType"]) ||
      inferDemandTypeFromPeriodicity(safeString(metadata.periodicity, "mensal")),
    serviceUnit: safeString(metadata.serviceUnit, "unidade"),
    periodicity: safeString(metadata.periodicity, "mensal"),
    quantidade: safeNumber(row.quantidade, 0),
    valorUnitario: safeNumber(row.valorUnitario, 0),
    productivityFactor: safeNumber(metadata.productivityFactor, 1),
    monthlyFactor:
      safeNumber(metadata.monthlyFactor, safeNumber(metadata.allocationFactor, 1)) ||
      1,
    depreciationCriteria: safeString(
      metadata.depreciationCriteria,
      safeString(metadata.depreciationMethod, "nao_aplica")
    ),
    status: safeString(row.status, "Pendente"),
    consumptionBase: safeString(
      metadata.consumptionBase,
      safeString(metadata.consumptionBasis)
    ),
    technicalJustification:
      safeString(metadata.technicalJustification) ||
      safeString(row.memoriaCalculo),
    memoriaCalculo: safeString(row.memoriaCalculo),
    origem: safeString(row.origem, "edição local"),
    automatico: Boolean(row.automatico),
    subtotal: safeNumber(row.subtotal, 0),
    trainingTags: Array.isArray(row.trainingTags) ? [...row.trainingTags] : [],
    metadata,
  });
}

export function spreadsheetRowsToServiceCompositionRows(
  rows: SpreadsheetRow[]
): ServiceCompositionRow[] {
  return rows
    .filter(isServiceCompositionSpreadsheetRow)
    .map((row) => spreadsheetRowToServiceCompositionRow(row));
}

export function spreadsheetToServiceCompositionRows(
  spreadsheet: SpreadsheetRecord | null | undefined
): ServiceCompositionRow[] {
  if (!spreadsheet) {
    return [];
  }

  return spreadsheetRowsToServiceCompositionRows(spreadsheet.rows);
}

export function compareServiceCompositionSpreadsheets(args: {
  previousSpreadsheet: SpreadsheetRecord | null | undefined;
  currentSpreadsheet: SpreadsheetRecord | null | undefined;
}): ServiceCompositionComparisonResult {
  const previousRows = spreadsheetToServiceCompositionRows(
    args.previousSpreadsheet
  );
  const currentRows = spreadsheetToServiceCompositionRows(
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
  const previousRows = spreadsheetToServiceCompositionRows(
    args.previousSpreadsheet
  );
  const currentRows = spreadsheetToServiceCompositionRows(
    args.currentSpreadsheet
  );

  const comparison = compareServiceCompositionVersions({
    previousRows,
    currentRows,
  });

  const previousSummary = summarizeServiceCompositionRows(previousRows);
  const currentSummary = summarizeServiceCompositionRows(currentRows);

  return {
    previousRows,
    currentRows,
    previousSummary,
    currentSummary,
    comparison,
    hasPreviousRows: previousRows.length > 0,
    hasCurrentRows: currentRows.length > 0,
    hasComparableData: previousRows.length > 0 || currentRows.length > 0,
  };
}
