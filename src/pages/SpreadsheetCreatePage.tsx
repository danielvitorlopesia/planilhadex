import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Link,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import PlaylistAddCheckCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCheckCircleOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  createSpreadsheetFromModel,
  SpreadsheetRecord,
} from "../services/spreadsheetService";
import {
  getSpreadsheetModelTemplate,
  spreadsheetModelTemplates,
} from "../mocks/modelTemplatesMocks";
import { DOMAIN_SCENARIOS } from "../mocks/domainScenarioCatalog";
import { SpreadsheetModelType } from "../types/spreadsheetModels";

type FormState = {
  title: string;
  domainScenario: string;
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
  objectDescription: string;
  mandatoryBenefitsNotes: string;
  notes: string;
};

type FeedbackState = {
  open: boolean;
  severity: "success" | "error";
  message: string;
};

const MODEL_OPTIONS = Object.keys(
  spreadsheetModelTemplates
) as SpreadsheetModelType[];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parseNumericInput(value: string) {
  if (!value) return undefined;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getModelLabel(modelType: SpreadsheetModelType) {
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
      return "Modelo";
  }
}

function buildInitialFormState(
  modelType: SpreadsheetModelType,
  preferredScenario?: string
): FormState {
  const compatibleScenario =
    preferredScenario &&
    preferredScenario in DOMAIN_SCENARIOS &&
    DOMAIN_SCENARIOS[preferredScenario as keyof typeof DOMAIN_SCENARIOS].recommendedModels.includes(
      modelType
    )
      ? preferredScenario
      : Object.values(DOMAIN_SCENARIOS).find((scenario) =>
          scenario.recommendedModels.includes(modelType)
        )?.key || "";

  const scenario =
    compatibleScenario && compatibleScenario in DOMAIN_SCENARIOS
      ? DOMAIN_SCENARIOS[compatibleScenario as keyof typeof DOMAIN_SCENARIOS]
      : undefined;

  return {
    title: "",
    domainScenario: compatibleScenario,
    contractingAgency: "",
    contractReference: "",
    unitName: "",
    lotName: "",
    referenceDate: todayIso(),
    municipality: "",
    state: "",
    cboCode: "",
    professionalCategory: "",
    cctReference: "",
    taxRegime: "lucro_presumido",
    headcount: scenario?.defaultDraftValues.headcount
      ? String(scenario.defaultDraftValues.headcount)
      : "",
    monthlyBaseValue: scenario?.defaultDraftValues.monthlyBaseValue
      ? String(scenario.defaultDraftValues.monthlyBaseValue)
      : "",
    mainShift: "",
    workScale: "",
    weeklyHours: "",
    monthlyHours: "",
    salaryBase: "",
    nightAdditional: "",
    hazardAdditional: "",
    mealAllowance: "",
    transportAllowance: "",
    objectDescription:
      typeof scenario?.defaultDraftValues.description === "string"
        ? scenario.defaultDraftValues.description
        : "",
    mandatoryBenefitsNotes: "",
    notes: "",
  };
}

export default function SpreadsheetCreatePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedModel = searchParams.get("model");
  const requestedScenario = searchParams.get("scenario");

  const initialModel = useMemo<SpreadsheetModelType>(() => {
    if (requestedModel && requestedModel in spreadsheetModelTemplates) {
      return requestedModel as SpreadsheetModelType;
    }

    return "dedicated_labor";
  }, [requestedModel]);

  const [modelType, setModelType] = useState<SpreadsheetModelType>(initialModel);
  const [form, setForm] = useState<FormState>(
    buildInitialFormState(initialModel, requestedScenario || undefined)
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    document.title = "CustoPúblico — Criar Planilha";
  }, []);

  useEffect(() => {
    if (requestedModel && requestedModel in spreadsheetModelTemplates) {
      const nextModel = requestedModel as SpreadsheetModelType;
      setModelType(nextModel);
      setForm(buildInitialFormState(nextModel, requestedScenario || undefined));
      return;
    }

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("model", initialModel);
        return next;
      },
      { replace: true }
    );
  }, [requestedModel, requestedScenario, initialModel, setSearchParams]);

  const template = useMemo(
    () => getSpreadsheetModelTemplate(modelType),
    [modelType]
  );

  const compatibleScenarios = useMemo(() => {
    return Object.values(DOMAIN_SCENARIOS).filter((scenario) =>
      scenario.recommendedModels.includes(modelType)
    );
  }, [modelType]);

  const selectedScenario = useMemo(() => {
    if (form.domainScenario && form.domainScenario in DOMAIN_SCENARIOS) {
      return DOMAIN_SCENARIOS[form.domainScenario as keyof typeof DOMAIN_SCENARIOS];
    }

    return undefined;
  }, [form.domainScenario]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleModelChange(nextModel: SpreadsheetModelType) {
    setModelType(nextModel);
    setForm(buildInitialFormState(nextModel));
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("model", nextModel);
        next.delete("scenario");
        return next;
      },
      { replace: true }
    );
  }

  function handleScenarioChange(nextScenario: string) {
    const scenario =
      nextScenario && nextScenario in DOMAIN_SCENARIOS
        ? DOMAIN_SCENARIOS[nextScenario as keyof typeof DOMAIN_SCENARIOS]
        : undefined;

    setForm((current) => ({
      ...current,
      domainScenario: nextScenario,
      headcount:
        current.headcount ||
        (scenario?.defaultDraftValues.headcount
          ? String(scenario.defaultDraftValues.headcount)
          : ""),
      monthlyBaseValue:
        current.monthlyBaseValue ||
        (scenario?.defaultDraftValues.monthlyBaseValue
          ? String(scenario.defaultDraftValues.monthlyBaseValue)
          : ""),
      objectDescription:
        current.objectDescription ||
        (typeof scenario?.defaultDraftValues.description === "string"
          ? scenario.defaultDraftValues.description
          : ""),
    }));

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("model", modelType);
        if (nextScenario) {
          next.set("scenario", nextScenario);
        } else {
          next.delete("scenario");
        }
        return next;
      },
      { replace: true }
    );
  }

  async function handleSubmit() {
    if (!template) {
      setFeedback({
        open: true,
        severity: "error",
        message: "Modelo inválido para criação.",
      });
      return;
    }

    if (!form.domainScenario) {
      setFeedback({
        open: true,
        severity: "error",
        message: "Selecione um exemplo setorial de partida.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const created: SpreadsheetRecord = createSpreadsheetFromModel({
        modelType,
        title: form.title,
        domainScenario: form.domainScenario,
        contractingAgency: form.contractingAgency,
        contractReference: form.contractReference,
        unitName: form.unitName,
        lotName: form.lotName,
        referenceDate: form.referenceDate,
        municipality: form.municipality,
        state: form.state,
        cboCode: form.cboCode,
        professionalCategory: form.professionalCategory,
        cctReference: form.cctReference,
        taxRegime: form.taxRegime,
        headcount: parseNumericInput(form.headcount),
        monthlyBaseValue: parseNumericInput(form.monthlyBaseValue),
        mainShift: form.mainShift,
        workScale: form.workScale,
        weeklyHours: form.weeklyHours,
        monthlyHours: form.monthlyHours,
        salaryBase: parseNumericInput(form.salaryBase),
        nightAdditional: parseNumericInput(form.nightAdditional),
        hazardAdditional: parseNumericInput(form.hazardAdditional),
        mealAllowance: parseNumericInput(form.mealAllowance),
        transportAllowance: parseNumericInput(form.transportAllowance),
        objectDescription: form.objectDescription,
        description: form.objectDescription,
        mandatoryBenefitsNotes: form.mandatoryBenefitsNotes,
        notes: form.notes,
        category: selectedScenario?.defaultCategory,
      });

      setFeedback({
        open: true,
        severity: "success",
        message: "Planilha criada com sucesso.",
      });

      navigate(`/spreadsheet/${created.id}`);
    } catch (error) {
      setFeedback({
        open: true,
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao criar a planilha.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F7F3F8", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
            <Link component={RouterLink} underline="hover" color="inherit" to="/">
              Início
            </Link>
            <Link
              component={RouterLink}
              underline="hover"
              color="inherit"
              to="/models/new"
            >
              Modelos
            </Link>
            <Typography color="text.primary">Criar planilha</Typography>
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
                      Criar nova planilha
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "#6D6186",
                        mt: 1.5,
                        lineHeight: 1.8,
                        maxWidth: 960,
                      }}
                    >
                      Esta etapa já nasce orientada por domínio. A criação da planilha
                      passa a registrar modelo, cenário setorial, dados iniciais da
                      contratação, referência normativa básica e parâmetros preparatórios
                      do editor.
                    </Typography>
                  </Box>

                  <Button
                    component={RouterLink}
                    to="/models/new"
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                  >
                    Voltar aos modelos
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={getModelLabel(modelType)} color="primary" variant="outlined" />
                  {selectedScenario ? (
                    <Chip label={selectedScenario.label} variant="outlined" />
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ borderRadius: 3 }}>
            O objetivo aqui é fazer a planilha nascer com contexto suficiente para
            montagem, leitura analítica, futura memória de cálculo e validação
            normativa.
          </Alert>

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
                      <DescriptionOutlinedIcon sx={{ color: "#5E35B1" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Modelo e cenário setorial
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
                        label="Modelo-base"
                        value={modelType}
                        onChange={(event) =>
                          handleModelChange(event.target.value as SpreadsheetModelType)
                        }
                        select
                        fullWidth
                      >
                        {MODEL_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {getModelLabel(option)}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        label="Exemplo setorial de partida"
                        value={form.domainScenario}
                        onChange={(event) => handleScenarioChange(event.target.value)}
                        select
                        fullWidth
                      >
                        {compatibleScenarios.map((scenario) => (
                          <MenuItem key={scenario.key} value={scenario.key}>
                            {scenario.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        label="Título da planilha"
                        value={form.title}
                        onChange={(event) => updateField("title", event.target.value)}
                        placeholder="Ex.: Vigilância patrimonial - Campus Central"
                        fullWidth
                      />

                      <TextField
                        label="Descrição resumida do objeto"
                        value={form.objectDescription}
                        onChange={(event) =>
                          updateField("objectDescription", event.target.value)
                        }
                        multiline
                        minRows={3}
                        fullWidth
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <PlaylistAddCheckCircleOutlinedIcon sx={{ color: "#1565C0" }} />
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
                        value={form.contractingAgency}
                        onChange={(event) =>
                          updateField("contractingAgency", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Referência contratual / processo"
                        value={form.contractReference}
                        onChange={(event) =>
                          updateField("contractReference", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Unidade principal"
                        value={form.unitName}
                        onChange={(event) => updateField("unitName", event.target.value)}
                        fullWidth
                      />

                      <TextField
                        label="Lote / grupo"
                        value={form.lotName}
                        onChange={(event) => updateField("lotName", event.target.value)}
                        fullWidth
                      />

                      <TextField
                        label="Data-base"
                        type="date"
                        value={form.referenceDate}
                        onChange={(event) =>
                          updateField("referenceDate", event.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />

                      <TextField
                        label="Regime tributário"
                        value={form.taxRegime}
                        onChange={(event) => updateField("taxRegime", event.target.value)}
                        select
                        fullWidth
                      >
                        <MenuItem value="lucro_presumido">Lucro presumido</MenuItem>
                        <MenuItem value="lucro_real">Lucro real</MenuItem>
                        <MenuItem value="simples_nacional">Simples nacional</MenuItem>
                        <MenuItem value="nao_informado">Não informado</MenuItem>
                      </TextField>

                      <TextField
                        label="Município"
                        value={form.municipality}
                        onChange={(event) =>
                          updateField("municipality", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="UF"
                        value={form.state}
                        onChange={(event) => updateField("state", event.target.value)}
                        fullWidth
                      />

                      <TextField
                        label="Código CBO"
                        value={form.cboCode}
                        onChange={(event) => updateField("cboCode", event.target.value)}
                        fullWidth
                      />

                      <TextField
                        label="Categoria profissional"
                        value={form.professionalCategory}
                        onChange={(event) =>
                          updateField("professionalCategory", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="CCT / ACT / Dissídio paradigma"
                        value={form.cctReference}
                        onChange={(event) =>
                          updateField("cctReference", event.target.value)
                        }
                        fullWidth
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <AccountTreeOutlinedIcon sx={{ color: "#2E7D32" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Postos, jornadas e base econômica
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
                        value={form.headcount}
                        onChange={(event) => updateField("headcount", event.target.value)}
                        fullWidth
                      />

                      <TextField
                        label="Valor mensal de referência"
                        value={form.monthlyBaseValue}
                        onChange={(event) =>
                          updateField("monthlyBaseValue", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Turno / arranjo predominante"
                        value={form.mainShift}
                        onChange={(event) => updateField("mainShift", event.target.value)}
                        fullWidth
                      />

                      <TextField
                        label="Escala"
                        value={form.workScale}
                        onChange={(event) => updateField("workScale", event.target.value)}
                        placeholder="Ex.: 12x36, comercial, 44h"
                        fullWidth
                      />

                      <TextField
                        label="Jornada semanal"
                        value={form.weeklyHours}
                        onChange={(event) =>
                          updateField("weeklyHours", event.target.value)
                        }
                        placeholder="Ex.: 44"
                        fullWidth
                      />

                      <TextField
                        label="Horas mensais"
                        value={form.monthlyHours}
                        onChange={(event) =>
                          updateField("monthlyHours", event.target.value)
                        }
                        placeholder="Ex.: 220"
                        fullWidth
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <FactCheckOutlinedIcon sx={{ color: "#EF6C00" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Custos mínimos relevantes
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
                        label="Salário-base"
                        value={form.salaryBase}
                        onChange={(event) => updateField("salaryBase", event.target.value)}
                        fullWidth
                      />

                      <TextField
                        label="Adicional noturno"
                        value={form.nightAdditional}
                        onChange={(event) =>
                          updateField("nightAdditional", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Adicional de insalubridade/periculosidade"
                        value={form.hazardAdditional}
                        onChange={(event) =>
                          updateField("hazardAdditional", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Auxílio-alimentação"
                        value={form.mealAllowance}
                        onChange={(event) =>
                          updateField("mealAllowance", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Vale-transporte"
                        value={form.transportAllowance}
                        onChange={(event) =>
                          updateField("transportAllowance", event.target.value)
                        }
                        fullWidth
                      />
                    </Box>

                    <TextField
                      label="Observações sobre benefícios obrigatórios"
                      value={form.mandatoryBenefitsNotes}
                      onChange={(event) =>
                        updateField("mandatoryBenefitsNotes", event.target.value)
                      }
                      multiline
                      minRows={3}
                      fullWidth
                    />

                    <TextField
                      label="Observações internas"
                      value={form.notes}
                      onChange={(event) => updateField("notes", event.target.value)}
                      multiline
                      minRows={3}
                      fullWidth
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>

            <Stack spacing={3}>
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                      Resumo do modelo
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Modelo:</strong> {template?.title || "Não identificado"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Descrição:</strong>{" "}
                      {template?.shortDescription || "Sem descrição."}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                    Casos de uso
                  </Typography>

                  <Stack spacing={0.75}>
                    {(template?.useCases || []).map((item) => (
                      <Typography key={item} variant="body2" color="text.secondary">
                        • {item}
                      </Typography>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                    Blocos principais
                  </Typography>

                  <Stack spacing={0.75}>
                    {(template?.mainBlocks || []).map((item) => (
                      <Typography key={item} variant="body2" color="text.secondary">
                        • {item}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {selectedScenario ? (
                <Card variant="outlined" sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                      Leitura do cenário setorial
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedScenario.summary}
                    </Typography>

                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                      Documentos esperados
                    </Typography>
                    <Stack spacing={0.6} sx={{ mb: 2 }}>
                      {selectedScenario.expectedDocuments.map((item) => (
                        <Typography key={item} variant="body2" color="text.secondary">
                          • {item}
                        </Typography>
                      ))}
                    </Stack>

                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                      Vetores de custo esperados
                    </Typography>
                    <Stack spacing={0.6} sx={{ mb: 2 }}>
                      {selectedScenario.expectedCostDrivers.map((item) => (
                        <Typography key={item} variant="body2" color="text.secondary">
                          • {item}
                        </Typography>
                      ))}
                    </Stack>

                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                      Focos de validação
                    </Typography>
                    <Stack spacing={0.6}>
                      {selectedScenario.validationFocus.map((item) => (
                        <Typography key={item} variant="body2" color="text.secondary">
                          • {item}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="h6" fontWeight={700}>
                      Próxima ação
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Ao criar a planilha, o sistema já gera a estrutura inicial,
                      registra o cenário setorial e salva os dados preparatórios do
                      editor para continuidade no detalhe.
                    </Typography>

                    <Button
                      variant="contained"
                      startIcon={<SaveOutlinedIcon />}
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Criando..." : "Criar planilha"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Stack>
      </Container>

      <Snackbar
        open={feedback.open}
        autoHideDuration={3500}
        onClose={() => setFeedback((current) => ({ ...current, open: false }))}
      >
        <Alert
          onClose={() => setFeedback((current) => ({ ...current, open: false }))}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
