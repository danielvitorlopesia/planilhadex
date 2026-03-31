import { useMemo } from "react";
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
  Stack,
  Typography,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { spreadsheetModelTemplates } from "../mocks/modelTemplatesMocks";
import {
  SpreadsheetModelTemplate,
  SpreadsheetModelType,
} from "../types/spreadsheetModels";

type TemplateWithExtras = SpreadsheetModelTemplate & {
  type: SpreadsheetModelType;
  title?: string;
  shortTitle?: string;
  description?: string;
  complexityLabel?: string;
  useCases?: string[];
  mainBlocks?: string[];
  primaryBlocks?: string[];
  creationHints?: string[];
  badgeLabel?: string;
  recommendedForPublicBodies?: boolean;
  requiresReferenceSpreadsheet?: boolean;
};

function getModelIcon(type: SpreadsheetModelType) {
  switch (type) {
    case "dedicated_labor":
      return <Groups2OutlinedIcon fontSize="small" />;
    case "non_dedicated_labor":
      return <TableChartIcon fontSize="small" />;
    case "service_composition":
      return <AccountTreeOutlinedIcon fontSize="small" />;
    case "economic_rebalance":
      return <CompareArrowsOutlinedIcon fontSize="small" />;
    default:
      return <PrecisionManufacturingOutlinedIcon fontSize="small" />;
  }
}

function getComplexityColor(
  complexity?: string
): "success" | "warning" | "error" {
  switch (complexity) {
    case "Essencial":
      return "success";
    case "Intermediário":
      return "warning";
    case "Avançado":
      return "error";
    default:
      return "warning";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getOptionalString(
  value: SpreadsheetModelTemplate,
  key: keyof TemplateWithExtras
): string | undefined {
  if (!isRecord(value)) return undefined;
  const raw = value[key as string];
  return typeof raw === "string" && raw.trim() ? raw : undefined;
}

function getOptionalBoolean(
  value: SpreadsheetModelTemplate,
  key: keyof TemplateWithExtras
): boolean {
  if (!isRecord(value)) return false;
  return value[key as string] === true;
}

function getOptionalStringArray(
  value: SpreadsheetModelTemplate,
  key: keyof TemplateWithExtras
): string[] {
  if (!isRecord(value)) return [];
  const raw = value[key as string];
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string") : [];
}

function normalizeTemplates(): SpreadsheetModelTemplate[] {
  if (Array.isArray(spreadsheetModelTemplates)) {
    return spreadsheetModelTemplates;
  }

  if (spreadsheetModelTemplates && typeof spreadsheetModelTemplates === "object") {
    return Object.values(
      spreadsheetModelTemplates as Record<string, SpreadsheetModelTemplate>
    );
  }

  return [];
}

export default function ModelSelectorPage() {
  const navigate = useNavigate();

  const templates = useMemo(() => normalizeTemplates(), []);

  const handleCreate = (modelType: SpreadsheetModelType) => {
    navigate(`/models/new/create?model=${modelType}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
              <Link
                component={RouterLink}
                underline="hover"
                color="inherit"
                to="/"
              >
                Início
              </Link>
              <Typography color="text.primary">Nova planilha</Typography>
            </Breadcrumbs>

            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Escolha o tipo de planilha
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Selecione o modelo mais aderente à natureza da contratação ou
                  da revisão contratual. Cada opção cria uma estrutura inicial
                  com blocos, campos e lógica compatíveis com o caso de uso.
                </Typography>
              </Box>

              <Button
                component={RouterLink}
                to="/"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
              >
                Voltar
              </Button>
            </Stack>
          </Stack>

          <Alert severity="info">
            Nesta etapa, o sistema passa a tratar a planilha conforme o modelo
            selecionado, em vez de abrir uma estrutura genérica única.
          </Alert>

          {templates.length === 0 ? (
            <Alert severity="warning">
              Nenhum modelo de planilha foi encontrado na configuração atual.
            </Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            {templates.map((model) => {
              const useCases = getOptionalStringArray(model, "useCases");
              const mainBlocksPrimary = getOptionalStringArray(model, "mainBlocks");
              const fallbackBlocks = getOptionalStringArray(model, "primaryBlocks");
              const mainBlocks =
                mainBlocksPrimary.length > 0 ? mainBlocksPrimary : fallbackBlocks;

              const creationHints = getOptionalStringArray(model, "creationHints");

              const shortTitle = getOptionalString(model, "shortTitle");
              const titleText = getOptionalString(model, "title");
              const badgeText = getOptionalString(model, "badgeLabel");
              const complexityLabel = getOptionalString(model, "complexityLabel");
              const descriptionText = getOptionalString(model, "description");

              const badgeLabel = badgeText || shortTitle || titleText || model.type;
              const title = shortTitle || titleText || model.type;
              const description =
                descriptionText ||
                "Sem descrição disponível para este modelo.";

              const recommendedForPublicBodies = getOptionalBoolean(
                model,
                "recommendedForPublicBodies"
              );
              const requiresReferenceSpreadsheet = getOptionalBoolean(
                model,
                "requiresReferenceSpreadsheet"
              );

              return (
                <Card
                  key={model.type}
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      height: "100%",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "action.hover",
                          }}
                        >
                          {getModelIcon(model.type)}
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            {badgeLabel}
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {title}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        label={complexityLabel || "Intermediário"}
                        color={getComplexityColor(complexityLabel)}
                        size="small"
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>

                    <Divider />

                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        gutterBottom
                      >
                        Casos de uso
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {useCases.length > 0 ? (
                          useCases.map((useCase) => (
                            <Chip
                              key={useCase}
                              label={useCase}
                              size="small"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhum caso de uso informado.
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        gutterBottom
                      >
                        Blocos principais
                      </Typography>

                      <Stack spacing={0.5}>
                        {mainBlocks.length > 0 ? (
                          mainBlocks.map((block) => (
                            <Typography
                              key={block}
                              variant="body2"
                              color="text.secondary"
                            >
                              • {block}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhum bloco principal informado.
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        gutterBottom
                      >
                        Observações
                      </Typography>

                      <Stack spacing={0.5}>
                        {creationHints.length > 0 ? (
                          creationHints.map((hint) => (
                            <Typography
                              key={hint}
                              variant="body2"
                              color="text.secondary"
                            >
                              • {hint}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sem observações adicionais.
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    <Box sx={{ mt: "auto", pt: 1 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {recommendedForPublicBodies ? (
                            <Chip
                              size="small"
                              color="primary"
                              label="Aderente ao setor público"
                            />
                          ) : null}

                          {requiresReferenceSpreadsheet ? (
                            <Chip
                              size="small"
                              color="warning"
                              label="Exige planilha-base"
                            />
                          ) : null}
                        </Stack>

                        <Button
                          variant="contained"
                          onClick={() => handleCreate(model.type)}
                        >
                          Criar planilha
                        </Button>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
