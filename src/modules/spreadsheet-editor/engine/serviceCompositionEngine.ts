import { SpreadsheetRecord } from "../../../services/spreadsheetService";
import {
  ServiceCompositionMemoryBundle,
  ServiceCompositionRow,
  ServiceCompositionSummary,
  buildServiceCompositionMemoryBundle,
  normalizeServiceCompositionRows,
  summarizeServiceCompositionRows,
} from "../utils/serviceCompositionCalculator";

export type SpreadsheetRow = SpreadsheetRecord["rows"][number];

export type ServiceCompositionPersistencePayload = {
  rows: SpreadsheetRow[];
  monthlyBaseValue: number;
  metadataPatch: {
    editorModule: "service_composition";
    lastEditedSection: "materials_equipments_logistics";
    serviceCompositionSummary: ServiceCompositionSummary;
    serviceCompositionMemoryBundle: ServiceCompositionMemoryBundle;
    serviceCompositionEngineSnapshot: {
      generatedAt: string;
      itemCount: number;
      total: number;
      totalByCategory: Record<string, number>;
      totalByRecurrence: Record<string, number>;
    };
  };
};

function round2(value: number) {
  return Number((value || 0).toFixed(2));
}

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

export function isServiceCompositionEditableRow(row: SpreadsheetRow) {
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

function inferDemandTypeFromMetadata(metadata: Record<string, unknown>, periodicity: string) {
  const explicitDemandType = safeString(metadata.demandType);
  if (
    explicitDemandType === "recorrente" ||
    explicitDemandType === "eventual" ||
    explicitDemandType === "sob_demanda" ||
    explicitDemandType === "nao_informado"
  ) {
    return explicitDemandType;
  }

  if (periodicity === "sob_demanda") {
    return "sob_demanda";
  }

  if (periodicity === "eventual") {
    return "eventual";
  }

  return "recorrente";
}

export function inferDraftRowFromSpreadsheetRow(
  row: SpreadsheetRow
): ServiceCompositionRow {
  const metadata = isRecord(row.metadata) ? row.metadata : {};
  const periodicity = safeString(metadata.periodicity, "mensal") || "mensal";

  return {
    id: safeString(row.id),
    item: safeString(row.item),
    categoria: safeString(row.categoria) || "Materiais e insumos",
    demandType: inferDemandTypeFromMetadata(metadata, periodicity) as ServiceCompositionRow["demandType"],
    serviceUnit: safeString(metadata.serviceUnit, "unidade"),
    periodicity,
    quantidade: safeNumber(row.quantidade, 1),
    valorUnitario: safeNumber(row.valorUnitario, 0),
    productivityFactor: safeNumber(metadata.productivityFactor, 1) || 1,
    monthlyFactor:
      safeNumber(metadata.monthlyFactor, safeNumber(metadata.allocationFactor, 1)) || 1,
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
  };
}

export function extractServiceCompositionDraftRows(
  rows: SpreadsheetRow[]
): ServiceCompositionRow[] {
  return normalizeServiceCompositionRows(
    rows
      .filter(isServiceCompositionEditableRow)
      .map((row) => inferDraftRowFromSpreadsheetRow(row))
  );
}

function buildTrainingTags(row: ServiceCompositionRow) {
  const bucket =
    row.categoria === "Materiais e insumos"
      ? "material"
      : row.categoria === "Equipamentos"
      ? "equipment"
      : row.categoria === "Logística operacional"
      ? "logistics"
      : row.categoria === "Apoio operacional"
      ? "support"
      : row.categoria === "Equipe técnica / operacional"
      ? "workforce"
      : "service_composition";

  return ["service_composition_editable", safeString(row.demandType), bucket].filter(Boolean);
}

export function buildSpreadsheetRowFromDraftRow(
  row: ServiceCompositionRow
): SpreadsheetRow {
  const normalizedRow = normalizeServiceCompositionRows([row])[0];
  const subtotal = safeNumber(normalizedRow?.subtotal, 0);

  return {
    id: safeString(normalizedRow?.id),
    item: safeString(normalizedRow?.item),
    categoria: safeString(normalizedRow?.categoria),
    quantidade: safeNumber(normalizedRow?.quantidade, 0),
    valorUnitario: safeNumber(normalizedRow?.valorUnitario, 0),
    subtotal,
    status: safeString(normalizedRow?.status, "Pendente"),
    memoriaCalculo: safeString(normalizedRow?.technicalJustification),
    origem: "edição local",
    automatico: false,
    trainingTags: buildTrainingTags(normalizedRow),
    metadata: {
      demandType: normalizedRow.demandType,
      serviceUnit: normalizedRow.serviceUnit,
      periodicity: normalizedRow.periodicity,
      productivityFactor: normalizedRow.productivityFactor,
      monthlyFactor: normalizedRow.monthlyFactor,
      depreciationCriteria: normalizedRow.depreciationCriteria,
      consumptionBase: normalizedRow.consumptionBase,
      technicalJustification: normalizedRow.technicalJustification,
    },
  };
}

export function normalizeServiceCompositionDraftRows(
  rows: Array<Partial<ServiceCompositionRow>>
): ServiceCompositionRow[] {
  return normalizeServiceCompositionRows(rows as ServiceCompositionRow[]);
}

function buildCategoryTotals(rows: ServiceCompositionRow[]) {
  const result: Record<string, number> = {};

  for (const row of rows) {
    const category = safeString(row.categoria) || "Não classificado";
    result[category] = round2((result[category] || 0) + safeNumber(row.subtotal, 0));
  }

  return result;
}

function buildRecurrenceTotals(rows: ServiceCompositionRow[]) {
  const result: Record<string, number> = {};

  for (const row of rows) {
    const recurrence = safeString(row.demandType) || "nao_informado";
    result[recurrence] = round2((result[recurrence] || 0) + safeNumber(row.subtotal, 0));
  }

  return result;
}

export function calculateServiceCompositionEngine(
  draftRows: ServiceCompositionRow[]
) {
  const normalizedRows = normalizeServiceCompositionDraftRows(draftRows);
  const spreadsheetRows = normalizedRows.map((row) =>
    buildSpreadsheetRowFromDraftRow(row)
  );
  const summary = summarizeServiceCompositionRows(normalizedRows);
  const memoryBundle = buildServiceCompositionMemoryBundle(normalizedRows);

  return {
    normalizedRows,
    spreadsheetRows,
    summary,
    memoryBundle,
    total: round2(summary.total),
  };
}

export function buildServiceCompositionPersistencePayload(args: {
  currentSpreadsheet: SpreadsheetRecord;
  draftRows: ServiceCompositionRow[];
}): ServiceCompositionPersistencePayload {
  const { currentSpreadsheet, draftRows } = args;

  const calculated = calculateServiceCompositionEngine(draftRows);

  const preservedRows = currentSpreadsheet.rows.filter(
    (row) => !isServiceCompositionEditableRow(row)
  );

  const rebuiltRows = [...calculated.spreadsheetRows, ...preservedRows];

  const monthlyBaseValue = round2(
    rebuiltRows.reduce((sum, row) => sum + safeNumber(row.subtotal, 0), 0)
  );

  return {
    rows: rebuiltRows,
    monthlyBaseValue,
    metadataPatch: {
      editorModule: "service_composition",
      lastEditedSection: "materials_equipments_logistics",
      serviceCompositionSummary: calculated.summary,
      serviceCompositionMemoryBundle: calculated.memoryBundle,
      serviceCompositionEngineSnapshot: {
        generatedAt: new Date().toISOString(),
        itemCount: calculated.summary.itemCount,
        total: calculated.summary.total,
        totalByCategory: buildCategoryTotals(calculated.normalizedRows),
        totalByRecurrence: buildRecurrenceTotals(calculated.normalizedRows),
      },
    },
  };
}
