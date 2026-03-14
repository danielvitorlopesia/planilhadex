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
  Stack,
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
import TableChartIcon from "@mui/icons-material/TableChart";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  getSpreadsheetById,
  SpreadsheetRecord,
} from "../services/spreadsheetService";

type LoadState = "loading" | "success" | "error";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function getModelLabel(modelType?: SpreadsheetRecord["modelType"]) {
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

function getModelIcon(modelType?: SpreadsheetRecord["modelType"]) {
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

function getModelChipStyles(modelType?: SpreadsheetRecord["modelType"]) {
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
    default:
      return {
        backgroundColor: "#EFE7F6",
        color: "#8E5AB5",
      };
  }
}

export default function SpreadsheetDetail() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetRecord | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "local" | null>(null);

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

      try {
        const response = await fetch(`/api/spreadsheets/${id}`);

        if (response.ok) {
          const data = await response.json();
          const payload = (data?.spreadsheet ?? data) as SpreadsheetRecord;

          if (isMounted) {
            setSpreadsheet(payload);
            setDataSource("api");
            setState("success");
          }
          return;
        }

        const localSpreadsheet = getSpreadsheetById(id);

        if (localSpreadsheet) {
          if (isMounted) {
            setSpreadsheet(localSpreadsheet);
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
        const localSpreadsheet = getSpreadsheetById(id);

        if (localSpreadsheet) {
          if (isMounted) {
            setSpreadsheet(localSpreadsheet);
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

  if (state === "error" || !spreadsheet) {
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
                        maxWidth: 900,
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
                    label={
                      dataSource === "local"
                        ? "Origem local"
                        : "Origem API"
                    }
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

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
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(320px, 1fr)" },
              gap: 3,
            }}
          >
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Estrutura inicial da planilha
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    Itens-base gerados a partir do modelo selecionado.
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Item</strong></TableCell>
                        <TableCell><strong>Categoria</strong></TableCell>
                        <TableCell align="right"><strong>Quantidade</strong></TableCell>
                        <TableCell align="right"><strong>Valor unitário</strong></TableCell>
                        <TableCell align="right"><strong>Subtotal</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {spreadsheet.rows.map((row, index) => (
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
                          <TableCell>
                            <Chip
                              size="small"
                              label={row.status}
                              sx={{
                                backgroundColor:
                                  row.status === "Pendente" ? "#FFF3E0" : "#E7F6EC",
                                color:
                                  row.status === "Pendente" ? "#EF6C00" : "#2E7D32",
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
                  <Stack spacing={1.5}>
                    <Typography variant="h6" fontWeight={700}>
                      Próximo passo
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      A próxima evolução dessa tela será transformar esta estrutura
                      inicial em editor real por modelo, com blocos específicos,
                      memória de cálculo, validações e análise automática.
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
