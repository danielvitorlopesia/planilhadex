import React from "react";
import {
  AppBar,
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
import { useNavigate, useParams } from "react-router-dom";
import { spreadsheetsMock } from "./Home";

type SpreadsheetRow = {
  item: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  status: string;
};

type VersionRow = {
  versao: string;
  data: string;
  responsavel: string;
  observacao: string;
};

type DocumentRow = {
  nome: string;
  tipo: string;
  atualizacao: string;
};

function getStatusStyles(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("concluído") || normalized.includes("concluido")) {
    return {
      label: status,
      sx: {
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
        fontWeight: 700,
      },
    };
  }

  if (normalized.includes("elaboração") || normalized.includes("elaboracao")) {
    return {
      label: status,
      sx: {
        backgroundColor: "rgba(140, 88, 162, 0.12)",
        color: "#6f3f84",
        fontWeight: 700,
      },
    };
  }

  return {
    label: status,
    sx: {
      backgroundColor: "rgba(140, 88, 162, 0.12)",
      color: "#6f3f84",
      fontWeight: 700,
    },
  };
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getSpreadsheetRows(id?: string): SpreadsheetRow[] {
  const baseRows: Record<string, SpreadsheetRow[]> = {
    "1": [
      {
        item: "Direção de Produção",
        categoria: "Equipe técnica",
        quantidade: 1,
        valorUnitario: 4500,
        subtotal: 4500,
        status: "Conferido",
      },
      {
        item: "Produção Executiva",
        categoria: "Equipe técnica",
        quantidade: 1,
        valorUnitario: 4000,
        subtotal: 4000,
        status: "Conferido",
      },
      {
        item: "Assessoria de Comunicação",
        categoria: "Comunicação",
        quantidade: 1,
        valorUnitario: 3500,
        subtotal: 3500,
        status: "Em revisão",
      },
      {
        item: "Custos Administrativos e Logísticos",
        categoria: "Operacional",
        quantidade: 1,
        valorUnitario: 7000,
        subtotal: 7000,
        status: "Conferido",
      },
      {
        item: "Impulsionamento e materiais gráficos",
        categoria: "Divulgação",
        quantidade: 1,
        valorUnitario: 2200,
        subtotal: 2200,
        status: "Em revisão",
      },
      {
        item: "Cachês artísticos",
        categoria: "Artístico",
        quantidade: 3,
        valorUnitario: 2000,
        subtotal: 6000,
        status: "Pendente",
      },
    ],
    "2": [
      {
        item: "Pré-produção",
        categoria: "Fase",
        quantidade: 2,
        valorUnitario: 1,
        subtotal: 2,
        status: "Concluído",
      },
      {
        item: "Produção",
        categoria: "Fase",
        quantidade: 2,
        valorUnitario: 1,
        subtotal: 2,
        status: "Em andamento",
      },
      {
        item: "Pós-produção",
        categoria: "Fase",
        quantidade: 3,
        valorUnitario: 1,
        subtotal: 3,
        status: "Pendente",
      },
      {
        item: "Plano de comunicação",
        categoria: "Entrega",
        quantidade: 12,
        valorUnitario: 1,
        subtotal: 12,
        status: "Em andamento",
      },
    ],
    "3": [
      {
        item: "Comprovantes financeiros",
        categoria: "Prestação",
        quantidade: 18,
        valorUnitario: 1,
        subtotal: 18,
        status: "Em revisão",
      },
      {
        item: "Relatório técnico",
        categoria: "Prestação",
        quantidade: 1,
        valorUnitario: 1,
        subtotal: 1,
        status: "Pendente",
      },
      {
        item: "Ata de encerramento",
        categoria: "Prestação",
        quantidade: 1,
        valorUnitario: 1,
        subtotal: 1,
        status: "Pendente",
      },
      {
        item: "Anexos comprobatórios",
        categoria: "Prestação",
        quantidade: 24,
        valorUnitario: 1,
        subtotal: 24,
        status: "Em revisão",
      },
    ],
    "4": [
      {
        item: "Identidade visual",
        categoria: "Entregável",
        quantidade: 1,
        valorUnitario: 1,
        subtotal: 1,
        status: "Concluído",
      },
      {
        item: "Teaser",
        categoria: "Entregável",
        quantidade: 1,
        valorUnitario: 1,
        subtotal: 1,
        status: "Em andamento",
      },
      {
        item: "Making of",
        categoria: "Entregável",
        quantidade: 1,
        valorUnitario: 1,
        subtotal: 1,
        status: "Pendente",
      },
      {
        item: "Book fotográfico",
        categoria: "Entregável",
        quantidade: 1,
        valorUnitario: 1,
        subtotal: 1,
        status: "Pendente",
      },
    ],
  };

  return baseRows[id || "1"] || baseRows["1"];
}

function getVersionRows(): VersionRow[] {
  return [
    {
      versao: "v1.0",
      data: "11/03/2026",
      responsavel: "Administração do sistema",
      observacao: "Estrutura inicial do módulo criada.",
    },
    {
      versao: "v1.1",
      data: "11/03/2026",
      responsavel: "Administração do sistema",
      observacao: "Layout do painel e navegação habilitados.",
    },
    {
      versao: "v1.2",
      data: "11/03/2026",
      responsavel: "Administração do sistema",
      observacao: "Página de detalhe expandida com visão de planilha.",
    },
  ];
}

function getDocumentRows(): DocumentRow[] {
  return [
    {
      nome: "Relatório Técnico.pdf",
      tipo: "PDF",
      atualizacao: "11/03/2026",
    },
    {
      nome: "Cronograma Geral.xlsx",
      tipo: "Planilha",
      atualizacao: "11/03/2026",
    },
    {
      nome: "Comprovantes.zip",
      tipo: "Arquivo compactado",
      atualizacao: "10/03/2026",
    },
  ];
}

export default function SpreadsheetDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const spreadsheet = spreadsheetsMock.find((item) => item.id === id);

  if (!spreadsheet) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #f7f4f9 0%, #f4eef7 45%, #ffffff 100%)",
        }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ minHeight: 68, px: { xs: 2, md: 4 } }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TableChartIcon />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                PlanilhaDEX
              </Typography>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 6 }}>
          <Card sx={{ borderRadius: "24px" }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Planilha não encontrada
                </Typography>
                <Typography color="text.secondary">
                  O item solicitado não existe ou não está disponível nesta versão.
                </Typography>
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/")}
                  >
                    Voltar para o painel
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const rows = getSpreadsheetRows(id);
  const versions = getVersionRows();
  const documents = getDocumentRows();
  const statusConfig = getStatusStyles(spreadsheet.status);

  const totalGeral = rows.reduce((acc, row) => acc + row.subtotal, 0);
  const itensConferidos = rows.filter(
    (row) => row.status.toLowerCase() === "conferido" || row.status.toLowerCase() === "concluído"
  ).length;
  const percentualConferencia =
    rows.length > 0 ? Math.round((itensConferidos / rows.length) * 100) : 0;
  const categoriasUnicas = new Set(rows.map((row) => row.categoria)).size;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f7f4f9 0%, #f4eef7 45%, #ffffff 100%)",
      }}
    >
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: 68, px: { xs: 2, md: 4 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TableChartIcon />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              PlanilhaDEX
            </Typography>
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
                  {spreadsheet.title}
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
                      {spreadsheet.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "1rem", md: "1.05rem" },
                        lineHeight: 1.9,
                      }}
                    >
                      {spreadsheet.description}
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
                            sx={{ fontSize: "1.35rem", fontWeight: 800, color: "text.primary" }}
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
                            sx={{ fontSize: "1.35rem", fontWeight: 800, color: "text.primary" }}
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
                            sx={{ fontSize: "1.35rem", fontWeight: 800, color: "text.primary" }}
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
                            sx={{ fontSize: "1.35rem", fontWeight: 800, color: "text.primary" }}
                          >
                            {spreadsheet.updatedAt}
                          </Typography>
                          <Typography color="text.secondary">
                            Última referência do módulo.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>

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
                            label={`${rows.length} registro(s)`}
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
                              {rows.map((row, index) => (
                                <TableRow
                                  key={`${row.item}-${index}`}
                                  sx={{
                                    "&:last-child td": { borderBottom: 0 },
                                    "& td": {
                                      borderBottom: "1px solid #f0e8f4",
                                    },
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
                                          row.status.toLowerCase() === "concluído"
                                            ? "#e8f5e9"
                                            : row.status.toLowerCase() === "pendente"
                                            ? "#fff3e0"
                                            : "rgba(140, 88, 162, 0.10)",
                                        color:
                                          row.status.toLowerCase() === "conferido" ||
                                          row.status.toLowerCase() === "concluído"
                                            ? "#2e7d32"
                                            : row.status.toLowerCase() === "pendente"
                                            ? "#b26a00"
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
                        sx={{
                          borderRadius: "24px",
                          borderColor: "#eadff0",
                        }}
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
                                  Categoria: <strong>{spreadsheet.category}</strong>
                                </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                <EditNoteIcon sx={{ color: "#8c58a2", fontSize: 20 }} />
                                <Typography color="text.secondary">
                                  Situação: <strong>{spreadsheet.status}</strong>
                                </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                <FolderOpenIcon sx={{ color: "#8c58a2", fontSize: 20 }} />
                                <Typography color="text.secondary">
                                  Identificador: <strong>#{spreadsheet.id}</strong>
                                </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                <CalendarMonthIcon sx={{ color: "#8c58a2", fontSize: 20 }} />
                                <Typography color="text.secondary">
                                  Última atualização: <strong>{spreadsheet.updatedAt}</strong>
                                </Typography>
                              </Stack>
                            </Stack>

                            <Divider />

                            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                              Este painel pode evoluir para edição, exportação, versionamento
                              e integração com dados reais do backend.
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>

                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: "24px",
                          borderColor: "#eadff0",
                        }}
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
                              {versions.map((version, index) => (
                                <TableRow
                                  key={`${version.versao}-${index}`}
                                  sx={{
                                    "&:last-child td": { borderBottom: 0 },
                                    "& td": {
                                      borderBottom: "1px solid #f0e8f4",
                                    },
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
                          {documents.map((doc, index) => (
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
