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

export type ConsolidatedOpinion = {
  ementa: string;
  conclusao: string;
  fundamentacaoTecnica: string;
  fundamentacaoTecnicoJuridica: string;
  versaoGestorLeigo: string;
  recomendacaoFinal: string;
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
  consolidatedOpinion?: ConsolidatedOpinion | null;
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
      consolidatedOpinion: {
        ementa:
          "Análise de exequibilidade com resultado materialmente favorável, condicionada à complementação documental e ao saneamento das premissas de composição do preço.",
        conclusao:
          "Conclui-se, nesta simulação, pela exequibilidade com diligência, uma vez que o valor proposto supera o custo obrigatório total, embora a margem remanescente permaneça moderada e demande robustecimento da base probatória.",
        fundamentacaoTecnica:
          "Sob a ótica estritamente técnica, a planilha apresenta compatibilidade mínima entre o valor proposto e os custos essenciais identificados. Ainda assim, a margem de exequibilidade não é folgada, o que exige conferência de encargos, critérios de rateio, retenções e aderência da memória de cálculo aos parâmetros considerados.",
        fundamentacaoTecnicoJuridica:
          "Em perspectiva técnico-jurídica, a manutenção da proposta depende da adequada demonstração dos elementos que sustentam a exequibilidade, de modo a reduzir o risco de questionamento futuro quanto à suficiência da composição de custos e à consistência da justificativa apresentada.",
        versaoGestorLeigo:
          "A proposta parece viável, mas ainda precisa estar melhor explicada e documentada. O preço cobre o mínimo necessário, porém a segurança da análise ainda depende de comprovações adicionais.",
        recomendacaoFinal:
          "Recomenda-se diligência complementar antes da aprovação conclusiva, com reforço da memória de cálculo, dos documentos de suporte e da justificativa dos componentes sensíveis do preço.",
      },
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
      consolidatedOpinion: {
        ementa:
          "Análise com exequibilidade formalmente possível, porém com margem residual reduzida e necessidade de revisão cautelosa dos elementos de sustentação do preço.",
        conclusao:
          "Conclui-se pela exequibilidade com ressalvas, considerando que a proposta ainda se mantém, em tese, acima do custo mínimo estimado, mas com folga praticamente inexistente.",
        fundamentacaoTecnica:
          "A aproximação entre o valor proposto e o custo obrigatório total indica vulnerabilidade elevada da composição. Pequenas oscilações em encargos, insumos ou premissas de cálculo são suficientes para comprometer o equilíbrio material da proposta.",
        fundamentacaoTecnicoJuridica:
          "Em leitura técnico-jurídica, a proposta exige motivação reforçada e documentação robusta, pois a margem reduzida acentua o potencial de controvérsia sobre a efetiva suficiência econômica da planilha.",
        versaoGestorLeigo:
          "A conta praticamente fecha no limite. Isso quer dizer que a proposta não está automaticamente errada, mas qualquer detalhe mal calculado pode gerar problema depois.",
        recomendacaoFinal:
          "Recomenda-se revisão da composição analítica, saneamento das premissas críticas e reforço das evidências antes de qualquer validação definitiva.",
      },
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
      consolidatedOpinion: {
        ementa:
          "Análise com indicativo consistente de inexequibilidade material, em razão da insuficiência do valor proposto frente aos custos essenciais estimados.",
        conclusao:
          "Conclui-se pela inexequibilidade da versão analisada, pois o preço proposto não comporta adequadamente os custos mínimos necessários à execução.",
        fundamentacaoTecnica:
          "Os dados simulados revelam desequilíbrio objetivo entre o valor ofertado e o custo obrigatório total, resultando em saldo negativo de exequibilidade e comprometendo a sustentabilidade da proposta.",
        fundamentacaoTecnicoJuridica:
          "Sob prisma técnico-jurídico, a insuficiência material da composição de custos, associada à ausência de base probatória apta a justificar a divergência, reforça o indicativo de inviabilidade da proposta nesta configuração.",
        versaoGestorLeigo:
          "O preço está baixo demais para cobrir o mínimo necessário. Na prática, isso indica grande chance de problema na execução ou de que a proposta precise ser refeita.",
        recomendacaoFinal:
          "Recomenda-se não validar esta versão, salvo se houver reestruturação relevante da composição de custos e nova rodada de análise.",
      },
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
