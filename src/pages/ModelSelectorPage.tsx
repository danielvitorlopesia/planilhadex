import React from "react";
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
  Grid,
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
  complexity: SpreadsheetModelTemplate["complexityLabel"]
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

export default function ModelSelectorPage() {
  const navigate = useNavigate();

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
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Selecione o modelo mais aderente à natureza da contratação ou da
                  revisão contratual. Cada opção cria uma estrutura inicial com
                  blocos, campos e lógica compatíveis com o caso de uso.
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

          <Grid container spacing={3}>
            {spreadsheetModelTemplates.map((model) => (
              <Grid item xs={12} md={6} key={model.type}>
                <Card
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
                            {model.badgeLabel}
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {model.shortTitle}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        label={model.complexityLabel}
                        color={getComplexityColor(model.complexityLabel)}
                        size="small"
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {model.description}
                    </Typography>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        Casos de uso
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {model.useCases.map((useCase) => (
                          <Chip
                            key={useCase}
                            label={useCase}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        Blocos principais
                      </Typography>

                      <Stack spacing={0.5}>
                        {model.primaryBlocks.map((block) => (
                          <Typography
                            key={block}
                            variant="body2"
                            color="text.secondary"
                          >
                            • {block}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        Observações
                      </Typography>

                      <Stack spacing={0.5}>
                        {model.creationHints.map((hint) => (
                          <Typography
                            key={hint}
                            variant="body2"
                            color="text.secondary"
                          >
                            • {hint}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ mt: "auto", pt: 1 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                      >
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {model.recommendedForPublicBodies ? (
                            <Chip
                              size="small"
                              color="primary"
                              label="Aderente ao setor público"
                            />
                          ) : null}

                          {model.requiresReferenceSpreadsheet ? (
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
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}