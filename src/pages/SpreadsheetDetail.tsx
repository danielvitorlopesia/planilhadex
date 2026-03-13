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
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

type SpreadsheetDetailData = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  category?: string | null;
  updatedAt?: string | null;
};

type AnalysisHistoryItem = {
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

type AnalysisExplanation = {
  explanationType: string;
  title: string;
  payload: string;
};

type AnalysisDetail = {
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

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
    value.includes("warning")
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
    title:
      source.title ??
      source.name ??
      source.nome ??
      "Planilha sem título",
    description:
      source.description ??
      source.descricao ??
      null,
    status:
      source.status ??
      source.situacao ??
      null,
    category:
      source.category ??
      source.categoria ??
      null,
    updatedAt:
      source.updatedAt ??
      source.updated_at ??
      source.updatedat ??
      null,
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

  const selectedHistoryItem = useMemo(() => {
    return history.find((item) => item.analysisId === selectedAnalysisId) || null;
  }, [history, selectedAnalysisId]);

  const loadAnalysisDetail = useCallback(async (analysisId: string) => {
    setAnalysisLoading(true);

    try {
      const payload = await tryFetchFirstAvailable([
        buildUrl(`/api/analyses/${analysisId}`),
        buildUrl(`/api/analysis/${analysisId}`),
      ]);

      if (!payload) {
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
  }, []);

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

      if (!historyPayload) {
        setHistory([]);
        setSelectedAnalysisId(null);
        setAnalysisDetail(null);
        setHistoryWarning(
          "O histórico de análises ainda não possui endpoint disponível no backend."
        );
        return;
      }

      const normalizedHistory = normalizeAnalysisHistory(historyPayload).sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      });

      setHistory(normalizedHistory);

      const initialAnalysisId =
        normalizedHistory.find((item) => item.isLatest)?.analysisId ||
        normalizedHistory[0]?.analysisId ||
        null;

      setSelectedAnalysisId(initialAnalysisId);

      if (initialAnalysisId) {
        await loadAnalysisDetail(initialAnalysisId);
      } else {
        setAnalysisDetail(null);
      }
    } catch (err: any) {
      setPageError(
        err?.message ||
          "Não foi possível carregar os dados da planilha."
      );
    } finally {
      setPageLoading(false);
    }
  }, [id, loadAnalysisDetail]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleSelectAnalysis = async (analysisId: string) => {
    if (!analysisId || analysisId === selectedAnalysisId) return;

    setSelectedAnalysisId(analysisId);
    setPageError(null);
    await loadAnalysisDetail(analysisId);
  };

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
                              Utilize este painel para revisar análises anteriores da
                              mesma planilha e comparar o racional já emitido ao longo
                              do histórico.
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

                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={800}>
                      Explicações vinculadas à análise
                    </Typography>

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
                </>
              ) : (
                <Alert severity="info">
                  Nenhuma análise foi selecionada ou encontrada para esta planilha.
                </Alert>
              )}

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
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
