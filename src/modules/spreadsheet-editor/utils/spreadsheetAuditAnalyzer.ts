export type AuditSeverity = "low" | "medium" | "high";

export type AuditCategory =
  | "math"
  | "classification"
  | "labor"
  | "documentation"
  | "duplication"
  | "executability";

export type AuditFinding = {
  id: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  category: AuditCategory;
  relatedRowId?: string;
  relatedItem?: string;
  recommendation?: string;
};

export type AuditSummary = {
  analyzedItems: number;
  findingsCount: number;
  highRiskCount: number;
  undocumentedRows: number;
  duplicatedEconomicEntries: number;
  consistencyScore: number;
};

export type SpreadsheetAuditPanelData = {
  summary: AuditSummary;
  findings: AuditFinding[];
};

export type SpreadsheetAuditRow = {
  id?: string | number;
  item?: string;
  categoria?: string;
  quantidade?: number | string;
  valorUnitario?: number | string;
  subtotal?: number | string;
  memoriaCalculo?: string;
  origem?: string;
  automatico?: boolean;
  trainingTags?: string[];
};

export type SpreadsheetAuditLaborBreakdown = {
  headcount?: number;
  salaryBaseTotal?: number;
  mandatoryBenefitsTotal?: number;
  additionalTotal?: number;
  monthlyLaborTotal?: number;
  mealAllowanceTotal?: number;
  transportAllowanceTotal?: number;
  employerInss?: number;
  fgts?: number;
  rat?: number;
  thirdPartyCharges?: number;
  feriasProvision?: number;
  thirteenthProvision?: number;
  valeTransporte?: number;
  valeAlimentacao?: number;
  otherBenefits?: number;
  total?: number;
  quantity?: number;
};

export type SpreadsheetAuditLaborChargesConfig = {
  employerInssRate?: number;
  fgtsRate?: number;
  ratRate?: number;
  thirdPartyRate?: number;
  vacationProvisionRate?: number;
  thirteenthProvisionRate?: number;
  valeTransportePerEmployee?: number;
  valeAlimentacaoPerEmployee?: number;
  otherBenefitsPerEmployee?: number;
};

export type SpreadsheetAuditAnalyzerInput = {
  rows: SpreadsheetAuditRow[];
  monthlyBaseValue?: number;
  laborCostBreakdown?: SpreadsheetAuditLaborBreakdown | null;
  laborChargesConfig?: SpreadsheetAuditLaborChargesConfig | null;
};

function safeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function includesAny(source: string, terms: string[]) {
  const normalized = source.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function isBenefitRow(row: SpreadsheetAuditRow) {
  const categoria = safeString(row.categoria);
  const item = safeString(row.item);
  return (
    includesAny(categoria, ["benefícios", "beneficios"]) ||
    includesAny(item, ["vale", "alimentação", "alimentacao", "transporte", "benefício", "beneficio"])
  );
}

function isChargeRow(row: SpreadsheetAuditRow) {
  const categoria = safeString(row.categoria);
  const item = safeString(row.item);
  return (
    includesAny(categoria, ["encargos", "provisões", "provisoes", "reflexos"]) ||
    includesAny(item, ["inss", "fgts", "rat", "gilrat", "terceiros", "férias", "ferias", "13º"])
  );
}

function isLaborRow(row: SpreadsheetAuditRow) {
  const categoria = safeString(row.categoria);
  const item = safeString(row.item);
  return (
    includesAny(categoria, ["mão de obra", "mao de obra", "equipe operacional", "remuneração"]) ||
    includesAny(item, ["posto", "salário", "salario", "vigia", "porteiro", "recepcionista", "auxiliar"])
  );
}

function isGeneratedRow(row: SpreadsheetAuditRow) {
  if (row.automatico === true) return true;
  const tags = Array.isArray(row.trainingTags) ? row.trainingTags : [];
  return tags.includes("generated_labor_charge") || tags.includes("generated_labor_benefit");
}

export function analyzeSpreadsheetAudit(
  input: SpreadsheetAuditAnalyzerInput
): SpreadsheetAuditPanelData {
  const findings: AuditFinding[] = [];
  const rows = input.rows || [];

  let undocumentedRows = 0;
  let duplicatedEconomicEntries = 0;

  rows.forEach((row, index) => {
    const quantidade = safeNumber(row.quantidade);
    const valorUnitario = safeNumber(row.valorUnitario);
    const subtotal = safeNumber(row.subtotal);
    const expectedSubtotal = Number((quantidade * valorUnitario).toFixed(2));
    const item = safeString(row.item) || `Linha ${index + 1}`;
    const rowId = row.id ? String(row.id) : undefined;

    if (quantidade > 0 && valorUnitario > 0 && Math.abs(subtotal - expectedSubtotal) > 0.01) {
      findings.push({
        id: `math-subtotal-${index}`,
        title: "Subtotal divergente",
        description: `O item "${item}" possui subtotal divergente de quantidade × valor unitário.`,
        severity: "high",
        category: "math",
        relatedRowId: rowId,
        relatedItem: item,
        recommendation: "Recalcular o subtotal e revisar a memória de cálculo.",
      });
    }

    if ((quantidade > 0 || valorUnitario > 0 || subtotal > 0) && !safeString(row.memoriaCalculo).trim()) {
      undocumentedRows += 1;
      findings.push({
        id: `doc-memory-${index}`,
        title: "Linha sem memória de cálculo",
        description: `O item "${item}" não possui memória de cálculo preenchida.`,
        severity: "medium",
        category: "documentation",
        relatedRowId: rowId,
        relatedItem: item,
        recommendation: "Preencher a memória de cálculo com a lógica de formação do valor.",
      });
    }

    if (isLaborRow(row) && isBenefitRow(row)) {
      findings.push({
        id: `class-mixed-${index}`,
        title: "Classificação ambígua",
        description: `O item "${item}" apresenta sinais de mão de obra e benefício ao mesmo tempo.`,
        severity: "medium",
        category: "classification",
        relatedRowId: rowId,
        relatedItem: item,
        recommendation: "Revisar a categoria e separar o item em linhas adequadas, se necessário.",
      });
    }
  });

  const laborRows = rows.filter(isLaborRow);
  const benefitRows = rows.filter(isBenefitRow);
  const chargeRows = rows.filter(isChargeRow);

  const laborSubtotal = laborRows.reduce((sum, row) => sum + safeNumber(row.subtotal), 0);
  const benefitsSubtotal = benefitRows.reduce((sum, row) => sum + safeNumber(row.subtotal), 0);
  const chargesSubtotal = chargeRows.reduce((sum, row) => sum + safeNumber(row.subtotal), 0);

  const effectiveHeadcount =
    input.laborCostBreakdown?.headcount ??
    input.laborCostBreakdown?.quantity ??
    laborRows.reduce((sum, row) => sum + safeNumber(row.quantidade), 0);

  if (effectiveHeadcount > 0 && benefitRows.length === 0) {
    findings.push({
      id: "labor-no-benefits",
      title: "Postos sem benefícios associados",
      description: "Há postos ativos, mas não foram identificadas linhas de benefícios correspondentes.",
      severity: "high",
      category: "labor",
      recommendation: "Validar vale-transporte, vale-alimentação e outros benefícios obrigatórios.",
    });
  }

  if (effectiveHeadcount > 0 && chargeRows.length === 0) {
    findings.push({
      id: "labor-no-charges",
      title: "Postos sem encargos associados",
      description: "Há postos ativos, mas não foram identificadas linhas de encargos ou provisões.",
      severity: "high",
      category: "labor",
      recommendation: "Validar INSS patronal, FGTS, RAT, terceiros e provisões.",
    });
  }

  const generatedRows = rows.filter(isGeneratedRow);
  const manualRows = rows.filter((row) => !isGeneratedRow(row));

  const generatedNames = new Set(
    generatedRows.map((row) => safeString(row.item).toLowerCase()).filter(Boolean)
  );

  manualRows.forEach((row, index) => {
    const item = safeString(row.item).toLowerCase();
    if (item && generatedNames.has(item)) {
      duplicatedEconomicEntries += 1;
      findings.push({
        id: `dup-${index}-${item}`,
        title: "Possível duplicidade econômica",
        description: `O item "${safeString(row.item)}" aparece em linha manual e também em linha automática.`,
        severity: "medium",
        category: "duplication",
        relatedItem: safeString(row.item),
        recommendation: "Verificar se há duplicidade entre lançamento manual e cálculo automático.",
      });
    }
  });

  const monthlyReference = safeNumber(input.monthlyBaseValue);
  const mandatoryEstimated = laborSubtotal + benefitsSubtotal + chargesSubtotal;

  if (monthlyReference > 0) {
    const ratio = mandatoryEstimated / monthlyReference;

    if (ratio > 1) {
      findings.push({
        id: "exec-above-reference",
        title: "Custo obrigatório acima da referência",
        description: "O custo obrigatório estimado supera o valor mensal de referência.",
        severity: "high",
        category: "executability",
        recommendation: "Revisar composição, referência contratual e premissas da planilha.",
      });
    } else if (ratio > 0.9) {
      findings.push({
        id: "exec-near-reference",
        title: "Custo obrigatório muito próximo da referência",
        description: "O custo obrigatório estimado está excessivamente próximo do valor mensal de referência.",
        severity: "medium",
        category: "executability",
        recommendation: "Validar margem de exequibilidade e risco contratual.",
      });
    }
  }

  const highRiskCount = findings.filter((item) => item.severity === "high").length;
  const analyzedItems = rows.length;
  const findingsCount = findings.length;

  let consistencyScore = 100;
  consistencyScore -= highRiskCount * 12;
  consistencyScore -= findings.filter((item) => item.severity === "medium").length * 6;
  consistencyScore -= findings.filter((item) => item.severity === "low").length * 3;
  consistencyScore = Math.max(0, Math.min(100, consistencyScore));

  return {
    summary: {
      analyzedItems,
      findingsCount,
      highRiskCount,
      undocumentedRows,
      duplicatedEconomicEntries,
      consistencyScore,
    },
    findings,
  };
}
