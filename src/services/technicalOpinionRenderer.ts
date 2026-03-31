// src/services/technicalOpinionRenderer.ts

export type RendererSectionKey =
  | "cabecalho"
  | "ementa"
  | "resultadoAnalise"
  | "indicadoresTecnicos"
  | "fundamentacaoTecnica"
  | "fundamentacaoTecnicoJuridica"
  | "versaoGestor"
  | "conclusao"
  | "recomendacaoFinal"
  | "diligenciasSugeridas";

export type RendererTone = "neutral" | "positive" | "warning" | "critical";

export type TechnicalOpinionRenderedSection = {
  key: RendererSectionKey;
  title: string;
  content: string;
  paragraphs: string[];
  bullets?: string[];
};

export type TechnicalOpinionRenderedHeader = {
  tituloDocumento: string;
  subtituloDocumento: string;
  orgao: string;
  unidade: string;
  contrato: string;
  dataReferencia: string;
  planilhaAnalisada: string;
  cenario: string;
};

export type TechnicalOpinionRenderedResult = {
  executabilityLabel: string;
  riskLabel: string;
  recommendationLabel: string;
  scoreLabel: string;
};

export type TechnicalOpinionRenderedIndicator = {
  label: string;
  value: string;
  tone?: RendererTone;
};

export type TechnicalOpinionRenderedMeta = {
  generatedAtIso: string;
  executabilityLabel: string;
  riskLabel: string;
  recommendationLabel: string;
  hasDiligences: boolean;
  diligenceCount: number;
};

export type TechnicalOpinionRenderedOutput = {
  title: string;
  subtitle: string;
  summaryLine: string;
  header: TechnicalOpinionRenderedHeader;
  result: TechnicalOpinionRenderedResult;
  indicators: TechnicalOpinionRenderedIndicator[];
  meta: TechnicalOpinionRenderedMeta;
  sections: Record<RendererSectionKey, TechnicalOpinionRenderedSection>;
  orderedSections: TechnicalOpinionRenderedSection[];
  plainText: string;
};

type AnyRecord = Record<string, unknown>;
export type RenderTechnicalOpinionInput = AnyRecord;

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function sentence(input: string): string {
  const clean = normalizeWhitespace(input);
  if (!clean) return "";
  return /[.!?;:]$/.test(clean) ? clean : `${clean}.`;
}

function paragraph(input: string): string {
  return sentence(input).replace(/\s+\./g, ".");
}

function joinParagraphs(paragraphs: string[]): string {
  return paragraphs
    .map((item) => paragraph(item))
    .filter(Boolean)
    .join("\n\n");
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (isNonEmptyString(value)) return normalizeWhitespace(value);
  }
  return undefined;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatCurrencyBRL(value: unknown): string | null {
  const n = coerceNumber(value);
  if (n === null) return null;

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `R$ ${n.toFixed(2)}`;
  }
}

function formatDatePtBr(value: unknown): string {
  if (!isNonEmptyString(value)) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("pt-BR");
}

function toTitleCasePtBr(input: string): string {
  const cleaned = normalizeWhitespace(input)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .toLowerCase();

  return cleaned.replace(/\b\p{L}/gu, (match) => match.toUpperCase());
}

function mapExecutabilityLabel(value: string | undefined): string {
  const normalized = (value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "exequivel":
      return "Exequível";
    case "exequivel_com_ressalvas":
      return "Exequível com ressalvas";
    case "exequivel_com_diligencia":
      return "Exequível com diligência";
    case "inexequivel":
      return "Inexequível";
    case "inconclusivo":
      return "Inconclusivo";
    default:
      return value ? toTitleCasePtBr(value) : "Não classificado";
  }
}

function mapRiskLabel(value: string | undefined): string {
  const normalized = (value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "low":
      return "Baixo";
    case "medium":
      return "Médio";
    case "high":
      return "Alto";
    default:
      return value ? toTitleCasePtBr(value) : "Não classificado";
  }
}

function mapRecommendationLabel(value: string | undefined): string {
  const normalized = (value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "approve":
    case "approved":
      return "Aprovação";
    case "approve_with_remarks":
    case "approved_with_remarks":
      return "Aprovação com ressalvas";
    case "request_diligence":
    case "diligence_requested":
      return "Diligência";
    case "reject":
    case "rejected":
      return "Rejeição";
    case "monitor":
      return "Monitoramento";
    default:
      return value ? toTitleCasePtBr(value) : "Sem recomendação formal";
  }
}

function deepGet(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const clean = normalizeWhitespace(value);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }

  return result;
}

function extractStringList(...sources: unknown[]): string[] {
  const output: string[] = [];

  for (const source of sources) {
    if (Array.isArray(source)) {
      for (const item of source) {
        if (isNonEmptyString(item)) {
          output.push(item);
        } else if (isRecord(item)) {
          const text = firstString(
            item.text,
            item.label,
            item.title,
            item.description,
            item.reason,
            item.message
          );
          if (text) output.push(text);
        }
      }
    } else if (isNonEmptyString(source)) {
      output.push(source);
    }
  }

  return dedupeStrings(output);
}

type ExtractedOpinion = {
  title?: string;
  spreadsheetTitle?: string;
  organization?: string;
  unitName?: string;
  contractReference?: string;
  referenceDate?: string;
  modelType?: string;
  domainScenario?: string;
  status?: string;

  executability?: string;
  riskLevel?: string;
  recommendation?: string;
  scoreGlobal?: unknown;

  ementa?: string;
  summary?: string;
  technicalFoundation?: string;
  technicalLegalFoundation?: string;
  conclusion?: string;
  finalRecommendation?: string;
  managerVersion?: string;

  diligenceItems: string[];
  indicators: Array<{ label: string; value: string; tone?: RendererTone }>;

  proposedTotalValue?: unknown;
  mandatoryCostTotal?: unknown;
  evidentiaryCostTotal?: unknown;
  retentionTotal?: unknown;
  executabilityBalance?: unknown;
};

function extractIndicators(source: unknown): Array<{
  label: string;
  value: string;
  tone?: RendererTone;
}> {
  const possibleArrays = [
    deepGet(source, ["indicators"]),
    deepGet(source, ["indicadores"]),
    deepGet(source, ["summary", "indicators"]),
    deepGet(source, ["executiveSummary", "indicators"]),
  ];

  for (const candidate of possibleArrays) {
    if (!Array.isArray(candidate)) continue;

    const parsed = candidate
      .map((item) => {
        if (!isRecord(item)) return null;

        const label = firstString(item.label, item.title, item.name);
        const value = firstString(item.value, item.text, item.description);
        const tone = firstString(item.tone) as RendererTone | undefined;

        if (!label || !value) return null;

        return {
          label,
          value,
          tone:
            tone === "positive" ||
            tone === "warning" ||
            tone === "critical" ||
            tone === "neutral"
              ? tone
              : undefined,
        };
      })
      .filter(
        (
          item
        ): item is {
          label: string;
          value: string;
          tone: RendererTone | undefined;
        } => item !== null
      );

    if (parsed.length) return parsed;
  }

  return [];
}

function extractOpinion(source: RenderTechnicalOpinionInput): ExtractedOpinion {
  return {
    title: firstString(source.title, source.opinionTitle),
    spreadsheetTitle: firstString(
      deepGet(source, ["spreadsheet", "title"]),
      source.spreadsheetTitle,
      source.documentTitle
    ),
    organization: firstString(
      source.organization,
      source.organ,
      source.agency,
      deepGet(source, ["spreadsheet", "organization"]),
      deepGet(source, ["spreadsheet", "agency"])
    ),
    unitName: firstString(
      source.unitName,
      deepGet(source, ["spreadsheet", "unitName"])
    ),
    contractReference: firstString(
      source.contractReference,
      deepGet(source, ["spreadsheet", "contractReference"])
    ),
    referenceDate: firstString(
      source.referenceDate,
      deepGet(source, ["spreadsheet", "referenceDate"])
    ),
    modelType: firstString(
      source.modelType,
      deepGet(source, ["spreadsheet", "modelType"])
    ),
    domainScenario: firstString(
      source.domainScenario,
      deepGet(source, ["spreadsheet", "domainScenario"])
    ),
    status: firstString(
      source.status,
      deepGet(source, ["spreadsheet", "status"])
    ),

    executability: firstString(
      source.executability,
      source.executabilityStatus,
      deepGet(source, ["summary", "executability"]),
      deepGet(source, ["classification", "executability"])
    ),
    riskLevel: firstString(
      source.riskLevel,
      source.risk,
      deepGet(source, ["summary", "riskLevel"]),
      deepGet(source, ["classification", "riskLevel"])
    ),
    recommendation: firstString(
      source.recommendation,
      source.recommendationLabel,
      source.finalRecommendation,
      deepGet(source, ["summary", "recommendation"])
    ),
    scoreGlobal: source.scoreGlobal ?? deepGet(source, ["summary", "scoreGlobal"]),

    ementa: firstString(
      source.ementa,
      deepGet(source, ["sections", "ementa"])
    ),
    summary: firstString(
      source.summary,
      source.executiveSummary,
      deepGet(source, ["sections", "summary"])
    ),
    technicalFoundation: firstString(
      source.technicalFoundation,
      deepGet(source, ["sections", "technicalFoundation"])
    ),
    technicalLegalFoundation: firstString(
      source.technicalLegalFoundation,
      deepGet(source, ["sections", "technicalLegalFoundation"])
    ),
    conclusion: firstString(
      source.conclusion,
      source.finalConclusion,
      deepGet(source, ["sections", "conclusion"])
    ),
    finalRecommendation: firstString(
      source.finalRecommendation,
      source.recommendationText,
      deepGet(source, ["sections", "finalRecommendation"])
    ),
    managerVersion: firstString(
      source.managerVersion,
      source.versionForManager,
      deepGet(source, ["sections", "managerVersion"])
    ),

    diligenceItems: extractStringList(
      source.diligenceItems,
      source.diligenciasSugeridas,
      source.diligences,
      deepGet(source, ["sections", "diligences"])
    ),
    indicators: extractIndicators(source),

    proposedTotalValue:
      source.proposedTotalValue ??
      deepGet(source, ["financial", "proposedTotalValue"]),
    mandatoryCostTotal:
      source.mandatoryCostTotal ??
      deepGet(source, ["financial", "mandatoryCostTotal"]),
    evidentiaryCostTotal:
      source.evidentiaryCostTotal ??
      deepGet(source, ["financial", "evidentiaryCostTotal"]),
    retentionTotal:
      source.retentionTotal ?? deepGet(source, ["financial", "retentionTotal"]),
    executabilityBalance:
      source.executabilityBalance ??
      deepGet(source, ["financial", "executabilityBalance"]),
  };
}

function buildHeader(opinion: ExtractedOpinion): TechnicalOpinionRenderedHeader {
  return {
    tituloDocumento: "NOTA TÉCNICA AUTOMATIZADA",
    subtituloDocumento:
      "Sistema CustoPúblico — Análise de Exequibilidade de Planilha",
    orgao: opinion.organization || "Não informado",
    unidade: opinion.unitName || "Não informada",
    contrato: opinion.contractReference || "Não informado",
    dataReferencia: formatDatePtBr(opinion.referenceDate),
    planilhaAnalisada: opinion.spreadsheetTitle || "Planilha não identificada",
    cenario: opinion.domainScenario
      ? toTitleCasePtBr(opinion.domainScenario)
      : "Não classificado",
  };
}

function buildSummaryLine(opinion: ExtractedOpinion): string {
  const executabilityLabel = mapExecutabilityLabel(opinion.executability);
  const riskLabel = mapRiskLabel(opinion.riskLevel);
  const recommendationLabel = mapRecommendationLabel(
    opinion.finalRecommendation ?? opinion.recommendation
  );

  return paragraph(
    `Análise automatizada da planilha de custos com enquadramento preliminar de ${executabilityLabel.toLowerCase()}, risco ${riskLabel.toLowerCase()} e recomendação de ${recommendationLabel.toLowerCase()}.`
  );
}

function buildResult(opinion: ExtractedOpinion): TechnicalOpinionRenderedResult {
  const score = coerceNumber(opinion.scoreGlobal);

  return {
    executabilityLabel: mapExecutabilityLabel(opinion.executability),
    riskLabel: mapRiskLabel(opinion.riskLevel),
    recommendationLabel: mapRecommendationLabel(
      opinion.finalRecommendation ?? opinion.recommendation
    ),
    scoreLabel: score !== null ? String(score) : "Não calculado",
  };
}

function buildInstitutionalIndicators(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedIndicator[] {
  const indicators: TechnicalOpinionRenderedIndicator[] = [];

  const proposedTotal = formatCurrencyBRL(opinion.proposedTotalValue);
  const mandatoryTotal = formatCurrencyBRL(opinion.mandatoryCostTotal);
  const evidentiaryTotal = formatCurrencyBRL(opinion.evidentiaryCostTotal);
  const retentionTotal = formatCurrencyBRL(opinion.retentionTotal);
  const balance = formatCurrencyBRL(opinion.executabilityBalance);

  if (proposedTotal) {
    indicators.push({
      label: "Custo proposto",
      value: proposedTotal,
      tone: "neutral",
    });
  }

  if (mandatoryTotal) {
    indicators.push({
      label: "Custo mínimo obrigatório",
      value: mandatoryTotal,
      tone: "warning",
    });
  }

  if (balance) {
    indicators.push({
      label: "Margem de exequibilidade",
      value: balance,
      tone: "positive",
    });
  }

  if (evidentiaryTotal) {
    indicators.push({
      label: "Custos evidenciários",
      value: evidentiaryTotal,
      tone: "neutral",
    });
  }

  if (retentionTotal) {
    indicators.push({
      label: "Retenções",
      value: retentionTotal,
      tone: "neutral",
    });
  }

  if (indicators.length === 0 && opinion.indicators.length > 0) {
    return opinion.indicators;
  }

  return indicators;
}

function buildCabecalhoSection(
  header: TechnicalOpinionRenderedHeader
): TechnicalOpinionRenderedSection {
  const paragraphs = [
    `${header.tituloDocumento}.`,
    `${header.subtituloDocumento}.`,
    `Órgão: ${header.orgao}.`,
    `Unidade: ${header.unidade}.`,
    `Contrato: ${header.contrato}.`,
    `Data de referência: ${header.dataReferencia}.`,
    `Planilha analisada: ${header.planilhaAnalisada}.`,
    `Cenário: ${header.cenario}.`,
  ];

  return {
    key: "cabecalho",
    title: "Cabeçalho institucional",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

function buildEmentaSection(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs = [
    opinion.ementa ||
      `Análise automatizada da planilha de custos referente à contratação de serviços terceirizados, com foco em consistência estrutural, coerência financeira e risco preliminar de inexequibilidade.`,
  ];

  return {
    key: "ementa",
    title: "Ementa técnica",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

function buildResultadoAnaliseSection(
  result: TechnicalOpinionRenderedResult
): TechnicalOpinionRenderedSection {
  const paragraphs = [
    `A análise consolidada indica enquadramento preliminar de ${result.executabilityLabel.toLowerCase()}, com risco ${result.riskLabel.toLowerCase()} e recomendação institucional de ${result.recommendationLabel.toLowerCase()}.`,
  ];

  const bullets = [
    `Exequibilidade: ${result.executabilityLabel}.`,
    `Risco: ${result.riskLabel}.`,
    `Recomendação: ${result.recommendationLabel}.`,
    `Score global: ${result.scoreLabel}.`,
  ];

  return {
    key: "resultadoAnalise",
    title: "Resultado da análise",
    paragraphs: paragraphs.map(paragraph),
    bullets,
    content: joinParagraphs(paragraphs) + `\n\n- ${bullets.join("\n- ")}`,
  };
}

function buildIndicadoresTecnicosSection(
  indicators: TechnicalOpinionRenderedIndicator[]
): TechnicalOpinionRenderedSection {
  const paragraphs = [
    `Os indicadores abaixo consolidam os principais parâmetros quantitativos usados para apoiar a leitura da exequibilidade e a motivação técnica da análise.`,
  ];

  const bullets =
    indicators.length > 0
      ? indicators.map((item) => `${item.label}: ${sentence(item.value)}`)
      : ["Não há indicadores técnicos estruturados disponíveis no momento."];

  return {
    key: "indicadoresTecnicos",
    title: "Indicadores técnicos",
    paragraphs: paragraphs.map(paragraph),
    bullets,
    content: joinParagraphs(paragraphs) + `\n\n- ${bullets.join("\n- ")}`,
  };
}

function buildFundamentacaoTecnicaSection(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs = [
    opinion.technicalFoundation ||
      `Sob o prisma técnico, a presente nota considerou a coerência interna da composição da planilha, a suficiência aparente dos blocos remuneratórios e operacionais, a consistência dos valores informados e os sinais preliminares de equilíbrio econômico da proposta analisada.`,
  ];

  return {
    key: "fundamentacaoTecnica",
    title: "Fundamentação técnica",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

function buildFundamentacaoTecnicoJuridicaSection(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs = [
    opinion.technicalLegalFoundation ||
      `A presente leitura técnico-jurídica possui natureza instrutória e não substitui manifestação jurídica formal, servindo como apoio à motivação administrativa quanto à aceitabilidade da planilha, à necessidade de diligências saneadoras e à proteção do interesse público na contratação.`,
  ];

  return {
    key: "fundamentacaoTecnicoJuridica",
    title: "Fundamentação técnico-jurídica",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

function buildVersaoGestorSection(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs = [
    opinion.managerVersion ||
      `Em linguagem executiva, a planilha já permite formação de juízo preliminar sobre sua viabilidade, mas a continuidade segura da instrução depende da observância do nível de risco identificado e do atendimento das diligências eventualmente apontadas.`,
  ];

  return {
    key: "versaoGestor",
    title: "Versão para gestor",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

function buildConclusaoSection(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs = [
    opinion.conclusion ||
      `Diante da análise realizada, conclui-se que a planilha apresenta elementos suficientes para leitura técnica preliminar, devendo a decisão administrativa observar o enquadramento de exequibilidade, o risco identificado e a eventual necessidade de complementação documental.`,
  ];

  return {
    key: "conclusao",
    title: "Conclusão",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

function buildRecomendacaoFinalSection(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs = [
    opinion.finalRecommendation ||
      `Recomenda-se o encaminhamento administrativo compatível com o resultado da análise automatizada, preservando-se a motivação do ato, a rastreabilidade da instrução e o saneamento prévio das inconsistências, quando cabível.`,
  ];

  return {
    key: "recomendacaoFinal",
    title: "Recomendação operacional",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

function buildDiligenciasSection(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs = [
    opinion.diligenceItems.length > 0
      ? `As diligências abaixo representam providências saneadoras ou confirmatórias relevantes para robustecer a instrução do processo.`
      : `No material atualmente estruturado, não foram identificadas diligências formalmente listadas pelo motor analítico.`,
  ];

  const bullets =
    opinion.diligenceItems.length > 0
      ? opinion.diligenceItems.map((item) => sentence(item))
      : undefined;

  return {
    key: "diligenciasSugeridas",
    title: "Diligências sugeridas",
    paragraphs: paragraphs.map(paragraph),
    bullets,
    content:
      joinParagraphs(paragraphs) +
      (bullets && bullets.length > 0 ? `\n\n- ${bullets.join("\n- ")}` : ""),
  };
}

export function renderTechnicalOpinion(
  input: RenderTechnicalOpinionInput
): TechnicalOpinionRenderedOutput {
  const opinion = extractOpinion(input);
  const header = buildHeader(opinion);
  const result = buildResult(opinion);
  const indicators = buildInstitutionalIndicators(opinion);

  const cabecalho = buildCabecalhoSection(header);
  const ementa = buildEmentaSection(opinion);
  const resultadoAnalise = buildResultadoAnaliseSection(result);
  const indicadoresTecnicos = buildIndicadoresTecnicosSection(indicators);
  const fundamentacaoTecnica = buildFundamentacaoTecnicaSection(opinion);
  const fundamentacaoTecnicoJuridica =
    buildFundamentacaoTecnicoJuridicaSection(opinion);
  const versaoGestor = buildVersaoGestorSection(opinion);
  const conclusao = buildConclusaoSection(opinion);
  const recomendacaoFinal = buildRecomendacaoFinalSection(opinion);
  const diligenciasSugeridas = buildDiligenciasSection(opinion);

  const orderedSections: TechnicalOpinionRenderedSection[] = [
    cabecalho,
    ementa,
    resultadoAnalise,
    indicadoresTecnicos,
    fundamentacaoTecnica,
    fundamentacaoTecnicoJuridica,
    versaoGestor,
    conclusao,
    recomendacaoFinal,
    diligenciasSugeridas,
  ];

  const sections: Record<RendererSectionKey, TechnicalOpinionRenderedSection> = {
    cabecalho,
    ementa,
    resultadoAnalise,
    indicadoresTecnicos,
    fundamentacaoTecnica,
    fundamentacaoTecnicoJuridica,
    versaoGestor,
    conclusao,
    recomendacaoFinal,
    diligenciasSugeridas,
  };

  const title = header.tituloDocumento;
  const subtitle = header.subtituloDocumento;
  const summaryLine = buildSummaryLine(opinion);

  const plainText = [
    title,
    subtitle,
    "",
    `Órgão: ${header.orgao}`,
    `Unidade: ${header.unidade}`,
    `Contrato: ${header.contrato}`,
    `Data de referência: ${header.dataReferencia}`,
    `Planilha analisada: ${header.planilhaAnalisada}`,
    `Cenário: ${header.cenario}`,
    "",
    summaryLine,
    "",
    ...orderedSections.flatMap((section) => {
      const block: string[] = [`${section.title}`];
      if (section.content) block.push(section.content);
      return [...block, ""];
    }),
  ]
    .join("\n")
    .trim();

  return {
    title,
    subtitle,
    summaryLine,
    header,
    result,
    indicators,
    meta: {
      generatedAtIso: new Date().toISOString(),
      executabilityLabel: result.executabilityLabel,
      riskLabel: result.riskLabel,
      recommendationLabel: result.recommendationLabel,
      hasDiligences: opinion.diligenceItems.length > 0,
      diligenceCount: opinion.diligenceItems.length,
    },
    sections,
    orderedSections,
    plainText,
  };
}

export function renderTechnicalOpinionAsPlainText(
  input: RenderTechnicalOpinionInput
): string {
  return renderTechnicalOpinion(input).plainText;
}
