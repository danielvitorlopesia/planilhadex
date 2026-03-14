export interface AnalysisHistoryItem {
  analysisId: string;
  spreadsheetId: string;
  spreadsheetVersionId: number;
  spreadsheetVersionLabel: string;
  analysisType: string;
  scoreGlobal: number;
  riskLevel: "low" | "medium" | "high";
  createdAt: string;
  isLatest?: boolean;
}

export interface ConsolidatedOpinion {
  ementa: string;
  conclusao: string;
}

export interface AnalysisDetail {
  analysis: AnalysisHistoryItem;
  consolidatedOpinion: ConsolidatedOpinion;
}

const HISTORY: AnalysisHistoryItem[] = [
  {
    analysisId: "9ad0fc6f-be95-4655-8c48-9b55c8e0a222",
    spreadsheetId: "30db5807-27ac-412d-909b-306fdc54ba43",
    spreadsheetVersionId: 1,
    spreadsheetVersionLabel: "Versão 1",
    analysisType: "executability_v1",
    scoreGlobal: 65,
    riskLevel: "medium",
    createdAt: "2026-03-13",
  },
  {
    analysisId: "d03a2e84-1f3f-4781-9d40-0f5a2a0f1001",
    spreadsheetId: "30db5807-27ac-412d-909b-306fdc54ba43",
    spreadsheetVersionId: 2,
    spreadsheetVersionLabel: "Versão 2",
    analysisType: "executability_v1",
    scoreGlobal: 82,
    riskLevel: "low",
    createdAt: "2026-03-14",
    isLatest: true,
  },
];

export function buildMockAnalysisHistory(
  spreadsheetId?: string
): AnalysisHistoryItem[] {
  if (!spreadsheetId) return HISTORY;
  return HISTORY.filter((i) => i.spreadsheetId === spreadsheetId);
}

export function buildMockAnalysisDetail(
  analysisId?: string | null
): AnalysisDetail {
  const analysis =
    HISTORY.find((i) => i.analysisId === analysisId) ||
    HISTORY.find((i) => i.isLatest) ||
    HISTORY[0];

  return {
    analysis,
    consolidatedOpinion: {
      ementa: "Análise automática de exequibilidade.",
      conclusao:
        analysis.riskLevel === "low"
          ? "Planilha considerada exequível."
          : "Planilha exige diligência complementar.",
    },
  };
}