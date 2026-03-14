import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RefreshIcon from "@mui/icons-material/Refresh";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import TableChartIcon from "@mui/icons-material/TableChart";
import { Link as RouterLink } from "react-router-dom";
import {
  getAllSpreadsheets,
  SpreadsheetRecord,
} from "../services/spreadsheetService";

function formatCurrency(value: number | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function getModelLabel(modelType?: string) {
  switch (modelType) {
    case "dedicated_labor":
      return "Dedicação exclusiva";
    case "non_dedicated_labor":
      return "Sem dedicação exclusiva";
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

function getDomainScenarioLabel(record: SpreadsheetRecord) {
  if (record.trainingProfile?.domainScenarioLabel) {
    return record.trainingProfile.domainScenarioLabel;
  }

  switch (record.domainScenario) {
    case "reception_administrative_support":
      return "Recepção e apoio administrativo";
    case "cleaning_conservation":
      return "Limpeza e conservação";
    case "concierge_access_control":
      return "Portaria e controle de acesso";
    case "property_security":
      return "Vigilância patrimonial";
    default:
      return "Domínio não classificado";
  }
}

function readEditorDraftField(
  spreadsheet: SpreadsheetRecord,
  field: string
): string {
  const editorDraft =
    spreadsheet.metadata &&
    typeof spreadsheet.metadata === "object" &&
    spreadsheet.metadata.editorDraft &&
    typeof spreadsheet.metadata.editorDraft === "object"
      ? (spreadsheet.metadata.editorDraft as Record<string, unknown>)
      : undefined;

  const value = editorDraft?.[field];
  return typeof value === "string" ? value : "";
}

function getProfessionalCategory(spreadsheet: SpreadsheetRecord) {
  const fromEditor = readEditorDraftField(spreadsheet, "professionalCategory");
  if (fromEditor) {
    return fromEditor;
  }

  const laborRow = spreadsheet.rows.find((row) => {
    const category = row.categoria.toLowerCase();
    return (
      category.includes("mão de obra") ||
      category.includes("equipe operacional")
    );
  });

  return laborRow?.item || "";
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800} color="#241B3A">
          {value}
        </Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SpreadsheetCard({ spreadsheet }: { spreadsheet: SpreadsheetRecord }) {
  const modelStyles = getModelChipStyles(spreadsheet.modelType);
  const statusStyles = getStatusChipStyles(spreadsheet.status);
  const domainLabel = getDomainScenarioLabel(spreadsheet);
  const professionalCategory = getProfessionalCategory(spreadsheet);
  const municipality = readEditorDraftField(spreadsheet, "municipality");
  const state = readEditorDraftField(spreadsheet, "state");
  const cctReference = readEditorDraftField(spreadsheet, "cctReference");
  const cboCode = readEditorDraftField(spreadsheet, "cboCode");
  const referenceLocation =
    [municipality, state].filter(Boolean).join(" / ") || "Não informado";

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        height: "100%",
        borderColor: "rgba(91, 58, 122, 0.10)",
        transition: "0.2s ease",
        "&:hover": {
          borderColor: "rgba(91, 58, 122, 0.24)",
          boxShadow: "0 10px 24px rgba(79, 55, 103, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#241B3A",
                  lineHeight: 1.2,
                }}
              >
                {spreadsheet.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#6D6186",
                  mt: 1,
                  lineHeight: 1.7,
                }}
              >
                {spreadsheet.description}
              </Typography>
            </Box>

            <Button
              component={RouterLink}
              to={`/spreadsheet/${spreadsheet.id}`}
              variant="outlined"
              sx={{ alignSelf: { xs: "flex-start", sm: "flex-start" } }}
            >
              Abrir
            </Button>
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
              label={spreadsheet.status}
              sx={{
                backgroundColor: statusStyles.backgroundColor,
                color: statusStyles.color,
                fontWeight: 700,
              }}
            />

            <Chip
              label={domainLabel}
              variant="outlined"
              sx={{
                fontWeight: 700,
                borderColor: "rgba(21, 101, 192, 0.24)",
                color: "#1565C0",
              }}
            />

            <Chip
              label={spreadsheet.isSeedExample ? "Exemplo nativo" : "Planilha criada"}
              variant="outlined"
            />

            <Chip
              label={spreadsheet.source === "api" ? "Origem API" : "Origem local"}
              variant="outlined"
            />
          </Stack>

          <Divider />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <ApartmentOutlinedIcon sx={{ fontSize: 18, color: "#7A708D", mt: "2px" }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Órgão / unidade
                </Typography>
                <Typography variant="body2" color="#241B3A" fontWeight={600}>
                  {spreadsheet.contractingAgency || "Não informado"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {spreadsheet.unitName || "Unidade não informada"}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="flex-start">
              <SourceOutlinedIcon sx={{ fontSize: 18, color: "#7A708D", mt: "2px" }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Processo / lote
                </Typography>
                <Typography variant="body2" color="#241B3A" fontWeight={600}>
                  {spreadsheet.contractReference || "Sem referência"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {spreadsheet.lotName || "Lote não informado"}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="flex-start">
              <FactCheckOutlinedIcon sx={{ fontSize: 18, color: "#7A708D", mt: "2px" }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Categoria / CBO / CCT
                </Typography>
                <Typography variant="body2" color="#241B3A" fontWeight={600}>
                  {professionalCategory || "Categoria não informada"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cboCode || "CBO não informado"}
                  {cctReference ? ` • ${cctReference}` : " • CCT não informada"}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="flex-start">
              <AttachMoneyOutlinedIcon sx={{ fontSize: 18, color: "#7A708D", mt: "2px" }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Valor de referência
                </Typography>
                <Typography variant="body2" color="#241B3A" fontWeight={600}>
                  {formatCurrency(spreadsheet.monthlyBaseValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {spreadsheet.headcount || 0} postos/unidades • {spreadsheet.rows.length} itens
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Inventory2OutlinedIcon sx={{ fontSize: 16, color: "#7A708D" }} />
              <Typography variant="body2" color="text.secondary">
                Localidade: {referenceLocation}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: 16, color: "#7A708D" }} />
              <Typography variant="body2" color="text.secondary">
                Atualizado em {spreadsheet.updatedAt}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetRecord[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>("");

  const reloadSpreadsheets = useCallback(() => {
    const data = getAllSpreadsheets();
    setSpreadsheets(data);
    setLastRefresh(new Date().toLocaleString("pt-BR"));
  }, []);

  useEffect(() => {
    document.title = "CustoPúblico — Painel";
    reloadSpreadsheets();
  }, [reloadSpreadsheets]);

  useEffect(() => {
    function handleFocus() {
      reloadSpreadsheets();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        reloadSpreadsheets();
      }
    }

    function handleStorage() {
      reloadSpreadsheets();
    }

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reloadSpreadsheets]);

  const createdSpreadsheets = useMemo(
    () => spreadsheets.filter((item) => !item.isSeedExample),
    [spreadsheets]
  );

  const seedExamples = useMemo(
    () => spreadsheets.filter((item) => item.isSeedExample),
    [spreadsheets]
  );

  const totalEstimatedValue = useMemo(() => {
    return createdSpreadsheets.reduce(
      (sum, spreadsheet) => sum + (spreadsheet.monthlyBaseValue || 0),
      0
    );
  }, [createdSpreadsheets]);

  const inProgressCount = useMemo(() => {
    return createdSpreadsheets.filter(
      (spreadsheet) => spreadsheet.status === "Em elaboração"
    ).length;
  }, [createdSpreadsheets]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F7F3F8", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
            <Typography color="text.primary">Início</Typography>
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
                      Gestão de Planilhas de Custos Públicas
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
                      Painel inicial com exemplos nativos de domínio e planilhas já
                      criadas. A partir daqui, o produto deixa de funcionar como
                      listagem genérica e passa a expor contexto contratual, cenário
                      setorial e base técnica para elaboração, leitura e análise.
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                    <Button
                      component={RouterLink}
                      to="/models/new"
                      variant="outlined"
                    >
                      Ver modelos
                    </Button>

                    <Button
                      component={RouterLink}
                      to="/create"
                      variant="contained"
                      startIcon={<AddCircleOutlineIcon />}
                    >
                      Nova planilha
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={reloadSpreadsheets}
                    >
                      Atualizar painel
                    </Button>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label="Recepção / apoio administrativo" variant="outlined" />
                  <Chip label="Limpeza e conservação" variant="outlined" />
                  <Chip label="Portaria / controle de acesso" variant="outlined" />
                  <Chip label="Vigilância patrimonial" variant="outlined" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            <StatCard
              label="Planilhas criadas"
              value={createdSpreadsheets.length}
              hint="Itens reais do ambiente local"
            />
            <StatCard
              label="Exemplos nativos"
              value={seedExamples.length}
              hint="Base inicial do domínio"
            />
            <StatCard
              label="Em elaboração"
              value={inProgressCount}
              hint="Status atual das planilhas criadas"
            />
            <StatCard
              label="Valor de referência"
              value={formatCurrency(totalEstimatedValue)}
              hint="Somatório das planilhas criadas"
            />
          </Box>

          <Alert severity="info" sx={{ borderRadius: 3 }}>
            A Home agora lê melhor o contexto das planilhas e se atualiza novamente ao
            retornar o foco da aba, ao mudar a visibilidade da página e ao clicar em
            “Atualizar painel”.
          </Alert>

          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={1.5}
            >
              <Typography variant="h5" fontWeight={800} color="#241B3A">
                Planilhas criadas
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Última atualização: {lastRefresh || "—"}
              </Typography>
            </Stack>

            {createdSpreadsheets.length === 0 ? (
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="h6" fontWeight={700}>
                      Nenhuma planilha criada ainda
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comece pelos modelos e já crie uma planilha com cenário setorial,
                      órgão, referência contratual e parâmetros iniciais do editor.
                    </Typography>
                    <Box>
                      <Button
                        component={RouterLink}
                        to="/models/new"
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                      >
                        Criar primeira planilha
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    lg: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                {createdSpreadsheets.map((spreadsheet) => (
                  <SpreadsheetCard
                    key={spreadsheet.id}
                    spreadsheet={spreadsheet}
                  />
                ))}
              </Box>
            )}
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={800} color="#241B3A">
              Exemplos nativos do domínio
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {seedExamples.map((spreadsheet) => (
                <SpreadsheetCard key={spreadsheet.id} spreadsheet={spreadsheet} />
              ))}
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
