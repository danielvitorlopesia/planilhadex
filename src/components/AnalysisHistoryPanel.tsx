export type AnalysisDecision =
  | "approved"
  | "approved_with_remarks"
  | "diligence_requested"
  | "rejected";

export type AnalysisRiskLevel = "low" | "medium" | "high";

export type AnalysisMaterialStatus =
  | "exequivel"
  | "exequivel_com_diligencia"
  | "inexequivel";

export type AnalysisProcessingStatus = "completed" | "processing" | "failed";

export type ExplanationType =
  | "technical"
  | "technical_legal"
  | "manager_friendly"
  | "recommendation";

export interface AnalysisExplanationItem {
  id: string;
  type: ExplanationType;
  title: string;
  content: string;
}

export interface InternalDecisionItem {
  decision: AnalysisDecision;
  despacho: string;
  decidedAt: string;
  decidedBy: string;
}

export interface ConsolidatedOpinionSection {
  title: string;
  content: string;
}

export interface ConsolidatedOpinion {
  ementa: string;
  conclusao: string;
  fundamentacaoTecnica: ConsolidatedOpinionSection;
  fundamentacaoTecnicoJuridica: ConsolidatedOpinionSection;
  versaoGestorLeigo: ConsolidatedOpinionSection;
  recomendacaoFinal: ConsolidatedOpinionSection;
}

export interface AnalysisHistoryItem {
  analysisId: string;
  spreadsheetId: string;
  spreadsheetVersionId: number;
  spreadsheetVersionLabel: string;
  analysisType: string;
  analysisProcessingStatus: AnalysisProcessingStatus;
  materialStatus: AnalysisMaterialStatus;
  scoreGlobal: number;
  riskLevel: AnalysisRiskLevel;
  proposedTotalValue: number;
  mandatoryCostTotal: number;
  evidentiaryCostTotal: number;
  retentionTotal: number;
  executabilityBalance: number;
  createdAt: string;
  createdBy: string;
  isLatest?: boolean;
  explanations: AnalysisExplanationItem[];
  internalDecision?: InternalDecisionItem | null;
}

export interface AnalysisTimelineEvent {
  id: string;
  type:
    | "analysis_created"
    | "analysis_completed"
    | "explanations_generated"
    | "internal_decision"
    | "comparison_available"
    | "opinion_generated";
  title: string;
  description: string;
  occurredAt: string;
  actor: string;
  highlight?: boolean;
}

export interface AnalysisComparisonItem {
  label: string;
  previousValue: string;
  currentValue: string;
  delta?: string;
  direction?: "up" | "down" | "neutral";
}

export interface AnalysisDetail {
  analysis: AnalysisHistoryItem;
  consolidatedOpinion: ConsolidatedOpinion;
  timeline: AnalysisTimelineEvent[];
  comparison: AnalysisComparisonItem[];
}

const baseSpreadsheetId = "30db5807-27ac-412d-909b-306fdc54ba43";

export const analysisHistoryMocks: AnalysisHistoryItem[] = [
  {
    analysisId: "9ad0fc6f-be95-4655-8c48-9b55c8e0a222",
    spreadsheetId: baseSpreadsheetId,
    spreadsheetVersionId: 1,
    spreadsheetVersionLabel: "Versão 1",
    analysisType: "executability_v1",
    analysisProcessingStatus: "completed",
    materialStatus: "exequivel_com_diligencia",
    scoreGlobal: 65,
    riskLevel: "medium",
    proposedTotalValue: 3600,
    mandatoryCostTotal: 3200,
    evidentiaryCostTotal: 700,
    retentionTotal: 250,
    executabilityBalance: 150,
    createdAt: "2026-03-13T10:00:00.000Z",
    createdBy: "Sistema IA",
    isLatest: false,
    explanations: [
      {
        id: "4d15d2ea-aa1c-4a60-ae17-2406a31965bc",
        type: "technical",
        title: "Fundamentação técnica",
        content:
          "A composição apresentada demonstra viabilidade material condicionada ao saneamento de custos acessórios e ao reforço documental dos insumos evidenciários.",
      },
      {
        id: "acf18aa5-621e-4d0c-a4d2-8d6dfaeeb796",
        type: "technical_legal",
        title: "Fundamentação técnico-jurídica",
        content:
          "A exequibilidade depende da aderência entre os itens planilhados, a memória de cálculo, os parâmetros normativos e a coerência interna da composição apresentada.",
      },
      {
        id: "aa1955a2-597b-49e0-bdb6-1070e569bcce",
        type: "manager_friendly",
        title: "Versão para gestor",
        content:
          "A planilha pode seguir, mas ainda precisa de diligência complementar para reduzir o risco de questionamento posterior.",
      },
      {
        id: "e324e975-b6e3-48e7-b6f4-b674abd951fa",
        type: "recommendation",
        title: "Recomendação operacional",
        content:
          "Solicitar ajuste dos custos evidenciários, revisar retenções e consolidar justificativa final antes da aprovação interna.",
      },
    ],
    internalDecision: {
      decision: "diligence_requested",
      despacho:
        "Determino a realização de diligência complementar para saneamento dos custos evidenciários e complementação justificativa.",
      decidedAt: "2026-03-13T11:10:00.000Z",
      decidedBy: "Gestor Interno",
    },
  },
  {
    analysisId: "d03a2e84-1f3f-4781-9d40-0f5a2a0f1001",
    spreadsheetId: baseSpreadsheetId,
    spreadsheetVersionId: 2,
    spreadsheetVersionLabel: "Versão 2",
    analysisType: "executability_v1",
    analysisProcessingStatus: "completed",
    materialStatus: "exequivel",
    scoreGlobal: 82,
    riskLevel: "low",
    proposedTotalValue: 3890,
    mandatoryCostTotal: 3200,
    evidentiaryCostTotal: 440,
    retentionTotal: 250,
    executabilityBalance: 440,
    createdAt: "2026-03-13T15:20:00.000Z",
    createdBy: "Sistema IA",
    isLatest: true,
    explanations: [
      {
        id: "f1",
        type: "technical",
        title: "Fundamentação técnica",
        content:
          "Após os ajustes realizados, a estrutura de custos tornou-se compatível com os parâmetros mínimos obrigatórios e com a memória de cálculo validada.",
      },
      {
        id: "f2",
        type: "technical_legal",
        title: "Fundamentação técnico-jurídica",
        content:
          "Os elementos apresentados reduzem o risco de inexequibilidade e reforçam a consistência interna da proposta.",
      },
      {
        id: "f3",
        type: "manager_friendly",
        title: "Versão para gestor",
        content:
          "A nova versão está melhor estruturada, com menor risco e saldo de exequibilidade mais confortável.",
      },
      {
        id: "f4",
        type: "recommendation",
        title: "Recomendação operacional",
        content:
          "Prosseguir com validação final e, se cabível, emissão do parecer consolidado para aprovação.",
      },
    ],
    internalDecision: {
      decision: "approved_with_remarks",
      despacho:
        "Aprovo com ressalvas de monitoramento posterior quanto à aderência documental e à rastreabilidade dos parâmetros utilizados.",
      decidedAt: "2026-03-13T16:00:00.000Z",
      decidedBy: "Gestor Interno",
    },
  },
  {
    analysisId: "8be1f577-7b52-4bd4-8f90-3b6c9d5ea321",
    spreadsheetId: baseSpreadsheetId,
    spreadsheetVersionId: 3,
    spreadsheetVersionLabel: "Versão 3",
    analysisType: "executability_v1",
    analysisProcessingStatus: "processing",
    materialStatus: "exequivel_com_diligencia",
    scoreGlobal: 0,
    riskLevel: "medium",
    proposedTotalValue: 0,
    mandatoryCostTotal: 0,
    evidentiaryCostTotal: 0,
    retentionTotal: 0,
    executabilityBalance: 0,
    createdAt: "2026-03-14T08:40:00.000Z",
    createdBy: "Sistema IA",
    isLatest: false,
    explanations: [],
    internalDecision: null,
  },
];

function getDefaultHistory(): AnalysisHistoryItem[] {
  return analysisHistoryMocks;
}

function findAnalysisById(analysisId?: string | null): AnalysisHistoryItem {
  const history = getDefaultHistory();

  if (!analysisId) {
    return history.find((item) => item.isLatest) ?? history[0];
  }

  return (
    history.find((item) => item.analysisId === analysisId) ??
    history.find((item) => item.isLatest) ??
    history[0]
  );
}

function buildOpinionForAnalysis(item: AnalysisHistoryItem): ConsolidatedOpinion {
  const technical =
    item.explanations.find((exp) => exp.type === "technical")?.content ??
    "A análise técnica ainda não possui conteúdo consolidado disponível.";

  const technicalLegal =
    item.explanations.find((exp) => exp.type === "technical_legal")?.content ??
    "A análise técnico-jurídica ainda não possui conteúdo consolidado disponível.";

  const managerFriendly =
    item.explanations.find((exp) => exp.type === "manager_friendly")?.content ??
    "A versão resumida para gestor ainda não foi gerada.";

  const recommendation =
    item.explanations.find((exp) => exp.type === "recommendation")?.content ??
    "A recomendação final ainda não foi consolidada.";

  const statusLabel =
    item.materialStatus === "exequivel"
      ? "exequível"
      : item.materialStatus === "exequivel_com_diligencia"
        ? "exequível com diligência"
        : "inexequível";

  const riskLabel =
    item.riskLevel === "low"
      ? "baixo"
      : item.riskLevel === "medium"
        ? "médio"
        : "alto";

  return {
    ementa: `Análise ${item.analysisType} da ${item.spreadsheetVersionLabel}, com resultado material ${statusLabel}, score global ${item.scoreGlobal} e risco ${riskLabel}.`,
    conclusao:
      item.materialStatus === "exequivel"
        ? "Conclui-se pela viabilidade da composição analisada, recomendando-se apenas monitoramento documental e rastreabilidade dos parâmetros utilizados."
        : item.materialStatus === "exequivel_com_diligencia"
          ? "Conclui-se pela viabilidade condicionada da composição analisada, com necessidade de diligência complementar para saneamento dos pontos remanescentes."
          : "Conclui-se pela inviabilidade da composição analisada, diante de inconsistências que comprometem sua sustentação técnica e jurídica.",
    fundamentacaoTecnica: {
      title: "Fundamentação técnica",
      content: technical,
    },
    fundamentacaoTecnicoJuridica: {
      title: "Fundamentação técnico-jurídica",
      content: technicalLegal,
    },
    versaoGestorLeigo: {
      title: "Versão gestor leigo",
      content: managerFriendly,
    },
    recomendacaoFinal: {
      title: "Recomendação final",
      content: recommendation,
    },
  };
}

function buildTimelineForAnalysis(item: AnalysisHistoryItem): AnalysisTimelineEvent[] {
  const events: AnalysisTimelineEvent[] = [
    {
      id: `${item.analysisId}-created`,
      type: "analysis_created",
      title: "Análise criada",
      description: `A ${item.analysisType} foi aberta para a ${item.spreadsheetVersionLabel}.`,
      occurredAt: item.createdAt,
      actor: item.createdBy,
    },
  ];

  if (item.analysisProcessingStatus === "completed") {
    events.push({
      id: `${item.analysisId}-completed`,
      type: "analysis_completed",
      title: "Análise concluída",
      description: `Processamento concluído com status material ${item.materialStatus}.`,
      occurredAt: item.createdAt,
      actor: "Motor analítico",
      highlight: true,
    });
  }

  if (item.explanations.length > 0) {
    events.push({
      id: `${item.analysisId}-explanations`,
      type: "explanations_generated",
      title: "Explicações geradas",
      description: `Foram produzidas ${item.explanations.length} explicações para suporte ao parecer e à leitura gerencial.`,
      occurredAt: item.createdAt,
      actor: "Camada de explicabilidade",
    });
  }

  events.push({
    id: `${item.analysisId}-comparison`,
    type: "comparison_available",
    title: "Comparação disponível",
    description:
      "Os indicadores principais foram organizados para comparação com a versão anterior da planilha.",
    occurredAt: item.createdAt,
    actor: "Módulo de comparação",
  });

  events.push({
    id: `${item.analysisId}-opinion`,
    type: "opinion_generated",
    title: "Parecer consolidado preparado",
    description:
      "A estrutura de parecer consolidado foi disponibilizada para leitura técnica, técnico-jurídica e gerencial.",
    occurredAt: item.createdAt,
    actor: "Módulo de parecer",
  });

  if (item.internalDecision) {
    events.push({
      id: `${item.analysisId}-decision`,
      type: "internal_decision",
      title: "Decisão interna registrada",
      description: item.internalDecision.despacho,
      occurredAt: item.internalDecision.decidedAt,
      actor: item.internalDecision.decidedBy,
      highlight: true,
    });
  }

  return events.sort(
    (a, b) =>
      new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );
}

function buildComparisonForAnalysis(item: AnalysisHistoryItem): AnalysisComparisonItem[] {
  const history = getDefaultHistory();
  const previous = history
    .filter((entry) => entry.spreadsheetVersionId < item.spreadsheetVersionId)
    .sort((a, b) => b.spreadsheetVersionId - a.spreadsheetVersionId)[0];

  if (!previous) {
    return [
      {
        label: "Versão anterior",
        previousValue: "-",
        currentValue: item.spreadsheetVersionLabel,
        delta: "Primeira versão analisada",
        direction: "neutral",
      },
      {
        label: "Score global",
        previousValue: "-",
        currentValue: String(item.scoreGlobal),
        delta: "Sem base anterior",
        direction: "neutral",
      },
      {
        label: "Saldo de exequibilidade",
        previousValue: "-",
        currentValue: formatCurrency(item.executabilityBalance),
        delta: "Sem base anterior",
        direction: "neutral",
      },
    ];
  }

  const scoreDelta = item.scoreGlobal - previous.scoreGlobal;
  const balanceDelta = item.executabilityBalance - previous.executabilityBalance;
  const evidentiaryDelta =
    item.evidentiaryCostTotal - previous.evidentiaryCostTotal;

  return [
    {
      label: "Versão comparada",
      previousValue: previous.spreadsheetVersionLabel,
      currentValue: item.spreadsheetVersionLabel,
      delta: `${previous.spreadsheetVersionId} → ${item.spreadsheetVersionId}`,
      direction: "neutral",
    },
    {
      label: "Score global",
      previousValue: String(previous.scoreGlobal),
      currentValue: String(item.scoreGlobal),
      delta: withSignal(scoreDelta),
      direction:
        scoreDelta > 0 ? "up" : scoreDelta < 0 ? "down" : "neutral",
    },
    {
      label: "Saldo de exequibilidade",
      previousValue: formatCurrency(previous.executabilityBalance),
      currentValue: formatCurrency(item.executabilityBalance),
      delta: formatSignedCurrency(balanceDelta),
      direction:
        balanceDelta > 0 ? "up" : balanceDelta < 0 ? "down" : "neutral",
    },
    {
      label: "Custos evidenciários",
      previousValue: formatCurrency(previous.evidentiaryCostTotal),
      currentValue: formatCurrency(item.evidentiaryCostTotal),
      delta: formatSignedCurrency(evidentiaryDelta),
      direction:
        evidentiaryDelta < 0 ? "up" : evidentiaryDelta > 0 ? "down" : "neutral",
    },
    {
      label: "Risco",
      previousValue: previous.riskLevel,
      currentValue: item.riskLevel,
      delta: `${previous.riskLevel} → ${item.riskLevel}`,
      direction: compareRiskDirection(previous.riskLevel, item.riskLevel),
    },
  ];
}

function compareRiskDirection(
  previous: AnalysisRiskLevel,
  current: AnalysisRiskLevel
): "up" | "down" | "neutral" {
  const weight: Record<AnalysisRiskLevel, number> = {
    low: 1,
    medium: 2,
    high: 3,
  };

  if (weight[current] < weight[previous]) return "up";
  if (weight[current] > weight[previous]) return "down";
  return "neutral";
}

function withSignal(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return "0";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatSignedCurrency(value: number): string {
  const formatted = formatCurrency(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatCurrency(0);
}

export function buildMockAnalysisHistory(
  spreadsheetId?: string
): AnalysisHistoryItem[] {
  const history = getDefaultHistory();

  if (!spreadsheetId) {
    return history;
  }

  return history.filter((item) => item.spreadsheetId === spreadsheetId);
}

export function buildMockAnalysisDetail(
  analysisId?: string | null
): AnalysisDetail {
  const analysis = findAnalysisById(analysisId);

  return {
    analysis,
    consolidatedOpinion: buildOpinionForAnalysis(analysis),
    timeline: buildTimelineForAnalysis(analysis),
    comparison: buildComparisonForAnalysis(analysis),
  };
}
