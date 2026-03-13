import { supabaseAi } from "../lib/supabaseAi";

export type AnalysisOpinionBundle = {
  analysis_id: string;
  meta: {
    interaction_id: string | null;
    session_id: string | null;
    spreadsheet_id: string;
    spreadsheet_version_id: number;
    analysis_type: string;
    analysis_processing_status: string;
    score_global: number | null;
    risk_level: string | null;
    summary_text: string | null;
  };
  numeric_summary: {
    proposed_total_value: number | null;
    mandatory_cost_total: number | null;
    evidentiary_cost_total: number | null;
    retention_total: number | null;
    executability_balance: number | null;
  };
  availability: {
    has_ementa: boolean;
    has_conclusao: boolean;
    has_fundamentacao_tecnica: boolean;
    has_fundamentacao_tecnico_juridica: boolean;
    has_versao_gestor_leigo: boolean;
    has_recomendacao_final: boolean;
    has_parecer_consolidado: boolean;
  };
  raw_analysis_json: Record<string, unknown>;
  ementa: {
    id: string | null;
    title: string | null;
    payload: Record<string, any>;
  };
  conclusao: {
    id: string | null;
    title: string | null;
    payload: Record<string, any>;
  };
  fundamentacao_tecnica: {
    id: string | null;
    title: string | null;
    payload: Record<string, any>;
  };
  fundamentacao_tecnico_juridica: {
    id: string | null;
    title: string | null;
    payload: Record<string, any>;
  };
  versao_gestor_leigo: {
    id: string | null;
    title: string | null;
    payload: Record<string, any>;
  };
  recomendacao_final: {
    id: string | null;
    title: string | null;
    payload: Record<string, any>;
  };
  parecer_consolidado: {
    id: string | null;
    title: string | null;
    payload: Record<string, any>;
  };
};

export async function getAnalysisOpinionBundle(
  analysisId: string
): Promise<AnalysisOpinionBundle> {
  const { data, error } = await supabaseAi.rpc(
    "fn_get_analysis_opinion_bundle",
    {
      p_analysis_id: analysisId,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data as AnalysisOpinionBundle;
}
