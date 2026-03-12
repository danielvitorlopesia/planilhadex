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
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HistoryIcon from "@mui/icons-material/History";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
          <Card
            sx={{
              borderRadius: "24px",
              boxShadow: "0 20px 40px rgba(81, 52, 96, 0.10)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Planilha não encontrada
                </Typography>

                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  O item solicitado não existe ou não está disponível nesta
                  versão da aplicação.
                </Typography>

                <Box>
                  <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/")}
                    sx={{ borderRadius: "14px", fontWeight: 700 }}
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

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1280, mx: "auto" }}>
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
                        md: "repeat(2, minmax(0, 1fr))",
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
                        <Stack spacing={1.4}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CategoryIcon sx={{ color: "#8c58a2" }} />
                            <Typography sx={{ fontWeight: 800 }}>
                              Categoria
                            </Typography>
                          </Stack>
                          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            {spreadsheet.category}
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
                        <Stack spacing={1.4}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarMonthIcon sx={{ color: "#8c58a2" }} />
                            <Typography sx={{ fontWeight: 800 }}>
                              Última atualização
                            </Typography>
                          </Stack>
                          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            {spreadsheet.updatedAt}
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
                        <Stack spacing={1.4}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <EditNoteIcon sx={{ color: "#8c58a2" }} />
                            <Typography sx={{ fontWeight: 800 }}>
                              Situação
                            </Typography>
                          </Stack>
                          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            {spreadsheet.status}
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
                        <Stack spacing={1.4}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <FolderOpenIcon sx={{ color: "#8c58a2" }} />
                            <Typography sx={{ fontWeight: 800 }}>
                              Identificador
                            </Typography>
                          </Stack>
                          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            #{spreadsheet.id}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        lg: "1.35fr 0.85fr",
                      },
                      gap: 3,
                    }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "22px",
                        borderColor: "#eadff0",
                        background:
                          "linear-gradient(135deg, rgba(140,88,162,0.06) 0%, rgba(111,63,132,0.10) 100%)",
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Stack spacing={2.2}>
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <DescriptionOutlinedIcon sx={{ color: "#8c58a2" }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              Visão geral
                            </Typography>
                          </Stack>

                          <Typography color="text.secondary" sx={{ lineHeight: 1.9 }}>
                            Esta página representa a estrutura detalhada do item
                            selecionado. Aqui você poderá evoluir a aplicação para
                            exibir dados reais da planilha, histórico de versões,
                            observações, documentos associados, integrações e ações
                            administrativas.
                          </Typography>

                          <Typography color="text.secondary" sx={{ lineHeight: 1.9 }}>
                            No estágio atual, a tela já está pronta para funcionar
                            como base de navegação e expansão do sistema, permitindo
                            transformar cada card do painel em um módulo com identidade
                            própria.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "22px",
                        borderColor: "#eadff0",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Stack spacing={2.4}>
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <InsightsOutlinedIcon sx={{ color: "#8c58a2" }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              Próximas evoluções
                            </Typography>
                          </Stack>

                          <Stack spacing={1.8}>
                            <Box>
                              <Typography sx={{ fontWeight: 700, mb: 0.4 }}>
                                1. Dados reais
                              </Typography>
                              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                Substituir o conteúdo mockado por dados do backend.
                              </Typography>
                            </Box>

                            <Box>
                              <Typography sx={{ fontWeight: 700, mb: 0.4 }}>
                                2. Histórico de versões
                              </Typography>
                              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                Exibir alterações, datas e responsáveis.
                              </Typography>
                            </Box>

                            <Box>
                              <Typography sx={{ fontWeight: 700, mb: 0.4 }}>
                                3. Documentos vinculados
                              </Typography>
                              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                Anexar relatórios, arquivos e referências.
                              </Typography>
                            </Box>

                            <Box>
                              <Typography sx={{ fontWeight: 700, mb: 0.4 }}>
                                4. Ações do módulo
                              </Typography>
                              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                Editar, exportar, versionar e aprovar conteúdo.
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>

                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: "22px",
                      borderColor: "#eadff0",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Stack spacing={2.2}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <HistoryIcon sx={{ color: "#8c58a2" }} />
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Histórico inicial
                          </Typography>
                        </Stack>

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              md: "repeat(3, minmax(0, 1fr))",
                            },
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              p: 2.2,
                              borderRadius: "16px",
                              backgroundColor: "#faf7fc",
                              border: "1px solid #eee4f3",
                            }}
                          >
                            <Typography sx={{ fontWeight: 700, mb: 0.6 }}>
                              Estrutura criada
                            </Typography>
                            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                              Módulo base preparado para evolução futura.
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              p: 2.2,
                              borderRadius: "16px",
                              backgroundColor: "#faf7fc",
                              border: "1px solid #eee4f3",
                            }}
                          >
                            <Typography sx={{ fontWeight: 700, mb: 0.6 }}>
                              Status atual
                            </Typography>
                            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                              {spreadsheet.status}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              p: 2.2,
                              borderRadius: "16px",
                              backgroundColor: "#faf7fc",
                              border: "1px solid #eee4f3",
                            }}
                          >
                            <Typography sx={{ fontWeight: 700, mb: 0.6 }}>
                              Última referência
                            </Typography>
                            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                              {spreadsheet.updatedAt}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
