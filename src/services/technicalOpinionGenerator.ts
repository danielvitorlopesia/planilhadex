export type TechnicalOpinionRiskLevel = "low" | "medium" | "high";
export type TechnicalOpinionExecutability =
  | "exequivel"
  | "exequivel_com_ressalvas"
  | "exequivel_com_diligencia"
  | "inexequivel"
  | "inconclusivo";

export type TechnicalOpinionIndicator = {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "warning" | "critical";
};

export type TechnicalOpinionInput = {
  spreadsheet?: {
    id?: string;
    title?: string;
    description?: string;
    modelType?: string;
    category?: string;
    status?: string;
    domainScenario?: string;
    notes?: string;
    rows?: Array<{
      item?: string;
      categoria?: string;
      quantidade?: number | string;
      valorUnitario?: number | string;
      subtotal?: number | string;
      status?: string;
    }>;
    trainingProfile?: {
      domainScenarioLabel?: string;
      expectedDocuments?: string[];
      expectedCostDrivers?: string[];
      validationFocus?: string[];
      readingHints?: string[];
    };
    metadata?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
  comparison?: {
    summary?: {
      previousItemCount?: number;
      currentItemCount?: number;
      previousTotal?: number;
      currentTotal?: number;
      totalDelta?: number;
      addedCount?: number;
      removedCount?: number;
      changedCount?: number;
      unchangedCount?: number;
      deltaByCategory?: Record<string, number>;
      deltaByRecurrence?: Record<string, number>;
    };
    rows?: Array<{
      key?: string;
      item?: string;
      category?: string;
      recurrenceType?: string;
      changeType?: "added" | "removed" | "changed" | "unchanged";
      previousSubtotal?: number;
      currentSubtotal?: number;
      subtotalDelta?: number;
      fieldDeltas?: Array<{
        field: string;
        previousValue: string | number;
        currentValue: string | number;
      }>;
    }>;
  } | null;
  executability?: {
    mandatoryCostTotal?: number;
    evidentiaryCostTotal?: number;
    effectiveMonthlyReference?: number;
    executabilityBalance?: number;
    riskLabel?: string;
    riskColor?: string;
  } | null;
  validation?: {
    score?: number;
    riskLevel?: TechnicalOpinionRiskLevel | string;
    executabilityStatus?: TechnicalOpinionExecutability | string;
    findings?: Array<{
      severity?: "info" | "warning" | "error" | "critical" | string;
      group?: string;
      title?: string;
      description?: string;
      recommendation?: string;
    }>;
    diligences?: string[];
    recommendations?: string[];
    summary?: string;
  } | null;
};

export type TechnicalOpinionOutput = {
  title: string;
  ementa: string;
  resumoExecutivo: string;
  fundamentacaoTecnica: string;
  fundamentacaoTecnicoJuridica: string;
  conclusao: string;
  recomendacaoFinal: string;
  diligenciasSugeridas: string[];
  versaoGestor: string;
  riskLevel: TechnicalOpinionRiskLevel;
  executabilityStatus: TechnicalOpinionExecutability;
  indicadores: TechnicalOpinionIndicator[];
  highlights: string[];
  comparisonHighlights: string[];
};

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function safeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function toSentenceCase(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function uniqueStrings(values: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    const normalized = safeString(value);
    if (!normalized) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }

  return out;
}

function inferRiskLevel(input: TechnicalOpinionInput): TechnicalOpinionRiskLevel {
  const explicit = safeString(input.validation?.riskLevel);
  if (explicit === "high" || explicit === "medium" || explicit === "low") {
    return explicit;
  }

  const score = safeNumber(input.validation?.score);
  if (score > 0) {
    if (score >= 75) return "high";
    if (score >= 45) return "medium";
    return "low";
  }

  const balance = safeNumber(input.executability?.executabilityBalance);
  const reference = safeNumber(input.executability?.effectiveMonthlyReference);
  if (reference > 0) {
    const ratio = balance / reference;
    if (ratio < 0) return "high";
    if (ratio < 0.1) return "medium";
    return "low";
  }

  const riskLabel = safeString(input.executability?.riskLabel).toLowerCase();
  if (riskLabel.includes("alto")) return "high";
  if (riskLabel.includes("moderad")) return "medium";
  if (riskLabel.includes("baixo")) return "low";

  return "medium";
}

function inferExecutabilityStatus(
  input: TechnicalOpinionInput,
  riskLevel: TechnicalOpinionRiskLevel
): TechnicalOpinionExecutability {
  const explicit = safeString(input.validation?.executabilityStatus);
  if (
    explicit === "exequivel" ||
    explicit === "exequivel_com_ressalvas" ||
    explicit === "exequivel_com_diligencia" ||
    explicit === "inexequivel" ||
    explicit === "inconclusivo"
  ) {
    return explicit;
  }

  const balance = safeNumber(input.executability?.executabilityBalance);
  const mandatory = safeNumber(input.executability?.mandatoryCostTotal);
  const reference = safeNumber(input.executability?.effectiveMonthlyReference);

  if (reference <= 0 && mandatory <= 0) {
    return "inconclusivo";
  }

  if (balance < 0) {
    return "inexequivel";
  }

  if (riskLevel === "high") {
    return "exequivel_com_diligencia";
  }

  if (riskLevel === "medium") {
    return "exequivel_com_ressalvas";
  }

  return "exequivel";
}

function summarizeTopCategoryDeltas(
  deltas: Record<string, number> | undefined,
  limit = 3
): string[] {
  if (!deltas) return [];
  return Object.entries(deltas)
    .filter(([, value]) => value !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, limit)
    .map(([key, value]) => {
      const direction = value >= 0 ? "acréscimo" : "redução";
      return `${key}: ${direction} de ${formatCurrency(Math.abs(value))}`;
    });
}

function summarizeComparisonHighlights(input: TechnicalOpinionInput): string[] {
  const summary = input.comparison?.summary;
  const rows = input.comparison?.rows ?? [];
  const highlights: string[] = [];

  if (summary) {
    const totalDelta = safeNumber(summary.totalDelta);
    if (totalDelta !== 0) {
      const direction = totalDelta >= 0 ? "aumento" : "redução";
      highlights.push(
        `Houve ${direction} global de ${formatCurrency(Math.abs(totalDelta))} entre as versões comparadas.`
      );
    }

    if (safeNumber(summary.addedCount) > 0) {
      highlights.push(`Foram incluídos ${safeNumber(summary.addedCount)} item(ns) na versão mais recente.`);
    }
    if (safeNumber(summary.removedCount) > 0) {
      highlights.push(`Foram removidos ${safeNumber(summary.removedCount)} item(ns) em relação à base anterior.`);
    }
    if (safeNumber(summary.changedCount) > 0) {
      highlights.push(`Foram identificados ${safeNumber(summary.changedCount)} item(ns) alterados com impacto material.`);
    }

    highlights.push(...summarizeTopCategoryDeltas(summary.deltaByCategory));
  }

  const mostRelevantRows = rows
    .filter((row) => row.changeType && row.changeType !== "unchanged")
    .sort((a, b) => Math.abs(safeNumber(b.subtotalDelta)) - Math.abs(safeNumber(a.subtotalDelta)))
    .slice(0, 3);

  for (const row of mostRelevantRows) {
    const item = safeString(row.item) || "Item sem identificação";
    const delta = safeNumber(row.subtotalDelta);
    const direction = delta >= 0 ? "acréscimo" : "redução";
    highlights.push(`${item}: ${direction} de ${formatCurrency(Math.abs(delta))}.`);
  }

  return uniqueStrings(highlights);
}

function buildHighlights(input: TechnicalOpinionInput): string[] {
  const spreadsheet = input.spreadsheet;
  const profile = spreadsheet?.trainingProfile;

  return uniqueStrings([
    profile?.domainScenarioLabel,
    ...(profile?.expectedCostDrivers ?? []),
    ...(profile?.validationFocus ?? []),
    ...(profile?.readingHints ?? []),
  ]);
}

function buildIndicators(
  input: TechnicalOpinionInput,
  riskLevel: TechnicalOpinionRiskLevel,
  executabilityStatus: TechnicalOpinionExecutability
): TechnicalOpinionIndicator[] {
  const mandatory = safeNumber(input.executability?.mandatoryCostTotal);
  const evidentiary = safeNumber(input.executability?.evidentiaryCostTotal);
  const reference = safeNumber(input.executability?.effectiveMonthlyReference);
  const balance = safeNumber(input.executability?.executabilityBalance);
  const delta = safeNumber(input.comparison?.summary?.totalDelta);
  const score = safeNumber(input.validation?.score);

  const indicators: TechnicalOpinionIndicator[] = [
    {
      label: "Risco técnico",
      value:
        riskLevel === "high"
          ? "Alto"
          : riskLevel === "medium"
          ? "Médio"
          : "Baixo",
      tone:
        riskLevel === "high"
          ? "critical"
          : riskLevel === "medium"
          ? "warning"
          : "positive",
    },
    {
      label: "Exequibilidade",
      value: executabilityStatus.replace(/_/g, " "),
      tone:
        executabilityStatus === "inexequivel"
          ? "critical"
          : executabilityStatus === "exequivel_com_diligencia" ||
            executabilityStatus === "exequivel_com_ressalvas"
          ? "warning"
          : "positive",
    },
  ];

  if (reference > 0) {
    indicators.push({
      label: "Referência mensal",
      value: formatCurrency(reference),
      tone: "neutral",
    });
  }

  if (mandatory > 0) {
    indicators.push({
      label: "Custo obrigatório",
      value: formatCurrency(mandatory),
      tone: "neutral",
    });
  }

  if (evidentiary > 0) {
    indicators.push({
      label: "Custo evidenciável",
      value: formatCurrency(evidentiary),
      tone: "neutral",
    });
  }

  indicators.push({
    label: "Saldo preliminar",
    value: formatCurrency(balance),
    tone: balance < 0 ? "critical" : balance < reference * 0.1 ? "warning" : "positive",
  });

  if (delta !== 0) {
    indicators.push({
      label: "Impacto entre versões",
      value: `${delta >= 0 ? "+" : "-"}${formatCurrency(Math.abs(delta))}`,
      tone: delta > 0 ? "warning" : "positive",
    });
  }

  if (score > 0) {
    indicators.push({
      label: "Score de validação",
      value: formatPercent(score),
      tone: score >= 75 ? "critical" : score >= 45 ? "warning" : "positive",
    });
  }

  return indicators;
}

function buildDiligences(input: TechnicalOpinionInput, riskLevel: TechnicalOpinionRiskLevel): string[] {
  const explicit = uniqueStrings([
    ...(input.validation?.diligences ?? []),
    ...(input.validation?.recommendations ?? []),
    ...(input.validation?.findings ?? []).map((f) => f.recommendation),
  ]);

  if (explicit.length > 0) {
    return explicit;
  }

  const diligences: string[] = [];

  const balance = safeNumber(input.executability?.executabilityBalance);
  if (balance < 0) {
    diligences.push(
      "Revisar imediatamente a composição mínima obrigatória e reprocessar a planilha para verificar a suficiência econômica da contratação."
    );
  }

  if (riskLevel !== "low") {
    diligences.push(
      "Conferir rubricas obrigatórias, bases de incidência e aderência entre itens laborais, encargos, benefícios e componentes materiais."
    );
  }

  if (safeNumber(input.comparison?.summary?.changedCount) > 0) {
    diligences.push(
      "Validar documentalmente os itens alterados entre versões e registrar motivação técnica para os principais impactos financeiros."
    );
  }

  if (safeNumber(input.comparison?.summary?.addedCount) > 0) {
    diligences.push(
      "Confirmar a necessidade operacional e a base de cálculo dos itens incluídos na versão mais recente."
    );
  }

  if (safeNumber(input.comparison?.summary?.removedCount) > 0) {
    diligences.push(
      "Verificar se a retirada de itens não suprimiu custos mínimos relevantes ou rubricas obrigatórias da contratação."
    );
  }

  if (diligences.length === 0) {
    diligences.push(
      "Registrar conferência técnica final e manter a rastreabilidade entre parâmetros, memória de cálculo e versão analisada."
    );
  }

  return uniqueStrings(diligences);
}

function buildRecommendation(
  executabilityStatus: TechnicalOpinionExecutability,
  riskLevel: TechnicalOpinionRiskLevel,
  diligences: string[]
): string {
  if (executabilityStatus === "inexequivel") {
    return "Recomenda-se não aprovar a versão analisada sem saneamento prévio, reprocessamento do cálculo e justificativa técnica expressa das rubricas críticas.";
  }

  if (executabilityStatus === "exequivel_com_diligencia" || riskLevel === "high") {
    return `Recomenda-se aprovação condicionada a diligência prévia, especialmente quanto aos seguintes pontos: ${diligences
      .slice(0, 2)
      .join(" ")}`;
  }

  if (executabilityStatus === "exequivel_com_ressalvas" || riskLevel === "medium") {
    return "Recomenda-se prosseguimento com ressalvas, mediante registro formal das premissas adotadas e conferência final dos itens de maior impacto.";
  }

  if (executabilityStatus === "inconclusivo") {
    return "Recomenda-se complementação de dados e nova rodada de validação antes de qualquer manifestação conclusiva.";
  }

  return "Recomenda-se prosseguimento da análise com aprovação técnica, preservando a trilha de cálculo, a memória explicativa e a documentação de suporte.";
}

function buildConclusion(
  executabilityStatus: TechnicalOpinionExecutability,
  riskLevel: TechnicalOpinionRiskLevel
): string {
  switch (executabilityStatus) {
    case "inexequivel":
      return "Conclui-se, em juízo preliminar técnico, que a versão analisada apresenta comprometimento relevante de exequibilidade e não reúne, no estado atual, robustez suficiente para aprovação sem saneamento.";
    case "exequivel_com_diligencia":
      return "Conclui-se que a versão analisada pode prosseguir apenas mediante diligência técnica prévia, em razão de achados relevantes que impactam a segurança da composição.";
    case "exequivel_com_ressalvas":
      return "Conclui-se pela viabilidade técnica com ressalvas, exigindo-se registro claro das premissas adotadas e reforço da conferência documental.";
    case "inconclusivo":
      return "Conclui-se pela insuficiência de elementos para manifestação final conclusiva, sendo necessária complementação técnica.";
    case "exequivel":
    default:
      return riskLevel === "low"
        ? "Conclui-se pela adequação técnica preliminar da versão analisada, sem indícios materiais relevantes que inviabilizem o prosseguimento."
        : "Conclui-se pela adequação técnica preliminar, sem prejuízo de conferências complementares proporcionais ao risco identificado.";
  }
}

function buildTechnicalFoundation(
  input: TechnicalOpinionInput,
  comparisonHighlights: string[],
  highlights: string[]
): string {
  const parts: string[] = [];

  const mandatory = safeNumber(input.executability?.mandatoryCostTotal);
  const evidentiary = safeNumber(input.executability?.evidentiaryCostTotal);
  const reference = safeNumber(input.executability?.effectiveMonthlyReference);
  const balance = safeNumber(input.executability?.executabilityBalance);

  if (reference > 0) {
    parts.push(
      `A leitura consolidada da planilha foi estruturada a partir de referência mensal de ${formatCurrency(
        reference
      )}, confrontada com custo obrigatório estimado de ${formatCurrency(
        mandatory
      )} e custo evidenciável de ${formatCurrency(evidentiary)}.`
    );
  }

  parts.push(
    `O saldo preliminar apurado foi de ${formatCurrency(
      balance
    )}, servindo como parâmetro inicial para o juízo de exequibilidade.`
  );

  if (comparisonHighlights.length > 0) {
    parts.push(`Na comparação entre versões, destacaram-se os seguintes vetores materiais: ${comparisonHighlights.join(" ")}`);
  }

  if (highlights.length > 0) {
    parts.push(`O contexto interpretativo considerado na leitura incluiu: ${highlights.join("; ")}.`);
  }

  return parts.join(" ");
}

function buildTechnicalLegalFoundation(
  executabilityStatus: TechnicalOpinionExecutability
): string {
  const base =
    "Sob enfoque técnico-jurídico, a manifestação deve preservar coerência entre estrutura da planilha, memória de cálculo, rastreabilidade entre versões, justificativa das alterações relevantes e aderência ao fluxo institucional de validação, recomendação e decisão.";

  if (executabilityStatus === "inexequivel") {
    return `${base} Diante de indícios de insuficiência material da composição, a recomendação técnica não pode se dissociar da necessidade de saneamento prévio, sob pena de fragilizar a motivação administrativa.`;
  }

  if (executabilityStatus === "exequivel_com_diligencia") {
    return `${base} Havendo achados relevantes, o prosseguimento exige diligência formalmente registrada e motivação clara sobre a suficiência dos ajustes ou justificativas apresentadas.`;
  }

  if (executabilityStatus === "exequivel_com_ressalvas") {
    return `${base} Ainda que não haja inviabilidade imediata, o prosseguimento demanda ressalvas expressas e reforço da documentação de suporte para preservar a robustez da motivação.`;
  }

  return `${base} No estado atual dos elementos analisados, a continuidade é compatível com manifestação técnica favorável, desde que mantidas integridade documental e trilha de explicabilidade.`;
}

function buildExecutiveSummary(
  input: TechnicalOpinionInput,
  executabilityStatus: TechnicalOpinionExecutability,
  riskLevel: TechnicalOpinionRiskLevel
): string {
  const title = safeString(input.spreadsheet?.title) || "planilha analisada";
  const delta = safeNumber(input.comparison?.summary?.totalDelta);
  const changedCount = safeNumber(input.comparison?.summary?.changedCount);

  const riskText =
    riskLevel === "high" ? "alto" : riskLevel === "medium" ? "médio" : "baixo";

  const parts = [
    `A análise preliminar da ${title} indica status ${executabilityStatus.replace(/_/g, " ")} e nível de risco ${riskText}.`,
  ];

  if (delta !== 0) {
    parts.push(
      `A comparação entre versões apontou ${
        delta >= 0 ? "aumento" : "redução"
      } global de ${formatCurrency(Math.abs(delta))}.`
    );
  }

  if (changedCount > 0) {
    parts.push(`Foram observados ${changedCount} item(ns) materialmente alterados entre as versões comparadas.`);
  }

  return parts.join(" ");
}

function buildManagerVersion(
  outputCore: {
    title: string;
    executabilityStatus: TechnicalOpinionExecutability;
    riskLevel: TechnicalOpinionRiskLevel;
    recommendation: string;
    conclusion: string;
    delta: number;
  }
): string {
  const riskText =
    outputCore.riskLevel === "high"
      ? "alto"
      : outputCore.riskLevel === "medium"
      ? "médio"
      : "baixo";

  const deltaText =
    outputCore.delta !== 0
      ? `Houve ${outputCore.delta >= 0 ? "aumento" : "redução"} de ${formatCurrency(
          Math.abs(outputCore.delta)
        )} entre as versões comparadas. `
      : "";

  return `Resumo gerencial da ${outputCore.title}: o sistema classificou a versão como ${outputCore.executabilityStatus.replace(
    /_/g,
    " "
  )}, com risco ${riskText}. ${deltaText}${outputCore.conclusion} ${outputCore.recommendation}`;
}

function buildEmenta(
  title: string,
  executabilityStatus: TechnicalOpinionExecutability,
  riskLevel: TechnicalOpinionRiskLevel
): string {
  const riskText =
    riskLevel === "high" ? "alto" : riskLevel === "medium" ? "médio" : "baixo";

  return `${title}. Análise técnica automatizada da planilha de custos. Leitura consolidada de composição, comparação entre versões, exequibilidade preliminar e recomendação final. Resultado: ${executabilityStatus.replace(
    /_/g,
    " "
  )}. Risco técnico ${riskText}.`;
}

export function generateTechnicalOpinion(
  input: TechnicalOpinionInput
): TechnicalOpinionOutput {
  const title = safeString(input.spreadsheet?.title) || "Planilha de custos";
  const riskLevel = inferRiskLevel(input);
  const executabilityStatus = inferExecutabilityStatus(input, riskLevel);
  const comparisonHighlights = summarizeComparisonHighlights(input);
  const highlights = buildHighlights(input);
  const diligenciasSugeridas = buildDiligences(input, riskLevel);
  const recomendacaoFinal = buildRecommendation(
    executabilityStatus,
    riskLevel,
    diligenciasSugeridas
  );
  const conclusao = buildConclusion(executabilityStatus, riskLevel);
  const fundamentacaoTecnica = buildTechnicalFoundation(
    input,
    comparisonHighlights,
    highlights
  );
  const fundamentacaoTecnicoJuridica =
    buildTechnicalLegalFoundation(executabilityStatus);
  const resumoExecutivo = buildExecutiveSummary(
    input,
    executabilityStatus,
    riskLevel
  );
  const delta = safeNumber(input.comparison?.summary?.totalDelta);
  const versaoGestor = buildManagerVersion({
    title,
    executabilityStatus,
    riskLevel,
    recommendation: recomendacaoFinal,
    conclusion: conclusao,
    delta,
  });

  return {
    title,
    ementa: buildEmenta(title, executabilityStatus, riskLevel),
    resumoExecutivo,
    fundamentacaoTecnica,
    fundamentacaoTecnicoJuridica,
    conclusao,
    recomendacaoFinal,
    diligenciasSugeridas,
    versaoGestor,
    riskLevel,
    executabilityStatus,
    indicadores: buildIndicators(input, riskLevel, executabilityStatus),
    highlights,
    comparisonHighlights,
  };
}

export default generateTechnicalOpinion;
