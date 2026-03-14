import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { Link as RouterLink } from "react-router-dom";

type SpreadsheetStatus = "Em elaboração" | "Concluída" | "Em revisão";

interface SpreadsheetCardItem {
  id: string;
  title: string;
  description: string;
  status: SpreadsheetStatus;
  category: string;
  updatedAt: string;
}

const spreadsheetCards: SpreadsheetCardItem[] = [
  {
    id: "1",
    title: "Planilha Orçamentária",
    description:
      "Estrutura inicial de custos, categorias financeiras e consolidação dos valores da contratação.",
    status: "Em elaboração",
    category: "Financeiro",
    updatedAt: "11/03/2026",
  },
  {
    id: "2",
    title: "Cronograma de Execução",
    description:
      "Planejamento temporal das etapas da contratação e acompanhamento dos marcos previstos.",
    status: "Em elaboração",
    category: "Gestão",
    updatedAt: "11/03/2026",
  },
  {
    id: "3",
    title: "Relatório de Prestação de Contas",
    description:
      "Consolidação de dados, documentos e registros para controle, auditoria e prestação de contas.",
    status: "Em elaboração",
    category: "Compliance",
    updatedAt: "11/03/2026",
  },
  {
    id: "4",
    title: "Mapa de Entregáveis",
    description:
      "Visão geral dos produtos, documentos e marcos de acompanhamento vinculados ao processo.",
    status: "Em elaboração",
    category: "Planejamento",
    updatedAt: "11/03/2026",
  },
];

function getStatusChipStyles(status: SpreadsheetStatus) {
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

export default function Home() {
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "CustoPúblico — Gestão de Planilhas de Custos Públicas";
  }, []);

  const filteredCards = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) return spreadsheetCards;

    return spreadsheetCards.filter((item) =>
      [item.title, item.description, item.category, item.status]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [search]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F7F3F8",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
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
              <Stack spacing={3}>
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
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: "#2B2340",
                        fontSize: { xs: "2rem", md: "2.35rem" },
                        lineHeight: 1.1,
                        maxWidth: 820,
                      }}
                    >
                      Gestão de Planilhas de Custos Públicas
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "#6D6186",
                        mt: 2,
                        maxWidth: 820,
                        lineHeight: 1.8,
                      }}
                    >
                      Plataforma para elaboração, organização, análise, comparação
                      e acompanhamento de planilhas de custos públicas, com foco em
                      clareza técnica, rastreabilidade e apoio à gestão contratual.
                    </Typography>
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ minWidth: { md: 260 } }}
                  >
                    <Button
                      component={RouterLink}
                      to="/models/new"
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{
                        borderRadius: 3,
                        px: 2.5,
                        py: 1.2,
                        textTransform: "none",
                        fontWeight: 700,
                        backgroundColor: "#8E5AB5",
                        "&:hover": {
                          backgroundColor: "#7B4CA1",
                        },
                      }}
                    >
                      Nova planilha
                    </Button>

                    <Button
                      component={RouterLink}
                      to="/models/new"
                      variant="outlined"
                      startIcon={<DashboardCustomizeOutlinedIcon />}
                      sx={{
                        borderRadius: 3,
                        px: 2.5,
                        py: 1.2,
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: "rgba(142, 90, 181, 0.35)",
                        color: "#6B3E90",
                        "&:hover": {
                          borderColor: "#8E5AB5",
                          backgroundColor: "rgba(142, 90, 181, 0.04)",
                        },
                      }}
                    >
                      Escolher modelo
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <TextField
            fullWidth
            placeholder="Pesquisar por título, categoria, descrição ou status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#7A708D" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                backgroundColor: "#FFFFFF",
              },
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            {filteredCards.map((item) => {
              const statusStyles = getStatusChipStyles(item.status);

              return (
                <Card
                  key={item.id}
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(43, 35, 64, 0.06)",
                    minHeight: 246,
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: "#241B3A",
                          fontSize: "1.85rem",
                          lineHeight: 1.15,
                          maxWidth: 360,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          ...statusStyles,
                          fontWeight: 700,
                          borderRadius: 2,
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "#6D6186",
                        lineHeight: 1.8,
                        mt: 2.5,
                        maxWidth: 500,
                      }}
                    >
                      {item.description}
                    </Typography>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      sx={{ mt: "auto", pt: 4 }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Chip
                          label={item.category}
                          variant="outlined"
                          size="small"
                          sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            color: "#5B3A7A",
                            borderColor: "rgba(91, 58, 122, 0.24)",
                            backgroundColor: "#FFFFFF",
                          }}
                        />

                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <AccessTimeIcon
                            sx={{ fontSize: 16, color: "#7A708D" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "#7A708D", fontWeight: 500 }}
                          >
                            Atualizado em {item.updatedAt}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Button
                        component={RouterLink}
                        to={`/spreadsheet/${item.id}`}
                        variant="contained"
                        endIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          minWidth: 120,
                          borderRadius: 2.5,
                          px: 2.5,
                          py: 1.1,
                          textTransform: "none",
                          fontWeight: 700,
                          backgroundColor: "#8E5AB5",
                          boxShadow: "0 6px 16px rgba(142, 90, 181, 0.24)",
                          "&:hover": {
                            backgroundColor: "#7B4CA1",
                          },
                        }}
                      >
                        Abrir
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {filteredCards.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(43, 35, 64, 0.06)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={1}>
                  <Typography variant="h6" fontWeight={700} color="#241B3A">
                    Nenhum resultado encontrado
                  </Typography>
                  <Typography variant="body2" color="#6D6186">
                    Ajuste a busca ou utilize o botão “Nova planilha” para iniciar
                    uma nova estrutura.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}
