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
  Stack,
  Toolbar,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import EditNoteIcon from "@mui/icons-material/EditNote";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import HistoryIcon from "@mui/icons-material/History";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import { useNavigate, useParams } from "react-router-dom";
import { getSpreadsheetById } from "../lib/api";
import { getStatusStyles } from "./Home";
import { SpreadsheetDetailData } from "../types/spreadsheet";
import { useAuth } from "../auth/AuthContext";
import ExecutabilityOpinionView, {
  DEMO_DOCUMENT,
  type ExecutabilityOpinionDocument,
} from "../components/ExecutabilityOpinionView";
import {
  getLatestAnalysisOpinionBundleBySpreadsheetId,
  listExecutabilityAnalysesBySpreadsheetId,
  type AnalysisOpinionBundle,
  type ExecutabilityAnalysisListItem,
} from "../services/analysisOpinions";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("pt-BR");
}

function resolveRealSpreadsheetId(
  data: SpreadsheetDetailData | null,
  routeId: string | undefined
): string | null {
  const candidates = [
    data?.spreadsheet_id,
    data?.spreadsheetId,
    data?.id,
    routeId,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
}

function extractTextFromPayload(payload: Record<string, any> | undefined | null) {
  if (!payload || typeof payload !== "object") return "";
  return payload.texto || payload.text || payload.content || payload.summary || "";
}

function buildOpinionDocumentFromBundle(
  bundle: AnalysisOpinionBundle
): ExecutabilityOpinionDocument {
  const generatedAt =
    (bundle.parecer_consolidado?.payload?.generated_at as string | undefined) ||
    (bundle.raw_analysis_json?.generated_at as string | undefined) ||
    new Date().toISOString();

  const analysisId = bundle.analysis_id;
  const spreadsheetId = bundle.meta?.spreadsheet_id || "";
  const spreadsheetVersionId = Number(bundle.meta?.spreadsheet_version_id || 1);

  return {
    header: {
      title: "Parecer Consolidado de Exequibilidade",
      subtitle:
        bundle.meta?.summary_text ||
        "Documento estruturado a partir do bundle consolidado de análise.",
      opinion_id: bundle.parecer_consolidado?.id || `bundle-${analysisId}`,
      executability_analysis_id: analysisId,
      spreadsheet_id: spreadsheetId,
      spreadsheet_version_id: spreadsheetVersionId,
      generated_at: generatedAt,
    },
    sections: [
      {
        key: "ementa",
        title: bundle.ementa?.title || "Ementa",
        content: extractTextFromPayload(bundle.ementa?.payload),
        sort_order: 1,
      },
      {
        key: "conclusao",
        title: bundle.conclusao?.title || "Conclusão",
        content: extractTextFromPayload(bundle.conclusao?.payload),
        sort_order: 2,
      },
      {
        key: "fundamentacao_tecnica",
        title: bundle.fundamentacao_tecnica?.title || "Fundamentação Técnica",
        content: extractTextFromPayload(bundle.fundamentacao_tecnica?.payload),
        sort_order: 3,
      },
      {
        key: "fundamentacao_tecnico_juridica",
        title:
          bundle.fundamentacao_tecnico_juridica?.title ||
          "Fundamentação Técnico-Jurídica",
        content: extractTextFromPayload(
          bundle.fundamentacao_tecnico_juridica?.payload
        ),
        sort_order: 4,
      },
      {
        key: "versao_gestor_leigo",
        title: bundle.versao_gestor_leigo?.title || "Versão para Gestor Leigo",
        content: extractTextFromPayload(bundle.versao_gestor_leigo?.payload),
        sort_order: 5,
      },
      {
        key: "recomendacao_final",
        title: bundle.recomendacao_final?.title || "Recomendação Final",
        content: extractTextFromPayload(bundle.recomendacao_final?.payload),
        sort_order: 6,
      },
    ].filter((section) => section.content && section.content.trim()),
  };
}

export default function SpreadsheetDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { logout, user } = useAuth();

  const [data, setData] = useState<SpreadsheetDetailData | null>(null);
  const [opinionDocument, setOpinionDocument] =
    useState<ExecutabilityOpinionDocument | null>(null);
  const [bundle, setBundle] = useState<AnalysisOpinionBundle | null>(null);
  const [analyses, setAnalyses] = useState<ExecutabilityAnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [technicalError, setTechnicalError] = useState("");

  const loadDetail = useCallback(async () => {
    if (!id) {
      setError("Identificador inválido.");
      setTechnicalError("A rota foi aberta sem um parâmetro de ID válido.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setTechnicalError("");
      setBundle(null);
      setAnalyses([]);

      const response = await getSpreadsheetById(id);
      setData(response);

      const realSpreadsheetId = resolveRealSpreadsheetId(response, id);

      if (!realSpreadsheetId) {
        setTechnicalError(
          "Não foi possível resolver o identificador efetivo da planilha para consultar o parecer consolidado."
        );
        setOpinionDocument(null);
        setBundle(null);
        setAnalyses([]);
        return;
      }

      const [opinionBundle, analysisHistory] = await Promise.all([
        getLatestAnalysisOpinionBundleBySpreadsheetId(realSpreadsheetId),
        listExecutabilityAnalysesBySpreadsheetId(realSpreadsheetId),
      ]);

      setAnalyses(analysisHistory);

      if (!opinionBundle) {
        setTechnicalError(
          "Nenhuma análise de exequibilidade foi localizada para a planilha selecionada."
        );
        setOpinionDocument(null);
        setBundle(null);
        return;
      }

      setBundle(opinionBundle);
      setOpinionDocument(buildOpinionDocumentFromBundle(opinionBundle));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o detalhe da planilha.";

      setError("Não foi possível carregar o detalhe da planilha.");
      setTechnicalError(message);
      setData(null);
      setOpinionDocument(null);
      setBundle(null);
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const totalGeral = useMemo(() => {
    if (!data) return 0;
    return data.rows.reduce((acc, row) => acc + row.subtotal, 0);
  }, [data]);

  const itensConferidos = useMemo(() => {
    if (!data) return 0;
    return data.rows.filter((row) => {
      const status = row.status.toLowerCase();
      return (
        status === "conferido" ||
        status === "concluído" ||
        status === "concluido"
      );
    }).length;
  }, [data]);

  const percentualConferencia = useMemo(() => {
    if (!data || data.rows.length === 0) return 0;
    return Math.round((itensConferidos / data.rows.length) * 100);
  }, [data, itensConferidos]);

  const categoriasUnicas = useMemo(() => {
    if (!data) return 0;
    return new Set(data.rows.map((row) => row.categoria)).size;
  }, [data]);

  const effectiveSpreadsheetId = useMemo(() => {
    return resolveRealSpreadsheetId(data, id);
  }, [data, id]);

  const fallbackOpinionDocument = useMemo<ExecutabilityOpinionDocument>(() => {
    if (!data || !id) return DEMO_DOCUMENT;

    return {
      ...DEMO_DOCUMENT,
      header: {
        ...DEMO_DOCUMENT.header,
        title: "Parecer Consolidado de Exequibilidade",
        subtitle: `Planilha #${id} — ${data.title}`,
        opinion_id: `demo-spreadsheet-${id}`,
        executability_analysis_id: `demo-analysis-spreadsheet-${id}`,
        spreadsheet_id: effectiveSpreadsheetId || id,
        spreadsheet_version_id: 1,
        generated_at: new Date().toISOString(),
      },
      sections: [
        {
          key: "ementa",
          title: "Ementa",
          content:
            "Parecer demonstrativo exibido como fallback visual enquanto o vínculo definitivo com o documento real da planilha não é localizado no banco.",
          sort_order: 1,
        },
        {
          key: "conclusao",
          title: "Conclusão",
          content:
            "A tela do parecer consolidado foi integrada com sucesso à página de detalhe da planilha. O próximo ajuste é alinhar o identificador consumido no frontend com a análise correspondente da planilha selecionada.",
          sort_order: 2,
        },
        {
          key: "fundamentacao_tecnica",
          title: "Fundamentação Técnica",
          content: `Total geral exibido na planilha: ${formatCurrency(
            totalGeral
          )}. Percentual de conferência: ${percentualConferencia}%. Categorias distintas: ${categoriasUnicas}. Identificador efetivo consultado: ${
            effectiveSpreadsheetId || "não localizado"
          }.`,
          sort_order: 3,
        },
        {
          key: "versao_gestor_leigo",
          title: "Versão para Gestor Leigo",
          content:
            "Esta versão mostra o bloco final do parecer dentro da interface do sistema. Quando o vínculo dinâmico entre planilha e analysis_id for concluído, este conteúdo será substituído automaticamente pelo parecer real retornado pela RPC.",
          sort_order: 4,
        },
      ],
    };
  }, [
    data,
    id,
    totalGeral,
    percentualConferencia,
    categoriasUnicas,
    effectiveSpreadsheetId,
  ]);

  const finalOpinionDocument = opinionDocument || fallbackOpinionDocument;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #f7f4f9 0%, #f4eef7 45%, #ffffff 100%)",
        }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar
            sx={{
              minHeight: 68,
              px: { xs: 2, md: 4 },
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TableChartIcon />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                PlanilhaDEX
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 600,
                  display: { xs: "none", md: "block" },
                }}
              >
                Usuário: {user?.username || "admin"}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.45)",
                  "&:hover": {
                    borderColor: "#fff",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  },
                  borderRadius: "12px",
                  fontWeight: 700,
                }}
              >
                Sair
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 8 }}>
          <Card
            sx={{
              borderRadius: "24px",
              boxShadow: "0 20px 40px rgba(81, 52, 96, 0.10)",
            }}
          >
            <CardContent sx={{ p: 5 }}>
              <Stack spacing={3} alignItems="center" textAlign="center">
                <CircularProgress />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Carregando detalhe da planilha
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
                  Estamos buscando as informações do módulo selecionado para montar
                  a visualização detalhada.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #f7f4f9 0%, #f4eef7 45%, #ffffff 100%)",
        }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar
            sx={{
              minHeight: 68,
              px: { xs: 2, md: 4 },
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TableChartIcon />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                PlanilhaDEX
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 600,
                  display: { xs: "none", md: "block" },
                }}
              >
                Usuário: {user?.username || "admin"}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.45)",
                  "&:hover": {
                    borderColor: "#fff",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  },
                  borderRadius: "12px",
                  fontWeight: 700,
                }}
              >
                Sair
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 8 }}>
          <Stack spacing={3}>
            <Card
              sx={{
                borderRadius: "24px",
                boxShadow: "0 20px 40px rgba(81, 52, 96, 0.10)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Alert severity="error">{error}</Alert>

                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "18px",
                      backgroundColor: "#fcf7fa",
                      border: "1px solid #f1d9df",
                    }}
                  >
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BugReportOutlinedIcon sx={{ color: "#b3261e" }} />
                        <Typography sx={{ fontWeight: 800 }}>
                          Detalhe técnico
                        </Typography>
                      </Stack>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          lineHeight: 1.8,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {technicalError ||
                          "Nenhum detalhe técnico adicional foi retornado."}
                      </Typography>
                    </Stack>
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="flex-start"
                  >
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={loadDetail}
                      sx={{
                        borderRadius: "14px",
                        fontWeight: 700,
                        minWidth: 180,
                      }}
                    >
                      Tentar novamente
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => navigate("/")}
                      sx={{
                        borderRadius: "14px",
                        fontWeight: 700,
                        minWidth: 180,
                      }}
                    >
                      Voltar para o painel
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    );
  }

  const statusConfig = getStatusStyles(data.status);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f7f4f9 0%, #f4eef7 45%, #ffffff 100%)",
      }}
    >
      <AppBar position="static" elevation={0}>
        <Toolbar
          sx={{
            minHeight: 68,
            px: { xs: 2, md: 4 },
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TableChartIcon />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              PlanilhaDEX
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.92)",
                fontWeight: 600,
                display: { xs: "none", md: "block" },
              }}
            >
              Usuário: {user?.username || "admin"}
            </Typography>

            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                color: "#fff",
                borderColor: "rgba(255,255,255,0.45)",
                "&:hover": {
                  borderColor: "#fff",
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
                borderRadius: "12px",
                fontWeight: 700,
              }}
            >
              Sair
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1340, mx: "auto" }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Stack spacing={1.2}>
                <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
                  <Link
                    underline="hover"
                    color="inherit"
                    sx={{ cursor: "pointer", fontWeight: 600 }}
                    onClick={() => navigate("/")}
                  >
                    Painel
                  </Link>
                  <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                    Detalhe da planilha
                  </Typography>
                </Breadcrumbs>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.8rem", md: "2.3rem" },
                    lineHeight: 1.15,
                  }}
                >
                  {data.title}
                </Typography>
              </Stack>

              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/")}
                sx={{
                  borderRadius: "14px",
                  fontWeight: 700,
                  minWidth: 190,
                }}
              >
                Voltar para o painel
              </Button>
            </Stack>

            <Card
              sx={{
                borderRadius: "28px",
                boxShadow: "0 20px 40px rgba(81, 52, 96, 0.10)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: { xs: 3, md: 5 },
                  py: { xs: 3, md: 4 },
                  background:
                    "linear-gradient(135deg, rgba(140,88,162,0.10) 0%, rgba(111,63,132,0.16) 100%)",
                  borderBottom: "1px solid rgba(140,88,162,0.12)",
                }}
              >
                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", lg: "center" }}
                  spacing={2.5}
                >
                  <Box sx={{ maxWidth: 900 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: "2rem", md: "2.7rem" },
                        fontWeight: 800,
                        lineHeight: 1.08,
                        mb: 1.5,
                        color: "text.primary",
                      }}
                    >
                      {data.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "1rem", md: "1.05rem" },
                        lineHeight: 1.9,
                      }}
                    >
                      {data.description}
                    </Typography>
                  </Box>

                  <Chip
                    label={statusConfig.label}
                    sx={{
                      ...statusConfig.sx,
                      borderRadius: "14px",
                      fontSize: "1rem",
                      height: 46,
                      px: 1.5,
                    }}
                  />
                </Stack>
              </Box>

              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={4}>
                  {!!technicalError && (
                    <Alert severity={opinionDocument ? "info" : "warning"}>
                      {technicalError}
                    </Alert>
                  )}

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        xl: "repeat(4, minmax(0, 1fr))",
                      },
                      gap: 2.5,
                    }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "18px",
                        backgroundColor: "#fcfafe",
                        borderColor: "#eadff0",
                      }}
                    >
                      <CardContent>
                        <Stack spacing={1.3}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <MonetizationOnOutlinedIcon sx={{ color: "#8c58a2" }} />
                            <Typography sx={{ fontWeight: 800 }}>
                              Total geral
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              fontSize: "1.35rem",
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {formatCurrency(totalGeral)}
                          </Typography>
                          <Typography color="text.secondary">
                            Soma consolidada dos itens exibidos.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "18px",
                        backgroundColor: "#fcfafe",
                        borderColor: "#eadff0",
                      }}
                    >
                      <CardContent>
                        <Stack spacing={1.3}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PercentOutlinedIcon sx={{ color: "#8c58a2" }} />
                            <Typography sx={{ fontWeight: 800 }}>
                              Conferência
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              fontSize: "1.35rem",
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {percentualConferencia}%
                          </Typography>
                          <Typography color="text.secondary">
                            Percentual de itens conferidos.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "18px",
                        backgroundColor: "#fcfafe",
                        borderColor: "#eadff0",
                      }}
                    >
                      <CardContent>
                        <Stack spacing={1.3}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccountTreeOutlinedIcon sx={{ color: "#8c58a2" }} />
                            <Typography sx={{ fontWeight: 800 }}>
                              Categorias
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              fontSize: "1.35rem",
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {categoriasUnicas}
                          </Typography>
                          <Typography color="text.secondary">
                            Categorias distintas nesta planilha.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "18px",
                        backgroundColor: "#fcfafe",
                        borderColor: "#eadff0",
                      }}
                    >
                      <CardContent>
                        <Stack spacing={1.3}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarMonthIcon sx={{ color: "#8c58a2" }} />
                            <Typography sx={{ fontWeight: 800 }}>
                              Atualização
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              fontSize: "1.35rem",
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {data.updatedAt}
                          </Typography>
                          <Typography color="text.secondary">
                            Última referência do módulo.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>

                  {bundle && (
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "24px",
                        borderColor: "#eadff0",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          px: 3,
                          py: 2.2,
                          borderBottom: "1px solid #eadff0",
                          backgroundColor: "#fcfafe",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={2}
                        >
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <InsightsOutlinedIcon sx={{ color: "#8c58a2" }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              Resumo numérico do parecer
                            </Typography>
                          </Stack>

                          <Chip
                            label={`${bundle.meta.analysis_type} • ${bundle.meta.analysis_processing_status}`}
                            sx={{
                              backgroundColor: "rgba(140, 88, 162, 0.10)",
                              color: "#6f3f84",
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                      </Box>

                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              md: "repeat(2, minmax(0, 1fr))",
                              xl: "repeat(5, minmax(0, 1fr))",
                            },
                            gap: 2,
                          }}
                        >
                          <Paper
                            variant="outlined"
                            sx={{ p: 2, borderRadius: "16px", borderColor: "#eadff0" }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Valor proposto
                            </Typography>
                            <Typography sx={{ mt: 1, fontWeight: 800 }}>
                              {formatCurrency(
                                Number(bundle.numeric_summary.proposed_total_value || 0)
                              )}
                            </Typography>
                          </Paper>

                          <Paper
                            variant="outlined"
                            sx={{ p: 2, borderRadius: "16px", borderColor: "#eadff0" }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Custos obrigatórios
                            </Typography>
                            <Typography sx={{ mt: 1, fontWeight: 800 }}>
                              {formatCurrency(
                                Number(bundle.numeric_summary.mandatory_cost_total || 0)
                              )}
                            </Typography>
                          </Paper>

                          <Paper
                            variant="outlined"
                            sx={{ p: 2, borderRadius: "16px", borderColor: "#eadff0" }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Custos probatórios
                            </Typography>
                            <Typography sx={{ mt: 1, fontWeight: 800 }}>
                              {formatCurrency(
                                Number(bundle.numeric_summary.evidentiary_cost_total || 0)
                              )}
                            </Typography>
                          </Paper>

                          <Paper
                            variant="outlined"
                            sx={{ p: 2, borderRadius: "16px", borderColor: "#eadff0" }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Retenções
                            </Typography>
                            <Typography sx={{ mt: 1, fontWeight: 800 }}>
                              {formatCurrency(
                                Number(bundle.numeric_summary.retention_total || 0)
                              )}
                            </Typography>
                          </Paper>

                          <Paper
                            variant="outlined"
                            sx={{ p: 2, borderRadius: "16px", borderColor: "#eadff0" }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Saldo de exequibilidade
                            </Typography>
                            <Typography sx={{ mt: 1, fontWeight: 800 }}>
                              {formatCurrency(
                                Number(bundle.numeric_summary.executability_balance || 0)
                              )}
                            </Typography>
                          </Paper>
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: "24px",
                      borderColor: "#eadff0",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        px: 3,
                        py: 2.2,
                        borderBottom: "1px solid #eadff0",
                        backgroundColor: "#fcfafe",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <GavelOutlinedIcon sx={{ color: "#8c58a2" }} />
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Parecer consolidado
                          </Typography>
                        </Stack>

                        <Chip
                          label={opinionDocument ? "Documento real" : "Fallback visual"}
                          sx={{
                            backgroundColor: opinionDocument
                              ? "rgba(46, 125, 50, 0.10)"
                              : "rgba(140, 88, 162, 0.10)",
                            color: opinionDocument ? "#2e7d32" : "#6f3f84",
                            fontWeight: 700,
                          }}
                        />
                      </Stack>
                    </Box>

                    <Box sx={{ p: { xs: 2, md: 3 } }}>
                      <ExecutabilityOpinionView document={finalOpinionDocument} />
                    </Box>
                  </Card>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        xl: "1.7fr 0.9fr",
                      },
                      gap: 3,
                    }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "24px",
                        borderColor: "#eadff0",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          px: 3,
                          py: 2.2,
                          borderBottom: "1px solid #eadff0",
                          backgroundColor: "#fcfafe",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={2}
                        >
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <DescriptionOutlinedIcon sx={{ color: "#8c58a2" }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              Itens da planilha
                            </Typography>
                          </Stack>

                          <Chip
                            label={`${data.rows.length} registro(s)`}
                            sx={{
                              backgroundColor: "rgba(140, 88, 162, 0.10)",
                              color: "#6f3f84",
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                      </Box>

                      <Box sx={{ p: 0 }}>
                        <Paper elevation={0} sx={{ width: "100%", overflowX: "auto" }}>
                          <Table sx={{ minWidth: 820 }}>
                            <TableHead>
                              <TableRow
                                sx={{
                                  "& th": {
                                    fontWeight: 800,
                                    color: "#4e3c59",
                                    backgroundColor: "#faf7fc",
                                    borderBottom: "1px solid #eadff0",
                                  },
                                }}
                              >
                                <TableCell>Item</TableCell>
                                <TableCell>Categoria</TableCell>
                                <TableCell align="center">Qtd.</TableCell>
                                <TableCell align="right">Valor unitário</TableCell>
                                <TableCell align="right">Subtotal</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {data.rows.map((row, index) => (
                                <TableRow
                                  key={`${row.item}-${index}`}
                                  sx={{
                                    "&:last-child td": { borderBottom: 0 },
                                    "& td": { borderBottom: "1px solid #f0e8f4" },
                                  }}
                                >
                                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                                    {row.item}
                                  </TableCell>
                                  <TableCell>{row.categoria}</TableCell>
                                  <TableCell align="center">{row.quantidade}</TableCell>
                                  <TableCell align="right">
                                    {formatCurrency(row.valorUnitario)}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(row.subtotal)}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={row.status}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          row.status.toLowerCase() === "conferido" ||
                                          row.status.toLowerCase() === "concluído" ||
                                          row.status.toLowerCase() === "concluido"
                                            ? "#e8f5e9"
                                            : row.status.toLowerCase() === "pendente"
                                            ? "#fff3e0"
                                            : row.status.toLowerCase().includes("revis")
                                            ? "#fff8e1"
                                            : "rgba(140, 88, 162, 0.10)",
                                        color:
                                          row.status.toLowerCase() === "conferido" ||
                                          row.status.toLowerCase() === "concluído" ||
                                          row.status.toLowerCase() === "concluido"
                                            ? "#2e7d32"
                                            : row.status.toLowerCase() === "pendente"
                                            ? "#b26a00"
                                            : row.status.toLowerCase().includes("revis")
                                            ? "#8d6e00"
                                            : "#6f3f84",
                                        fontWeight: 700,
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}

                              <TableRow
                                sx={{
                                  "& td": {
                                    backgroundColor: "#faf7fc",
                                    borderTop: "2px solid #eadff0",
                                  },
                                }}
                              >
                                <TableCell colSpan={4} sx={{ fontWeight: 800 }}>
                                  Total consolidado
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>
                                  {formatCurrency(totalGeral)}
                                </TableCell>
                                <TableCell />
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Paper>
                      </Box>
                    </Card>

                    <Stack spacing={3}>
                      <Card
                        variant="outlined"
                        sx={{ borderRadius: "24px", borderColor: "#eadff0" }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={2.2}>
                            <Stack direction="row" spacing={1.1} alignItems="center">
                              <InsightsOutlinedIcon sx={{ color: "#8c58a2" }} />
                              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Resumo do módulo
                              </Typography>
                            </Stack>

                            <Stack spacing={1.6}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <CategoryIcon sx={{ color: "#8c58a2", fontSize: 20 }} />
                                <Typography color="text.secondary">
                                  Categoria: <strong>{data.category}</strong>
                                </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                <EditNoteIcon sx={{ color: "#8c58a2", fontSize: 20 }} />
                                <Typography color="text.secondary">
                                  Situação: <strong>{data.status}</strong>
                                </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                <FolderOpenIcon sx={{ color: "#8c58a2", fontSize: 20 }} />
                                <Typography color="text.secondary">
                                  Identificador visual: <strong>#{data.id}</strong>
                                </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                <FolderOpenIcon sx={{ color: "#8c58a2", fontSize: 20 }} />
                                <Typography color="text.secondary">
                                  Identificador efetivo:{" "}
                                  <strong>{effectiveSpreadsheetId || "não localizado"}</strong>
                                </Typography>
                              </Stack>

                              {bundle && (
                                <>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <GavelOutlinedIcon
                                      sx={{ color: "#8c58a2", fontSize: 20 }}
                                    />
                                    <Typography color="text.secondary">
                                      Analysis ID: <strong>{bundle.analysis_id}</strong>
                                    </Typography>
                                  </Stack>

                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <InsightsOutlinedIcon
                                      sx={{ color: "#8c58a2", fontSize: 20 }}
                                    />
                                    <Typography color="text.secondary">
                                      Score global:{" "}
                                      <strong>{bundle.meta.score_global ?? "-"}</strong>
                                    </Typography>
                                  </Stack>

                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <InsightsOutlinedIcon
                                      sx={{ color: "#8c58a2", fontSize: 20 }}
                                    />
                                    <Typography color="text.secondary">
                                      Risco:{" "}
                                      <strong>{bundle.meta.risk_level || "-"}</strong>
                                    </Typography>
                                  </Stack>
                                </>
                              )}

                              <Stack direction="row" spacing={1} alignItems="center">
                                <CalendarMonthIcon sx={{ color: "#8c58a2", fontSize: 20 }} />
                                <Typography color="text.secondary">
                                  Última atualização: <strong>{data.updatedAt}</strong>
                                </Typography>
                              </Stack>
                            </Stack>

                            <Divider />

                            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                              Este painel já está conectado à API e pronto para evoluir
                              para edição, exportação, versionamento e integração com
                              documentos reais.
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>

                      <Card
                        variant="outlined"
                        sx={{ borderRadius: "24px", borderColor: "#eadff0" }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={2.2}>
                            <Stack direction="row" spacing={1.1} alignItems="center">
                              <AssignmentTurnedInIcon sx={{ color: "#8c58a2" }} />
                              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Ações
                              </Typography>
                            </Stack>

                            <Stack spacing={1.5}>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<EditIcon />}
                                sx={{ borderRadius: "14px", justifyContent: "flex-start" }}
                              >
                                Editar planilha
                              </Button>

                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                sx={{ borderRadius: "14px", justifyContent: "flex-start" }}
                              >
                                Exportar dados
                              </Button>

                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<HistoryIcon />}
                                sx={{ borderRadius: "14px", justifyContent: "flex-start" }}
                              >
                                Ver histórico completo
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Box>

                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: "24px",
                      borderColor: "#eadff0",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        px: 3,
                        py: 2.2,
                        borderBottom: "1px solid #eadff0",
                        backgroundColor: "#fcfafe",
                      }}
                    >
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <HistoryIcon sx={{ color: "#8c58a2" }} />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          Histórico de análises de exequibilidade
                        </Typography>
                      </Stack>
                    </Box>

                    <CardContent sx={{ p: 0 }}>
                      <Paper elevation={0} sx={{ width: "100%", overflowX: "auto" }}>
                        <Table sx={{ minWidth: 900 }}>
                          <TableHead>
                            <TableRow
                              sx={{
                                "& th": {
                                  fontWeight: 800,
                                  color: "#4e3c59",
                                  backgroundColor: "#faf7fc",
                                  borderBottom: "1px solid #eadff0",
                                },
                              }}
                            >
                              <TableCell>Analysis ID</TableCell>
                              <TableCell>Versão</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Score</TableCell>
                              <TableCell>Risco</TableCell>
                              <TableCell>Criado em</TableCell>
                              <TableCell>Atualizado em</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {analyses.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7}>
                                  <Typography color="text.secondary">
                                    Nenhuma análise de exequibilidade encontrada para esta planilha.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              analyses.map((analysis) => (
                                <TableRow
                                  key={analysis.analysis_id}
                                  sx={{
                                    "&:last-child td": { borderBottom: 0 },
                                    "& td": { borderBottom: "1px solid #f0e8f4" },
                                  }}
                                >
                                  <TableCell sx={{ fontWeight: 700 }}>
                                    {analysis.analysis_id}
                                  </TableCell>
                                  <TableCell>{analysis.spreadsheet_version_id}</TableCell>
                                  <TableCell>{analysis.status}</TableCell>
                                  <TableCell>{analysis.score_global ?? "-"}</TableCell>
                                  <TableCell>{analysis.risk_level ?? "-"}</TableCell>
                                  <TableCell>{formatDateTime(analysis.created_at)}</TableCell>
                                  <TableCell>{formatDateTime(analysis.updated_at)}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </Paper>
                    </CardContent>
                  </Card>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        xl: "1.1fr 0.9fr",
                      },
                      gap: 3,
                    }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "24px",
                        borderColor: "#eadff0",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          px: 3,
                          py: 2.2,
                          borderBottom: "1px solid #eadff0",
                          backgroundColor: "#fcfafe",
                        }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <HistoryIcon sx={{ color: "#8c58a2" }} />
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Histórico de versões
                          </Typography>
                        </Stack>
                      </Box>

                      <CardContent sx={{ p: 0 }}>
                        <Paper elevation={0} sx={{ width: "100%", overflowX: "auto" }}>
                          <Table sx={{ minWidth: 620 }}>
                            <TableHead>
                              <TableRow
                                sx={{
                                  "& th": {
                                    fontWeight: 800,
                                    color: "#4e3c59",
                                    backgroundColor: "#faf7fc",
                                    borderBottom: "1px solid #eadff0",
                                  },
                                }}
                              >
                                <TableCell>Versão</TableCell>
                                <TableCell>Data</TableCell>
                                <TableCell>Responsável</TableCell>
                                <TableCell>Observação</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {data.versions.map((version, index) => (
                                <TableRow
                                  key={`${version.versao}-${index}`}
                                  sx={{
                                    "&:last-child td": { borderBottom: 0 },
                                    "& td": { borderBottom: "1px solid #f0e8f4" },
                                  }}
                                >
                                  <TableCell sx={{ fontWeight: 700 }}>
                                    {version.versao}
                                  </TableCell>
                                  <TableCell>{version.data}</TableCell>
                                  <TableCell>{version.responsavel}</TableCell>
                                  <TableCell>{version.observacao}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      </CardContent>
                    </Card>

                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "24px",
                        borderColor: "#eadff0",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          px: 3,
                          py: 2.2,
                          borderBottom: "1px solid #eadff0",
                          backgroundColor: "#fcfafe",
                        }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <AttachFileIcon sx={{ color: "#8c58a2" }} />
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Documentos vinculados
                          </Typography>
                        </Stack>
                      </Box>

                      <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2}>
                          {data.documents.map((doc, index) => (
                            <Box
                              key={`${doc.nome}-${index}`}
                              sx={{
                                p: 2,
                                borderRadius: "16px",
                                backgroundColor: "#faf7fc",
                                border: "1px solid #eee4f3",
                              }}
                            >
                              <Stack spacing={0.8}>
                                <Typography sx={{ fontWeight: 700 }}>{doc.nome}</Typography>
                                <Typography color="text.secondary">
                                  Tipo: {doc.tipo}
                                </Typography>
                                <Typography color="text.secondary">
                                  Atualização: {doc.atualizacao}
                                </Typography>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
