import {
  ServiceCompositionDraftRow,
  ServiceCompositionSummary,
  buildServiceCompositionSummary,
  calculateServiceCompositionItemSubtotal,
  inferRecurrenceTypeFromPeriodicity,
  inferServiceCompositionCategory,
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

function buildRowIdentityKey(row: ServiceCompositionDraftRow) {
  const explicitId = safeString(row.id).trim();
  if (explicitId) {
    return explicitId;
  }

  return [
    normalizeText(row.item),
    normalizeText(row.category),
    normalizeText(row.recurrenceType),
    normalizeText(row.serviceUnit),
    normalizeText(row.periodicity),
  ].join("|");
}

function sanitizeRows(
  rows: Array<Partial<ServiceCompositionDraftRow>>
): ServiceCompositionDraftRow[] {
  return rows.map((row) => sanitizeServiceCompositionDraftRow(row));
}

function mapRowsByIdentity(rows: ServiceCompositionDraftRow[]) {
  const map = new Map<string, ServiceCompositionDraftRow>();

  for (const row of rows) {
    map.set(buildRowIdentityKey(row), row);
  }

  return map;
}

function pushDeltaIfChanged(
  deltas: ServiceCompositionFieldDelta[],
  field: ServiceCompositionFieldDelta["field"],
  previousValue: string | number,
  currentValue: string | number
) {
  const prevComparable =
    typeof previousValue === "number" ? round2(previousValue) : String(previousValue);
  const currComparable =
    typeof currentValue === "number" ? round2(currentValue) : String(currentValue);

  if (prevComparable !== currComparable) {
    deltas.push({
      field,
      previousValue,
      currentValue,
    });
  }
}

function buildFieldDeltas(
  previousRow: ServiceCompositionDraftRow,
  currentRow: ServiceCompositionDraftRow
): ServiceCompositionFieldDelta[] {
  const deltas: ServiceCompositionFieldDelta[] = [];

  pushDeltaIfChanged(deltas, "item", previousRow.item, currentRow.item);
  pushDeltaIfChanged(deltas, "category", previousRow.category, currentRow.category);
  pushDeltaIfChanged(
    deltas,
    "recurrenceType",
    previousRow.recurrenceType,
    currentRow.recurrenceType
  );
  pushDeltaIfChanged(
    deltas,
    "serviceUnit",
    previousRow.serviceUnit,
    currentRow.serviceUnit
  );
  pushDeltaIfChanged(
    deltas,
    "periodicity",
    previousRow.periodicity,
    currentRow.periodicity
  );
  pushDeltaIfChanged(deltas, "quantity", previousRow.quantity, currentRow.quantity);
  pushDeltaIfChanged(deltas, "unitCost", previousRow.unitCost, currentRow.unitCost);
  pushDeltaIfChanged(
    deltas,
    "productivityFactor",
    previousRow.productivityFactor,
    currentRow.productivityFactor
  );
  pushDeltaIfChanged(
    deltas,
    "allocationFactor",
    previousRow.allocationFactor,
    currentRow.allocationFactor
  );
  pushDeltaIfChanged(
    deltas,
    "depreciationMethod",
    previousRow.depreciationMethod,
    currentRow.depreciationMethod
  );
  pushDeltaIfChanged(
    deltas,
    "usefulLifeMonths",
    previousRow.usefulLifeMonths,
    currentRow.usefulLifeMonths
  );
  pushDeltaIfChanged(deltas, "status", previousRow.status, currentRow.status);
  pushDeltaIfChanged(
    deltas,
    "consumptionBasis",
    previousRow.consumptionBasis,
    currentRow.consumptionBasis
  );
  pushDeltaIfChanged(
    deltas,
    "technicalJustification",
    previousRow.technicalJustification,
    currentRow.technicalJustification
  );

  const previousSubtotal = calculateServiceCompositionItemSubtotal(previousRow);
  const currentSubtotal = calculateServiceCompositionItemSubtotal(currentRow);

  pushDeltaIfChanged(deltas, "subtotal", previousSubtotal, currentSubtotal);

  return deltas;
}

function buildComparisonRow(args: {
  key: string;
  previousRow: ServiceCompositionDraftRow | null;
  currentRow: ServiceCompositionDraftRow | null;
}): ServiceCompositionRowComparison {
  const { key, previousRow, currentRow } = args;

  const previousSubtotal = previousRow
    ? calculateServiceCompositionItemSubtotal(previousRow)
    : 0;

  const currentSubtotal = currentRow
    ? calculateServiceCompositionItemSubtotal(currentRow)
    : 0;

  let changeType: ServiceCompositionChangeType = "unchanged";
  let fieldDeltas: ServiceCompositionFieldDelta[] = [];

  if (!previousRow && currentRow) {
    changeType = "added";
  } else if (previousRow && !currentRow) {
    changeType = "removed";
  } else if (previousRow && currentRow) {
    fieldDeltas = buildFieldDeltas(previousRow, currentRow);
    changeType = fieldDeltas.length > 0 ? "changed" : "unchanged";
  }

  const referenceRow = currentRow ?? previousRow;

  return {
    id: safeString(referenceRow?.id) || key,
    key,
    item: safeString(referenceRow?.item),
    category: safeString(referenceRow?.category),
    recurrenceType: safeString(referenceRow?.recurrenceType),
    changeType,
    previousRow,
    currentRow,
    previousSubtotal: round2(previousSubtotal),
    currentSubtotal: round2(currentSubtotal),
    subtotalDelta: round2(currentSubtotal - previousSubtotal),
    fieldDeltas,
  };
}

function buildDeltaByCategory(
  previousSummary: ServiceCompositionSummary,
  currentSummary: ServiceCompositionSummary
) {
  const categories = new Set<string>([
    ...Object.keys(previousSummary.totalsByCategory || {}),
    ...Object.keys(currentSummary.totalsByCategory || {}),
  ]);

  const result: Record<string, number> = {};

  categories.forEach((category) => {
    const previousValue = safeNumber(previousSummary.totalsByCategory?.[category], 0);
    const currentValue = safeNumber(currentSummary.totalsByCategory?.[category], 0);
    result[category] = round2(currentValue - previousValue);
  });

  return result;
}

function buildDeltaByRecurrence(
  previousSummary: ServiceCompositionSummary,
  currentSummary: ServiceCompositionSummary
) {
  const recurrences = new Set<string>([
    ...Object.keys(previousSummary.totalsByRecurrence || {}),
    ...Object.keys(currentSummary.totalsByRecurrence || {}),
  ]);

  const result: Record<string, number> = {};

  recurrences.forEach((recurrence) => {
    const previousValue = safeNumber(previousSummary.totalsByRecurrence?.[recurrence], 0);
    const currentValue = safeNumber(currentSummary.totalsByRecurrence?.[recurrence], 0);
    result[recurrence] = round2(currentValue - previousValue);
  });

  return result;
}

export function compareServiceCompositionVersions(args: {
  previousRows: Array<Partial<ServiceCompositionDraftRow>>;
  currentRows: Array<Partial<ServiceCompositionDraftRow>>;
}): ServiceCompositionComparisonResult {
  const previousRows = sanitizeRows(args.previousRows);
  const currentRows = sanitizeRows(args.currentRows);

  const previousMap = mapRowsByIdentity(previousRows);
  const currentMap = mapRowsByIdentity(currentRows);

  const allKeys = new Set<string>([
    ...Array.from(previousMap.keys()),
    ...Array.from(currentMap.keys()),
  ]);

  const rows: ServiceCompositionRowComparison[] = Array.from(allKeys).map((key) =>
    buildComparisonRow({
      key,
      previousRow: previousMap.get(key) ?? null,
      currentRow: currentMap.get(key) ?? null,
    })
  );

  const previousSummary = buildServiceCompositionSummary(previousRows);
  const currentSummary = buildServiceCompositionSummary(currentRows);

  const addedCount = rows.filter((row) => row.changeType === "added").length;
  const removedCount = rows.filter((row) => row.changeType === "removed").length;
  const changedCount = rows.filter((row) => row.changeType === "changed").length;
  const unchangedCount = rows.filter((row) => row.changeType === "unchanged").length;

  return {
    summary: {
      previousItemCount: previousRows.length,
      currentItemCount: currentRows.length,
      addedCount,
      removedCount,
      changedCount,
      unchangedCount,
      previousTotal: round2(previousSummary.total),
      currentTotal: round2(currentSummary.total),
      totalDelta: round2(currentSummary.total - previousSummary.total),
      previousSummary,
      currentSummary,
      deltaByCategory: buildDeltaByCategory(previousSummary, currentSummary),
      deltaByRecurrence: buildDeltaByRecurrence(previousSummary, currentSummary),
    },
    rows: rows.sort((a, b) => {
      const weight = (type: ServiceCompositionChangeType) => {
        switch (type) {
          case "changed":
            return 0;
          case "added":
            return 1;
          case "removed":
            return 2;
          case "unchanged":
            return 3;
          default:
            return 4;
        }
      };

      const byType = weight(a.changeType) - weight(b.changeType);
      if (byType !== 0) {
        return byType;
      }

      return a.item.localeCompare(b.item, "pt-BR");
    }),
  };
}
