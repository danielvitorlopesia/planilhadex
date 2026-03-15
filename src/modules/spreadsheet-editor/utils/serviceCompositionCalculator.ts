import { SpreadsheetRecord } from "../../../services/spreadsheetService";

export type SpreadsheetRow = SpreadsheetRecord["rows"][number];

export type ServiceDemandType =
  | "recorrente"
  | "eventual"
  | "sob_demanda"
  | "nao_informado";

export type ServiceCompositionRow = SpreadsheetRow & {
  demandType?: ServiceDemandType;
  serviceUnit?: string;
  periodicity?: string;
  productivityFactor?: number;
  monthlyFactor?: number;
  depreciationCriteria?: string;
  consumptionBase?: string;
  technicalJustification?: string;
  metadata?: Record<string, unknown>;
};

export type ServiceCompositionSummary = {
  itemCount: number;
  total: number;
  workforceTotal: number;
  materialsTotal: number;
  equipmentTotal: number;
  logisticsTotal: number;
  supportTotal: number;
  episAndUniformsTotal: number;
  consumablesTotal: number;
  recurringTotal: number;
  eventualTotal: number;
  onDemandTotal: number;
};

export type ServiceCompositionMemoryItem = {
  rowId: string | number;
  item: string;
  category: string;
  categoryKey: string;
  demandType: ServiceDemandType;
  quantity: number;
  unitCost: number;
  subtotal: number;
  serviceUnit: string;
  periodicity: string;
  productivityFactor: number;
  monthlyFactor: number;
  depreciationCriteria: string;
  consumptionBase: string;
  technicalJustification: string;
  memoryText: string;
  source: string;
  automatic: boolean;
  status: string;
};

export type ServiceCompositionMemoryBundle = {
  generatedAt: string;
  editorModule: "service_composition";
  itemCount: number;
  totals: {
    materials: number;
    equipment: number;
    logistics: number;
    operationalSupport: number;
    episAndUniforms: number;
    consumables: number;
    grandTotal: number;
  };
  demandBreakdown: {
    recurring: number;
    eventual: number;
    onDemand: number;
  };
  items: ServiceCompositionMemoryItem[];
};

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeText(value: unknown) {
  return safeString(value).trim().toLowerCase();
}

function roundCurrency(value: number) {
  return Number((value || 0).toFixed(2));
}

function categoryIncludes(category: string, terms: string[]) {
  const normalized = normalizeText(category);
  return terms.some((term) => normalized.includes(term));
}

function inferDemandType(row: ServiceCompositionRow): ServiceDemandType {
  const explicit = normalizeText(row.demandType);
  if (
    explicit === "recorrente" ||
    explicit === "eventual" ||
    explicit === "sob_demanda" ||
    explicit === "nao_informado"
  ) {
    return explicit;
  }

  const tags = Array.isArray(row.trainingTags) ? row.trainingTags : [];

  if (tags.includes("recorrente")) return "recorrente";
  if (tags.includes("eventual")) return "eventual";
  if (tags.includes("sob_demanda")) return "sob_demanda";

  return "nao_informado";
}

export function isServiceCompositionRow(row: SpreadsheetRow) {
  const category = normalizeText(row.categoria);
  const item = normalizeText(row.item);
  const tags = Array.isArray(row.trainingTags) ? row.trainingTags : [];

  return (
    categoryIncludes(category, [
      "material",
      "insumo",
      "equipamento",
      "logística",
      "logistica",
      "apoio operacional",
      "epi",
      "uniforme",
      "consumo",
    ]) ||
    item.includes("equipamento") ||
    item.includes("uniforme") ||
    item.includes("epi") ||
    tags.includes("service_composition_editable")
  );
}

export function buildServiceCompositionRowId(prefix = "composition") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function recalcServiceCompositionRow(
  input: ServiceCompositionRow
): ServiceCompositionRow {
  const quantity = Math.max(0, safeNumber(input.quantidade));
  const unitCost = Math.max(0, safeNumber(input.valorUnitario));
  const productivityFactor = Math.max(0, safeNumber(input.productivityFactor, 1) || 1);
  const monthlyFactor = Math.max(0, safeNumber(input.monthlyFactor, 1) || 1);

  const subtotal = roundCurrency(quantity * unitCost * productivityFactor * monthlyFactor);

  return {
    ...input,
    quantidade: quantity,
    valorUnitario: unitCost,
    productivityFactor,
    monthlyFactor,
    demandType: inferDemandType(input),
    subtotal,
  };
}

export function normalizeServiceCompositionRows(
  rows: ServiceCompositionRow[]
): ServiceCompositionRow[] {
  return rows.map((row) =>
    recalcServiceCompositionRow({
      ...row,
      id: row.id ?? buildServiceCompositionRowId("composition"),
      item: safeString(row.item).trim() || "Item sem nome",
      categoria: safeString(row.categoria).trim() || "Materiais e insumos",
      status: safeString(row.status).trim() || "Pendente",
      memoriaCalculo: safeString(row.memoriaCalculo),
      origem: safeString(row.origem) || "edição local",
      automatico: Boolean(row.automatico),
      demandType: inferDemandType(row),
      serviceUnit: safeString(row.serviceUnit),
      periodicity: safeString(row.periodicity),
      depreciationCriteria: safeString(row.depreciationCriteria),
      consumptionBase: safeString(row.consumptionBase),
      technicalJustification: safeString(row.technicalJustification),
      metadata:
        row.metadata && typeof row.metadata === "object"
          ? { ...row.metadata }
          : {},
      trainingTags: Array.isArray(row.trainingTags) ? [...row.trainingTags] : [],
    })
  );
}

function getCategoryKey(category: string) {
  const normalized = normalizeText(category);

  if (categoryIncludes(normalized, ["equipamento"])) return "equipment";
  if (categoryIncludes(normalized, ["logística", "logistica"])) return "logistics";
  if (categoryIncludes(normalized, ["apoio operacional"])) return "support";
  if (categoryIncludes(normalized, ["epi", "uniforme"])) return "epis_and_uniforms";
  if (categoryIncludes(normalized, ["consumo"])) return "consumables";
  if (categoryIncludes(normalized, ["material", "insumo"])) return "materials";

  return "other";
}

export function summarizeServiceCompositionRows(
  rows: ServiceCompositionRow[]
): ServiceCompositionSummary {
  const normalizedRows = normalizeServiceCompositionRows(rows);

  let materialsTotal = 0;
  let equipmentTotal = 0;
  let logisticsTotal = 0;
  let supportTotal = 0;
  let episAndUniformsTotal = 0;
  let consumablesTotal = 0;
  let recurringTotal = 0;
  let eventualTotal = 0;
  let onDemandTotal = 0;

  for (const row of normalizedRows) {
    const subtotal = safeNumber(row.subtotal);
    const categoryKey = getCategoryKey(safeString(row.categoria));
    const demandType = inferDemandType(row);

    if (categoryKey === "materials") materialsTotal += subtotal;
    if (categoryKey === "equipment") equipmentTotal += subtotal;
    if (categoryKey === "logistics") logisticsTotal += subtotal;
    if (categoryKey === "support") supportTotal += subtotal;
    if (categoryKey === "epis_and_uniforms") episAndUniformsTotal += subtotal;
    if (categoryKey === "consumables") consumablesTotal += subtotal;

    if (demandType === "recorrente") recurringTotal += subtotal;
    if (demandType === "eventual") eventualTotal += subtotal;
    if (demandType === "sob_demanda") onDemandTotal += subtotal;
  }

  const total = normalizedRows.reduce(
    (sum, row) => sum + safeNumber(row.subtotal),
    0
  );

  return {
    itemCount: normalizedRows.length,
    total: roundCurrency(total),
    workforceTotal: 0,
    materialsTotal: roundCurrency(materialsTotal),
    equipmentTotal: roundCurrency(equipmentTotal),
    logisticsTotal: roundCurrency(logisticsTotal),
    supportTotal: roundCurrency(supportTotal),
    episAndUniformsTotal: roundCurrency(episAndUniformsTotal),
    consumablesTotal: roundCurrency(consumablesTotal),
    recurringTotal: roundCurrency(recurringTotal),
    eventualTotal: roundCurrency(eventualTotal),
    onDemandTotal: roundCurrency(onDemandTotal),
  };
}

export function buildServiceCompositionMemoryBundle(
  rows: ServiceCompositionRow[]
): ServiceCompositionMemoryBundle {
  const normalizedRows = normalizeServiceCompositionRows(rows);
  const summary = summarizeServiceCompositionRows(normalizedRows);

  const items: ServiceCompositionMemoryItem[] = normalizedRows.map((row) => ({
    rowId: row.id ?? buildServiceCompositionRowId("composition"),
    item: safeString(row.item),
    category: safeString(row.categoria),
    categoryKey: getCategoryKey(safeString(row.categoria)),
    demandType: inferDemandType(row),
    quantity: safeNumber(row.quantidade),
    unitCost: safeNumber(row.valorUnitario),
    subtotal: safeNumber(row.subtotal),
    serviceUnit: safeString(row.serviceUnit),
    periodicity: safeString(row.periodicity),
    productivityFactor: safeNumber(row.productivityFactor, 1) || 1,
    monthlyFactor: safeNumber(row.monthlyFactor, 1) || 1,
    depreciationCriteria: safeString(row.depreciationCriteria),
    consumptionBase: safeString(row.consumptionBase),
    technicalJustification: safeString(row.technicalJustification),
    memoryText: safeString(row.memoriaCalculo),
    source: safeString(row.origem) || "edição local",
    automatic: Boolean(row.automatico),
    status: safeString(row.status) || "Pendente",
  }));

  return {
    generatedAt: new Date().toISOString(),
    editorModule: "service_composition",
    itemCount: summary.itemCount,
    totals: {
      materials: summary.materialsTotal,
      equipment: summary.equipmentTotal,
      logistics: summary.logisticsTotal,
      operationalSupport: summary.supportTotal,
      episAndUniforms: summary.episAndUniformsTotal,
      consumables: summary.consumablesTotal,
      grandTotal: summary.total,
    },
    demandBreakdown: {
      recurring: summary.recurringTotal,
      eventual: summary.eventualTotal,
      onDemand: summary.onDemandTotal,
    },
    items,
  };
}
