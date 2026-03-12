import React from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useNavigate, useParams } from "react-router-dom";
import { spreadsheetsMock } from "./Home";

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
                    Voltar
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const statusConfig = getStatusStyles(spreadsheet.status);

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

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/")}
              sx={{
                borderRadius: "14px",
                fontWeight: 700,
              }}
            >
              Voltar para o painel
            </Button>
          </Box>

          <Card
            sx={{
              borderRadius: "28px",
              boxShadow: "0 20px 40px rgba(81, 52, 96, 0.10)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={4}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                >
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: "2rem", md: "2.5rem" },
                        fontWeight: 800,
                        lineHeight: 1.1,
                        mb: 1.5,
                      }}
                    >
                      {spreadsheet.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        fontSize: "1.05rem",
                        lineHeight: 1.8,
                        maxWidth: 820,
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

                <Divider />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 2.5,
                  }}
                >
                  <Card
                    variant="outlined"
                    sx={{ borderRadius: "18px", backgroundColor: "#fcfafe" }}
                  >
                    <CardContent>
                      <Stack spacing={1.3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CategoryIcon sx={{ color: "#8c58a2" }} />
                          <Typography sx={{ fontWeight: 700 }}>
                            Categoria
                          </Typography>
                        </Stack>
                        <Typography color="text.secondary">
                          {spreadsheet.category}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card
                    variant="outlined"
                    sx={{ borderRadius: "18px", backgroundColor: "#fcfafe" }}
                  >
                    <CardContent>
                      <Stack spacing={1.3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarMonthIcon sx={{ color: "#8c58a2" }} />
                          <Typography sx={{ fontWeight: 700 }}>
                            Última atualização
                          </Typography>
                        </Stack>
                        <Typography color="text.secondary">
                          {spreadsheet.updatedAt}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card
                    variant="outlined"
                    sx={{ borderRadius: "18px", backgroundColor: "#fcfafe" }}
                  >
                    <CardContent>
                      <Stack spacing={1.3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EditNoteIcon sx={{ color: "#8c58a2" }} />
                          <Typography sx={{ fontWeight: 700 }}>
                            Situação
                          </Typography>
                        </Stack>
                        <Typography color="text.secondary">
                          {spreadsheet.status}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: "22px",
                    background:
                      "linear-gradient(135deg, rgba(140,88,162,0.08) 0%, rgba(111,63,132,0.12) 100%)",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <DescriptionOutlinedIcon sx={{ color: "#8c58a2" }} />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          Área de conteúdo
                        </Typography>
                      </Stack>

                      <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        Esta é a página de detalhe da planilha selecionada. Nesta
                        próxima etapa, você poderá conectar dados reais, versões,
                        documentos vinculados, histórico de atualização, planilhas
                        anexas, ações disponíveis e integrações com o backend.
                      </Typography>

                      <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        No momento, esta visualização está preparada como estrutura
                        base funcional para navegação e expansão futura.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
