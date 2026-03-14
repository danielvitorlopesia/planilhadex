export type ServiceCompositionCategory =
  | "Equipe técnica / operacional"
  | "Materiais e insumos"
  | "Equipamentos"
  | "Logística operacional"
  | "Apoio operacional";

export type ServiceCompositionPeriodicity =
  | "mensal"
  | "bimestral"
  | "trimestral"
  | "quadrimestral"
  | "semestral"
  | "anual"
  | "sob_demanda";

export type ServiceCompositionDraftRow = {
  id: string;
  item: string;
  category: ServiceCompositionCategory;
  serviceUnit: string;
  periodicity: ServiceCompositionPeriodicity;
  quantity: number;
  unitCost: number;
  productivityFactor: number;
  allocationFactor: number;
  status: string;
  notes: string;
};

export type ServiceCompositionSummary = {
  itemCount: number;
  total: number;
  workforceTotal: number;
  materialsTotal: number;
  equipmentTotal: number;
  logisticsTotal: number;
  supportTotal: number;
  totalsByCategory: Record<ServiceCompositionCategory, number>;
};

export const SERVICE_COMPOSITION_CATEGORY_OPTIONS: Array<{
  value: ServiceCompositionCategory;
  label: string;
}> = [
  {
    value: "Equipe técnica / operacional",
    label: "Equipe técnica / operacional",
  },
  {
    value: "Materiais e insumos",
    label: "Materiais e insumos",
  },
  {
    value: "Equipamentos",
    label: "Equipamentos",
  },
  {
    value: "Logística operacional",
    label: "Logística operacional",
  },
  {
    value: "Apoio operacional",
    label: "Apoio operacional",
  },
];

export const SERVICE_COMPOSITION_PERIODICITY_OPTIONS: Array<{
  value: ServiceCompositionPeriodicity;
  label: string;
}> = [
  { value: "mensal", label: "Mensal" },
  { value: "bimestral", label: "Bimestral" },
  { value: "trimestral", label: "Trimestral" },
  { value: "quadrimestral", label: "Quadrimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
  { value: "sob_demanda", label: "Sob demanda" },
];

export const SERVICE_COMPOSITION_STATUS_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: "Pendente", label: "Pendente" },
  { value: "Conferido", label: "Conferido" },
  { value: "Exemplo do domínio", label: "Exemplo do domínio" },
  { value: "Em elaboração", label: "Em elaboração" },
];

function round2(value: number) {
  return Number((value || 0).toFixed(2));
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

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

const VALID_PERIODICITIES = new Set<ServiceCompositionPeriodicity>([
  "mensal",
  "bimestral",
  "trimestral",
  "quadrimestral",
  "semestral",
  "anual",
  "sob_demanda",
]);

export function inferServiceCompositionCategory(
  rawCategory?: string
): ServiceCompositionCategory {
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

export function sanitizeServiceCompositionDraftRow(
  input?: Partial<ServiceCompositionDraftRow>
): ServiceCompositionDraftRow {
  const rawPeriodicity = safeString(input?.periodicity, "mensal");
  const periodicity = VALID_PERIODICITIES.has(
    rawPeriodicity as ServiceCompositionPeriodicity
  )
    ? (rawPeriodicity as ServiceCompositionPeriodicity)
    : "mensal";

  return {
    id:
      safeString(input?.id) ||
      `svc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    item: safeString(input?.item) || "Novo componente",
    category: inferServiceCompositionCategory(
      safeString(input?.category) || "Materiais e insumos"
    ),
    serviceUnit: safeString(input?.serviceUnit) || "unidade",
    periodicity,
    quantity: Math.max(0, safeNumber(input?.quantity, 1)),
    unitCost: Math.max(0, safeNumber(input?.unitCost, 0)),
    productivityFactor: Math.max(0, safeNumber(input?.productivityFactor, 1)),
    allocationFactor: Math.max(0, safeNumber(input?.allocationFactor, 1)),
    status: safeString(input?.status) || "Pendente",
    notes: safeString(input?.notes),
  };
}

export function calculateServiceCompositionItemSubtotal(
  row: ServiceCompositionDraftRow
) {
  const subtotal =
    row.quantity *
    row.unitCost *
    row.productivityFactor *
    row.allocationFactor;

  return round2(subtotal);
}

export function calculateServiceCompositionEffectiveUnitCost(
  row: ServiceCompositionDraftRow
) {
  return round2(
    row.unitCost * row.productivityFactor * row.allocationFactor
  );
}

export function buildServiceCompositionRowMemory(
  row: ServiceCompositionDraftRow
) {
  const fragments = [
    `Unidade de serviço: ${row.serviceUnit}`,
    `Periodicidade: ${row.periodicity}`,
    `Custo unitário base: ${round2(row.unitCost)}`,
    `Fator de produtividade: ${round2(row.productivityFactor)}`,
    `Fator de rateio/depreciação: ${round2(row.allocationFactor)}`,
    `Fórmula: quantidade x custo unitário x produtividade x rateio`,
  ];

  if (row.notes.trim()) {
    fragments.push(`Observações: ${row.notes.trim()}`);
  }

  return fragments.join(" | ");
}

export function buildServiceCompositionSummary(
  rows: ServiceCompositionDraftRow[]
): ServiceCompositionSummary {
  const totalsByCategory: Record<ServiceCompositionCategory, number> = {
    "Equipe técnica / operacional": 0,
    "Materiais e insumos": 0,
    Equipamentos: 0,
    "Logística operacional": 0,
    "Apoio operacional": 0,
  };

  rows.forEach((row) => {
    totalsByCategory[row.category] += calculateServiceCompositionItemSubtotal(row);
  });

  const workforceTotal = round2(totalsByCategory["Equipe técnica / operacional"]);
  const materialsTotal = round2(totalsByCategory["Materiais e insumos"]);
  const equipmentTotal = round2(totalsByCategory["Equipamentos"]);
  const logisticsTotal = round2(totalsByCategory["Logística operacional"]);
  const supportTotal = round2(totalsByCategory["Apoio operacional"]);

  const total = round2(
    workforceTotal +
      materialsTotal +
      equipmentTotal +
      logisticsTotal +
      supportTotal
  );

  return {
    itemCount: rows.length,
    total,
    workforceTotal,
    materialsTotal,
    equipmentTotal,
    logisticsTotal,
    supportTotal,
    totalsByCategory: {
      "Equipe técnica / operacional": workforceTotal,
      "Materiais e insumos": materialsTotal,
      Equipamentos: equipmentTotal,
      "Logística operacional": logisticsTotal,
      "Apoio operacional": supportTotal,
    },
  };
}
