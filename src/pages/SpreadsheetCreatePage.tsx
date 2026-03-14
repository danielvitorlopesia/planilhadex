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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PlaylistAddCheckCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCheckCircleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  getSpreadsheetModelTemplate,
  spreadsheetModelTemplates,
} from "../mocks/modelTemplatesMocks";
import {
  ModelInitialFieldDefinition,
  SpreadsheetCreateDraft,
  SpreadsheetModelTemplate,
  SpreadsheetModelType,
} from "../types/spreadsheetModels";

const EMPTY_DRAFT: SpreadsheetCreateDraft = {
  title: "",
  organization: "",
  objectDescription: "",
  processReference: "",
  city: "",
  state: "",
  baseDate: "",
  contractTermMonths: "",
  taxRegime: "",
  notes: "",
  referenceSpreadsheetId: "",
  referenceSpreadsheetVersionId: "",
  rebalanceEventType: "",
  rebalanceEventDate: "",
};

function isSpreadsheetModelType(value: string | null): value is SpreadsheetModelType {
  return spreadsheetModelTemplates.some((item) => item.type === value);
}

function getInitialDraft(): SpreadsheetCreateDraft {
  return { ...EMPTY_DRAFT };
}

function renderField(
  field: ModelInitialFieldDefinition,
  draft: SpreadsheetCreateDraft,
  onChange: (key: keyof SpreadsheetCreateDraft, value: string) => void
) {
  const value = String(draft[field.key as keyof SpreadsheetCreateDraft] ?? "");

  if (field.type === "select") {
    return (
      <TextField
        select
        fullWidth
        label={field.label}
        value={value}
        required={field.required}
        helperText={field.helperText}
        onChange={(event) =>
          onChange(field.key as keyof SpreadsheetCreateDraft, event.target.value)
        }
      >
        <MenuItem value="">Selecione</MenuItem>
        {(field.options ?? []).map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (field.type === "textarea") {
    return (
      <TextField
        fullWidth
        multiline
        minRows={4}
        label={field.label}
        value={value}
        required={field.required}
        placeholder={field.placeholder}
        helperText={field.helperText}
        onChange={(event) =>
          onChange(field.key as keyof SpreadsheetCreateDraft, event.target.value)
        }
      />
    );
  }

  return (
    <TextField
      fullWidth
      type={field.type}
      label={field.label}
      value={value}
      required={field.required}
      placeholder={field.placeholder}
      helperText={field.helperText}
      onChange={(event) =>
        onChange(field.key as keyof SpreadsheetCreateDraft, event.target.value)
      }
      InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
    />
  );
}

export default function SpreadsheetCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [draft, setDraft] = useState<SpreadsheetCreateDraft>(getInitialDraft());
  const [touched, setTouched] = useState(false);

  const modelParam = searchParams.get("model");
  const modelType = isSpreadsheetModelType(modelParam) ? modelParam : null;

  const selectedModel: SpreadsheetModelTemplate | undefined = useMemo(() => {
    if (!modelType) return undefined;
    return getSpreadsheetModelTemplate(modelType);
  }, [modelType]);

  useEffect(() => {
    document.title = "CustoPúblico — Nova Planilha";
  }, []);

  const requiredErrors = useMemo(() => {
    if (!selectedModel) return [];

    return selectedModel.initialFormFields
      .filter((field) => field.required)
      .filter((field) => {
        const value = String(draft[field.key as keyof SpreadsheetCreateDraft] ?? "").trim();
        return value.length === 0;
      })
      .map((field) => field.label);
  }, [draft, selectedModel]);

  const handleChange = (key: keyof SpreadsheetCreateDraft, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveDraft = () => {
    setTouched(true);

    if (!selectedModel) return;
    if (requiredErrors.length > 0) return;

    alert(
      `Rascunho criado com sucesso.\n\nModelo: ${selectedModel.title}\nTítulo: ${draft.title || "Sem título"}`
    );
  };

  const handleContinue = () => {
    setTouched(true);

    if (!selectedModel) return;
    if (requiredErrors.length > 0) return;

    alert(
      `Próxima etapa preparada.\n\nModelo: ${selectedModel.title}\nTítulo: ${draft.title || "Sem título"}\n\nNo próximo passo, essa ação deverá criar a planilha real e abrir o editor estruturado.`
    );
  };

  if (!selectedModel) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#F7F3F8", py: 4 }}>
        <Container maxWidth="md">
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
                Nova planilha
              </Link>
              <Typography color="text.primary">Criação</Typography>
            </Breadcrumbs>

            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={2}>
                  <Typography variant="h4" fontWeight={700}>
                    Modelo não identificado
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    A rota de criação precisa receber um parâmetro válido em
                    <strong> ?model=</strong>.
                  </Typography>
                  <Alert severity="warning">
                    Volte à seleção de modelos e escolha uma opção válida para iniciar
                    a criação da planilha.
                  </Alert>
                  <Stack direction="row" spacing={2}>
                    <Button
                      component={RouterLink}
                      to="/models/new"
                      variant="contained"
                    >
                      Ir para seleção de modelos
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/"
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                    >
                      Voltar ao início
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F7F3F8", py: 4 }}>
      <Container maxWidth="lg">
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
              Nova planilha
            </Link>
            <Typography color="text.primary">Criação inicial</Typography>
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
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip label={selectedModel.badgeLabel} size="small" color="primary" />
                      <Chip
                        label={selectedModel.complexityLabel}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    <Typography variant="h4" fontWeight={800} color="#2B2340">
                      {selectedModel.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{ color: "#6D6186", mt: 1.5, lineHeight: 1.8, maxWidth: 900 }}
                    >
                      {selectedModel.description}
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button
                      component={RouterLink}
                      to="/models/new"
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                    >
                      Trocar modelo
                    </Button>

                    <Button onClick={() => navigate("/")} variant="text">
                      Voltar ao início
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(320px, 1fr)" },
              gap: 3,
            }}
          >
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Dados iniciais da planilha
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Preencha os campos iniciais para criar a estrutura base do modelo
                      selecionado. Os campos exibidos abaixo já respeitam o tipo de
                      planilha escolhido.
                    </Typography>
                  </Box>

                  <Divider />

                  {touched && requiredErrors.length > 0 ? (
                    <Alert severity="error">
                      Preencha os campos obrigatórios pendentes:{" "}
                      <strong>{requiredErrors.join(", ")}</strong>.
                    </Alert>
                  ) : null}

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    {selectedModel.initialFormFields.map((field) => (
                      <Box
                        key={field.key}
                        sx={{
                          gridColumn: {
                            xs: "span 1",
                            md: field.type === "textarea" ? "1 / -1" : "span 1",
                          },
                        }}
                      >
                        {renderField(field, draft, handleChange)}
                      </Box>
                    ))}
                  </Box>

                  <Divider />

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<SaveOutlinedIcon />}
                      onClick={handleSaveDraft}
                    >
                      Salvar rascunho
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<PlaylistAddCheckCircleOutlinedIcon />}
                      onClick={handleContinue}
                      sx={{
                        backgroundColor: "#8E5AB5",
                        "&:hover": {
                          backgroundColor: "#7B4CA1",
                        },
                      }}
                    >
                      Criar e continuar
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Stack spacing={3}>
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <InfoOutlinedIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight={700}>
                        Resumo do modelo
                      </Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Nome:</strong> {selectedModel.shortTitle}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Aderente ao setor público:</strong>{" "}
                      {selectedModel.recommendedForPublicBodies ? "Sim" : "Não"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Exige planilha-base:</strong>{" "}
                      {selectedModel.requiresReferenceSpreadsheet ? "Sim" : "Não"}
                    </Typography>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        Blocos principais
                      </Typography>

                      <Stack spacing={0.75}>
                        {selectedModel.primaryBlocks.map((block) => (
                          <Typography key={block} variant="body2" color="text.secondary">
                            • {block}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Orientações iniciais
                    </Typography>

                    <Stack spacing={1}>
                      {selectedModel.creationHints.map((hint) => (
                        <Typography key={hint} variant="body2" color="text.secondary">
                          • {hint}
                        </Typography>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Próxima etapa
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Após esta fase, o sistema deverá abrir o editor principal da
                      planilha já configurado com a estrutura do modelo selecionado.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
