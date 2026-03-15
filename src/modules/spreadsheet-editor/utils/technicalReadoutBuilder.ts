export type ServiceCompositionSummary = {
  itemCount: number;
  total: number;
  workforceTotal: number;
  materialsTotal: number;
  equipmentTotal: number;
  logisticsTotal: number;
  supportTotal: number;
  recurringTotal: number;
  eventualTotal: number;
};

export type ServiceCompositionMemoryBundleItem = {
  serviceUnit: string;
  periodicity: string;
  quantity: number;
  unitCost: number;
  productivityFactor: number;
  monthlyizationFactor: number;
  allocationFactor: number;
  depreciationMethod: string;
  depreciationFactor: number;
  usefulLifeMonths: number;
  subtotal: number;
  formula: string;
  consumptionBasis: string;
  technicalJustification: string;
};

export type ServiceCompositionTechnicalReadout = {
  summary: ServiceCompositionSummary;
  bundle: ServiceCompositionMemoryBundleItem[];
  highlights: string[];
  alerts: string[];
};

const EMPTY_SUMMARY: ServiceCompositionSummary = {
  itemCount: 0,
  total: 0,
  workforceTotal: 0,
  materialsTotal: 0,
  equipmentTotal: 0,
  logisticsTotal: 0,
  supportTotal: 0,
  recurringTotal: 0,
  eventualTotal: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseNumber(value: unknown, fallback = 0): number {
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

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => safeString(item).trim())
    .filter((item) => item.length > 0);
}

export function extractServiceCompositionSummaryMetadata(
  raw: unknown
): ServiceCompositionSummary {
  if (!isRecord(raw)) {
    return { ...EMPTY_SUMMARY };
  }

  return {
    itemCount: parseNumber(raw["itemCount"]),
    total: parseNumber(raw["total"]),
    workforceTotal: parseNumber(raw["workforceTotal"]),
    materialsTotal: parseNumber(raw["materialsTotal"]),
    equipmentTotal: parseNumber(raw["equipmentTotal"]),
    logisticsTotal: parseNumber(raw["logisticsTotal"]),
    supportTotal: parseNumber(raw["supportTotal"]),
    recurringTotal: parseNumber(raw["recurringTotal"]),
    eventualTotal: parseNumber(raw["eventualTotal"]),
  };
}

export function extractServiceCompositionMemoryBundleMetadata(
  raw: unknown
): ServiceCompositionMemoryBundleItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => {
    const record = isRecord(item) ? item : {};

    return {
      serviceUnit: safeString(record["serviceUnit"]),
      periodicity: safeString(record["periodicity"]),
      quantity: parseNumber(record["quantity"]),
      unitCost: parseNumber(record["unitCost"]),
      productivityFactor: parseNumber(record["productivityFactor"]),
      monthlyizationFactor: parseNumber(record["monthlyizationFactor"]),
      allocationFactor: parseNumber(record["allocationFactor"]),
      depreciationMethod: safeString(record["depreciationMethod"]),
      depreciationFactor: parseNumber(record["depreciationFactor"]),
      usefulLifeMonths: parseNumber(record["usefulLifeMonths"]),
      subtotal: parseNumber(record["subtotal"]),
      formula: safeString(record["formula"]),
      consumptionBasis: safeString(record["consumptionBasis"]),
      technicalJustification: safeString(record["technicalJustification"]),
    };
  });
}

export function extractServiceCompositionTechnicalReadoutMetadata(
  raw: unknown
): ServiceCompositionTechnicalReadout {
  if (!isRecord(raw)) {
    return {
      summary: { ...EMPTY_SUMMARY },
      bundle: [],
      highlights: [],
      alerts: [],
    };
  }

  return {
    summary: extractServiceCompositionSummaryMetadata(raw["summary"]),
    bundle: extractServiceCompositionMemoryBundleMetadata(raw["bundle"]),
    highlights: safeStringArray(raw["highlights"]),
    alerts: safeStringArray(raw["alerts"]),
  };
}

type BuildTechnicalReadoutParams = {
  rows: Array<{
    item?: string;
    categoria?: string;
    quantidade?: number;
    valorUnitario?: number;
    subtotal?: number;
    memoriaCalculo?: string;
    status?: string;
  }>;
};

function categoryIncludes(
  categoria: string | undefined,
  terms: string[]
): boolean {
  const normalized = safeString(categoria).toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function sumSubtotals(
  rows: BuildTechnicalReadoutParams["rows"],
  matcher: (row: BuildTechnicalReadoutParams["rows"][number]) => boolean
): number {
  return rows.reduce((sum, row) => {
    if (!matcher(row)) {
      return sum;
    }

    return sum + parseNumber(row.subtotal);
  }, 0);
}

function buildBundleFromRows(
  rows: BuildTechnicalReadoutParams["rows"]
): ServiceCompositionMemoryBundleItem[] {
  return rows.map((row) => ({
    serviceUnit: safeString(row.item),
    periodicity: "mensal",
    quantity: parseNumber(row.quantidade),
    unitCost: parseNumber(row.valorUnitario),
    productivityFactor: 1,
    monthlyizationFactor: 1,
    allocationFactor: 1,
    depreciationMethod: "",
    depreciationFactor: 0,
    usefulLifeMonths: 0,
    subtotal: parseNumber(row.subtotal),
    formula: safeString(row.memoriaCalculo),
    consumptionBasis: safeString(row.categoria),
    technicalJustification: "",
  }));
}

function buildHighlights(summary: ServiceCompositionSummary): string[] {
  const highlights: string[] = [];

  if (summary.workforceTotal > 0) {
    highlights.push("Há composição relevante de mão de obra na estrutura.");
  }

  if (summary.materialsTotal > 0) {
    highlights.push("Há insumos e materiais com impacto econômico mensurável.");
  }

  if (summary.equipmentTotal > 0) {
    highlights.push("Há equipamentos ou ativos operacionais compondo o custo.");
  }

  if (summary.recurringTotal > 0) {
    highlights.push("Foram identificados itens recorrentes na composição.");
  }

  if (summary.eventualTotal > 0) {
    highlights.push("Foram identificados itens eventuais na composição.");
  }

  return highlights;
}

function buildAlerts(summary: ServiceCompositionSummary): string[] {
  const alerts: string[] = [];

  if (summary.total <= 0) {
    alerts.push("A composição não apresenta total econômico positivo.");
  }

  if (summary.itemCount === 0) {
    alerts.push("Nenhum item foi identificado na composição técnica.");
  }

  if (summary.materialsTotal === 0 && summary.equipmentTotal === 0) {
    alerts.push(
      "A composição não apresenta materiais nem equipamentos; revisar aderência ao serviço."
    );
  }

  return alerts;
}

export function buildServiceCompositionTechnicalReadout(
  params: BuildTechnicalReadoutParams
): ServiceCompositionTechnicalReadout {
  const rows = Array.isArray(params.rows) ? params.rows : [];

  const summary: ServiceCompositionSummary = {
    itemCount: rows.length,
    total: rows.reduce((sum, row) => sum + parseNumber(row.subtotal), 0),
    workforceTotal: sumSubtotals(rows, (row) =>
      categoryIncludes(row.categoria, [
        "mão de obra",
        "mao de obra",
        "equipe",
        "operacional",
      ])
    ),
    materialsTotal: sumSubtotals(rows, (row) =>
      categoryIncludes(row.categoria, ["material", "materiais", "insumos"])
    ),
    equipmentTotal: sumSubtotals(rows, (row) =>
      categoryIncludes(row.categoria, ["equipamento", "equipamentos"])
    ),
    logisticsTotal: sumSubtotals(rows, (row) =>
      categoryIncludes(row.categoria, ["logística", "logistica", "transporte"])
    ),
    supportTotal: sumSubtotals(rows, (row) =>
      categoryIncludes(row.categoria, ["apoio", "suporte", "administração", "administracao"])
    ),
    recurringTotal: sumSubtotals(rows, (row) =>
      safeString(row.status).toLowerCase().includes("recorrente")
    ),
    eventualTotal: sumSubtotals(rows, (row) =>
      safeString(row.status).toLowerCase().includes("eventual")
    ),
  };

  return {
    summary,
    bundle: buildBundleFromRows(rows),
    highlights: buildHighlights(summary),
    alerts: buildAlerts(summary),
  };
}
