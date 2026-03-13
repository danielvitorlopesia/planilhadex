export type AnalysisProcessingStatus =
  | "completed"
  | "processing"
  | "failed";

export type ExecutabilityStatus =
  | "exequivel"
  | "exequivel_com_diligencia"
  | "inexequivel"
  | "pendente";

export type RiskLevel = "low" | "medium" | "high";

export type InternalDecision =
  | "aprovado"
  | "aprovado_com_ressalvas"
  | "diligencia"
  | "reprovado"
  | "pendente";

export type AnalysisTimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "system" | "analysis" | "decision" | "version";
};

export type AnalysisHistoryItem = {
  id: string;
  analysisId: string;
  versionNumber: number;
  spreadsheetVersionId: number;
  analysisType: string;
  createdAt: string;
  updatedAt: string;
  requestedBy: string;
  processingStatus: AnalysisProcessingStatus;
  executabilityStatus: ExecutabilityStatus;
  riskLevel: RiskLevel;
  scoreGlobal: number;
  proposedTotalValue: number;
  mandatoryCostTotal: number;
  evidentiaryCostTotal: number;
  retentionTotal: number;
  executabilityBalance: number;
  internalDecision: InternalDecision;
  shortDispatch: string;
  technicalSummary: string;
  technicalLegalSummary: string;
  managerSummary: string;
  recommendationSummary: string;
  timeline: AnalysisTimelineItem[];
};

export const analysisHistoryMocks: AnalysisHistoryItem[] = [
  {
    id: "hist-001",
    analysisId: "9ad0fc6f-be95-4655-8c48-9b55c8e0a222",
    versionNumber: 1,
    spreadsheetVersionId: 1,
    analysisType: "executability_v1",
    createdAt: "2026-03-10T09:15:00",
    updatedAt: "2026-03-10T09:24:00",
    requestedBy: "Cristina Dorneles",
    processingStatus: "completed",
    executabilityStatus: "exequivel_com_diligencia",
    riskLevel: "medium",
    scoreGlobal: 65,
    proposedTotalValue: 3600,
    mandatoryCostTotal: 3200,
    evidentiaryCostTotal: 700,
    retentionTotal: 250,
    executabilityBalance: 150,
    internalDecision: "aprovado_com_ressalvas",
    shortDispatch:
      "Aprovação condicionada à complementação documental e ao reforço da memória de cálculo.",
    technicalSummary:
      "A composição do preço apresenta compatibilidade parcial com os custos obrigatórios e margem reduzida para absorção de encargos indiretos.",
    technicalLegalSummary:
      "A versão analisada demanda diligência para robustecer a comprovação dos elementos de formação do preço e reduzir vulnerabilidade em eventual controle posterior.",
    managerSummary:
      "A planilha pode seguir, mas precisa de pequenos ajustes e documentos de apoio antes da validação final.",
    recommendationSummary:
      "Emitir diligência saneadora focada em memória de cálculo, evidências dos custos acessórios e justificativa do equilíbrio final.",
    timeline: [
      {
        id: "t1",
        date: "2026-03-10T09:15:00",
        title: "Análise criada",
        description:
          "A análise de exequibilidade foi iniciada para a versão 1 da planilha.",
        type: "analysis",
      },
      {
        id: "t2",
        date: "2026-03-10T09:18:00",
        title: "Processamento concluído",
        description:
          "O motor concluiu o cálculo dos custos obrigatórios, retenções e saldo de exequibilidade.",
        type: "system",
      },
      {
        id: "t3",
        date: "2026-03-10T09:24:00",
        title: "Despacho interno registrado",
        description:
          "A análise foi aprovada com ressalvas e recomendação de diligência complementar.",
        type: "decision",
      },
    ],
  },
  {
    id: "hist-002",
    analysisId: "1f10ea56-3f6f-4d62-b5ef-52d1e2a111aa",
    versionNumber: 2,
    spreadsheetVersionId: 2,
    analysisType: "executability_v1",
    createdAt: "2026-03-11T10:05:00",
    updatedAt: "2026-03-11T10:14:00",
    requestedBy: "Cristina Dorneles",
    processingStatus: "completed",
    executabilityStatus: "exequivel",
    riskLevel: "low",
    scoreGlobal: 81,
    proposedTotalValue: 4100,
    mandatoryCostTotal: 3200,
    evidentiaryCostTotal: 500,
    retentionTotal: 250,
    executabilityBalance: 650,
    internalDecision: "aprovado",
    shortDispatch:
      "Versão apta para prosseguimento, com aderência satisfatória aos parâmetros mínimos.",
    technicalSummary:
      "A revisão ampliou a folga operacional e reduziu a discrepância entre custos suportados e preço proposto.",
    technicalLegalSummary:
      "A versão demonstra maior consistência documental e menor exposição a questionamentos quanto à exequibilidade.",
    managerSummary:
      "Esta é uma versão mais segura e melhor estruturada para seguir no fluxo.",
    recommendationSummary:
      "Prosseguir com a versão 2 como referência principal do histórico.",
    timeline: [
      {
        id: "t4",
        date: "2026-03-11T10:05:00",
        title: "Nova versão vinculada",
        description:
          "A versão 2 da planilha foi submetida ao histórico de análise.",
        type: "version",
      },
      {
        id: "t5",
        date: "2026-03-11T10:09:00",
        title: "Análise concluída",
        description:
          "O motor identificou melhora do saldo global e redução do risco.",
        type: "analysis",
      },
      {
        id: "t6",
        date: "2026-03-11T10:14:00",
        title: "Aprovação interna",
        description:
          "A análise foi aprovada para continuidade sem necessidade de diligência imediata.",
        type: "decision",
      },
    ],
  },
  {
    id: "hist-003",
    analysisId: "5f8cc201-6409-4af6-8c11-2d65a7b2bbbb",
    versionNumber: 3,
    spreadsheetVersionId: 3,
    analysisType: "executability_v1",
    createdAt: "2026-03-12T14:20:00",
    updatedAt: "2026-03-12T14:33:00",
    requestedBy: "Cristina Dorneles",
    processingStatus: "completed",
    executabilityStatus: "inexequivel",
    riskLevel: "high",
    scoreGlobal: 38,
    proposedTotalValue: 2800,
    mandatoryCostTotal: 3200,
    evidentiaryCostTotal: 600,
    retentionTotal: 250,
    executabilityBalance: -1050,
    internalDecision: "reprovado",
    shortDispatch:
      "Versão reprovada em razão de insuficiência do preço frente aos custos mínimos identificados.",
    technicalSummary:
      "O preço proposto não absorve os componentes essenciais e evidencia desequilíbrio material relevante.",
    technicalLegalSummary:
      "Há risco elevado de inexequibilidade com potencial de comprometimento contratual e questionamento pelos órgãos de controle.",
    managerSummary:
      "Esta versão não deve seguir como base, pois o valor não sustenta os custos mínimos.",
    recommendationSummary:
      "Retornar para reestruturação integral da composição de custos antes de nova submissão.",
    timeline: [
      {
        id: "t7",
        date: "2026-03-12T14:20:00",
        title: "Versão 3 submetida",
        description:
          "A terceira versão foi enviada para nova rodada de análise automatizada.",
        type: "version",
      },
      {
        id: "t8",
        date: "2026-03-12T14:28:00",
        title: "Inconsistência identificada",
        description:
          "O cálculo apontou insuficiência frente aos custos obrigatórios.",
        type: "system",
      },
      {
        id: "t9",
        date: "2026-03-12T14:33:00",
        title: "Reprovação interna",
        description:
          "A equipe técnica registrou reprovação da versão por risco alto e saldo negativo.",
        type: "decision",
      },
    ],
  },
  {
    id: "hist-004",
    analysisId: "7c2238a1-91aa-4f6c-87a2-1ef84b31cccc",
    versionNumber: 4,
    spreadsheetVersionId: 4,
    analysisType: "executability_v1",
    createdAt: "2026-03-13T08:40:00",
    updatedAt: "2026-03-13T08:48:00",
    requestedBy: "Cristina Dorneles",
    processingStatus: "processing",
    executabilityStatus: "pendente",
    riskLevel: "medium",
    scoreGlobal: 0,
    proposedTotalValue: 0,
    mandatoryCostTotal: 0,
    evidentiaryCostTotal: 0,
    retentionTotal: 0,
    executabilityBalance: 0,
    internalDecision: "pendente",
    shortDispatch:
      "Aguardando finalização do processamento para emissão de despacho.",
    technicalSummary: "Análise ainda em processamento.",
    technicalLegalSummary: "Análise ainda em processamento.",
    managerSummary: "Análise ainda em processamento.",
    recommendationSummary:
      "Aguardar conclusão do motor antes de deliberar.",
    timeline: [
      {
        id: "t10",
        date: "2026-03-13T08:40:00",
        title: "Processamento iniciado",
        description:
          "A versão 4 foi encaminhada ao pipeline de análise.",
        type: "analysis",
      },
    ],
  },
];

export const analysisStatusOptions: Array<{
  value: ExecutabilityStatus | "all";
  label: string;
}> = [
  { value: "all", label: "Todos os status" },
  { value: "exequivel", label: "Exequível" },
  { value: "exequivel_com_diligencia", label: "Exequível com diligência" },
  { value: "inexequivel", label: "Inexequível" },
  { value: "pendente", label: "Pendente" },
];

export const riskLevelOptions: Array<{
  value: RiskLevel | "all";
  label: string;
}> = [
  { value: "all", label: "Todos os riscos" },
  { value: "low", label: "Baixo" },
  { value: "medium", label: "Médio" },
  { value: "high", label: "Alto" },
];

export const internalDecisionOptions: Array<{
  value: InternalDecision | "all";
  label: string;
}> = [
  { value: "all", label: "Todas as decisões" },
  { value: "aprovado", label: "Aprovado" },
  { value: "aprovado_com_ressalvas", label: "Aprovado com ressalvas" },
  { value: "diligencia", label: "Diligência" },
  { value: "reprovado", label: "Reprovado" },
  { value: "pendente", label: "Pendente" },
];

export function buildMockAnalysisHistory(): AnalysisHistoryItem[] {
  return [...analysisHistoryMocks].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
