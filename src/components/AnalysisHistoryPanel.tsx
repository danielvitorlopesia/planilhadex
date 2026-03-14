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

export interface AnalysisExplanationItem {
  id: string;
  type: "technical" | "technical_legal" | "manager_friendly" | "recommendation";
  title: string;
  content: string;
}

export interface InternalDecisionItem {
  decision: AnalysisDecision;
  despacho: string;
  decidedAt: string;
  decidedBy: string;
}

export interface AnalysisHistoryItem {
  analysisId: string;
  spreadsheetId: string;
  spreadsheetVersionId: number;
  spreadsheetVersionLabel: string;
  analysisType: string;
  analysisProcessingStatus: "completed" | "processing" | "failed";
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

export interface ConsolidatedOpinion {
  ementa: string;
  conclusao: string;
  fundamentacaoTecnica: {
    title: string;
    content: string;
  };
  fundamentacaoTecnicoJuridica: {
    title: string;
    content: string;
  };
  versaoGestorLeigo: {
    title: string;
    content: string;
  };
  recomendacaoFinal: {
    title: string;
    content: string;
  };
}

export interface AnalysisTimelineEvent {
  id: string;
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

const HISTORY: AnalysisHistoryItem[] = [
  {
    analysisId: "9ad0fc6f-be95-4655-8c48-9b55c8e0a222",
    spreadsheetId: "30db5807-27ac-412d-909b-306fdc54ba43",
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
    explanations: [
      {
        id: "exp-1",
        type: "technical",
        title: "Fundamentação técnica",
        content:
          "A composição demonstra viabilidade material condicionada ao saneamento de custos acessórios e ao reforço documental.",
      },
      {
        id: "exp-2",
        type: "technical_legal",
        title: "Fundamentação técnico-jurídica",
        content:
          "A exequibilidade depende da aderência entre itens planilhados, memória de cálculo e parâmetros normativos.",
      },
      {
        id: "exp-3",
        type: "manager_friendly",
        title: "Versão para gestor",
        content:
          "A planilha pode seguir, mas ainda precisa de diligência complementar.",
      },
      {
        id: "exp-4",
        type: "recommendation",
        title: "Recomendação operacional",
        content:
          "Solicitar ajuste dos custos evidenciários e consolidar justificativa final antes da aprovação.",
      },
    ],
    internalDecision: {
      decision: "diligence_requested",
      despacho:
        "Determino diligência complementar para saneamento dos custos evidenciários.",
      decidedAt: "2026-03-13T11:10:00.000Z",
      decidedBy: "Gestor Interno",
    },
  },
  {
    analysisId: "d03a2e84-1f3f-4781-9d40-0f5a2a0f1001",
    spreadsheetId: "30db5807-27ac-412d-909b-306fdc54ba43",
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
        id: "exp-5",
        type: "technical",
        title: "Fundamentação técnica",
        content:
          "Após os ajustes, a estrutura de custos tornou-se compatível com os parâmetros mínimos obrigatórios.",
      },
      {
        id: "exp-6",
        type: "technical_legal",
        title: "Fundamentação técnico-jurídica",
        content:
          "Os elementos apresentados reduzem o risco de inexequibilidade e reforçam a consistência interna.",
      },
      {
        id: "exp-7",
        type: "manager_friendly",
        title: "Versão para gestor",
        content:
          "A nova versão está melhor estruturada, com menor risco e saldo de exequibilidade mais confortável.",
      },
      {
        id: "exp-8",
        type: "recommendation",
        title: "Recomendação operacional",
        content:
          "Prosseguir com validação final e emissão do parecer consolidado.",
      },
    ],
    internalDecision: {
      decision: "approved_with_remarks",
      despacho:
        "Aprovo com ressalvas de monitoramento posterior quanto à aderência documental.",
      decidedAt: "2026-03-13T16:00:00.000Z",
      decidedBy: "Gestor Interno",
    },
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export const analysisHistoryMocks = HISTORY;

export function buildMockAnalysisHistory(
  spreadsheetId?: string
): AnalysisHistoryItem[] {
  if (!spreadsheetId) return HISTORY;
  return HISTORY.filter((item) => item.spreadsheetId === spreadsheetId);
}

export function buildMockAnalysisDetail(
  analysisId?: string | null
): AnalysisDetail {
  const analysis =
    HISTORY.find((item) => item.analysisId === analysisId) ??
    HISTORY.find((item) => item.isLatest) ??
    HISTORY[0];

  const technical =
    analysis.explanations.find((e) => e.type === "technical")?.content ?? "";
  const technicalLegal =
    analysis.explanations.find((e) => e.type === "technical_legal")?.content ?? "";
  const managerFriendly =
    analysis.explanations.find((e) => e.type === "manager_friendly")?.content ?? "";
  const recommendation =
    analysis.explanations.find((e) => e.type === "recommendation")?.content ?? "";

  return {
    analysis,
    consolidatedOpinion: {
      ementa: `Análise ${analysis.analysisType} da ${analysis.spreadsheetVersionLabel}.`,
      conclusao:
        analysis.materialStatus === "exequivel"
          ? "Conclui-se pela viabilidade da composição analisada."
          : analysis.materialStatus === "exequivel_com_diligencia"
            ? "Conclui-se pela viabilidade condicionada, com necessidade de diligência complementar."
            : "Conclui-se pela inviabilidade da composição analisada.",
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
    },
    timeline: [
      {
        id: `${analysis.analysisId}-1`,
        title: "Análise criada",
        description: `A ${analysis.analysisType} foi aberta para a ${analysis.spreadsheetVersionLabel}.`,
        occurredAt: analysis.createdAt,
        actor: analysis.createdBy,
      },
      {
        id: `${analysis.analysisId}-2`,
        title: "Parecer preparado",
        description: "A estrutura de parecer consolidado foi disponibilizada.",
        occurredAt: analysis.createdAt,
        actor: "Módulo de parecer",
        highlight: true,
      },
      ...(analysis.internalDecision
        ? [
            {
              id: `${analysis.analysisId}-3`,
              title: "Decisão interna registrada",
              description: analysis.internalDecision.despacho,
              occurredAt: analysis.internalDecision.decidedAt,
              actor: analysis.internalDecision.decidedBy,
              highlight: true,
            },
          ]
        : []),
    ],
    comparison: [
      {
        label: "Score global",
        previousValue: "-",
        currentValue: String(analysis.scoreGlobal),
        delta: "Sem base anterior",
        direction: "neutral",
      },
      {
        label: "Saldo de exequibilidade",
        previousValue: "-",
        currentValue: formatCurrency(analysis.executabilityBalance),
        delta: "Sem base anterior",
        direction: "neutral",
      },
      {
        label: "Valor proposto",
        previousValue: "-",
        currentValue: formatCurrency(analysis.proposedTotalValue),
        delta: "Sem base anterior",
        direction: "neutral",
      },
    ],
  };
}
