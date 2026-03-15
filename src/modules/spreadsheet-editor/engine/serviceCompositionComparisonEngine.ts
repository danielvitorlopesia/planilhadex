import {
  ServiceCompositionDraftRow,
  ServiceCompositionSummary,
  buildServiceCompositionSummary,
  calculateServiceCompositionItemSubtotal,
} from "../utils/serviceCompositionCalculator";

export type ServiceCompositionChangeType =
  | "added"
  | "removed"
  | "changed"
  | "unchanged";

export type ServiceCompositionFieldDelta = {
  field:
    | "item"
    | "category"
    | "recurrenceType"
    | "serviceUnit"
    | "periodicity"
    | "quantity"
    | "unitCost"
    | "productivityFactor"
    | "allocationFactor"
    | "depreciationMethod"
    | "usefulLifeMonths"
    | "status"
    | "consumptionBasis"
    | "technicalJustification"
    | "subtotal";
  previousValue: string | number;
  currentValue: string | number;
};

export type ServiceCompositionRowComparison = {
  id: string;
  key: string;
  item: string;
  category: string;
  recurrenceType: string;
  changeType: ServiceCompositionChangeType;
  previousRow: ServiceCompositionDraftRow | null;
  currentRow: ServiceCompositionDraftRow | null;
  previousSubtotal: number;
  currentSubtotal: number;
  subtotalDelta: number;
  fieldDeltas: ServiceCompositionFieldDelta[];
};

export type ServiceCompositionComparisonSummary = {
  previousItemCount: number;
  currentItemCount: number;
  addedCount: number;
  removedCount: number;
  changedCount: number;
  unchangedCount: number;
  previousTotal: number;
  currentTotal: number;
  totalDelta: number;
  previousSummary: ServiceCompositionSummary;
  currentSummary: ServiceCompositionSummary;
  deltaByCategory: Record<string, number>;
  deltaByRecurrence: Record<string, number>;
};

export type ServiceCompositionComparisonResult = {
  summary: ServiceCompositionComparisonSummary;
  rows: ServiceCompositionRowComparison[];
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
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function normalizeText(value: unknown) {
  return safeString(value).trim().toLowerCase();
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
    safeString(input?.category)
