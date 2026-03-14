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

export const analysisHistoryMocks: AnalysisHistoryItem[] = [
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
    isLatest: false,
    explanations: [
      {
        id: "4d15d2ea-aa1c-4a60-ae17-2406a31965bc",
        type: "technical",
        title: "Fundamentação técnica",
        content:
          "A composição apresentada demonstra viabilidade material condicionada ao saneamento de custos acessórios e reforço documental dos insumos evidenciários.",
      },
      {
        id: "acf18aa5-621e-4d0c-a4d2-8d6dfaeeb796",
        type: "technical_legal",
        title: "Fundamentação técnico-jurídica",
        content:
          "A exequibilidade depende da aderência entre os itens planilhados, a memória de cálculo e os parâmetros normativos aplicáveis ao regime de contratação.",
      },
      {
        id: "aa1955a2-597b-49e0-bdb6-1070e569bcce",
        type: "manager_friendly",
        title: "Versão para gestor",
        content:
          "A planilha pode seguir, mas precisa de diligência complementar para reduzir risco de questionamento posterior.",
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
        "Aprovo com ressalvas de monitoramento posterior quanto à aderência documental e rastreabilidade dos parâmetros utilizados.",
      decidedAt: "2026-03-13T16:00:00.000Z",
      decidedBy: "Gestor Interno",
    },
  },
  {
    analysisId: "8be1f577-7b52-4bd4-8f90-3b6c9d5ea321",
    spreadsheetId: "30db5807-27ac-412d-909b-306fdc54ba43",
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
