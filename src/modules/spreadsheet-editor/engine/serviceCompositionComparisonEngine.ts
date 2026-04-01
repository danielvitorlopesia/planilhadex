import {
  ServiceCompositionRow,
  ServiceCompositionSummary,
  normalizeServiceCompositionRows,
  summarizeServiceCompositionRows,
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
    | "demandType"
    | "serviceUnit"
    | "periodicity"
    | "quantity"
    | "unitCost"
    | "productivityFactor"
    | "monthlyFactor"
    | "depreciationCriteria"
    | "status"
    | "consumptionBase"
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
  previousRow: ServiceCompositionRow | null;
  currentRow: ServiceCompositionRow | null;
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

function getRowSubtotal(row: ServiceCompositionRow | null | undefined) {
  return round2(safeNumber(row?.subtotal, 0));
}

function buildRowIdentityKey(row: ServiceCompositionRow) {
  const explicitId = safeString(row.id).trim();
  if (explicitId) {
    return explicitId;
  }

  return [
    normalizeText(row.item),
    normalizeText(row.categoria),
    normalizeText(row.demandType),
    normalizeText(row.serviceUnit),
    normalizeText(row.periodicity),
  ].join("|");
}

function sanitizeRows(
  rows: Array<Partial<ServiceCompositionRow>>
): ServiceCompositionRow[] {
  return normalizeServiceCompositionRows(rows as ServiceCompositionRow[]);
}

function mapRowsByIdentity(rows: ServiceCompositionRow[]) {
  const map = new Map<string, ServiceCompositionRow>();

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
  previousRow: ServiceCompositionRow,
  currentRow: ServiceCompositionRow
): ServiceCompositionFieldDelta[] {
  const deltas: ServiceCompositionFieldDelta[] = [];

  pushDeltaIfChanged(deltas, "item", previousRow.item, currentRow.item);
  pushDeltaIfChanged(
    deltas,
    "category",
    safeString(previousRow.categoria),
    safeString(currentRow.categoria)
  );
  pushDeltaIfChanged(
    deltas,
    "demandType",
    safeString(previousRow.demandType),
    safeString(currentRow.demandType)
  );
  pushDeltaIfChanged(
    deltas,
    "serviceUnit",
    safeString(previousRow.serviceUnit),
    safeString(currentRow.serviceUnit)
  );
  pushDeltaIfChanged(
    deltas,
    "periodicity",
    safeString(previousRow.periodicity),
    safeString(currentRow.periodicity)
  );
  pushDeltaIfChanged(
    deltas,
    "quantity",
    safeNumber(previousRow.quantidade),
    safeNumber(currentRow.quantidade)
  );
  pushDeltaIfChanged(
    deltas,
    "unitCost",
    safeNumber(previousRow.valorUnitario),
    safeNumber(currentRow.valorUnitario)
  );
  pushDeltaIfChanged(
    deltas,
    "productivityFactor",
    safeNumber(previousRow.productivityFactor, 1),
    safeNumber(currentRow.productivityFactor, 1)
  );
  pushDeltaIfChanged(
    deltas,
    "monthlyFactor",
    safeNumber(previousRow.monthlyFactor, 1),
    safeNumber(currentRow.monthlyFactor, 1)
  );
  pushDeltaIfChanged(
    deltas,
    "depreciationCriteria",
    safeString(previousRow.depreciationCriteria),
    safeString(currentRow.depreciationCriteria)
  );
  pushDeltaIfChanged(
    deltas,
    "status",
    safeString(previousRow.status),
    safeString(currentRow.status)
  );
  pushDeltaIfChanged(
    deltas,
    "consumptionBase",
    safeString(previousRow.consumptionBase),
    safeString(currentRow.consumptionBase)
  );
  pushDeltaIfChanged(
    deltas,
    "technicalJustification",
    safeString(previousRow.technicalJustification),
    safeString(currentRow.technicalJustification)
  );

  pushDeltaIfChanged(
    deltas,
    "subtotal",
    getRowSubtotal(previousRow),
    getRowSubtotal(currentRow)
  );

  return deltas;
}

function buildComparisonRow(args: {
  key: string;
  previousRow: ServiceCompositionRow | null;
  currentRow: ServiceCompositionRow | null;
}): ServiceCompositionRowComparison {
  const { key, previousRow, currentRow } = args;

  const previousSubtotal = previousRow ? getRowSubtotal(previousRow) : 0;
  const currentSubtotal = currentRow ? getRowSubtotal(currentRow) : 0;

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
    category: safeString(referenceRow?.categoria),
    recurrenceType: safeString(referenceRow?.demandType),
    changeType,
    previousRow,
    currentRow,
    previousSubtotal: round2(previousSubtotal),
    currentSubtotal: round2(currentSubtotal),
    subtotalDelta: round2(currentSubtotal - previousSubtotal),
    fieldDeltas,
  };
}

function buildCategoryTotals(rows: ServiceCompositionRow[]) {
  const result: Record<string, number> = {};

  for (const row of rows) {
    const category = safeString(row.categoria) || "Não classificado";
    result[category] = round2((result[category] || 0) + getRowSubtotal(row));
  }

  return result;
}

function buildRecurrenceTotals(rows: ServiceCompositionRow[]) {
  const result: Record<string, number> = {};

  for (const row of rows) {
    const recurrence = safeString(row.demandType) || "nao_informado";
    result[recurrence] = round2((result[recurrence] || 0) + getRowSubtotal(row));
  }

  return result;
}

function buildDeltaMap(
  previousMap: Record<string, number>,
  currentMap: Record<string, number>
) {
  const keys = new Set<string>([
    ...Object.keys(previousMap),
    ...Object.keys(currentMap),
  ]);

  const result: Record<string, number> = {};

  keys.forEach((key) => {
    const previousValue = safeNumber(previousMap[key], 0);
    const currentValue = safeNumber(currentMap[key], 0);
    result[key] = round2(currentValue - previousValue);
  });

  return result;
}

export function compareServiceCompositionVersions(args: {
  previousRows: Array<Partial<ServiceCompositionRow>>;
  currentRows: Array<Partial<ServiceCompositionRow>>;
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

  const previousSummary = summarizeServiceCompositionRows(previousRows);
  const currentSummary = summarizeServiceCompositionRows(currentRows);

  const previousCategoryTotals = buildCategoryTotals(previousRows);
  const currentCategoryTotals = buildCategoryTotals(currentRows);

  const previousRecurrenceTotals = buildRecurrenceTotals(previousRows);
  const currentRecurrenceTotals = buildRecurrenceTotals(currentRows);

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
      deltaByCategory: buildDeltaMap(
        previousCategoryTotals,
        currentCategoryTotals
      ),
      deltaByRecurrence: buildDeltaMap(
        previousRecurrenceTotals,
        currentRecurrenceTotals
      ),
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
