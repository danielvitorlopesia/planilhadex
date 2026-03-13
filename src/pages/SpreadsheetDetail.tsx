import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingFlatRoundedIcon from "@mui/icons-material/TrendingFlatRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  AnalysisDetail,
  AnalysisExplanation,
  AnalysisHistoryItem,
  ConsolidatedOpinion,
  buildMockAnalysisDetail,
  buildMockAnalysisHistory,
} from "../mocks/analysisHistoryMocks";

type SpreadsheetDetailData = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  category?: string | null;
  updatedAt?: string | null;
};

type DetailViewTab = "summary" | "comparison" | "opinion" | "explanations";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const ENABLE_MOCK_ANALYSIS_HISTORY = true;

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatLabel(value?: string | null): string {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRiskChipColor(
  riskLevel?: string | null
):
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "primary"
  | "secondary" {
  const value = (riskLevel || "").toLowerCase();

  if (value.includes("low") || value.includes("baixo")) return "success";
  if (value.includes("medium") || value.includes("médio") || value.includes("medio")) {
    return "warning";
  }
  if (value.includes("high") || value.includes("alto")) return "error";

  return "default";
}

function getStatusChipColor(
  status?: string | null
):
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "primary"
  | "secondary" {
  const value = (status || "").toLowerCase();

  if (
    value.includes("completed") ||
    value.includes("concluído") ||
    value.includes("concluido") ||
    value.includes("exequivel")
  ) {
    return "success";
  }

  if (
    value.includes("diligencia") ||
    value.includes("pendente") ||
    value.includes("warning") ||
    value.includes("ressalvas")
  ) {
    return "warning";
  }

  if (
    value.includes("erro") ||
    value.includes("error") ||
    value.includes("inexequivel")
  ) {
    return "error";
  }

  if (value.includes("processing") || value.includes("processando")) {
    return "info";
  }

  return "default";
}

function normalizeSpreadsheet(payload: any): SpreadsheetDetailData {
  const source =
    payload?.data ||
    payload?.spreadsheet ||
    payload?.item ||
    payload ||
    {};

  return {
    id: String(source.id ?? ""),
    title: source.title ?? source.name ?? source.nome ?? "Planilha sem título",
    description: source.description ?? source.descricao ?? null,
    status: source.status ?? source.situacao ?? null,
    category: source.category ?? source.categoria ?? null,
    updatedAt:
      source.updatedAt ?? source.updated_at ?? source.updatedat ?? null,
  };
}

function normalizeAnalysisHistory(payload: any): AnalysisHistoryItem[] {
  const rawList =
    payload?.data ||
    payload?.items ||
    payload?.analyses ||
    payload?.analysises ||
    payload?.history ||
    payload?.results ||
    payload ||
    [];

  if (!Array.isArray(rawList)) return [];

  return rawList.map((item: any, index: number) => ({
    analysisId: String(
      item.analysisId ??
        item.analysis_id ??
        item.id ??
        `analysis-${index + 1}`
    ),
    spreadsheetId: item.spreadsheetId ?? item.spreadsheet_id ?? null,
    spreadsheetVersionId:
      item.spreadsheetVersionId ?? item.spreadsheet_version_id ?? null,
    analysisType: item.analysisType ?? item.analysis_type ?? null,
    processingStatus: item.processingStatus ?? item.processing_status ?? null,
    finalStatus: item.finalStatus ?? item.final_status ?? null,
    executabilityStatus:
      item.executabilityStatus ?? item.executability_status ?? null,
    riskLevel: item.riskLevel ?? item.risk_level ?? null,
    scoreGlobal:
      item.scoreGlobal !== undefined && item.scoreGlobal !== null
        ? Number(item.scoreGlobal)
        : item.score_global !== undefined && item.score_global !== null
        ? Number(item.score_global)
        : null,
    createdAt: item.createdAt ?? item.created_at ?? null,
    updatedAt: item.updatedAt ?? item.updated_at ?? null,
    isLatest: Boolean(item.isLatest ?? item.is_latest ?? index === 0),
  }));
}

function normalizeAnalysisDetail(payload: any): AnalysisDetail {
  const source = payload?.data || payload?.analysis || payload || {};

  const explanationsRaw =
    source.explanations ||
    source.analysis_explanations ||
    source.explanation_bundle ||
    [];

  const explanations: AnalysisExplanation[] = Array.isArray(explanationsRaw)
    ? explanationsRaw.map((item: any) => ({
        explanationType:
          item.explanationType ?? item.explanation_type ?? "general",
        title: item.title ?? "Sem título",
        payload:
          typeof item.payload === "string"
            ? item.payload
            : JSON.stringify(item.payload ?? "", null, 2),
      }))
    : [];

  const consolidatedOpinionRaw =
    source.consolidatedOpinion ??
    source.consolidated_opinion ??
    null;

  const consolidatedOpinion: ConsolidatedOpinion | null =
    consolidatedOpinionRaw
      ? {
          ementa: consolidatedOpinionRaw.ementa ?? "",
          conclusao: consolidatedOpinionRaw.conclusao ?? "",
          fundamentacaoTecnica:
            consolidatedOpinionRaw.fundamentacaoTecnica ??
            consolidatedOpinionRaw.fundamentacao_tecnica ??
            "",
          fundamentacaoTecnicoJuridica:
            consolidatedOpinionRaw.fundamentacaoTecnicoJuridica ??
            consolidatedOpinionRaw.fundamentacao_tecnico_juridica ??
            "",
          versaoGestorLeigo:
            consolidatedOpinionRaw.versaoGestorLeigo ??
            consolidatedOpinionRaw.versao_gestor_leigo ??
            "",
          recomendacaoFinal:
            consolidatedOpinionRaw.recomendacaoFinal ??
            consolidatedOpinionRaw.recomendacao_final ??
            "",
        }
      : null;

  return {
    analysisId: String(source.analysisId ?? source.analysis_id ?? source.id ?? ""),
    spreadsheetId: source.spreadsheetId ?? source.spreadsheet_id ?? null,
    spreadsheetVersionId:
      source.spreadsheetVersionId ?? source.spreadsheet_version_id ?? null,
    analysisType: source.analysisType ?? source.analysis_type ?? null,
    processingStatus: source.processingStatus ?? source.processing_status ?? null,
    finalStatus: source.finalStatus ?? source.final_status ?? null,
    executabilityStatus:
      source.executabilityStatus ?? source.executability_status ?? null,
    riskLevel: source.riskLevel ?? source.risk_level ?? null,
    scoreGlobal:
      source.scoreGlobal !== undefined && source.scoreGlobal !== null
        ? Number(source.scoreGlobal)
        : source.score_global !== undefined && source.score_global !== null
        ? Number(source.score_global)
        : null,
    proposedTotalValue:
      source.proposedTotalValue !== undefined && source.proposedTotalValue !== null
        ? Number(source.proposedTotalValue)
        : source.proposed_total_value !== undefined &&
          source.proposed_total_value !== null
        ? Number(source.proposed_total_value)
        : null,
    mandatoryCostTotal:
      source.mandatoryCostTotal !== undefined && source.mandatoryCostTotal !== null
        ? Number(source.mandatoryCostTotal)
        : source.mandatory_cost_total !== undefined &&
          source.mandatory_cost_total !== null
        ? Number(source.mandatory_cost_total)
        : null,
    evidentiaryCostTotal:
      source.evidentiaryCostTotal !== undefined &&
      source.evidentiaryCostTotal !== null
        ? Number(source.evidentiaryCostTotal)
        : source.evidentiary_cost_total !== undefined &&
          source.evidentiary_cost_total !== null
        ? Number(source.evidentiary_cost_total)
        : null,
    retentionTotal:
      source.retentionTotal !== undefined && source.retentionTotal !== null
        ? Number(source.retentionTotal)
        : source.retention_total !== undefined && source.retention_total !== null
        ? Number(source.retention_total)
        : null,
    executabilityBalance:
      source.executabilityBalance !== undefined &&
      source.executabilityBalance !== null
        ? Number(source.executabilityBalance)
        : source.executability_balance !== undefined &&
          source.executability_balance !== null
        ? Number(source.executability_balance)
        : null,
    createdAt: source.createdAt ?? source.created_at ?? null,
    updatedAt: source.updatedAt ?? source.updated_at ?? null,
    explanations,
    consolidatedOpinion,
  };
}

async function fetchRequiredJson<T = any>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Falha ao carregar ${url}. Status ${response.status}. ${text || ""}`.trim()
    );
  }

  return response.json();
}

async function fetchOptionalJson<T = any>(url: string): Promise<T | null> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Falha ao carregar ${url}. Status ${response.status}. ${text || ""}`.trim()
    );
  }

  return response.json();
}

async function tryFetchFirstAvailable<T = any>(urls: string[]): Promise<T | null> {
  for (const url of urls) {
    const payload = await fetchOptionalJson<T>(url);
    if (payload !== null) {
      return payload;
    }
  }

  return null;
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
          {icon}
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Stack>

        <Typography variant="h6" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ExplanationBlock({
  explanation,
}: {
  explanation: AnalysisExplanation;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <DescriptionRoundedIcon fontSize="small" />
          <Typography variant="subtitle1" fontWeight={700}>
            {explanation.title}
          </Typography>
          <Chip
            size="small"
            label={formatLabel(explanation.explanationType)}
            variant="outlined"
          />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
        >
          {explanation.payload || "Sem conteúdo disponível."}
        </Typography>
      </CardContent>
    </Card>
  );
}

function OpinionSection({
  title,
  content,
}: {
  title: string;
  content?: string | null;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}
        >
          {content || "Conteúdo não disponível."}
        </Typography>
      </CardContent>
    </Card>
  );
}

function normalizeRiskOrder(risk?: string | null): number {
  const value = (risk || "").toLowerCase();

  if (value.includes("low") || value.includes("baixo")) return 1;
  if (value.includes("medium") || value.includes("médio") || value.includes("medio")) {
    return 2;
  }
  if (value.includes("high") || value.includes("alto")) return 3;

  return 0;
}

function normalizeStatusOrder(status?: string | null): number {
  const value = (status || "").toLowerCase();

  if (value.includes("inexequivel")) return 1;
  if (value.includes("ressalvas")) return 2;
  if (value.includes("diligencia")) return 3;
  if (value.includes("exequivel")) return 4;

  return 0;
}

function ComparisonRow({
  label,
  current,
  previous,
  direction,
}: {
  label: string;
  current: string;
  previous: string;
  direction: "up" | "down" | "same";
}) {
  const icon =
    direction === "up" ? (
      <TrendingUpRoundedIcon color="success" fontSize="small" />
    ) : direction === "down" ? (
      <TrendingDownRoundedIcon color="error" fontSize="small" />
    ) : (
      <TrendingFlatRoundedIcon color="disabled" fontSize="small" />
    );

  const chipColor =
    direction === "up"
      ? "success"
      : direction === "down"
      ? "error"
      : "default";

  const chipLabel =
    direction === "up"
      ? "Melhorou"
      : direction === "down"
      ? "Piorou"
      : "Sem mudança";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "180px 1fr 1fr auto" },
        gap: 1.5,
        alignItems: "center",
        py: 1.25,
      }}
    >
      <Typography variant="body2" fontWeight={700}>
        {label}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Atual: <strong>{current}</strong>
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Anterior: <strong>{previous}</strong>
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Chip size="small" label={chipLabel} color={chipColor} variant="outlined" />
      </Stack>
    </Box>
  );
}

function RightPanelHeader({
  currentTab,
  onChange,
}: {
  currentTab: DetailViewTab;
  onChange: (tab: DetailViewTab) => void;
}) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: "16px !important" }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={800}>
            Navegação da análise
          </Typography>

          <Tabs
            value={currentTab}
            onChange={(_, value: DetailViewTab) => onChange(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab
              value="summary"
              label="Resumo"
              icon={<DashboardRoundedIcon />}
              iconPosition="start"
            />
            <Tab
              value="comparison"
              label="Comparação"
              icon={<CompareArrowsRoundedIcon />}
              iconPosition="start"
            />
            <Tab
              value="opinion"
              label="Parecer"
              icon={<ArticleRoundedIcon />}
              iconPosition="start"
            />
            <Tab
              value="explanations"
              label="Explicações"
              icon={<NotesRoundedIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SpreadsheetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetDetailData | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [analysisDetail, setAnalysisDetail] = useState<AnalysisDetail | null>(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [historyWarning, setHistoryWarning] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [detailViewTab, setDetailViewTab] = useState<DetailViewTab>("summary");

  const selectedHistoryItem = useMemo(() => {
    return history.find((item) => item.analysisId === selectedAnalysisId) || null;
  }, [history, selectedAnalysisId]);

  const selectedHistoryIndex = useMemo(() => {
    return history.findIndex((item) => item.analysisId === selectedAnalysisId);
  }, [history, selectedAnalysisId]);

  const previousHistoryItem = useMemo(() => {
    if (selectedHistoryIndex < 0) return null;
    return history[selectedHistoryIndex + 1] || null;
  }, [history, selectedHistoryIndex]);

  const loadAnalysisDetail = useCallback(
    async (analysisId: string, spreadsheetIdForMock?: string, forceMock = false) => {
      setAnalysisLoading(true);

      try {
        if ((usingMockData || forceMock) && spreadsheetIdForMock) {
          const mockDetail = buildMockAnalysisDetail(analysisId, spreadsheetIdForMock);
          setAnalysisDetail(mockDetail);
          return;
        }

        const payload = await tryFetchFirstAvailable([
          buildUrl(`/api/analyses/${analysisId}`),
          buildUrl(`/api/analysis/${analysisId}`),
        ]);

        if (!payload) {
          if (ENABLE_MOCK_ANALYSIS_HISTORY && spreadsheetIdForMock) {
            const mockDetail = buildMockAnalysisDetail(analysisId, spreadsheetIdForMock);
            setAnalysisDetail(mockDetail);
            return;
          }

          setAnalysisDetail(null);
          return;
        }

        const normalized = normalizeAnalysisDetail(payload);
        setAnalysisDetail(normalized);
      } catch (err: any) {
        setPageError(
          err?.message ||
            "Não foi possível carregar os detalhes da análise selecionada."
        );
      } finally {
        setAnalysisLoading(false);
      }
    },
    [usingMockData]
  );

  const loadPage = useCallback(async () => {
    if (!id) {
      setPageError("ID da planilha não informado.");
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    setPageError(null);
    setHistoryWarning(null);

    try {
      const spreadsheetPayload = await fetchRequiredJson(
        buildUrl(`/api/spreadsheets/${id}`)
      );
      const normalizedSpreadsheet = normalizeSpreadsheet(spreadsheetPayload);
      setSpreadsheet(normalizedSpreadsheet);

      const historyPayload = await tryFetchFirstAvailable([
        buildUrl(`/api/spreadsheets/${id}/analyses`),
        buildUrl(`/api/spreadsheets/${id}/analysis`),
        buildUrl(`/api/analyses?spreadsheetId=${id}`),
        buildUrl(`/api/analysis?spreadsheetId=${id}`),
      ]);

      let normalizedHistory: AnalysisHistoryItem[] = [];

      if (historyPayload) {
        normalizedHistory = normalizeAnalysisHistory(historyPayload).sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
          const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
          return dateB - dateA;
        });
      }

      let useMock = false;

      if (normalizedHistory.length === 0 && ENABLE_MOCK_ANALYSIS_HISTORY) {
        normalizedHistory = buildMockAnalysisHistory(id);
        useMock = true;
        setUsingMockData(true);
        setHistoryWarning(
          "O backend ainda não possui histórico real. A tela está exibindo modelos simulados para teste visual."
        );
      } else if (normalizedHistory.length === 0) {
        setUsingMockData(false);
        setHistoryWarning(
          "O histórico de análises ainda não possui endpoint disponível no backend."
        );
      } else {
        setUsingMockData(false);
      }

      setHistory(normalizedHistory);

      const initialAnalysisId =
        normalizedHistory.find((item) => item.isLatest)?.analysisId ||
        normalizedHistory[0]?.analysisId ||
        null;

      setSelectedAnalysisId(initialAnalysisId);

      if (initialAnalysisId) {
        await loadAnalysisDetail(initialAnalysisId, id, useMock);
      } else {
        setAnalysisDetail(null);
      }
    } catch (err: any) {
      setPageError(
        err?.message || "Não foi possível carregar os dados da planilha."
      );
    } finally {
      setPageLoading(false);
    }
  }, [id, loadAnalysisDetail]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleSelectAnalysis = async (analysisId: string) => {
    if (!analysisId || analysisId === selectedAnalysisId || !id) return;

    setSelectedAnalysisId(analysisId);
    setPageError(null);
    await loadAnalysisDetail(analysisId, id);
  };

  const previousDetail = useMemo(() => {
    if (!id || !previousHistoryItem) return null;
    return buildMockAnalysisDetail(previousHistoryItem.analysisId, id);
  }, [id, previousHistoryItem]);

  const comparisonSummary = useMemo(() => {
    if (!analysisDetail || !previousHistoryItem || !previousDetail) return null;

    const currentStatus =
      analysisDetail.executabilityStatus || analysisDetail.finalStatus || null;
    const previousStatus =
      previousHistoryItem.executabilityStatus || previousHistoryItem.finalStatus || null;

    const currentScore = analysisDetail.scoreGlobal ?? null;
    const previousScore = previousHistoryItem.scoreGlobal ?? null;

    const scoreDirection =
      currentScore === null || previousScore === null
        ? "same"
        : currentScore > previousScore
        ? "up"
        : currentScore < previousScore
        ? "down"
        : "same";

    const currentRiskOrder = normalizeRiskOrder(analysisDetail.riskLevel);
    const previousRiskOrder = normalizeRiskOrder(previousHistoryItem.riskLevel);

    const riskDirection =
      currentRiskOrder === 0 || previousRiskOrder === 0
        ? "same"
        : currentRiskOrder < previousRiskOrder
        ? "up"
        : currentRiskOrder > previousRiskOrder
        ? "down"
        : "same";

    const currentStatusOrder = normalizeStatusOrder(currentStatus);
    const previousStatusOrder = normalizeStatusOrder(previousStatus);

    const statusDirection =
      currentStatusOrder === 0 || previousStatusOrder === 0
        ? "same"
        : currentStatusOrder > previousStatusOrder
        ? "up"
        : currentStatusOrder < previousStatusOrder
        ? "down"
        : "same";

    const currentBalance = analysisDetail.executabilityBalance;
    const previousBalance = previousDetail.executabilityBalance;

    const balanceDirection =
      currentBalance === null ||
      currentBalance === undefined ||
      previousBalance === null ||
      previousBalance === undefined
        ? "same"
        : currentBalance > previousBalance
        ? "up"
        : currentBalance < previousBalance
        ? "down"
        : "same";

    return {
      scoreDirection,
      riskDirection,
      statusDirection,
      balanceDirection,
    };
  }, [analysisDetail, previousDetail, previousHistoryItem]);

  useEffect(() => {
    setDetailViewTab("summary");
  }, [selectedAnalysisId]);

  if (pageLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body1" color="text.secondary">
            Carregando detalhes da planilha e histórico de análises...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
          >
            Voltar
          </Button>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {spreadsheet?.title || "Detalhes da planilha"}
            </Typography>

            <Typography variant="body2" color="text.secondary" noWrap>
              Histórico de análises, seleção de versões e leitura consolidada
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
            <Link component={RouterLink} underline="hover" color="inherit" to="/">
              Início
            </Link>
            <Typography color="text.primary">
              {spreadsheet?.title || "Planilha"}
            </Typography>
          </Breadcrumbs>

          {pageError ? <Alert severity="error">{pageError}</Alert> : null}
          {historyWarning ? <Alert severity="info">{historyWarning}</Alert> : null}

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={800} gutterBottom>
                      {spreadsheet?.title || "Planilha sem título"}
                    </Typography>

                    <Typography variant="body1" color="text.secondary">
                      {spreadsheet?.description || "Sem descrição cadastrada."}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    alignItems="flex-start"
                  >
                    <Chip
                      icon={<CategoryIcon />}
                      label={spreadsheet?.category || "Sem categoria"}
                      variant="outlined"
                    />
                    <Chip
                      icon={<FolderOpenIcon />}
                      label={spreadsheet?.status || "Sem status"}
                      color={getStatusChipColor(spreadsheet?.status)}
                    />
                    <Chip
                      icon={<CalendarMonthIcon />}
                      label={`Atualizada em ${formatDateTime(spreadsheet?.updatedAt)}`}
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "360px minmax(0, 1fr)" },
              gap: 3,
              alignItems: "start",
            }}
          >
            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <HistoryIcon fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Histórico de análises
                  </Typography>
                  <Chip size="small" label={history.length} />
                  {usingMockData ? (
                    <Chip size="small" color="warning" label="Mock" variant="outlined" />
                  ) : null}
                </Stack>
              </Box>

              {history.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <Alert severity="info" icon={<InfoOutlinedIcon />}>
                    Ainda não há análises registradas para esta planilha.
                  </Alert>
                </Box>
              ) : (
                <List disablePadding>
                  {history.map((item, index) => {
                    const selected = item.analysisId === selectedAnalysisId;

                    return (
                      <React.Fragment key={item.analysisId}>
                        <ListItemButton
                          selected={selected}
                          onClick={() => handleSelectAnalysis(item.analysisId)}
                          sx={{
                            alignItems: "flex-start",
                            py: 1.75,
                            px: 2,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack spacing={1}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  flexWrap="wrap"
                                  useFlexGap
                                >
                                  <Typography variant="body1" fontWeight={700}>
                                    {formatLabel(item.analysisType || "Análise")}
                                  </Typography>

                                  {item.isLatest ? (
                                    <Chip
                                      size="small"
                                      label="Mais recente"
                                      color="primary"
                                      variant={selected ? "filled" : "outlined"}
                                    />
                                  ) : null}

                                  <Chip
                                    size="small"
                                    label={formatLabel(
                                      item.executabilityStatus || item.finalStatus
                                    )}
                                    color={getStatusChipColor(
                                      item.executabilityStatus || item.finalStatus
                                    )}
                                    variant={selected ? "filled" : "outlined"}
                                  />
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  useFlexGap
                                >
                                  <Chip
                                    size="small"
                                    label={`Risco: ${formatLabel(item.riskLevel)}`}
                                    color={getRiskChipColor(item.riskLevel)}
                                    variant="outlined"
                                  />

                                  <Chip
                                    size="small"
                                    label={`Score: ${
                                      item.scoreGlobal !== null &&
                                      item.scoreGlobal !== undefined
                                        ? item.scoreGlobal
                                        : "—"
                                    }`}
                                    variant="outlined"
                                  />
                                </Stack>
                              </Stack>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Analysis ID: {item.analysisId}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  Versão da planilha:{" "}
                                  {item.spreadsheetVersionId ?? "—"}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  Criada em: {formatDateTime(item.createdAt)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>

                        {index < history.length - 1 ? <Divider /> : null}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Paper>

            <Stack spacing={3}>
              {analysisLoading ? (
                <Paper
                  variant="outlined"
                  sx={{
                    minHeight: 240,
                    display: "grid",
                    placeItems: "center",
                    p: 3,
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                      Carregando análise selecionada...
                    </Typography>
                  </Stack>
                </Paper>
              ) : analysisDetail ? (
                <>
                  <RightPanelHeader
                    currentTab={detailViewTab}
                    onChange={setDetailViewTab}
                  />

                  {detailViewTab === "summary" ? (
                    <>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack spacing={2.5}>
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              justifyContent="space-between"
                              spacing={2}
                            >
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                  <InsightsOutlinedIcon />
                                  <Typography variant="h6" fontWeight={800}>
                                    Análise selecionada
                                  </Typography>
                                </Stack>

                                <Typography variant="body2" color="text.secondary">
                                  Utilize este painel para revisar os principais
                                  metadados e indicadores da análise selecionada.
                                </Typography>
                              </Box>

                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                                alignItems="flex-start"
                              >
                                <Chip
                                  label={formatLabel(analysisDetail.analysisType)}
                                  variant="outlined"
                                />
                                <Chip
                                  label={formatLabel(
                                    analysisDetail.executabilityStatus ||
                                      analysisDetail.finalStatus
                                  )}
                                  color={getStatusChipColor(
                                    analysisDetail.executabilityStatus ||
                                      analysisDetail.finalStatus
                                  )}
                                />
                                <Chip
                                  label={`Risco: ${formatLabel(analysisDetail.riskLevel)}`}
                                  color={getRiskChipColor(analysisDetail.riskLevel)}
                                  variant="outlined"
                                />
                              </Stack>
                            </Stack>

                            <Divider />

                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                  xs: "1fr",
                                  sm: "repeat(2, minmax(0, 1fr))",
                                  xl: "repeat(4, minmax(0, 1fr))",
                                },
                                gap: 2,
                              }}
                            >
                              <MetricCard
                                title="Score global"
                                value={
                                  analysisDetail.scoreGlobal !== null &&
                                  analysisDetail.scoreGlobal !== undefined
                                    ? String(analysisDetail.scoreGlobal)
                                    : "—"
                                }
                                icon={<CheckCircleOutlineIcon fontSize="small" />}
                              />

                              <MetricCard
                                title="Valor proposto"
                                value={formatCurrency(analysisDetail.proposedTotalValue)}
                                icon={<SummarizeRoundedIcon fontSize="small" />}
                              />

                              <MetricCard
                                title="Custo obrigatório"
                                value={formatCurrency(analysisDetail.mandatoryCostTotal)}
                                icon={<GavelRoundedIcon fontSize="small" />}
                              />

                              <MetricCard
                                title="Saldo de exequibilidade"
                                value={formatCurrency(analysisDetail.executabilityBalance)}
                                icon={<WarningAmberRoundedIcon fontSize="small" />}
                              />
                            </Box>

                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                  xs: "1fr",
                                  md: "repeat(2, minmax(0, 1fr))",
                                },
                                gap: 2,
                              }}
                            >
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                    Metadados da análise
                                  </Typography>

                                  <Stack spacing={0.75}>
                                    <Typography variant="body2">
                                      <strong>Analysis ID:</strong> {analysisDetail.analysisId}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Versão da planilha:</strong>{" "}
                                      {analysisDetail.spreadsheetVersionId ?? "—"}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Tipo:</strong>{" "}
                                      {formatLabel(analysisDetail.analysisType)}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Processamento:</strong>{" "}
                                      {formatLabel(analysisDetail.processingStatus)}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Criada em:</strong>{" "}
                                      {formatDateTime(analysisDetail.createdAt)}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Atualizada em:</strong>{" "}
                                      {formatDateTime(analysisDetail.updatedAt)}
                                    </Typography>
                                  </Stack>
                                </CardContent>
                              </Card>

                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                    Totais auxiliares
                                  </Typography>

                                  <Stack spacing={0.75}>
                                    <Typography variant="body2">
                                      <strong>Custo evidenciário:</strong>{" "}
                                      {formatCurrency(analysisDetail.evidentiaryCostTotal)}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Retenções:</strong>{" "}
                                      {formatCurrency(analysisDetail.retentionTotal)}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Status final:</strong>{" "}
                                      {formatLabel(
                                        analysisDetail.executabilityStatus ||
                                          analysisDetail.finalStatus
                                      )}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Risco:</strong>{" "}
                                      {formatLabel(analysisDetail.riskLevel)}
                                    </Typography>
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>

                      {selectedHistoryItem ? (
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                              Resumo da seleção atual
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              Você está visualizando a análise{" "}
                              <strong>{selectedHistoryItem.analysisId}</strong>, vinculada à
                              versão{" "}
                              <strong>
                                {selectedHistoryItem.spreadsheetVersionId ?? "—"}
                              </strong>{" "}
                              da planilha, criada em{" "}
                              <strong>{formatDateTime(selectedHistoryItem.createdAt)}</strong>.
                            </Typography>
                          </CardContent>
                        </Card>
                      ) : null}
                    </>
                  ) : null}

                  {detailViewTab === "comparison" ? (
                    previousHistoryItem ? (
                      <Card variant="outlined">
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CompareArrowsRoundedIcon />
                              <Typography variant="h6" fontWeight={800}>
                                Comparação com a análise anterior
                              </Typography>
                            </Stack>

                            <Typography variant="body2" color="text.secondary">
                              Comparativo entre a análise selecionada e a versão
                              imediatamente anterior do histórico.
                            </Typography>

                            <Divider />

                            <ComparisonRow
                              label="Score global"
                              current={
                                analysisDetail.scoreGlobal !== null &&
                                analysisDetail.scoreGlobal !== undefined
                                  ? String(analysisDetail.scoreGlobal)
                                  : "—"
                              }
                              previous={
                                previousHistoryItem.scoreGlobal !== null &&
                                previousHistoryItem.scoreGlobal !== undefined
                                  ? String(previousHistoryItem.scoreGlobal)
                                  : "—"
                              }
                              direction={comparisonSummary?.scoreDirection || "same"}
                            />

                            <Divider />

                            <ComparisonRow
                              label="Saldo de exequibilidade"
                              current={formatCurrency(
                                analysisDetail.executabilityBalance
                              )}
                              previous={formatCurrency(
                                previousDetail?.executabilityBalance
                              )}
                              direction={comparisonSummary?.balanceDirection || "same"}
                            />

                            <Divider />

                            <ComparisonRow
                              label="Risco"
                              current={formatLabel(analysisDetail.riskLevel)}
                              previous={formatLabel(previousHistoryItem.riskLevel)}
                              direction={comparisonSummary?.riskDirection || "same"}
                            />

                            <Divider />

                            <ComparisonRow
                              label="Status final"
                              current={formatLabel(
                                analysisDetail.executabilityStatus ||
                                  analysisDetail.finalStatus
                              )}
                              previous={formatLabel(
                                previousHistoryItem.executabilityStatus ||
                                  previousHistoryItem.finalStatus
                              )}
                              direction={comparisonSummary?.statusDirection || "same"}
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    ) : (
                      <Alert severity="info">
                        Não existe análise anterior suficiente para comparação.
                      </Alert>
                    )
                  ) : null}

                  {detailViewTab === "opinion" ? (
                    <>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <ArticleRoundedIcon />
                              <Typography variant="h6" fontWeight={800}>
                                Parecer consolidado
                              </Typography>
                            </Stack>

                            <Typography variant="body2" color="text.secondary">
                              Estrutura consolidada da manifestação analítica da versão
                              selecionada, já organizada em linguagem técnica e executiva.
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>

                      <OpinionSection
                        title="Ementa"
                        content={analysisDetail.consolidatedOpinion?.ementa}
                      />

                      <OpinionSection
                        title="Conclusão"
                        content={analysisDetail.consolidatedOpinion?.conclusao}
                      />

                      <OpinionSection
                        title="Fundamentação técnica"
                        content={
                          analysisDetail.consolidatedOpinion?.fundamentacaoTecnica
                        }
                      />

                      <OpinionSection
                        title="Fundamentação técnico-jurídica"
                        content={
                          analysisDetail.consolidatedOpinion
                            ?.fundamentacaoTecnicoJuridica
                        }
                      />

                      <OpinionSection
                        title="Versão para gestor leigo"
                        content={
                          analysisDetail.consolidatedOpinion?.versaoGestorLeigo
                        }
                      />

                      <OpinionSection
                        title="Recomendação final"
                        content={analysisDetail.consolidatedOpinion?.recomendacaoFinal}
                      />
                    </>
                  ) : null}

                  {detailViewTab === "explanations" ? (
                    <Stack spacing={2}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <NotesRoundedIcon />
                            <Typography variant="h6" fontWeight={800}>
                              Explicações vinculadas à análise
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>

                      {analysisDetail.explanations &&
                      analysisDetail.explanations.length > 0 ? (
                        analysisDetail.explanations.map((explanation, index) => (
                          <ExplanationBlock
                            key={`${explanation.explanationType}-${index}`}
                            explanation={explanation}
                          />
                        ))
                      ) : (
                        <Alert severity="info">
                          Esta análise não possui explicações detalhadas disponíveis.
                        </Alert>
                      )}
                    </Stack>
                  ) : null}
                </>
              ) : (
                <Alert severity="info">
                  Nenhuma análise foi selecionada ou encontrada para esta planilha.
                </Alert>
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
