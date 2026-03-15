export type LaborChargesConfig = {
  employerInssRate: number;
  fgtsRate: number;
  ratRate: number;
  thirdPartyRate: number;
  vacationProvisionRate: number;
  thirteenthProvisionRate: number;
  valeTransportePerEmployee: number;
  valeAlimentacaoPerEmployee: number;
  otherBenefitsPerEmployee: number;
};

export type LaborInput = {
  salaryBaseTotal: number;
  quantity: number;
  config?: Partial<LaborChargesConfig> | null;
};

export type LaborResult = {
  salaryBaseTotal: number;
  quantity: number;
  employerInss: number;
  fgts: number;
  rat: number;
  thirdPartyCharges: number;
  feriasProvision: number;
  thirteenthProvision: number;
  valeTransporte: number;
  valeAlimentacao: number;
  otherBenefits: number;
  totalEncargos: number;
  totalBenefits: number;
  custoTotal: number;
  config: LaborChargesConfig;
};

export const DEFAULT_LABOR_CHARGES_CONFIG: LaborChargesConfig = {
  employerInssRate: 20,
  fgtsRate: 8,
  ratRate: 2,
  thirdPartyRate: 5.8,
  vacationProvisionRate: 11.11,
  thirteenthProvisionRate: 8.33,
  valeTransportePerEmployee: 0,
  valeAlimentacaoPerEmployee: 0,
  otherBenefitsPerEmployee: 0,
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

export function sanitizeLaborChargesConfig(
  input?: Partial<LaborChargesConfig> | null
): LaborChargesConfig {
  return {
    employerInssRate: parseNumber(
      input?.employerInssRate,
      DEFAULT_LABOR_CHARGES_CONFIG.employerInssRate
    ),
    fgtsRate: parseNumber(
      input?.fgtsRate,
      DEFAULT_LABOR_CHARGES_CONFIG.fgtsRate
    ),
    ratRate: parseNumber(
      input?.ratRate,
      DEFAULT_LABOR_CHARGES_CONFIG.ratRate
    ),
    thirdPartyRate: parseNumber(
      input?.thirdPartyRate,
      DEFAULT_LABOR_CHARGES_CONFIG.thirdPartyRate
    ),
    vacationProvisionRate: parseNumber(
      input?.vacationProvisionRate,
      DEFAULT_LABOR_CHARGES_CONFIG.vacationProvisionRate
    ),
    thirteenthProvisionRate: parseNumber(
      input?.thirteenthProvisionRate,
      DEFAULT_LABOR_CHARGES_CONFIG.thirteenthProvisionRate
    ),
    valeTransportePerEmployee: parseNumber(
      input?.valeTransportePerEmployee,
      DEFAULT_LABOR_CHARGES_CONFIG.valeTransportePerEmployee
    ),
    valeAlimentacaoPerEmployee: parseNumber(
      input?.valeAlimentacaoPerEmployee,
      DEFAULT_LABOR_CHARGES_CONFIG.valeAlimentacaoPerEmployee
    ),
    otherBenefitsPerEmployee: parseNumber(
      input?.otherBenefitsPerEmployee,
      DEFAULT_LABOR_CHARGES_CONFIG.otherBenefitsPerEmployee
    ),
  };
}

export function extractLaborChargesConfigMetadata(
  raw: unknown
): LaborChargesConfig {
  if (!isRecord(raw)) {
    return { ...DEFAULT_LABOR_CHARGES_CONFIG };
  }

  const partialConfig: Partial<LaborChargesConfig> = {
    employerInssRate: parseNumber(raw["employerInssRate"]),
    fgtsRate: parseNumber(raw["fgtsRate"]),
    ratRate: parseNumber(raw["ratRate"]),
    thirdPartyRate: parseNumber(raw["thirdPartyRate"]),
    vacationProvisionRate: parseNumber(raw["vacationProvisionRate"]),
    thirteenthProvisionRate: parseNumber(raw["thirteenthProvisionRate"]),
    valeTransportePerEmployee: parseNumber(raw["valeTransportePerEmployee"]),
    valeAlimentacaoPerEmployee: parseNumber(raw["valeAlimentacaoPerEmployee"]),
    otherBenefitsPerEmployee: parseNumber(raw["otherBenefitsPerEmployee"]),
  };

  return sanitizeLaborChargesConfig(partialConfig);
}

export function extractLaborCostBreakdownMetadata(
  raw: unknown
): LaborResult | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    salaryBaseTotal: parseNumber(raw["salaryBaseTotal"]),
    quantity: parseNumber(raw["quantity"]),
    employerInss: parseNumber(raw["employerInss"]),
    fgts: parseNumber(raw["fgts"]),
    rat: parseNumber(raw["rat"]),
    thirdPartyCharges: parseNumber(raw["thirdPartyCharges"]),
    feriasProvision: parseNumber(raw["feriasProvision"]),
    thirteenthProvision: parseNumber(raw["thirteenthProvision"]),
    valeTransporte: parseNumber(raw["valeTransporte"]),
    valeAlimentacao: parseNumber(raw["valeAlimentacao"]),
    otherBenefits: parseNumber(raw["otherBenefits"]),
    totalEncargos: parseNumber(raw["totalEncargos"]),
    totalBenefits: parseNumber(raw["totalBenefits"]),
    custoTotal: parseNumber(raw["custoTotal"]),
    config: extractLaborChargesConfigMetadata(raw["config"]),
  };
}

export function calculateLaborCost(input: LaborInput): LaborResult {
  const config = sanitizeLaborChargesConfig(input.config);

  const salaryBaseTotal = parseNumber(input.salaryBaseTotal, 0);
  const quantity = parseNumber(input.quantity, 0);

  const employerInss = salaryBaseTotal * (config.employerInssRate / 100);
  const fgts = salaryBaseTotal * (config.fgtsRate / 100);
  const rat = salaryBaseTotal * (config.ratRate / 100);
  const thirdPartyCharges = salaryBaseTotal * (config.thirdPartyRate / 100);
  const feriasProvision =
    salaryBaseTotal * (config.vacationProvisionRate / 100);
  const thirteenthProvision =
    salaryBaseTotal * (config.thirteenthProvisionRate / 100);

  const valeTransporte = quantity * config.valeTransportePerEmployee;
  const valeAlimentacao = quantity * config.valeAlimentacaoPerEmployee;
  const otherBenefits = quantity * config.otherBenefitsPerEmployee;

  const totalEncargos =
    employerInss +
    fgts +
    rat +
    thirdPartyCharges +
    feriasProvision +
    thirteenthProvision;

  const totalBenefits =
    valeTransporte + valeAlimentacao + otherBenefits;

  const custoTotal = salaryBaseTotal + totalEncargos + totalBenefits;

  return {
    salaryBaseTotal,
    quantity,
    employerInss,
    fgts,
    rat,
    thirdPartyCharges,
    feriasProvision,
    thirteenthProvision,
    valeTransporte,
    valeAlimentacao,
    otherBenefits,
    totalEncargos,
    totalBenefits,
    custoTotal,
    config,
  };
}
