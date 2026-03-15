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

function coerceNumber(value: unknown, fallback = 0): number {
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
    employerInssRate: coerceNumber(
      input?.employerInssRate,
      DEFAULT_LABOR_CHARGES_CONFIG.employerInssRate
    ),
    fgtsRate: coerceNumber(
      input?.fgtsRate,
      DEFAULT_LABOR_CHARGES_CONFIG.fgtsRate
    ),
    ratRate: coerceNumber(
      input?.ratRate,
      DEFAULT_LABOR_CHARGES_CONFIG.ratRate
    ),
    thirdPartyRate: coerceNumber(
      input?.thirdPartyRate,
      DEFAULT_LABOR_CHARGES_CONFIG.thirdPartyRate
    ),
    vacationProvisionRate: coerceNumber(
      input?.vacationProvisionRate,
      DEFAULT_LABOR_CHARGES_CONFIG.vacationProvisionRate
    ),
    thirteenthProvisionRate: coerceNumber(
      input?.thirteenthProvisionRate,
      DEFAULT_LABOR_CHARGES_CONFIG.thirteenthProvisionRate
    ),
    valeTransportePerEmployee: coerceNumber(
      input?.valeTransportePerEmployee,
      DEFAULT_LABOR_CHARGES_CONFIG.valeTransportePerEmployee
    ),
    valeAlimentacaoPerEmployee: coerceNumber(
      input?.valeAlimentacaoPerEmployee,
      DEFAULT_LABOR_CHARGES_CONFIG.valeAlimentacaoPerEmployee
    ),
    otherBenefitsPerEmployee: coerceNumber(
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

  return sanitizeLaborChargesConfig({
    employerInssRate: raw.employerInssRate,
    fgtsRate: raw.fgtsRate,
    ratRate: raw.ratRate,
    thirdPartyRate: raw.thirdPartyRate,
    vacationProvisionRate: raw.vacationProvisionRate,
    thirteenthProvisionRate: raw.thirteenthProvisionRate,
    valeTransportePerEmployee: raw.valeTransportePerEmployee,
    valeAlimentacaoPerEmployee: raw.valeAlimentacaoPerEmployee,
    otherBenefitsPerEmployee: raw.otherBenefitsPerEmployee,
  });
}

export function extractLaborCostBreakdownMetadata(
  raw: unknown
): LaborResult | null {
  if (!isRecord(raw)) {
    return null;
  }

  const config = extractLaborChargesConfigMetadata(raw.config);

  const salaryBaseTotal = coerceNumber(raw.salaryBaseTotal);
  const quantity = coerceNumber(raw.quantity);
  const employerInss = coerceNumber(raw.employerInss);
  const fgts = coerceNumber(raw.fgts);
  const rat = coerceNumber(raw.rat);
  const thirdPartyCharges = coerceNumber(raw.thirdPartyCharges);
  const feriasProvision = coerceNumber(raw.feriasProvision);
  const thirteenthProvision = coerceNumber(raw.thirteenthProvision);
  const valeTransporte = coerceNumber(raw.valeTransporte);
  const valeAlimentacao = coerceNumber(raw.valeAlimentacao);
  const otherBenefits = coerceNumber(raw.otherBenefits);
  const totalEncargos = coerceNumber(raw.totalEncargos);
  const totalBenefits = coerceNumber(raw.totalBenefits);
  const custoTotal = coerceNumber(raw.custoTotal);

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

export function calculateLaborCost(input: LaborInput): LaborResult {
  const config = sanitizeLaborChargesConfig(input.config);

  const salaryBaseTotal = coerceNumber(input.salaryBaseTotal, 0);
  const quantity = coerceNumber(input.quantity, 0);

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
