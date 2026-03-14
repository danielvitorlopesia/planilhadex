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

export type ServiceCompositionRecurrenceType =
  | "recorrente"
  | "eventual"
  | "sob_demanda";

export type ServiceCompositionDepreciationMethod =
  | "nao_aplica"
  | "rateio_linear";

export type ServiceCompositionDraftRow = {
  id: string;
  item: string;
  category: ServiceCompositionCategory;
  recurrenceType: ServiceCompositionRecurrenceType;
  serviceUnit: string;
  periodicity: ServiceCompositionPeriodicity;
  quantity: number;
  unitCost: number;
  productivityFactor: number;
  allocationFactor: number;
  depreciationMethod: ServiceCompositionDepreciationMethod;
  usefulLifeMonths: number;
  status: string;
  consumptionBasis: string;
  technicalJustification: string;
};

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
  onDemandTotal: number;
  totalsByCategory: Record<ServiceCompositionCategory, number>;
  totalsByRecurrence: Record<ServiceCompositionRecurrenceType, number>;
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

export const SERVICE_COMPOSITION_RECURRENCE_OPTIONS: Array<{
  value: ServiceCompositionRecurrenceType;
  label: string;
}> = [
  { value: "recorrente", label: "Recorrente" },
  { value: "eventual", label: "Eventual" },
  { value: "sob_demanda", label: "Sob demanda" },
];

export const SERVICE_COMPOSITION_DEPRECIATION_OPTIONS: Array<{
  value: ServiceCompositionDepreciationMethod;
  label: string;
}> = [
  { value: "nao_aplica", label: "Não se aplica" },
  { value: "rateio_linear", label: "Rateio linear" },
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

const VALID_RECURRENCES = new Set<ServiceCompositionRecurrenceType>([
  "recorrente",
  "eventual",
  "sob_demanda",
]);

const VALID_DEPRECIATION_METHODS = new Set<ServiceCompositionDepreciationMethod>([
  "nao_aplica",
  "rateio_linear",
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

export function inferRecurrenceTypeFromPeriodicity(
  periodicity?: string
): ServiceCompositionRecurrenceType {
  if (periodicity === "sob_demanda") {
    return "sob_demanda";
  }

  return "recorrente";
}

export function getMonthlyizationFactor(
  periodicity: ServiceCompositionPeriodicity
) {
  switch (periodicity) {
    case "mensal":
      return 1;
    case "bimestral":
      return 1 / 2;
    case "trimestral":
      return 1 / 3;
    case "quadrimestral":
      return 1 / 4;
    case "semestral":
      return 1 / 6;
    case "anual":
      return 1 / 12;
    case "sob_demanda":
      return 1;
    default:
      return 1;
  }
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

  const rawRecurrence = safeString(
    input?.recurrenceType,
    inferRecurrenceTypeFromPeriodicity(periodicity)
  );
  const recurrenceType = VALID_RECURRENCES.has(
    rawRecurrence as ServiceCompositionRecurrenceType
  )
    ? (rawRecurrence as ServiceCompositionRecurrenceType)
    : "recorrente";

  const rawDepreciationMethod = safeString(
    input?.depreciationMethod,
    "nao_aplica"
  );
  const depreciationMethod = VALID_DEPRECIATION_METHODS.has(
    rawDepreciationMethod as ServiceCompositionDepreciationMethod
  )
    ? (rawDepreciationMethod as ServiceCompositionDepreciationMethod)
    : "nao_aplica";

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

export function calculateServiceCompositionItemSubtotal(
  row: ServiceCompositionDraftRow
) {
  const monthlyizationFactor = getMonthlyizationFactor(row.periodicity);

  const depreciationFactor =
    row.depreciationMethod === "rateio_linear" && row.usefulLifeMonths > 0
      ? 1 / row.usefulLifeMonths
      : 1;

  const subtotal =
    row.quantity *
    row.unitCost *
    row.productivityFactor *
    monthlyizationFactor *
    row.allocationFactor *
    depreciationFactor;

  return round2(subtotal);
}

export function calculateServiceCompositionEffectiveUnitCost(
  row: ServiceCompositionDraftRow
) {
  if (row.quantity <= 0) {
    return 0;
  }

  return round2(calculateServiceCompositionItemSubtotal(row) / row.quantity);
}

export function buildServiceCompositionRowMemory(
  row: ServiceCompositionDraftRow
) {
  const monthlyizationFactor = getMonthlyizationFactor(row.periodicity);

  const depreciationFragment =
    row.depreciationMethod === "rateio_linear" && row.usefulLifeMonths > 0
      ? `Depreciação/rateio linear em ${row.usefulLifeMonths} mês(es)`
      : "Sem depreciação/rateio linear";

  const fragments = [
    `Recorrência: ${row.recurrenceType}`,
    `Unidade de serviço: ${row.serviceUnit}`,
    `Periodicidade: ${row.periodicity} (fator mensal ${round2(monthlyizationFactor)})`,
    `Custo unitário base: ${round2(row.unitCost)}`,
    `Fator de produtividade: ${round2(row.productivityFactor)}`,
    `Fator de rateio contratual: ${round2(row.allocationFactor)}`,
    depreciationFragment,
    `Fórmula: quantidade x custo unitário x produtividade x fator mensal x rateio x depreciação`,
  ];

  if (row.consumptionBasis.trim()) {
    fragments.push(`Base de consumo: ${row.consumptionBasis.trim()}`);
  }

  if (row.technicalJustification.trim()) {
    fragments.push(`Justificativa técnica: ${row.technicalJustification.trim()}`);
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

  const totalsByRecurrence: Record<ServiceCompositionRecurrenceType, number> = {
    recorrente: 0,
    eventual: 0,
    sob_demanda: 0,
  };

  rows.forEach((row) => {
    const subtotal = calculateServiceCompositionItemSubtotal(row);
    totalsByCategory[row.category] += subtotal;
    totalsByRecurrence[row.recurrenceType] += subtotal;
  });

  const workforceTotal = round2(totalsByCategory["Equipe técnica / operacional"]);
  const materialsTotal = round2(totalsByCategory["Materiais e insumos"]);
  const equipmentTotal = round2(totalsByCategory["Equipamentos"]);
  const logisticsTotal = round2(totalsByCategory["Logística operacional"]);
  const supportTotal = round2(totalsByCategory["Apoio operacional"]);

  const recurringTotal = round2(totalsByRecurrence.recorrente);
  const eventualTotal = round2(totalsByRecurrence.eventual);
  const onDemandTotal = round2(totalsByRecurrence.sob_demanda);

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
    recurringTotal,
    eventualTotal,
    onDemandTotal,
    totalsByCategory: {
      "Equipe técnica / operacional": workforceTotal,
      "Materiais e insumos": materialsTotal,
      Equipamentos: equipmentTotal,
      "Logística operacional": logisticsTotal,
      "Apoio operacional": supportTotal,
    },
    totalsByRecurrence: {
      recorrente: recurringTotal,
      eventual: eventualTotal,
      sob_demanda: onDemandTotal,
    },
  };
}
