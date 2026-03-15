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
  config?: Partial<LaborChargesConfig>;
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

function parseNumber(value: unknown, fallback = 0): number {
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

export function sanitizeLaborChargesConfig(
  config?: Partial<LaborChargesConfig>
): LaborChargesConfig {
  return {
    employerInssRate: parseNumber(
      config?.employerInssRate,
      DEFAULT_LABOR_CHARGES_CONFIG.employerInssRate
    ),
    fgtsRate: parseNumber(
      config?.fgtsRate,
      DEFAULT_LABOR_CHARGES_CONFIG.fgtsRate
    ),
    ratRate: parseNumber(
      config?.ratRate,
      DEFAULT_LABOR_CHARGES_CONFIG.ratRate
    ),
    thirdPartyRate: parseNumber(
      config?.thirdPartyRate,
      DEFAULT_LABOR_CHARGES_CONFIG.thirdPartyRate
    ),
    vacationProvisionRate: parseNumber(
      config?.vacationProvisionRate,
      DEFAULT_LABOR_CHARGES_CONFIG.vacationProvisionRate
    ),
    thirteenthProvisionRate: parseNumber(
      config?.thirteenthProvisionRate,
      DEFAULT_LABOR_CHARGES_CONFIG.thirteenthProvisionRate
    ),
    valeTransportePerEmployee: parseNumber(
      config?.valeTransportePerEmployee,
      DEFAULT_LABOR_CHARGES_CONFIG.valeTransportePerEmployee
    ),
    valeAlimentacaoPerEmployee: parseNumber(
      config?.valeAlimentacaoPerEmployee,
      DEFAULT_LABOR_CHARGES_CONFIG.valeAlimentacaoPerEmployee
    ),
    otherBenefitsPerEmployee: parseNumber(
      config?.otherBenefitsPerEmployee,
      DEFAULT_LABOR_CHARGES_CONFIG.otherBenefitsPerEmployee
    ),
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
  const feriasProvision = salaryBaseTotal * (config.vacationProvisionRate / 100);
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

  const totalBenefits = valeTransporte + valeAlimentacao + otherBenefits;

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
