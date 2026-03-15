import { SpreadsheetRecord } from "../../../services/spreadsheetService";
import {
  ServiceCompositionDraftRow,
  ServiceCompositionMemoryItem,
  ServiceCompositionSummary,
  buildServiceCompositionMemoryBundle,
  buildServiceCompositionSummary,
  calculateServiceCompositionItemSubtotal,
  sanitizeServiceCompositionDraftRow,
} from "../utils/serviceCompositionCalculator";

export type SpreadsheetRow = SpreadsheetRecord["rows"][number];

export type ServiceCompositionPersistencePayload = {
  rows: SpreadsheetRow[];
  monthlyBaseValue: number;
  metadataPatch: {
    editorModule: "service_composition";
    lastEditedSection: "materials_equipments_logistics";
    serviceCompositionSummary: ServiceCompositionSummary;
    serviceCompositionMemoryBundle: ServiceCompositionMemoryItem[];
    serviceCompositionEngineSnapshot: {
      generatedAt: string;
      itemCount: number;
      total: number;
      totalByCategory: ServiceCompositionSummary["totalsByCategory"];
      totalByRecurrence: ServiceCompositionSummary["totalsByRecurrence"];
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
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
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

export function inferDraftRowFromSpreadsheetRow(
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
    quantity: safeNumber(row.quantidade, 1),
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

export function extractServiceCompositionDraftRows(
  rows: SpreadsheetRow[]
): ServiceCompositionDraftRow[] {
  return rows
    .filter(isServiceCompositionEditableRow)
    .map((row) => inferDraftRowFromSpreadsheetRow(row));
}

export function buildSpreadsheetRowFromDraftRow(
  row: ServiceCompositionDraftRow
): SpreadsheetRow {
  const subtotal = calculateServiceCompositionItemSubtotal(row);

  const trainingTags = [
    "service_composition_editable",
    row.recurrenceType,
    row.category === "Materiais e insumos"
      ? "material"
      : row.category === "Equipamentos"
      ? "equipment"
      : row.category === "Logística operacional"
      ? "logistics"
      : row.category === "Apoio operacional"
      ? "support"
      : "workforce",
  ];

  return {
    id: row.id,
    item: row.item,
    categoria: row.category,
    quantidade: row.quantity,
    valorUnitario: row.unitCost,
    subtotal,
    status: row.status,
    memoriaCalculo: row.technicalJustification || "",
    origem: "edição local",
    automatico: false,
    trainingTags,
    metadata: {
      recurrenceType: row.recurrenceType,
      demandType: row.recurrenceType,
      serviceUnit: row.serviceUnit,
      periodicity: row.periodicity,
      productivityFactor: row.productivityFactor,
      allocationFactor: row.allocationFactor,
      depreciationMethod: row.depreciationMethod,
      usefulLifeMonths: row.usefulLifeMonths,
      consumptionBasis: row.consumptionBasis,
      technicalJustification: row.technicalJustification,
    },
  };
}

export function normalizeServiceCompositionDraftRows(
  rows: Array<Partial<ServiceCompositionDraftRow>>
): ServiceCompositionDraftRow[] {
  return rows.map((row) => sanitizeServiceCompositionDraftRow(row));
}

export function calculateServiceCompositionEngine(
  draftRows: ServiceCompositionDraftRow[]
) {
  const normalizedRows = normalizeServiceCompositionDraftRows(draftRows);
  const spreadsheetRows = normalizedRows.map((row) =>
    buildSpreadsheetRowFromDraftRow(row)
  );
  const summary = buildServiceCompositionSummary(normalizedRows);
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
  draftRows: ServiceCompositionDraftRow[];
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
        totalByCategory: calculated.summary.totalsByCategory,
        totalByRecurrence: calculated.summary.totalsByRecurrence,
      },
    },
  };
}
