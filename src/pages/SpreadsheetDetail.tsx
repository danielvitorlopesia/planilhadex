import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import TableChartIcon from "@mui/icons-material/TableChart";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlaylistAddCheckCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCheckCircleOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  getSpreadsheetById,
  SpreadsheetRecord,
  updateSpreadsheetEditorDraft,
} from "../services/spreadsheetService";

type LoadState = "loading" | "success" | "error";
type SaveState = "idle" | "saving" | "success" | "error";

type SpreadsheetDetailRow = {
  item: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  status: string;
  memoriaCalculo?: string;
  origem?: string;
  automatico?: boolean;
  trainingTags?: string[];
};

type SpreadsheetDetailRecord = SpreadsheetRecord & {
  contractReference?: string;
  contractingAgency?: string;
  unitName?: string;
  lotName?: string;
  referenceDate?: string;
  headcount?: number;
  monthlyBaseValue?: number;
  notes?: string;
  domainScenario?: string;
  rows: SpreadsheetDetailRow[];
  trainingProfile?: {
    domainScenarioLabel?: string;
    interpretationTags?: string[];
    expectedDocuments?: string[];
    expectedCostDrivers?: string[];
    validationFocus?: string[];
    readingHints?: string[];
  };
  metadata?: Record<string, unknown>;
};

type EditorState = {
  contractingAgency: string;
  contractReference: string;
  unitName: string;
  lotName: string;
  referenceDate: string;
  municipality: string;
  state: string;
  cboCode: string;
  professionalCategory: string;
  cctReference: string;
  taxRegime: string;
  objectDescription: string;
  domainScenario: string;
  headcount: string;
  monthlyBaseValue: string;
  mainShift: string;
  workScale: string;
  weeklyHours: string;
  monthlyHours: string;
  salaryBase: string;
  nightAdditional: string;
  hazardAdditional: string;
  mealAllowance: string;
  transportAllowance: string;
  mandatoryBenefitsNotes: string;
  notes: string;
};

const DOMAIN_SCENARIO_LABELS: Record<string, string> = {
  reception_administrative_support: "Recepção e apoio administrativo",
  cleaning_conservation: "Limpeza e conservação",
  concierge_access_control: "Portaria e controle de acesso",
  property_security: "Vigilância patrimonial",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function parseNumber(value: string | number | undefined | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (!value) {
    return 0;
  }

  const normalized = String(value).replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stringifyNumber(value: number | undefined | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "";
  }

  return String(value);
}

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getModelLabel(modelType?: string) {
  switch (modelType) {
    case "dedicated_labor":
      return "Terceirização com dedicação exclusiva";
    case "non_dedicated_labor":
      return "Terceirização sem dedicação exclusiva";
    case "service_composition":
      return "Serviços por composição";
    case "economic_rebalance":
      return "Repactuação / revisão";
    default:
      return "Planilha";
  }
}

function getModelIcon(modelType?: string) {
  switch (modelType) {
    case "dedicated_labor":
      return <Groups2OutlinedIcon sx={{ fontSize: 18 }} />;
    case "non_dedicated_labor":
      return <TableChartOutlinedIcon sx={{ fontSize: 18 }} />;
    case "service_composition":
      return <AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />;
    case "economic_rebalance":
      return <CompareArrowsOutlinedIcon sx={{ fontSize: 18 }} />;
    default:
      return <TableChartIcon sx={{ fontSize: 18 }} />;
  }
}

function getModelChipStyles(modelType?: string) {
  switch (modelType) {
    case "dedicated_labor":
      return {
        backgroundColor: "#EDE7F6",
        color: "#5E35B1",
      };
    case "non_dedicated_labor":
      return {
        backgroundColor: "#E3F2FD",
        color: "#1565C0",
      };
    case "service_composition":
      return {
        backgroundColor: "#E8F5E9",
        color: "#2E7D32",
      };
    case "economic_rebalance":
      return {
        backgroundColor: "#FFF3E0",
        color: "#EF6C00",
      };
    default:
      return {
        backgroundColor: "#EDE7F6",
        color: "#5E35B1",
      };
  }
}

function getStatusChipStyles(status?: string) {
  switch (status) {
    case "Em elaboração":
      return {
        backgroundColor: "#EFE7F6",
        color: "#8E5AB5",
      };
    case "Concluída":
      return {
        backgroundColor: "#E7F6EC",
        color: "#2E7D32",
      };
    case "Em revisão":
      return {
        backgroundColor: "#FFF3E0",
        color: "#ED6C02",
      };
    case "Exemplo nativo":
      return {
        backgroundColor: "#E3F2FD",
        color: "#1565C0",
      };
    default:
      return {
        backgroundColor: "#EFE7F6",
        color: "#8E5AB5",
      };
  }
}

function categoryMatches(category: string, terms: string[]) {
  const normalized = category.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function itemMatches(item: string, terms: string[]) {
  const normalized = item.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function sumRowsByCategory(rows: SpreadsheetDetailRow[], terms: string[]) {
  return rows.reduce((sum, row) => {
    if (categoryMatches(row.categoria, terms)) {
      return sum + (row.subtotal || 0);
    }
    return sum;
  }, 0);
}

function findFirstRowByItem(rows: SpreadsheetDetailRow[], terms: string[]) {
  return rows.find((row) => itemMatches(row.item, terms));
}

function getDomainScenarioLabel(record?: SpreadsheetDetailRecord | null) {
  const key = record?.domainScenario;
  if (key && DOMAIN_SCENARIO_LABELS[key]) {
    return DOMAIN_SCENARIO_LABELS[key];
  }

  if (record?.trainingProfile?.domainScenarioLabel) {
    return record.trainingProfile.domainScenarioLabel;
  }

  return "Não classificado";
}

function extractStoredEditorDraft(record: SpreadsheetDetailRecord) {
  const raw = record.metadata?.editorDraft;

  if (typeof raw === "object" && raw !== null) {
    return raw as Partial<EditorState>;
  }

  return {};
}

function buildInitialEditorState(record: SpreadsheetDetailRecord): EditorState {
  const storedDraft = extractStoredEditorDraft(record);

  const laborRows = record.rows.filter((row) =>
    categoryMatches(row.categoria, ["mão de obra", "equipe operacional"])
  );

  const firstLaborRow = laborRows[0];
  const mealAllowanceRow = findFirstRowByItem(record.rows, [
    "vale-alimentação",
    "vale alimentação",
    "alimentação",
  ]);
  const transportAllowanceRow = findFirstRowByItem(record.rows, [
    "vale-transporte",
    "vale transporte",
    "transporte",
  ]);

  const inferredHeadcount =
    record.headcount ??
    laborRows.reduce((sum, row) => sum + (row.quantidade || 0), 0);

  const inferredMonthlyBaseValue =
    record.monthlyBaseValue ??
    record.rows.reduce((sum, row) => sum + (row.subtotal || 0), 0);

  return {
    contractingAgency:
      storedDraft.contractingAgency ?? safeString(record.contractingAgency),
    contractReference:
      storedDraft.contractReference ?? safeString(record.contractReference),
    unitName: storedDraft.unitName ?? safeString(record.unitName),
    lotName: storedDraft.lotName ?? safeString(record.lotName),
    referenceDate: storedDraft.referenceDate ?? safeString(record.referenceDate),
    municipality: storedDraft.municipality ?? "",
    state: storedDraft.state ?? "",
    cboCode: storedDraft.cboCode ?? "",
    professionalCategory:
      storedDraft.professionalCategory ?? firstLaborRow?.item ?? "",
    cctReference: storedDraft.cctReference ?? "",
    taxRegime: storedDraft.taxRegime ?? "lucro_presumido",
    objectDescription: storedDraft.objectDescription ?? record.description ?? "",
    domainScenario: storedDraft.domainScenario ?? safeString(record.domainScenario),
    headcount: storedDraft.headcount ?? stringifyNumber(inferredHeadcount),
    monthlyBaseValue:
      storedDraft.monthlyBaseValue ?? stringifyNumber(inferredMonthlyBaseValue),
    mainShift: storedDraft.mainShift ?? (laborRows.length > 0 ? "Postos contínuos" : ""),
    workScale: storedDraft.workScale ?? "",
    weeklyHours: storedDraft.weeklyHours ?? "",
    monthlyHours: storedDraft.monthlyHours ?? "",
    salaryBase: storedDraft.salaryBase ?? stringifyNumber(firstLaborRow?.valorUnitario ?? 0),
    nightAdditional: storedDraft.nightAdditional ?? "",
    hazardAdditional: storedDraft.hazardAdditional ?? "",
    mealAllowance:
      storedDraft.mealAllowance ?? stringifyNumber(mealAllowanceRow?.valorUnitario ?? 0),
    transportAllowance:
      storedDraft.transportAllowance ??
      stringifyNumber(transportAllowanceRow?.valorUnitario ?? 0),
    mandatoryBenefitsNotes: storedDraft.mandatoryBenefitsNotes ?? "",
    notes: storedDraft.notes ?? safeString(record.notes),
  };
}

function getExequibilityRisk(
  mandatoryCostTotal: number,
  referenceValue: number,
  totalRowsValue: number
) {
  const base = referenceValue > 0 ? referenceValue : totalRowsValue;
  if (base <= 0) {
    return {
      label: "Sem base suficiente",
      color: "#6D6186",
      backgroundColor: "#F3EAF7",
    };
  }

  const ratio = mandatoryCostTotal / base;

  if (ratio <= 0.75) {
    return {
      label: "Baixo risco preliminar",
      color: "#2E7D32",
      backgroundColor: "#E7F6EC",
    };
  }

  if (ratio <= 0.9) {
    return {
      label: "Atenção moderada",
      color: "#ED6C02",
      backgroundColor: "#FFF3E0",
    };
  }

  return {
    label: "Alto risco preliminar",
    color: "#C62828",
    backgroundColor: "#FDECEC",
  };
}

export default function SpreadsheetDetail() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetDetailRecord | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "local" | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    document.title = "CustoPúblico — Detalhe da Planilha";
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSpreadsheet() {
      if (!id) {
        if (!isMounted) return;
        setState("error");
        setErrorMessage("ID da planilha não informado.");
        return;
      }

      setState("loading");
      setErrorMessage("");
      setSpreadsheet(null);
      setEditor(null);

      const localSpreadsheet = getSpreadsheetById(id) as SpreadsheetDetailRecord | undefined;

      try {
        const response = await fetch(`/api/spreadsheets/${id}`);

        if (response.ok) {
          const data = await response.json();
          const apiPayload = (data?.spreadsheet ?? data) as SpreadsheetDetailRecord;

          const localDraftOverride =
            localSpreadsheet &&
            localSpreadsheet.metadata &&
            typeof localSpreadsheet.metadata === "object" &&
            localSpreadsheet.metadata.localDraftOverride === true;

          const payload = localDraftOverride ? localSpreadsheet : apiPayload;

          if (isMounted) {
            setSpreadsheet(payload);
            setEditor(buildInitialEditorState(payload));
            setDataSource(localDraftOverride ? "local" : "api");
            setState("success");
          }
          return;
        }

        if (localSpreadsheet) {
          if (isMounted) {
            setSpreadsheet(localSpreadsheet);
            setEditor(buildInitialEditorState(localSpreadsheet));
            setDataSource("local");
            setState("success");
          }
          return;
        }

        const data = await response.json().catch(() => null);
        const message =
          data?.message ??
          `Falha ao carregar /api/spreadsheets/${id}. Status ${response.status}.`;

        if (isMounted) {
          setState("error");
          setErrorMessage(message);
        }
      } catch (error) {
        if (localSpreadsheet) {
          if (isMounted) {
            setSpreadsheet(localSpreadsheet);
            setEditor(buildInitialEditorState(localSpreadsheet));
            setDataSource("local");
            setState("success");
          }
          return;
        }

        if (isMounted) {
          setState("error");
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Erro inesperado ao carregar a planilha."
          );
        }
      }
    }

    loadSpreadsheet();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const totalValue = useMemo(() => {
    if (!spreadsheet) return 0;
    return spreadsheet.rows.reduce((sum, row) => sum + (row.subtotal || 0), 0);
  }, [spreadsheet]);

  const totalItems = spreadsheet?.rows.length ?? 0;
  const pendingItems =
    spreadsheet?.rows.filter((row) => row.status === "Pendente").length ?? 0;

  const laborRows = useMemo(() => {
    if (!spreadsheet) return [];
    return spreadsheet.rows.filter((row) =>
      categoryMatches(row.categoria, ["mão de obra", "equipe operacional"])
    );
  }, [spreadsheet]);

  const mandatoryCostTotal = useMemo(() => {
    if (!spreadsheet) return 0;

    return sumRowsByCategory(spreadsheet.rows, [
      "mão de obra",
      "equipe operacional",
      "encargos",
      "benefícios",
    ]);
  }, [spreadsheet]);

  const evidentiaryCostTotal = useMemo(() => {
    if (!spreadsheet) return 0;

    return sumRowsByCategory(spreadsheet.rows, [
      "insumos",
      "equipamentos",
      "materiais",
    ]);
  }, [spreadsheet]);

  const analysisReferenceValue = useMemo(() => {
    if (!editor) return 0;
    return parseNumber(editor.monthlyBaseValue);
  }, [editor]);

  const executabilityBalance = useMemo(() => {
    const base = analysisReferenceValue > 0 ? analysisReferenceValue : totalValue;
    return base - mandatoryCostTotal;
  }, [analysisReferenceValue, totalValue, mandatoryCostTotal]);

  const exequibilityRisk = useMemo(() => {
    return getExequibilityRisk(mandatoryCostTotal, analysisReferenceValue, totalValue);
  }, [mandatoryCostTotal, analysisReferenceValue, totalValue]);

  function updateEditorField(field: keyof EditorState, value: string) {
    setEditor((current) => {
      if (!current) return current;
      return {
        ...current,
        [field]: value,
      };
    });
  }

  function handleSaveLocalDraft() {
    if (!spreadsheet || !editor) {
      return;
    }

    setSaveState("saving");
    setSaveMessage("");

    try {
      const updated = updateSpreadsheetEditorDraft(spreadsheet.id, {
        contractingAgency: editor.contractingAgency,
        contractReference: editor.contractReference,
        unitName: editor.unitName,
        lotName: editor.lotName,
        referenceDate: editor.referenceDate,
        municipality: editor.municipality,
        state: editor.state,
        cboCode: editor.cboCode,
        professionalCategory: editor.professionalCategory,
        cctReference: editor.cctReference,
        taxRegime: editor.taxRegime,
        objectDescription: editor.objectDescription,
        domainScenario: editor.domainScenario,
        headcount: editor.headcount,
        monthlyBaseValue: editor.monthlyBaseValue,
        mainShift: editor.mainShift,
        workScale: editor.workScale,
        weeklyHours: editor.weeklyHours,
        monthlyHours: editor.monthlyHours,
        salaryBase: editor.salaryBase,
        nightAdditional: editor.nightAdditional,
        hazardAdditional: editor.hazardAdditional,
        mealAllowance: editor.mealAllowance,
        transportAllowance: editor.transportAllowance,
        mandatoryBenefitsNotes: editor.mandatoryBenefitsNotes,
        notes: editor.notes,
      }) as SpreadsheetDetailRecord | null;

      if (!updated) {
        throw new Error("Não foi possível salvar a edição local.");
      }

      setSpreadsheet(updated);
      setEditor(buildInitialEditorState(updated));
      setDataSource("local");
      setSaveState("success");
      setSaveMessage("Edição local salva com sucesso.");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao salvar a edição local."
      );
    }
  }

  if (state === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F7F3F8",
          display: "grid",
          placeItems: "center",
          px: 3,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">
            Carregando detalhes da planilha...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (state === "error" || !spreadsheet || !editor) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#F7F3F8", py: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
              <Link component={RouterLink} underline="hover" color="inherit" to="/">
                Início
              </Link>
              <Typography color="text.primary">Planilha</Typography>
            </Breadcrumbs>

            <Alert severity="error">
              Falha ao carregar <strong>/api/spreadsheets/{id}</strong>. {errorMessage}
            </Alert>

            <Button
              component={RouterLink}
              to="/"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ alignSelf: "flex-start" }}
            >
              Voltar ao painel
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  const modelStyles = getModelChipStyles(spreadsheet.modelType);
  const statusStyles = getStatusChipStyles(spreadsheet.status);
  const domainScenarioLabel = getDomainScenarioLabel(spreadsheet);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F7F3F8", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
            <Link component={RouterLink} underline="hover" color="inherit" to="/">
              Início
            </Link>
            <Typography color="text.primary">Planilha</Typography>
          </Breadcrumbs>

          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              background:
                "linear-gradient(180deg, rgba(238,229,243,1) 0%, rgba(235,226,240,1) 100%)",
              border: "1px solid rgba(142, 90, 181, 0.12)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                >
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <AutoAwesomeOutlinedIcon
                        sx={{ fontSize: 16, color: "#9C6BC0" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          color: "#9C6BC0",
                          textTransform: "uppercase",
                        }}
                      >
                        CustoPúblico
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: "#2B2340",
                        lineHeight: 1.15,
                      }}
                    >
                      {spreadsheet.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "#6D6186",
                        mt: 1.5,
                        lineHeight: 1.8,
                        maxWidth: 980,
                      }}
                    >
                      {spreadsheet.description}
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                    <Button
                      component={RouterLink}
                      to="/"
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                    >
                      Voltar
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<SaveOutlinedIcon />}
                      onClick={handleSaveLocalDraft}
                      disabled={saveState === "saving"}
                    >
                      {saveState === "saving" ? "Salvando..." : "Salvar edição local"}
                    </Button>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={getModelIcon(spreadsheet.modelType)}
                    label={getModelLabel(spreadsheet.modelType)}
                    sx={{
                      backgroundColor: modelStyles.backgroundColor,
                      color: modelStyles.color,
                      fontWeight: 700,
                    }}
                  />

                  <Chip
                    label={spreadsheet.category}
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      borderColor: "rgba(91, 58, 122, 0.24)",
                      color: "#5B3A7A",
                    }}
                  />

                  <Chip
                    label={spreadsheet.status}
                    sx={{
                      backgroundColor: statusStyles.backgroundColor,
                      color: statusStyles.color,
                      fontWeight: 700,
                    }}
                  />

                  <Chip
                    label={domainScenarioLabel}
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      borderColor: "rgba(21, 101, 192, 0.24)",
                      color: "#1565C0",
                    }}
                  />

                  <Chip
                    label={dataSource === "local" ? "Origem local" : "Origem API"}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Alert
            icon={<InfoOutlinedIcon fontSize="inherit" />}
            severity="info"
            sx={{ borderRadius: 3 }}
          >
            Esta tela já foi convertida para a primeira etapa do editor orientado por
            domínio. Nesta fase, os campos abaixo funcionam como estrutura preparatória
            para futura persistência, memória de cálculo, validação normativa e análise
            automática.
          </Alert>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Itens da planilha
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#241B3A">
                  {totalItems}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Itens pendentes
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#241B3A">
                  {pendingItems}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Valor total estimado
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#241B3A">
                  {formatCurrency(totalValue)}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 2fr) minmax(340px, 1fr)" },
              gap: 3,
            }}
          >
            <Stack spacing={3}>
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <PlaylistAddCheckCircleOutlinedIcon sx={{ color: "#5E35B1" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Dados iniciais da contratação
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Órgão ou entidade"
                        value={editor.contractingAgency}
                        onChange={(event) =>
                          updateEditorField("contractingAgency", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Referência contratual / processo"
                        value={editor.contractReference}
                        onChange={(event) =>
                          updateEditorField("contractReference", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Unidade principal"
                        value={editor.unitName}
                        onChange={(event) =>
                          updateEditorField("unitName", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Lote / grupo"
                        value={editor.lotName}
                        onChange={(event) =>
                          updateEditorField("lotName", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Data-base"
                        type="date"
                        value={editor.referenceDate}
                        onChange={(event) =>
                          updateEditorField("referenceDate", event.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />

                      <TextField
                        label="Exemplo setorial"
                        value={editor.domainScenario}
                        onChange={(event) =>
                          updateEditorField("domainScenario", event.target.value)
                        }
                        select
                        fullWidth
                      >
                        <MenuItem value="">Não definido</MenuItem>
                        <MenuItem value="reception_administrative_support">
                          Recepção e apoio administrativo
                        </MenuItem>
                        <MenuItem value="cleaning_conservation">
                          Limpeza e conservação
                        </MenuItem>
                        <MenuItem value="concierge_access_control">
                          Portaria e controle de acesso
                        </MenuItem>
                        <MenuItem value="property_security">
                          Vigilância patrimonial
                        </MenuItem>
                      </TextField>

                      <TextField
                        label="Município"
                        value={editor.municipality}
                        onChange={(event) =>
                          updateEditorField("municipality", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="UF"
                        value={editor.state}
                        onChange={(event) => updateEditorField("state", event.target.value)}
                        fullWidth
                      />

                      <TextField
                        label="Código CBO"
                        value={editor.cboCode}
                        onChange={(event) =>
                          updateEditorField("cboCode", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Categoria profissional"
                        value={editor.professionalCategory}
                        onChange={(event) =>
                          updateEditorField("professionalCategory", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="CCT / ACT / Dissídio paradigma"
                        value={editor.cctReference}
                        onChange={(event) =>
                          updateEditorField("cctReference", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Regime tributário"
                        value={editor.taxRegime}
                        onChange={(event) =>
                          updateEditorField("taxRegime", event.target.value)
                        }
                        select
                        fullWidth
                      >
                        <MenuItem value="lucro_presumido">Lucro presumido</MenuItem>
                        <MenuItem value="lucro_real">Lucro real</MenuItem>
                        <MenuItem value="simples_nacional">Simples nacional</MenuItem>
                        <MenuItem value="nao_informado">Não informado</MenuItem>
                      </TextField>
                    </Box>

                    <TextField
                      label="Descrição resumida do objeto"
                      value={editor.objectDescription}
                      onChange={(event) =>
                        updateEditorField("objectDescription", event.target.value)
                      }
                      multiline
                      minRows={3}
                      fullWidth
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <ManageSearchOutlinedIcon sx={{ color: "#1565C0" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Postos e jornadas
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Quantidade total estimada"
                        value={editor.headcount}
                        onChange={(event) =>
                          updateEditorField("headcount", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Valor mensal de referência"
                        value={editor.monthlyBaseValue}
                        onChange={(event) =>
                          updateEditorField("monthlyBaseValue", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Turno / arranjo predominante"
                        value={editor.mainShift}
                        onChange={(event) =>
                          updateEditorField("mainShift", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Escala"
                        value={editor.workScale}
                        onChange={(event) =>
                          updateEditorField("workScale", event.target.value)
                        }
                        placeholder="Ex.: 12x36, comercial, 44h"
                        fullWidth
                      />

                      <TextField
                        label="Jornada semanal"
                        value={editor.weeklyHours}
                        onChange={(event) =>
                          updateEditorField("weeklyHours", event.target.value)
                        }
                        placeholder="Ex.: 44"
                        fullWidth
                      />

                      <TextField
                        label="Horas mensais"
                        value={editor.monthlyHours}
                        onChange={(event) =>
                          updateEditorField("monthlyHours", event.target.value)
                        }
                        placeholder="Ex.: 220"
                        fullWidth
                      />
                    </Box>

                    <Box sx={{ overflowX: "auto", borderRadius: 3, border: "1px solid #ECE7F1" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <strong>Posto / função</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Categoria</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Quantidade</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Valor unitário</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Subtotal</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {laborRows.map((row, index) => (
                            <TableRow key={`${row.item}-${index}`}>
                              <TableCell>{row.item}</TableCell>
                              <TableCell>{row.categoria}</TableCell>
                              <TableCell align="right">{row.quantidade}</TableCell>
                              <TableCell align="right">
                                {formatCurrency(row.valorUnitario)}
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(row.subtotal)}
                              </TableCell>
                            </TableRow>
                          ))}

                          {laborRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5}>
                                <Typography variant="body2" color="text.secondary">
                                  Nenhum posto de trabalho foi identificado automaticamente
                                  na estrutura atual desta planilha.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </TableBody>
                      </Table>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <AttachMoneyOutlinedIcon sx={{ color: "#2E7D32" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Custos mínimos relevantes
                      </Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Este bloco prepara a base para futura validação normativa da
                      exequibilidade, especialmente salário-base, adicionais e benefícios
                      relevantes.
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Salário-base"
                        value={editor.salaryBase}
                        onChange={(event) =>
                          updateEditorField("salaryBase", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Adicional noturno"
                        value={editor.nightAdditional}
                        onChange={(event) =>
                          updateEditorField("nightAdditional", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Adicional de insalubridade/periculosidade"
                        value={editor.hazardAdditional}
                        onChange={(event) =>
                          updateEditorField("hazardAdditional", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Auxílio-alimentação"
                        value={editor.mealAllowance}
                        onChange={(event) =>
                          updateEditorField("mealAllowance", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Vale-transporte"
                        value={editor.transportAllowance}
                        onChange={(event) =>
                          updateEditorField("transportAllowance", event.target.value)
                        }
                        fullWidth
                      />
                    </Box>

                    <TextField
                      label="Observações sobre benefícios obrigatórios"
                      value={editor.mandatoryBenefitsNotes}
                      onChange={(event) =>
                        updateEditorField("mandatoryBenefitsNotes", event.target.value)
                      }
                      multiline
                      minRows={3}
                      fullWidth
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ px: 3, py: 2.5 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Estrutura inicial da planilha
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      Itens-base identificados nesta versão da planilha.
                    </Typography>
                  </Box>

                  <Divider />

                  <Box sx={{ overflowX: "auto" }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Item</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Categoria</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>Quantidade</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>Valor unitário</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>Subtotal</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Status</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {spreadsheet.rows.map((row, index) => (
                          <TableRow key={`${row.item}-${index}`}>
                            <TableCell>
                              <Stack spacing={0.4}>
                                <Typography variant="body2">{row.item}</Typography>
                                {row.memoriaCalculo ? (
                                  <Typography variant="caption" color="text.secondary">
                                    {row.memoriaCalculo}
                                  </Typography>
                                ) : null}
                              </Stack>
                            </TableCell>
                            <TableCell>{row.categoria}</TableCell>
                            <TableCell align="right">{row.quantidade}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(row.valorUnitario)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(row.subtotal)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={row.status}
                                sx={{
                                  backgroundColor:
                                    row.status === "Pendente"
                                      ? "#FFF3E0"
                                      : row.status === "Exemplo do domínio"
                                      ? "#E3F2FD"
                                      : "#E7F6EC",
                                  color:
                                    row.status === "Pendente"
                                      ? "#EF6C00"
                                      : row.status === "Exemplo do domínio"
                                      ? "#1565C0"
                                      : "#2E7D32",
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}

                        {spreadsheet.rows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <Typography variant="body2" color="text.secondary">
                                Nenhum item encontrado nesta planilha.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Stack>

            <Stack spacing={3}>
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                      Resumo executivo
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Tipo do modelo:</strong>{" "}
                      {getModelLabel(spreadsheet.modelType)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Status:</strong> {spreadsheet.status}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Categoria:</strong> {spreadsheet.category}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Domínio:</strong>{" "}
                      {DOMAIN_SCENARIO_LABELS[editor.domainScenario] || domainScenarioLabel}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Quantidade estimada:</strong>{" "}
                      {parseNumber(editor.headcount)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Referência mensal:</strong>{" "}
                      {formatCurrency(parseNumber(editor.monthlyBaseValue))}
                    </Typography>

                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <AccessTimeIcon sx={{ fontSize: 16, color: "#7A708D" }} />
                      <Typography variant="body2" color="text.secondary">
                        Atualizado em {spreadsheet.updatedAt}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                      Quadro preliminar de exequibilidade
                    </Typography>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: exequibilityRisk.backgroundColor,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: exequibilityRisk.color, fontWeight: 800 }}
                      >
                        {exequibilityRisk.label}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Custos obrigatórios estimados:</strong>{" "}
                      {formatCurrency(mandatoryCostTotal)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Custos comprobatórios / materiais:</strong>{" "}
                      {formatCurrency(evidentiaryCostTotal)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Saldo preliminar de exequibilidade:</strong>{" "}
                      {formatCurrency(executabilityBalance)}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Esta leitura ainda é preparatória. A próxima camada deverá
                      transformar este quadro em parecer técnico automatizado, com
                      segregação formal entre custo obrigatório, custo comprobatório,
                      risco material e diligência recomendada.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="h6" fontWeight={700}>
                      Leitura e análise do domínio
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Cenário identificado:</strong> {domainScenarioLabel}
                    </Typography>

                    {spreadsheet.trainingProfile?.expectedDocuments?.length ? (
                      <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                          Documentos esperados
                        </Typography>
                        <Stack spacing={0.6}>
                          {spreadsheet.trainingProfile.expectedDocuments.map((item) => (
                            <Typography
                              key={item}
                              variant="body2"
                              color="text.secondary"
                            >
                              • {item}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    ) : null}

                    {spreadsheet.trainingProfile?.expectedCostDrivers?.length ? (
                      <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                          Vetores de custo esperados
                        </Typography>
                        <Stack spacing={0.6}>
                          {spreadsheet.trainingProfile.expectedCostDrivers.map((item) => (
                            <Typography
                              key={item}
                              variant="body2"
                              color="text.secondary"
                            >
                              • {item}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    ) : null}

                    {spreadsheet.trainingProfile?.validationFocus?.length ? (
                      <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                          Focos de validação
                        </Typography>
                        <Stack spacing={0.6}>
                          {spreadsheet.trainingProfile.validationFocus.map((item) => (
                            <Typography
                              key={item}
                              variant="body2"
                              color="text.secondary"
                            >
                              • {item}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    ) : null}

                    {spreadsheet.trainingProfile?.readingHints?.length ? (
                      <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                          Pistas de leitura
                        </Typography>
                        <Stack spacing={0.6}>
                          {spreadsheet.trainingProfile.readingHints.map((item) => (
                            <Typography
                              key={item}
                              variant="body2"
                              color="text.secondary"
                            >
                              • {item}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="h6" fontWeight={700}>
                      Observações internas
                    </Typography>

                    <TextField
                      label="Anotações preparatórias"
                      value={editor.notes}
                      onChange={(event) => updateEditorField("notes", event.target.value)}
                      multiline
                      minRows={4}
                      fullWidth
                    />

                    <Typography variant="caption" color="text.secondary">
                      Este campo já prepara a futura integração com histórico analítico,
                      decisão interna, parecer consolidado e trilha de auditoria.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Stack>
      </Container>

      <Snackbar
        open={saveState === "success" || saveState === "error"}
        autoHideDuration={3500}
        onClose={() => setSaveState("idle")}
      >
        <Alert
          onClose={() => setSaveState("idle")}
          severity={saveState === "success" ? "success" : "error"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {saveMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
