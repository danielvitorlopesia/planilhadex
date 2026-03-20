// src/services/technicalOpinionRenderer.ts

/**
 * CustoPublico - technicalOpinionRenderer
 *
 * Camada posterior ao technicalOpinionGenerator.
 * Responsabilidade:
 * - receber o resultado do parecer técnico automático;
 * - reorganizar o conteúdo em formato institucional estruturado;
 * - devolver blocos nomeados para UI e futura exportação PDF/DOCX.
 *
 * Observação importante:
 * Este arquivo foi desenhado para ser resiliente a pequenas variações
 * na forma do TechnicalOpinionOutput, evitando acoplamento rígido
 * antes da estabilização final do contrato do gerador.
 */

export type RendererSectionKey =
  | "ementa"
  | "resumoExecutivo"
  | "fundamentacaoTecnica"
  | "fundamentacaoTecnicoJuridica"
  | "conclusao"
  | "recomendacaoFinal"
  | "diligenciasSugeridas"
  | "versaoGestor";

export type RendererTone = "neutral" | "positive" | "warning" | "critical";

export type TechnicalOpinionRenderedSection = {
  key: RendererSectionKey;
  title: string;
  content: string;
  paragraphs: string[];
  bullets?: string[];
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
  meta: TechnicalOpinionRenderedMeta;
  sections: Record<RendererSectionKey, TechnicalOpinionRenderedSection>;
  orderedSections: TechnicalOpinionRenderedSection[];
  plainText: string;
};

type AnyRecord = Record<string, unknown>;

export type RenderTechnicalOpinionInput = AnyRecord;

/* ============================================================================
 * Helpers de tipagem e leitura segura
 * ========================================================================== */

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
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

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (isNonEmptyString(value)) return normalizeWhitespace(value);
  }
  return undefined;
}

function deepGet(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function collectStringsDeep(value: unknown, limit = 30): string[] {
  const out: string[] = [];

  function walk(node: unknown): void {
    if (out.length >= limit) return;

    if (isNonEmptyString(node)) {
      out.push(normalizeWhitespace(node));
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        if (out.length >= limit) break;
        walk(item);
      }
      return;
    }

    if (isRecord(node)) {
      for (const entry of Object.values(node)) {
        if (out.length >= limit) break;
        walk(entry);
      }
    }
  }

  walk(value);
  return dedupeStrings(out);
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

function formatPercentPtBr(value: unknown): string | null {
  const n = coerceNumber(value);
  if (n === null) return null;

  const finalValue = Math.abs(n) > 1 ? n / 100 : n;
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(finalValue);
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

function joinParagraphs(paragraphs: string[]): string {
  return paragraphs
    .map((item) => paragraph(item))
    .filter(Boolean)
    .join("\n\n");
}

/* ============================================================================
 * Extração semântica tolerante ao contrato
 * ========================================================================== */

type ExtractedOpinion = {
  title?: string;
  spreadsheetTitle?: string;
  organization?: string;
  modelType?: string;
  status?: string;

  executability?: string;
  riskLevel?: string;
  recommendation?: string;
  conclusion?: string;
  ementa?: string;

  summary?: string;
  managerVersion?: string;
  technicalFoundation?: string;
  technicalLegalFoundation?: string;
  finalRecommendation?: string;

  diligenceItems: string[];
  highlights: string[];
  warnings: string[];
  positives: string[];
  indicators: Array<{ label: string; value: string; tone?: RendererTone }>;

  proposedTotalValue?: unknown;
  mandatoryCostTotal?: unknown;
  evidentiaryCostTotal?: unknown;
  retentionTotal?: unknown;
  executabilityBalance?: unknown;
  scoreGlobal?: unknown;

  comparisonHighlights: string[];
  explanatoryFragments: string[];
};

function extractIndicators(source: unknown): Array<{
  label: string;
  value: string;
  tone?: RendererTone;
}> {
  const possibleArrays = [
    deepGet(source, ["indicators"]),
    deepGet(source, ["summary", "indicators"]),
    deepGet(source, ["executiveSummary", "indicators"]),
    deepGet(source, ["dashboard", "indicators"]),
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
          tone?: RendererTone;
        } => Boolean(item)
      );

    if (parsed.length) return parsed;
  }

  return [];
}

function extractStringList(...sources: unknown[]): string[] {
  const output: string[] = [];

  for (const source of sources) {
    if (Array.isArray(source)) {
      for (const item of source) {
        if (isNonEmptyString(item)) output.push(item);
        else if (isRecord(item)) {
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
    } else if (isRecord(source)) {
      output.push(...collectStringsDeep(source, 20));
    } else if (isNonEmptyString(source)) {
      output.push(source);
    }
  }

  return dedupeStrings(output);
}

function extractOpinion(source: RenderTechnicalOpinionInput): ExtractedOpinion {
  const executability = firstString(
    source.executability,
    source.executabilityStatus,
    source.statusMaterial,
    deepGet(source, ["summary", "executability"]),
    deepGet(source, ["classification", "executability"])
  );

  const riskLevel = firstString(
    source.riskLevel,
    source.risk,
    deepGet(source, ["summary", "riskLevel"]),
    deepGet(source, ["classification", "riskLevel"])
  );

  const recommendation = firstString(
    source.recommendation,
    source.recommendationLabel,
    source.finalRecommendation,
    deepGet(source, ["summary", "recommendation"]),
    deepGet(source, ["operationalRecommendation", "status"])
  );

  const technicalFoundation = firstString(
    source.technicalFoundation,
    source.technicalOpinion,
    source.technicalRationale,
    deepGet(source, ["foundations", "technical"]),
    deepGet(source, ["sections", "technicalFoundation"]),
    deepGet(source, ["payload", "technicalFoundation"])
  );

  const technicalLegalFoundation = firstString(
    source.technicalLegalFoundation,
    source.technicalLegalOpinion,
    source.technicalLegalRationale,
    deepGet(source, ["foundations", "technicalLegal"]),
    deepGet(source, ["sections", "technicalLegalFoundation"]),
    deepGet(source, ["payload", "technicalLegalFoundation"])
  );

  const summary = firstString(
    source.summary,
    source.executiveSummary,
    source.resume,
    deepGet(source, ["sections", "summary"]),
    deepGet(source, ["payload", "summary"])
  );

  const managerVersion = firstString(
    source.managerVersion,
    source.managerFriendly,
    source.managerFriendlyVersion,
    source.versionForManager,
    deepGet(source, ["sections", "managerVersion"]),
    deepGet(source, ["payload", "managerVersion"])
  );

  const conclusion = firstString(
    source.conclusion,
    source.finalConclusion,
    deepGet(source, ["sections", "conclusion"]),
    deepGet(source, ["payload", "conclusion"])
  );

  const ementa = firstString(
    source.ementa,
    source.synopsis,
    source.summaryLine,
    deepGet(source, ["sections", "ementa"]),
    deepGet(source, ["payload", "ementa"])
  );

  const finalRecommendation = firstString(
    source.finalRecommendation,
    source.recommendationText,
    source.operationalRecommendation,
    deepGet(source, ["sections", "finalRecommendation"]),
    deepGet(source, ["payload", "finalRecommendation"])
  );

  const diligenceItems = extractStringList(
    source.diligenceItems,
    source.diligences,
    source.pendingDiligences,
    deepGet(source, ["sections", "diligences"]),
    deepGet(source, ["payload", "diligences"]),
    deepGet(source, ["recommendation", "diligences"])
  );

  const highlights = extractStringList(
    source.highlights,
    source.keyHighlights,
    deepGet(source, ["summary", "highlights"]),
    deepGet(source, ["executiveSummary", "highlights"])
  );

  const warnings = extractStringList(
    source.warnings,
    source.alerts,
    source.risks,
    deepGet(source, ["summary", "warnings"]),
    deepGet(source, ["executability", "warnings"])
  );

  const positives = extractStringList(
    source.positives,
    source.strengths,
    source.consistencies,
    deepGet(source, ["summary", "positives"])
  );

  const comparisonHighlights = extractStringList(
    source.versionComparison,
    source.comparisonHighlights,
    deepGet(source, ["comparison", "highlights"]),
    deepGet(source, ["versioning", "highlights"])
  );

  const explanatoryFragments = extractStringList(
    source.explanations,
    source.explanationBundle,
    deepGet(source, ["payload", "explanations"]),
    deepGet(source, ["summary", "explanations"])
  );

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
    modelType: firstString(
      source.modelType,
      deepGet(source, ["spreadsheet", "modelType"])
    ),
    status: firstString(source.status, deepGet(source, ["spreadsheet", "status"])),

    executability,
    riskLevel,
    recommendation,
    conclusion,
    ementa,

    summary,
    managerVersion,
    technicalFoundation,
    technicalLegalFoundation,
    finalRecommendation,

    diligenceItems,
    highlights,
    warnings,
    positives,
    indicators: extractIndicators(source),

    proposedTotalValue:
      source.proposedTotalValue ?? deepGet(source, ["financial", "proposedTotalValue"]),
    mandatoryCostTotal:
      source.mandatoryCostTotal ?? deepGet(source, ["financial", "mandatoryCostTotal"]),
    evidentiaryCostTotal:
      source.evidentiaryCostTotal ?? deepGet(source, ["financial", "evidentiaryCostTotal"]),
    retentionTotal:
      source.retentionTotal ?? deepGet(source, ["financial", "retentionTotal"]),
    executabilityBalance:
      source.executabilityBalance ??
      deepGet(source, ["financial", "executabilityBalance"]),
    scoreGlobal: source.scoreGlobal ?? deepGet(source, ["summary", "scoreGlobal"]),

    comparisonHighlights,
    explanatoryFragments,
  };
}

/* ============================================================================
 * Builders das seções institucionais
 * ========================================================================== */

function buildSummaryLine(opinion: ExtractedOpinion): string {
  const executabilityLabel = mapExecutabilityLabel(opinion.executability);
  const riskLabel = mapRiskLabel(opinion.riskLevel);
  const recommendationLabel = mapRecommendationLabel(
    opinion.finalRecommendation ?? opinion.recommendation
  );

  if (opinion.ementa) return paragraph(opinion.ementa);

  return paragraph(
    `Análise técnica consolidada com enquadramento preliminar de ${executabilityLabel.toLowerCase()}, nível de risco ${riskLabel.toLowerCase()} e recomendação de ${recommendationLabel.toLowerCase()}.`
  );
}

function buildEmenta(opinion: ExtractedOpinion): TechnicalOpinionRenderedSection {
  const paragraphs: string[] = [];

  if (opinion.ementa) {
    paragraphs.push(opinion.ementa);
  } else {
    const parts: string[] = [];

    if (opinion.spreadsheetTitle) {
      parts.push(`Trata-se de análise da planilha "${opinion.spreadsheetTitle}"`);
    } else {
      parts.push("Trata-se de análise técnica de planilha de custos");
    }

    if (opinion.modelType) {
      parts.push(`relativa ao modelo ${toTitleCasePtBr(opinion.modelType)}`);
    }

    const executabilityLabel = mapExecutabilityLabel(opinion.executability);
    const riskLabel = mapRiskLabel(opinion.riskLevel);
    const recommendationLabel = mapRecommendationLabel(
      opinion.finalRecommendation ?? opinion.recommendation
    );

    parts.push(
      `com conclusão preliminar de ${executabilityLabel.toLowerCase()}, risco ${riskLabel.toLowerCase()} e recomendação de ${recommendationLabel.toLowerCase()}`
    );

    paragraphs.push(parts.join(", "));
  }

  return {
    key: "ementa",
    title: "Ementa",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

function buildResumoExecutivo(opinion: ExtractedOpinion): TechnicalOpinionRenderedSection {
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  if (opinion.summary) {
    paragraphs.push(opinion.summary);
  } else {
    paragraphs.push(
      `A presente nota técnica consolida a leitura institucional da planilha analisada, com foco em exequibilidade material, consistência estrutural, aderência lógica dos custos e apoio à tomada de decisão.`
    );
  }

  const score = coerceNumber(opinion.scoreGlobal);
  const proposedTotal = formatCurrencyBRL(opinion.proposedTotalValue);
  const mandatoryCost = formatCurrencyBRL(opinion.mandatoryCostTotal);
  const evidentiaryCost = formatCurrencyBRL(opinion.evidentiaryCostTotal);
  const retention = formatCurrencyBRL(opinion.retentionTotal);
  const balance = formatCurrencyBRL(opinion.executabilityBalance);

  if (score !== null) bullets.push(`Score global da análise: ${score}.`);
  if (proposedTotal) bullets.push(`Valor global proposto: ${proposedTotal}.`);
  if (mandatoryCost) bullets.push(`Custos obrigatórios identificados: ${mandatoryCost}.`);
  if (evidentiaryCost)
    bullets.push(`Custos evidenciários identificados: ${evidentiaryCost}.`);
  if (retention) bullets.push(`Retenções consideradas: ${retention}.`);
  if (balance) bullets.push(`Saldo de exequibilidade apurado: ${balance}.`);

  if (opinion.highlights.length) {
    bullets.push(...opinion.highlights.map((item) => sentence(item)));
  }

  if (!bullets.length) {
    bullets.push(
      sentence(
        `A análise aponta que a planilha já possui material suficiente para leitura técnica consolidada, embora a suficiência final dependa do enquadramento dos riscos e, quando cabível, de diligências saneadoras.`
      )
    );
  }

  return {
    key: "resumoExecutivo",
    title: "Resumo executivo",
    paragraphs: paragraphs.map(paragraph),
    bullets,
    content: joinParagraphs(paragraphs) + (bullets.length ? `\n\n- ${bullets.join("\n- ")}` : ""),
  };
}

function buildFundamentacaoTecnica(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  if (opinion.technicalFoundation) {
    paragraphs.push(opinion.technicalFoundation);
  } else {
    paragraphs.push(
      `Sob o prisma técnico, a leitura consolidada considerou a composição dos custos declarados, a coerência interna da estrutura da planilha, os sinais preliminares de suficiência econômica e o comportamento comparativo entre versões, quando disponível.`
    );
  }

  if (opinion.indicators.length) {
    bullets.push(
      ...opinion.indicators.map(
        (indicator) => `${indicator.label}: ${sentence(indicator.value)}`
      )
    );
  }

  if (opinion.comparisonHighlights.length) {
    bullets.push(
      ...opinion.comparisonHighlights.map((item) => `Comparação entre versões: ${sentence(item)}`)
    );
  }

  if (opinion.positives.length) {
    bullets.push(...opinion.positives.map((item) => `Consistência identificada: ${sentence(item)}`));
  }

  if (opinion.warnings.length) {
    bullets.push(...opinion.warnings.map((item) => `Ponto de atenção: ${sentence(item)}`));
  }

  if (opinion.explanatoryFragments.length && bullets.length < 10) {
    bullets.push(
      ...opinion.explanatoryFragments
        .slice(0, Math.max(0, 10 - bullets.length))
        .map((item) => sentence(item))
    );
  }

  if (!bullets.length) {
    bullets.push(
      sentence(
        `Não foram extraídos fragmentos técnicos adicionais em formato estruturado; ainda assim, a leitura institucional preserva o juízo consolidado do motor analítico.`
      )
    );
  }

  return {
    key: "fundamentacaoTecnica",
    title: "Fundamentação técnica",
    paragraphs: paragraphs.map(paragraph),
    bullets,
    content: joinParagraphs(paragraphs) + (bullets.length ? `\n\n- ${bullets.join("\n- ")}` : ""),
  };
}

function buildFundamentacaoTecnicoJuridica(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  if (opinion.technicalLegalFoundation) {
    paragraphs.push(opinion.technicalLegalFoundation);
  } else {
    paragraphs.push(
      `A leitura técnico-jurídica desta nota observa que a análise da planilha de custos deve servir de suporte à formação do juízo administrativo sobre aceitabilidade da proposta, exequibilidade material, necessidade de diligência saneadora e proteção do interesse público na contratação.`
    );
    paragraphs.push(
      `Não se trata, nesta etapa, de substituição da manifestação jurídica formal do órgão competente, mas de consolidação institucional dos elementos técnicos relevantes para instrução, motivação e eventual decisão administrativa.`
    );
  }

  const executabilityLabel = mapExecutabilityLabel(opinion.executability);
  const riskLabel = mapRiskLabel(opinion.riskLevel);

  bullets.push(
    sentence(
      `O enquadramento preliminar de exequibilidade foi classificado como ${executabilityLabel.toLowerCase()}, devendo orientar a continuidade da instrução administrativa.`
    )
  );
  bullets.push(
    sentence(
      `O risco identificado foi classificado como ${riskLabel.toLowerCase()}, o que impacta diretamente o grau de cautela recomendável na aceitação da planilha.`
    )
  );

  if (opinion.diligenceItems.length) {
    bullets.push(
      sentence(
        `A existência de diligências pendentes recomenda saneamento prévio antes de eventual validação definitiva do conteúdo econômico analisado.`
      )
    );
  }

  return {
    key: "fundamentacaoTecnicoJuridica",
    title: "Fundamentação técnico-jurídica",
    paragraphs: paragraphs.map(paragraph),
    bullets,
    content: joinParagraphs(paragraphs) + (bullets.length ? `\n\n- ${bullets.join("\n- ")}` : ""),
  };
}

function buildConclusao(opinion: ExtractedOpinion): TechnicalOpinionRenderedSection {
  const paragraphs: string[] = [];

  if (opinion.conclusion) {
    paragraphs.push(opinion.conclusion);
  } else {
    const executabilityLabel = mapExecutabilityLabel(opinion.executability);
    const riskLabel = mapRiskLabel(opinion.riskLevel);

    paragraphs.push(
      `Conclui-se, em análise preliminar consolidada, que a planilha apresenta enquadramento de ${executabilityLabel.toLowerCase()} e nível de risco ${riskLabel.toLowerCase()}, devendo a decisão administrativa observar tanto os elementos favoráveis já identificados quanto os pontos que ainda demandam confirmação documental ou saneamento técnico.`
    );
  }

  return {
    key: "conclusao",
    title: "Conclusão",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

function buildRecomendacaoFinal(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs: string[] = [];

  if (opinion.finalRecommendation) {
    paragraphs.push(opinion.finalRecommendation);
  } else {
    const recommendationLabel = mapRecommendationLabel(
      opinion.finalRecommendation ?? opinion.recommendation
    );

    paragraphs.push(
      `Recomenda-se, no estado atual da análise, o encaminhamento institucional compatível com ${recommendationLabel.toLowerCase()}, resguardando-se a motivação administrativa e a rastreabilidade da decisão.`
    );
  }

  return {
    key: "recomendacaoFinal",
    title: "Recomendação final",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

function buildDiligenciasSugeridas(
  opinion: ExtractedOpinion
): TechnicalOpinionRenderedSection {
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  if (opinion.diligenceItems.length) {
    paragraphs.push(
      `As diligências abaixo representam providências saneadoras ou confirmatórias cuja realização pode ser necessária para robustecer a instrução do processo e reduzir risco decisório.`
    );
    bullets.push(...opinion.diligenceItems.map((item) => sentence(item)));
  } else {
    paragraphs.push(
      `No material atualmente estruturado, não foram identificadas diligências formalmente listadas pelo motor analítico. Isso não elimina a possibilidade de saneamentos adicionais no fluxo institucional, caso a análise humana identifique lacunas documentais ou justificativas insuficientes.`
    );
  }

  return {
    key: "diligenciasSugeridas",
    title: "Diligências sugeridas",
    paragraphs: paragraphs.map(paragraph),
    bullets: bullets.length ? bullets : undefined,
    content: joinParagraphs(paragraphs) + (bullets.length ? `\n\n- ${bullets.join("\n- ")}` : ""),
  };
}

function buildVersaoGestor(opinion: ExtractedOpinion): TechnicalOpinionRenderedSection {
  const paragraphs: string[] = [];

  if (opinion.managerVersion) {
    paragraphs.push(opinion.managerVersion);
  } else {
    const executabilityLabel = mapExecutabilityLabel(opinion.executability);
    const riskLabel = mapRiskLabel(opinion.riskLevel);
    const recommendationLabel = mapRecommendationLabel(
      opinion.finalRecommendation ?? opinion.recommendation
    );

    paragraphs.push(
      `Em linguagem executiva, a leitura consolidada indica que a planilha foi classificada como ${executabilityLabel.toLowerCase()}, com risco ${riskLabel.toLowerCase()}.`
    );
    paragraphs.push(
      `Na prática, isso significa que a proposta analisada já permite formação de juízo administrativo preliminar, mas a continuidade segura depende da observância da recomendação de ${recommendationLabel.toLowerCase()} e, quando aplicável, do atendimento das diligências apontadas.`
    );
  }

  return {
    key: "versaoGestor",
    title: "Versão para gestor",
    paragraphs: paragraphs.map(paragraph),
    content: joinParagraphs(paragraphs),
  };
}

/* ============================================================================
 * Funções públicas
 * ========================================================================== */

export function renderTechnicalOpinion(
  input: RenderTechnicalOpinionInput
): TechnicalOpinionRenderedOutput {
  const opinion = extractOpinion(input);

  const ementa = buildEmenta(opinion);
  const resumoExecutivo = buildResumoExecutivo(opinion);
  const fundamentacaoTecnica = buildFundamentacaoTecnica(opinion);
  const fundamentacaoTecnicoJuridica = buildFundamentacaoTecnicoJuridica(opinion);
  const conclusao = buildConclusao(opinion);
  const recomendacaoFinal = buildRecomendacaoFinal(opinion);
  const diligenciasSugeridas = buildDiligenciasSugeridas(opinion);
  const versaoGestor = buildVersaoGestor(opinion);

  const orderedSections: TechnicalOpinionRenderedSection[] = [
    ementa,
    resumoExecutivo,
    fundamentacaoTecnica,
    fundamentacaoTecnicoJuridica,
    conclusao,
    recomendacaoFinal,
    diligenciasSugeridas,
    versaoGestor,
  ];

  const sections: Record<RendererSectionKey, TechnicalOpinionRenderedSection> = {
    ementa,
    resumoExecutivo,
    fundamentacaoTecnica,
    fundamentacaoTecnicoJuridica,
    conclusao,
    recomendacaoFinal,
    diligenciasSugeridas,
    versaoGestor,
  };

  const recommendationLabel = mapRecommendationLabel(
    opinion.finalRecommendation ?? opinion.recommendation
  );
  const executabilityLabel = mapExecutabilityLabel(opinion.executability);
  const riskLabel = mapRiskLabel(opinion.riskLevel);

  const title =
    opinion.title ||
    (opinion.spreadsheetTitle
      ? `Nota técnica institucional - ${opinion.spreadsheetTitle}`
      : "Nota técnica institucional");

  const subtitle = opinion.organization
    ? `${opinion.organization} · CustoPublico`
    : "CustoPublico · Gestão de Planilhas de Custos Públicas";

  const summaryLine = buildSummaryLine(opinion);

  const plainText = [
    title,
    subtitle,
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
    meta: {
      generatedAtIso: new Date().toISOString(),
      executabilityLabel,
      riskLabel,
      recommendationLabel,
      hasDiligences: opinion.diligenceItems.length > 0,
      diligenceCount: opinion.diligenceItems.length,
    },
    sections,
    orderedSections,
    plainText,
  };
}

/**
 * Útil para cenários em que a UI queira apenas um texto corrido,
 * mas mantendo a separação institucional no renderer.
 */
export function renderTechnicalOpinionAsPlainText(
  input: RenderTechnicalOpinionInput
): string {
  return renderTechnicalOpinion(input).plainText;
}

/**
 * Helper opcional para cards ou listas resumidas na UI.
 */
export function renderTechnicalOpinionSectionCards(
  input: RenderTechnicalOpinionInput
): Array<{
  key: RendererSectionKey;
  title: string;
  preview: string;
}> {
  const rendered = renderTechnicalOpinion(input);

  return rendered.orderedSections.map((section) => ({
    key: section.key,
    title: section.title,
    preview: normalizeWhitespace(
      section.paragraphs[0] ??
        section.bullets?.[0] ??
        "Sem conteúdo estruturado disponível."
    ),
  }));
}
