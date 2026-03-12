import React, { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TableChartIcon from "@mui/icons-material/TableChart";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

type SpreadsheetItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  updatedAt: string;
};

const spreadsheetsMock: SpreadsheetItem[] = [
  {
    id: "1",
    title: "Planilha Orçamentária",
    description:
      "Controle e organização de custos, categorias financeiras e projeções orçamentárias do projeto.",
    status: "Em elaboração",
    category: "Financeiro",
    updatedAt: "11/03/2026",
  },
  {
    id: "2",
    title: "Cronograma de Execução",
    description:
      "Planejamento temporal das etapas do projeto, com acompanhamento das ações previstas.",
    status: "Em elaboração",
    category: "Gestão",
    updatedAt: "11/03/2026",
  },
  {
    id: "3",
    title: "Relatório de Prestação de Contas",
    description:
      "Consolidação de dados e documentos para prestação de contas e monitoramento da execução.",
    status: "Em elaboração",
    category: "Compliance",
    updatedAt: "11/03/2026",
  },
  {
    id: "4",
    title: "Mapa de Entregáveis",
    description:
      "Visão geral dos produtos, documentos e marcos de acompanhamento do projeto.",
    status: "Em elaboração",
    category: "Planejamento",
    updatedAt: "11/03/2026",
  },
];

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

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return spreadsheetsMock;

    return spreadsheetsMock.filter((item) => {
      return (
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
      );
    });
  }, [search]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f7f4f9 0%, #f4eef7 45%, #ffffff 100%)",
      }}
    >
      <AppBar position="static" elevation={0}>
        <Toolbar
          sx={{
            minHeight: 68,
            px: { xs: 2, md: 4 },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TableChartIcon />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              PlanilhaDEX
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Stack spacing={4}>
            <Box
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: "32px",
                background:
                  "linear-gradient(135deg, rgba(140,88,162,0.10) 0%, rgba(111,63,132,0.18) 100%)",
                border: "1px solid rgba(140,88,162,0.16)",
                boxShadow: "0 18px 40px rgba(111, 63, 132, 0.08)",
              }}
            >
              <Stack spacing={2.2}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <AutoAwesomeIcon sx={{ color: "#8c58a2", fontSize: 20 }} />
                  <Typography
                    variant="overline"
                    sx={{
                      color: "#8c58a2",
                      fontWeight: 800,
                      letterSpacing: 1.3,
                    }}
                  >
                    Painel principal
                  </Typography>
                </Stack>

                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: "1.8rem", md: "2.35rem" },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.15,
                    maxWidth: 900,
                  }}
                >
                  Organize, acompanhe e visualize suas planilhas com mais clareza
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    maxWidth: 820,
                    color: "text.secondary",
                    lineHeight: 1.8,
                    fontSize: { xs: "0.98rem", md: "1.04rem" },
                  }}
                >
                  Ambiente central para acompanhamento de planilhas, documentos,
                  cronogramas e materiais em desenvolvimento. Utilize a busca para
                  localizar rapidamente os itens e acompanhar o andamento de cada
                  estrutura.
                </Typography>
              </Stack>
            </Box>

            <TextField
              fullWidth
              placeholder="Pesquisar por título, categoria, descrição ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  minHeight: 58,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#8a7c93" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Grid container spacing={3}>
              {filteredItems.map((item) => {
                const statusConfig = getStatusStyles(item.status);

                return (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: "20px",
                        transition:
                          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 20px 40px rgba(81, 52, 96, 0.14)",
                          borderColor: "rgba(140, 88, 162, 0.25)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 3.2,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Stack spacing={2.4} sx={{ flexGrow: 1 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            spacing={2}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.25,
                              }}
                            >
                              {item.title}
                            </Typography>

                            <Chip
                              label={statusConfig.label}
                              sx={{
                                ...statusConfig.sx,
                                borderRadius: "10px",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                            />
                          </Stack>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              lineHeight: 1.75,
                              minHeight: 56,
                            }}
                          >
                            {item.description}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Chip
                              label={item.category}
                              variant="outlined"
                              sx={{
                                borderColor: "#d8c9e0",
                                color: "#5f4a6c",
                                fontWeight: 700,
                                backgroundColor: "#fff",
                              }}
                            />

                            <Stack
                              direction="row"
                              spacing={0.6}
                              alignItems="center"
                              sx={{ color: "text.secondary" }}
                            >
                              <AccessTimeIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary">
                                Atualizado em {item.updatedAt}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Box
                            sx={{
                              mt: "auto",
                              pt: 1.5,
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              variant="contained"
                              endIcon={
                                <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                              }
                              sx={{
                                minWidth: 104,
                                fontWeight: 700,
                              }}
                            >
                              Abrir
                            </Button>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {filteredItems.length === 0 && (
              <Box
                sx={{
                  py: 9,
                  px: 3,
                  textAlign: "center",
                  borderRadius: 4,
                  backgroundColor: "#ffffff",
                  border: "1px dashed #d7c8df",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 800 }}>
                  Nenhum item encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tente ajustar os termos da pesquisa para localizar a planilha desejada.
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
