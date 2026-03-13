export type AnalysisHistoryItem = {
  analysisId: string;
  spreadsheetId?: string | null;
  spreadsheetVersionId?: number | string | null;
  analysisType?: string | null;
  processingStatus?: string | null;
  finalStatus?: string | null;
  executabilityStatus?: string | null;
  riskLevel?: string | null;
  scoreGlobal?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  isLatest?: boolean;
};

export type AnalysisExplanation = {
  explanationType: string;
  title: string;
  payload: string;
};

export type AnalysisDetail = {
  analysisId: string;
  spreadsheetId?: string | null;
  spreadsheetVersionId?: number | string | null;
  analysisType?: string | null;
  processingStatus?: string | null;
  finalStatus?: string | null;
  executabilityStatus?: string | null;
  riskLevel?: string | null;
  scoreGlobal?: number | null;
  proposedTotalValue?: number | null;
  mandatoryCostTotal?: number | null;
  evidentiaryCostTotal?: number | null;
  retentionTotal?: number | null;
  executabilityBalance?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  explanations?: AnalysisExplanation[];
};

export function buildMockAnalysisHistory(
  spreadsheetId: string
): AnalysisHistoryItem[] {
  return [
    {
      analysisId: `mock-analysis-${spreadsheetId}-3`,
      spreadsheetId,
      spreadsheetVersionId: 3,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "exequivel_com_diligencia",
      executabilityStatus: "exequivel_com_diligencia",
      riskLevel: "medium",
      scoreGlobal: 65,
      createdAt: "2026-03-13T09:10:00.000Z",
      updatedAt: "2026-03-13T09:12:00.000Z",
      isLatest: true,
    },
    {
      analysisId: `mock-analysis-${spreadsheetId}-2`,
      spreadsheetId,
      spreadsheetVersionId: 2,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "exequivel_com_ressalvas",
      executabilityStatus: "exequivel_com_ressalvas",
      riskLevel: "medium",
      scoreGlobal: 58,
      createdAt: "2026-03-12T18:20:00.000Z",
      updatedAt: "2026-03-12T18:22:00.000Z",
      isLatest: false,
    },
    {
      analysisId: `mock-analysis-${spreadsheetId}-1`,
      spreadsheetId,
      spreadsheetVersionId: 1,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "inexequivel",
      executabilityStatus: "inexequivel",
      riskLevel: "high",
      scoreGlobal: 39,
      createdAt: "2026-03-11T14:00:00.000Z",
      updatedAt: "2026-03-11T14:05:00.000Z",
      isLatest: false,
    },
  ];
}

export function buildMockAnalysisDetail(
  analysisId: string,
  spreadsheetId: string
): AnalysisDetail | null {
  const mockMap: Record<string, AnalysisDetail> = {
    [`mock-analysis-${spreadsheetId}-3`]: {
      analysisId: `mock-analysis-${spreadsheetId}-3`,
      spreadsheetId,
      spreadsheetVersionId: 3,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "exequivel_com_diligencia",
      executabilityStatus: "exequivel_com_diligencia",
      riskLevel: "medium",
      scoreGlobal: 65,
      proposedTotalValue: 3600,
      mandatoryCostTotal: 3200,
      evidentiaryCostTotal: 700,
      retentionTotal: 250,
      executabilityBalance: 150,
      createdAt: "2026-03-13T09:10:00.000Z",
      updatedAt: "2026-03-13T09:12:00.000Z",
      explanations: [
        {
          explanationType: "technical",
          title: "Fundamentação técnica",
          payload:
            "A composição global indica viabilidade material condicionada à diligência complementar. O valor proposto permanece superior ao custo obrigatório total, porém a margem é estreita e recomenda reforço documental sobre itens acessórios e critérios de formação do preço.",
        },
        {
          explanationType: "technical_legal",
          title: "Fundamentação técnico-jurídica",
          payload:
            "A análise sugere exequibilidade com diligência, pois não se identificou, nesta simulação, insuficiência absoluta para cobertura dos custos essenciais. Todavia, a robustez probatória da memória de cálculo ainda demanda aprimoramento para mitigar risco de questionamento futuro.",
        },
        {
          explanationType: "manager_friendly",
          title: "Versão para gestor leigo",
          payload:
            "A planilha parece viável, mas ainda precisa de alguns comprovantes e justificativas mais claras. Em outras palavras, o preço não está necessariamente errado, porém ainda não está forte o bastante para aprovação sem checagens adicionais.",
        },
        {
          explanationType: "recommendation",
          title: "Recomendação operacional final",
          payload:
            "Recomenda-se diligenciar memória de cálculo, encargos incidentes, critérios de rateio e documentos de suporte antes da emissão do parecer conclusivo definitivo.",
        },
      ],
    },
    [`mock-analysis-${spreadsheetId}-2`]: {
      analysisId: `mock-analysis-${spreadsheetId}-2`,
      spreadsheetId,
      spreadsheetVersionId: 2,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "exequivel_com_ressalvas",
      executabilityStatus: "exequivel_com_ressalvas",
      riskLevel: "medium",
      scoreGlobal: 58,
      proposedTotalValue: 3450,
      mandatoryCostTotal: 3180,
      evidentiaryCostTotal: 820,
      retentionTotal: 260,
      executabilityBalance: 10,
      createdAt: "2026-03-12T18:20:00.000Z",
      updatedAt: "2026-03-12T18:22:00.000Z",
      explanations: [
        {
          explanationType: "technical",
          title: "Fundamentação técnica",
          payload:
            "A versão intermediária da análise demonstra margem quase nula entre preço proposto e dispêndios mínimos estimados, o que sinaliza sensibilidade elevada a qualquer variação de encargos, insumos ou retenções.",
        },
        {
          explanationType: "technical_legal",
          title: "Fundamentação técnico-jurídica",
          payload:
            "Ainda que não haja inviabilidade automática, a margem residual reduzida recomenda cautela reforçada. O cenário sugere possibilidade de exequibilidade apenas sob premissas estritas e plenamente demonstradas.",
        },
        {
          explanationType: "manager_friendly",
          title: "Versão para gestor leigo",
          payload:
            "Nesta versão, a conta fecha por muito pouco. Isso significa que qualquer erro pequeno ou custo esquecido pode tornar a proposta problemática.",
        },
        {
          explanationType: "recommendation",
          title: "Recomendação operacional final",
          payload:
            "Não aprovar sem revisão da base de custos, da memória analítica e das evidências que sustentam a composição do preço final.",
        },
      ],
    },
    [`mock-analysis-${spreadsheetId}-1`]: {
      analysisId: `mock-analysis-${spreadsheetId}-1`,
      spreadsheetId,
      spreadsheetVersionId: 1,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "inexequivel",
      executabilityStatus: "inexequivel",
      riskLevel: "high",
      scoreGlobal: 39,
      proposedTotalValue: 2900,
      mandatoryCostTotal: 3250,
      evidentiaryCostTotal: 900,
      retentionTotal: 300,
      executabilityBalance: -650,
      createdAt: "2026-03-11T14:00:00.000Z",
      updatedAt: "2026-03-11T14:05:00.000Z",
      explanations: [
        {
          explanationType: "technical",
          title: "Fundamentação técnica",
          payload:
            "A versão inicial aponta insuficiência objetiva entre o montante proposto e o custo mínimo necessário à execução. O desequilíbrio compromete a sustentabilidade da contratação.",
        },
        {
          explanationType: "technical_legal",
          title: "Fundamentação técnico-jurídica",
          payload:
            "Na simulação desta análise, os elementos reunidos indicam forte indício de inexequibilidade, pois o preço não absorve adequadamente os custos essenciais e não há base probatória robusta capaz de afastar a inconsistência.",
        },
        {
          explanationType: "manager_friendly",
          title: "Versão para gestor leigo",
          payload:
            "Aqui a proposta está baixa demais para cobrir os custos mínimos. Em termos práticos, a tendência seria gerar problema na execução ou necessidade de ajuste posterior.",
        },
        {
          explanationType: "recommendation",
          title: "Recomendação operacional final",
          payload:
            "Recomenda-se não validar esta versão como apta, salvo se houver reconstrução relevante da composição de custos e nova rodada analítica.",
        },
      ],
    },
  };

  return mockMap[analysisId] ?? null;
}
