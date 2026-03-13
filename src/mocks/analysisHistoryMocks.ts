export type AnalysisHistoryItem = {
  analysisId: string;
  spreadsheetId: string | null;
  spreadsheetVersionId: number | null;
  analysisType: string | null;
  processingStatus: string | null;
  finalStatus: string | null;
  executabilityStatus: string | null;
  riskLevel: string | null;
  scoreGlobal: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  isLatest: boolean;
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
  spreadsheetId: string | null;
  spreadsheetVersionId: number | null;
  analysisType: string | null;
  processingStatus: string | null;
  finalStatus: string | null;
  executabilityStatus: string | null;
  riskLevel: string | null;
  scoreGlobal: number | null;
  proposedTotalValue: number | null;
  mandatoryCostTotal: number | null;
  evidentiaryCostTotal: number | null;
  retentionTotal: number | null;
  executabilityBalance: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  explanations: AnalysisExplanation[];
  consolidatedOpinion: ConsolidatedOpinion | null;
};

function buildOpinionForStatus(params: {
  version: number;
  status: string;
  risk: string;
  score: number | null;
  balance: number | null;
}): ConsolidatedOpinion {
  const { version, status, risk, score, balance } = params;

  const saldoFormatado =
    balance === null || balance === undefined
      ? "não apurado"
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(balance);

  return {
    ementa:
      `Análise automatizada de exequibilidade da versão ${version} da planilha, ` +
      `com enquadramento material em "${status}", risco "${risk}" ` +
      `e score global ${score ?? "não disponível"}.`,

    conclusao:
      status === "exequivel"
        ? `A versão ${version} apresenta, em leitura sintética, condições favoráveis de prosseguimento, com saldo de exequibilidade ${saldoFormatado}.`
        : status === "exequivel_com_diligencia"
        ? `A versão ${version} pode prosseguir, porém depende de saneamento complementar e reforço documental, sobretudo para sustentar o saldo identificado de ${saldoFormatado}.`
        : status === "inexequivel"
        ? `A versão ${version} não demonstra sustentação econômica suficiente, indicando inviabilidade material diante do saldo apurado de ${saldoFormatado}.`
        : `A versão ${version} ainda depende de conclusão do processamento para definição conclusiva.`,

    fundamentacaoTecnica:
      status === "exequivel"
        ? "Os indicadores quantitativos apontam compatibilidade entre o preço proposto e a estrutura mínima de custos identificada, com margem operacional mais segura que as versões anteriores."
        : status === "exequivel_com_diligencia"
        ? "Os indicadores técnicos demonstram viabilidade condicionada, porém com folga reduzida e necessidade de robustecimento de memória de cálculo, evidências auxiliares e consistência documental."
        : status === "inexequivel"
        ? "Os valores propostos não absorvem satisfatoriamente os custos mínimos estruturantes, revelando desequilíbrio material e risco relevante de comprometimento da execução."
        : "Os cálculos ainda estão em fase de processamento, sem base técnica consolidada para emissão de conclusão definitiva.",

    fundamentacaoTecnicoJuridica:
      status === "exequivel"
        ? "Sob perspectiva técnico-jurídica, a modelagem apresenta menor exposição a questionamentos sobre exequibilidade, desde que mantidas as premissas declaradas e os documentos de suporte."
        : status === "exequivel_com_diligencia"
        ? "Sob o enfoque técnico-jurídico, recomenda-se diligência saneadora antes de validação conclusiva, a fim de reduzir fragilidades probatórias e mitigar risco de impugnação futura."
        : status === "inexequivel"
        ? "Há risco jurídico relevante associado à aprovação desta versão sem revisão estrutural, especialmente por insuficiência aparente do preço frente aos componentes mínimos da composição."
        : "Enquanto o processamento não for concluído, não há substrato técnico-jurídico suficiente para consolidação do parecer.",

    versaoGestorLeigo:
      status === "exequivel"
        ? "Em termos simples: esta versão está mais segura e parece sustentável para seguir."
        : status === "exequivel_com_diligencia"
        ? "Em termos simples: esta versão pode seguir, mas precisa de pequenos ajustes e documentos de reforço antes da aprovação final."
        : status === "inexequivel"
        ? "Em termos simples: esta versão não fecha a conta e não deve seguir como está."
        : "Em termos simples: a análise ainda não terminou.",

    recomendacaoFinal:
      status === "exequivel"
        ? "Prosseguir com esta versão como base preferencial do histórico."
        : status === "exequivel_com_diligencia"
        ? "Prosseguir apenas mediante diligência saneadora e revisão pontual dos elementos de suporte."
        : status === "inexequivel"
        ? "Retornar a composição para reestruturação integral antes de nova submissão."
        : "Aguardar finalização do pipeline analítico antes de qualquer deliberação.",
  };
}

function buildExplanations(params: {
  status: string;
  version: number;
  score: number | null;
  balance: number | null;
}): AnalysisExplanation[] {
  const { status, version, score, balance } = params;

  const saldoFormatado =
    balance === null || balance === undefined
      ? "não disponível"
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(balance);

  return [
    {
      explanationType: "technical",
      title: "Leitura técnica da exequibilidade",
      payload:
        status === "exequivel"
          ? `A versão ${version} apresenta score ${score ?? "não informado"} e saldo ${saldoFormatado}, sugerindo compatibilidade entre o preço proposto e a estrutura mínima de custos.`
          : status === "exequivel_com_diligencia"
          ? `A versão ${version} apresenta score ${score ?? "não informado"} e saldo ${saldoFormatado}, com viabilidade condicionada à complementação de memória de cálculo e evidências.`
          : status === "inexequivel"
          ? `A versão ${version} apresenta score ${score ?? "não informado"} e saldo ${saldoFormatado}, indicando insuficiência material para sustentar a composição proposta.`
          : `A versão ${version} ainda se encontra em processamento, sem leitura técnica conclusiva.`,
    },
    {
      explanationType: "technical_legal",
      title: "Leitura técnico-jurídica",
      payload:
        status === "exequivel"
          ? "A análise sinaliza aderência mais consistente aos parâmetros mínimos de sustentação econômica, com menor risco de questionamento posterior."
          : status === "exequivel_com_diligencia"
          ? "A aprovação depende de diligência saneadora, a fim de reduzir fragilidades documentais e reforçar a motivação técnica da decisão."
          : status === "inexequivel"
          ? "A manutenção desta versão sem ajuste estrutural amplia o risco de impugnação e de comprometimento da futura execução contratual."
          : "Sem conclusão técnico-jurídica até o encerramento do processamento.",
    },
    {
      explanationType: "manager_friendly",
      title: "Versão gerencial simplificada",
      payload:
        status === "exequivel"
          ? "Resumo: a versão está melhor equilibrada e pode seguir."
          : status === "exequivel_com_diligencia"
          ? "Resumo: a versão pode seguir, mas precisa de ajustes e documentos de reforço."
          : status === "inexequivel"
          ? "Resumo: a versão não sustenta os custos mínimos e precisa ser refeita."
          : "Resumo: ainda é preciso aguardar o sistema concluir a análise.",
    },
    {
      explanationType: "recommendation",
      title: "Recomendação operacional",
      payload:
        status === "exequivel"
          ? "Encaminhar esta versão como principal referência do histórico analítico."
          : status === "exequivel_com_diligencia"
          ? "Emitir diligência saneadora focada em memória de cálculo, documentação e justificativa do equilíbrio final."
          : status === "inexequivel"
          ? "Impedir o prosseguimento da versão e retornar para reestruturação completa."
          : "Monitorar o processamento e reabrir a análise após conclusão.",
    },
  ];
}

const MOCK_HISTORY_BY_SPREADSHEET: Record<string, AnalysisHistoryItem[]> = {
  "1": [
    {
      analysisId: "9ad0fc6f-be95-4655-8c48-9b55c8e0a222",
      spreadsheetId: "1",
      spreadsheetVersionId: 1,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "completed",
      executabilityStatus: "exequivel_com_diligencia",
      riskLevel: "medium",
      scoreGlobal: 65,
      createdAt: "2026-03-10T09:15:00",
      updatedAt: "2026-03-10T09:24:00",
      isLatest: false,
    },
    {
      analysisId: "1f10ea56-3f6f-4d62-b5ef-52d1e2a111aa",
      spreadsheetId: "1",
      spreadsheetVersionId: 2,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "completed",
      executabilityStatus: "exequivel",
      riskLevel: "low",
      scoreGlobal: 81,
      createdAt: "2026-03-11T10:05:00",
      updatedAt: "2026-03-11T10:14:00",
      isLatest: false,
    },
    {
      analysisId: "5f8cc201-6409-4af6-8c11-2d65a7b2bbbb",
      spreadsheetId: "1",
      spreadsheetVersionId: 3,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "completed",
      executabilityStatus: "inexequivel",
      riskLevel: "high",
      scoreGlobal: 38,
      createdAt: "2026-03-12T14:20:00",
      updatedAt: "2026-03-12T14:33:00",
      isLatest: false,
    },
    {
      analysisId: "7c2238a1-91aa-4f6c-87a2-1ef84b31cccc",
      spreadsheetId: "1",
      spreadsheetVersionId: 4,
      analysisType: "executability_v1",
      processingStatus: "processing",
      finalStatus: "pending",
      executabilityStatus: "pendente",
      riskLevel: "medium",
      scoreGlobal: 0,
      createdAt: "2026-03-13T08:40:00",
      updatedAt: "2026-03-13T08:48:00",
      isLatest: true,
    },
  ],
};

function buildFallbackHistory(spreadsheetId: string): AnalysisHistoryItem[] {
  return [
    {
      analysisId: `${spreadsheetId}-analysis-v1`,
      spreadsheetId,
      spreadsheetVersionId: 1,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "completed",
      executabilityStatus: "exequivel_com_diligencia",
      riskLevel: "medium",
      scoreGlobal: 65,
      createdAt: "2026-03-10T09:15:00",
      updatedAt: "2026-03-10T09:24:00",
      isLatest: false,
    },
    {
      analysisId: `${spreadsheetId}-analysis-v2`,
      spreadsheetId,
      spreadsheetVersionId: 2,
      analysisType: "executability_v1",
      processingStatus: "completed",
      finalStatus: "completed",
      executabilityStatus: "exequivel",
      riskLevel: "low",
      scoreGlobal: 81,
      createdAt: "2026-03-11T10:05:00",
      updatedAt: "2026-03-11T10:14:00",
      isLatest: true,
    },
  ];
}

export function buildMockAnalysisHistory(
  spreadsheetId: string
): AnalysisHistoryItem[] {
  const history =
    MOCK_HISTORY_BY_SPREADSHEET[spreadsheetId] || buildFallbackHistory(spreadsheetId);

  return [...history].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
    const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
    return dateB - dateA;
  });
}

export function buildMockAnalysisDetail(
  analysisId: string,
  spreadsheetId: string
): AnalysisDetail {
  const history = buildMockAnalysisHistory(spreadsheetId);
  const base =
    history.find((item) => item.analysisId === analysisId) || history[0] || null;

  if (!base) {
    return {
      analysisId,
      spreadsheetId,
      spreadsheetVersionId: null,
      analysisType: "executability_v1",
      processingStatus: "pending",
      finalStatus: "pending",
      executabilityStatus: "pendente",
      riskLevel: "medium",
      scoreGlobal: null,
      proposedTotalValue: null,
      mandatoryCostTotal: null,
      evidentiaryCostTotal: null,
      retentionTotal: null,
      executabilityBalance: null,
      createdAt: null,
      updatedAt: null,
      explanations: [],
      consolidatedOpinion: null,
    };
  }

  const version = base.spreadsheetVersionId ?? 1;
  const status = base.executabilityStatus || base.finalStatus || "pendente";

  let proposedTotalValue: number | null = null;
  let mandatoryCostTotal: number | null = null;
  let evidentiaryCostTotal: number | null = null;
  let retentionTotal: number | null = null;
  let executabilityBalance: number | null = null;

  if (version === 1) {
    proposedTotalValue = 3600;
    mandatoryCostTotal = 3200;
    evidentiaryCostTotal = 700;
    retentionTotal = 250;
    executabilityBalance = 150;
  } else if (version === 2) {
    proposedTotalValue = 4100;
    mandatoryCostTotal = 3200;
    evidentiaryCostTotal = 500;
    retentionTotal = 250;
    executabilityBalance = 650;
  } else if (version === 3) {
    proposedTotalValue = 2800;
    mandatoryCostTotal = 3200;
    evidentiaryCostTotal = 600;
    retentionTotal = 250;
    executabilityBalance = -1050;
  } else if (version === 4) {
    proposedTotalValue = 0;
    mandatoryCostTotal = 0;
    evidentiaryCostTotal = 0;
    retentionTotal = 0;
    executabilityBalance = 0;
  } else {
    proposedTotalValue = 3900;
    mandatoryCostTotal = 3200;
    evidentiaryCostTotal = 450;
    retentionTotal = 250;
    executabilityBalance = 450;
  }

  return {
    analysisId: base.analysisId,
    spreadsheetId: base.spreadsheetId,
    spreadsheetVersionId: base.spreadsheetVersionId,
    analysisType: base.analysisType,
    processingStatus: base.processingStatus,
    finalStatus: base.finalStatus,
    executabilityStatus: base.executabilityStatus,
    riskLevel: base.riskLevel,
    scoreGlobal: base.scoreGlobal,
    proposedTotalValue,
    mandatoryCostTotal,
    evidentiaryCostTotal,
    retentionTotal,
    executabilityBalance,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
    explanations: buildExplanations({
      status,
      version,
      score: base.scoreGlobal,
      balance: executabilityBalance,
    }),
    consolidatedOpinion: buildOpinionForStatus({
      version,
      status,
      risk: base.riskLevel || "medium",
      score: base.scoreGlobal,
      balance: executabilityBalance,
    }),
  };
}
