import React, { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TableChartIcon from "@mui/icons-material/TableChart";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

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

function getStatusChipColor(status: string): "default" | "primary" | "secondary" | "success" | "warning" {
  const normalized = status.toLowerCase();

  if (normalized.includes("concluído") || normalized.includes("concluido")) {
    return "success";
  }

  if (normalized.includes("elaboração") || normalized.includes("elaboracao")) {
    return "warning";
  }

  return "primary";
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
          "linear-gradient(180deg, #f7f4f9 0%, #f4eef7 40%, #ffffff 100%)",
      }}
    >
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: 72 }}>
          <TableChartIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            PlanilhaDEX
          </Typography>

          <IconButton color="inherit" aria-label="ícone decorativo">
            <DescriptionIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack spacing={4}>
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background:
                "linear-gradient(135deg, rgba(140,88,162,0.10) 0%, rgba(111,63,132,0.16) 100%)",
              border: "1px solid rgba(140,88,162,0.14)",
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
                flexWrap="wrap"
              >
                <AutoAwesomeIcon color="primary" />
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 700,
                    letterSpacing: 1.2,
                  }}
                >
                  Painel principal
                </Typography>
              </Stack>

              <Typography
                variant="h4"
                sx={{
                  color: "text.primary",
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                Organize, acompanhe e visualize suas planilhas com mais clareza
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  maxWidth: 780,
                  color: "text.secondary",
                  lineHeight: 1.75,
                }}
              >
                Ambiente central para acompanhamento de planilhas, documentos,
                cronogramas e materiais em desenvolvimento. Abaixo, você pode
                localizar rapidamente os itens e acompanhar o status de cada um.
              </Typography>
            </Stack>
          </Box>

          <Box>
            <TextField
              fullWidth
              placeholder="Pesquisar por título, categoria, descrição ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              sx={{
                backgroundColor: "#fff",
                borderRadius: 3,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Grid container spacing={3}>
            {filteredItems.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 16px 36px rgba(81, 52, 96, 0.14)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: "text.primary",
                              mb: 0.8,
                            }}
                          >
                            {item.title}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              lineHeight: 1.7,
                            }}
                          >
                            {item.description}
                          </Typography>
                        </Box>

                        <Chip
                          label={item.status}
                          color={getStatusChipColor(item.status)}
                          variant="filled"
                          sx={{ whiteSpace: "nowrap" }}
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip label={item.category} variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          Atualizado em {item.updatedAt}
                        </Typography>
                      </Stack>

                      <Box
                        sx={{
                          pt: 1,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="contained"
                          endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
                        >
                          Abrir
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredItems.length === 0 && (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
                borderRadius: 4,
                backgroundColor: "#fff",
                border: "1px dashed #d7c8df",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                Nenhum item encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tente refinar os termos da pesquisa para localizar a planilha
                desejada.
              </Typography>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
