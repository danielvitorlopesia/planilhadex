import { SpreadsheetRecord } from "../../../services/spreadsheetService";

export type ServiceCompositionRow = SpreadsheetRecord["rows"][number];

export type ServiceCompositionDemandType =
  | "recorrente"
  | "eventual"
  | "sob_demanda"
  | "nao_informado";

export type ServiceCompositionCategoryKey =
  | "materials"
  | "equipment"
  | "logistics"
  | "operationalSupport"
  | "episAndUniforms"
  | "consumables"
  | "other";

export type ServiceCompositionNormalizedRow = ServiceCompositionRow & {
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  categoria: string;
  item: string;
  status: string;
  memoriaCalculo: string;
  serviceUnit: string;
  periodicity: string;
  productivityFactor: number;
  monthlyFactor: number;
  depreciationCriteria: string;
  consumptionBase: string;
  technicalJustification: string;
  demandType: ServiceCompositionDemandType;
  categoryKey: ServiceCompositionCategoryKey;
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
  categoryKey: ServiceCompositionCategoryKey;
  demandType: ServiceCompositionDemandType;
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

export type ServiceCompositionCalculationResult = {
  normalizedRows: ServiceCompositionNormalizedRow[];
  summary: ServiceCompositionSummary;
  memoryBundle: ServiceCompositionMemoryBundle;
};

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function safeNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toFixedNumber(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function categoryIncludes(category: string, terms: string[]) {
  const normalized = category.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function rowHasTrainingTag(row: ServiceCompositionRow, tag: string) {
  return Array.isArray(row.trainingTags) && row.trainingTags.includes(tag);
}

export function isEditableCompositionRow(row: ServiceCompositionRow) {
  const category = safeString(row.categoria).toLowerCase();
  const item = safeString(row.item).toLowerCase();

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
    item.includes("insumo") ||
    item.includes("material") ||
    rowHasTrainingTag(row, "service_composition_editable")
  );
}

export function extractEditableCompositionRows(rows: ServiceCompositionRow[]) {
  return rows.filter(isEditableCompositionRow);
}

function resolveDemandType(row: ServiceCompositionRow): ServiceCompositionDemandType {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  const explicitDemandType = safeString(metadata.demandType).toLowerCase();

  if (
    explicitDemandType === "recorrente" ||
    explicitDemandType === "eventual" ||
    explicitDemandType === "sob_demanda"
  ) {
    return explicitDemandType;
  }

  const tags = Array.isArray(row.trainingTags) ? row.trainingTags : [];

  if (tags.includes("recorrente")) {
    return "recorrente";
  }

  if (tags.includes("eventual")) {
    return "eventual";
  }

  if (tags.includes("sob_demanda")) {
    return "sob_demanda";
  }

  return "nao_informado";
}

function resolveCategoryKey(category: string): ServiceCompositionCategoryKey {
  const normalized = category.toLowerCase();

  if (categoryIncludes(normalized, ["material", "insumo"])) {
    return "materials";
  }

  if (categoryIncludes(normalized, ["equipamento"])) {
    return "equipment";
  }

  if (categoryIncludes(normalized, ["logística", "logistica"])) {
    return "logistics";
  }

  if (categoryIncludes(normalized, ["apoio operacional"])) {
    return "operationalSupport";
  }

  if (categoryIncludes(normalized, ["epi", "uniforme"])) {
    return "episAndUniforms";
  }

  if (categoryIncludes(normalized, ["consumo"])) {
    return "consumables";
  }

  return "other";
}

function normalizeRow(row: ServiceCompositionRow): ServiceCompositionNormalizedRow {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;

  const quantidade = Math.max(0, safeNumber(row.quantidade));
  const valorUnitario = Math.max(0, safeNumber(row.valorUnitario));
  const productivityFactor = Math.max(0, safeNumber(metadata.productivityFactor || 1)) || 1;
  const monthlyFactor = Math.max(0, safeNumber(metadata.monthlyFactor || 1)) || 1;

  const effectiveQuantity = quantidade * productivityFactor * monthlyFactor;
  const subtotal = toFixedNumber(effectiveQuantity * valorUnitario);

  const categoria = safeString(row.categoria).trim() || "Materiais e insumos";
  const item = safeString(row.item).trim() || "Item sem nome";
  const status = safeString(row.status).trim() || "Pendente";
  const memoriaCalculo = safeString(row.memoriaCalculo);

  const serviceUnit = safeString(metadata.serviceUnit).trim();
  const periodicity = safeString(metadata.periodicity).trim();
  const depreciationCriteria = safeString(metadata.depreciationCriteria).trim();
  const consumptionBase = safeString(metadata.consumptionBase).trim();
  const technicalJustification = safeString(
    metadata.technicalJustification || memoriaCalculo
  ).trim();

  const demandType = resolveDemandType(row);
  const categoryKey = resolveCategoryKey(categoria);

  return {
    ...row,
    item,
    categoria,
    quantidade: toFixedNumber(quantidade, 4),
    valorUnitario: toFixedNumber(valorUnitario),
    subtotal,
    status,
    memoriaCalculo,
    serviceUnit,
    periodicity,
    productivityFactor: toFixedNumber(productivityFactor, 4),
    monthlyFactor: toFixedNumber(monthlyFactor, 4),
    depreciationCriteria,
    consumptionBase,
    technicalJustification,
    demandType,
    categoryKey,
  };
}

export function calculateServiceComposition(
  rows: ServiceCompositionRow[]
): ServiceCompositionCalculationResult {
  const normalizedRows = rows.map(normalizeRow);

  let materialsTotal = 0;
  let equipmentTotal = 0;
  let logisticsTotal = 0;
  let supportTotal = 0;
  let episAndUniformsTotal = 0;
  let consumablesTotal = 0;
  let recurringTotal = 0;
  let eventualTotal = 0;
  let onDemandTotal = 0;

  normalizedRows.forEach((row) => {
    switch (row.categoryKey) {
      case "materials":
        materialsTotal += row.subtotal;
        break;
      case "equipment":
        equipmentTotal += row.subtotal;
        break;
      case "logistics":
        logisticsTotal += row.subtotal;
        break;
      case "operationalSupport":
        supportTotal += row.subtotal;
        break;
      case "episAndUniforms":
        episAndUniformsTotal += row.subtotal;
        break;
      case "consumables":
        consumablesTotal += row.subtotal;
        break;
      default:
        materialsTotal += row.subtotal;
        break;
    }

    if (row.demandType === "recorrente") {
      recurringTotal += row.subtotal;
    } else if (row.demandType === "eventual") {
      eventualTotal += row.subtotal;
    } else if (row.demandType === "sob_demanda") {
      onDemandTotal += row.subtotal;
    }
  });

  const total =
    materialsTotal +
    equipmentTotal +
    logisticsTotal +
    supportTotal +
    episAndUniformsTotal +
    consumablesTotal;

  const summary: ServiceCompositionSummary = {
    itemCount: normalizedRows.length,
    total: toFixedNumber(total),
    workforceTotal: 0,
    materialsTotal: toFixedNumber(materialsTotal),
    equipmentTotal: toFixedNumber(equipmentTotal),
    logisticsTotal: toFixedNumber(logisticsTotal),
    supportTotal: toFixedNumber(supportTotal),
    episAndUniformsTotal: toFixedNumber(episAndUniformsTotal),
    consumablesTotal: toFixedNumber(consumablesTotal),
    recurringTotal: toFixedNumber(recurringTotal),
    eventualTotal: toFixedNumber(eventualTotal),
    onDemandTotal: toFixedNumber(onDemandTotal),
  };

  const memoryBundle: ServiceCompositionMemoryBundle = {
    generatedAt: new Date().toISOString(),
    editorModule: "service_composition",
    itemCount: normalizedRows.length,
    totals: {
      materials: toFixedNumber(materialsTotal),
      equipment: toFixedNumber(equipmentTotal),
      logistics: toFixedNumber(logisticsTotal),
      operationalSupport: toFixedNumber(supportTotal),
      episAndUniforms: toFixedNumber(episAndUniformsTotal),
      consumables: toFixedNumber(consumablesTotal),
      grandTotal: toFixedNumber(total),
    },
    demandBreakdown: {
      recurring: toFixedNumber(recurringTotal),
      eventual: toFixedNumber(eventualTotal),
      onDemand: toFixedNumber(onDemandTotal),
    },
    items: normalizedRows.map((row) => ({
      rowId: row.id,
      item: row.item,
      category: row.categoria,
      categoryKey: row.categoryKey,
      demandType: row.demandType,
      quantity: row.quantidade,
      unitCost: row.valorUnitario,
      subtotal: row.subtotal,
      serviceUnit: row.serviceUnit,
      periodicity: row.periodicity,
      productivityFactor: row.productivityFactor,
      monthlyFactor: row.monthlyFactor,
      depreciationCriteria: row.depreciationCriteria,
      consumptionBase: row.consumptionBase,
      technicalJustification: row.technicalJustification,
      memoryText: row.memoriaCalculo,
      source: safeString(row.origem),
      automatic: Boolean(row.automatico),
      status: row.status,
    })),
  };

  return {
    normalizedRows,
    summary,
    memoryBundle,
  };
}
