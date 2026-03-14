import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TimelineIcon from "@mui/icons-material/Timeline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import DifferenceIcon from "@mui/icons-material/Difference";
import type {
  AnalysisDecision,
  AnalysisHistoryItem,
  AnalysisMaterialStatus,
  AnalysisRiskLevel,
} from "../mocks/analysisHistoryMocks";

interface AnalysisHistoryPanelProps {
  items: AnalysisHistoryItem[];
  selectedAnalysisId: string | null;
  onSelectAnalysis: (analysisId: string) => void;
}

type DecisionFilterValue = AnalysisDecision | "all";
type StatusFilterValue = AnalysisMaterialStatus | "all";
type RiskFilterValue = AnalysisRiskLevel | "all";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getRiskChipColor(risk: AnalysisRiskLevel) {
  switch (risk) {
    case "low":
      return "success";
    case "medium":
      return "warning";
    case "high":
      return "error";
    default:
      return "default";
  }
}

function getMaterialStatusChipColor(status: AnalysisMaterialStatus) {
  switch (status) {
    case "exequivel":
      return "success";
    case "exequivel_com_diligencia":
      return "warning";
    case "inexequivel":
      return "error";
    default:
      return "default";
  }
}

function getDecisionChipColor(decision?: AnalysisDecision | null) {
  switch (decision) {
    case "approved":
      return "success";
    case "approved_with_remarks":
      return "warning";
    case "diligence_requested":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
}

function getDecisionLabel(decision?: AnalysisDecision | null) {
  switch (decision) {
    case "approved":
      return "Aprovado";
    case "approved_with_remarks":
      return "Aprovado com ressalvas";
    case "diligence_requested":
      return "Diligência";
    case "rejected":
      return "Rejeitado";
    default:
      return "Sem decisão";
  }
}

function getRiskLabel(risk: AnalysisRiskLevel) {
  switch (risk) {
    case "low":
      return "Baixo";
    case "medium":
      return "Médio";
    case "high":
      return "Alto";
    default:
      return risk;
  }
}

function getMaterialStatusLabel(status: AnalysisMaterialStatus) {
  switch (status) {
    case "exequivel":
      return "Exequível";
    case "exequivel_com_diligencia":
      return "Exequível com diligência";
    case "inexequivel":
      return "Inexequível";
    default:
      return status;
  }
}

export default function AnalysisHistoryPanel({
  items,
  selectedAnalysisId,
  onSelectAnalysis,
}: AnalysisHistoryPanelProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilterValue>("all");
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilterValue>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const summary = useMemo(() => {
    const total = items.length;
    const lowRisk = items.filter((item) => item.riskLevel === "low").length;
    const mediumRisk = items.filter((item) => item.riskLevel === "medium").length;
    const highRisk = items.filter((item) => item.riskLevel === "high").length;
    const withDecision = items.filter((item) => item.internalDecision?.decision).length;

    return {
      total,
      lowRisk,
      mediumRisk,
      highRisk,
      withDecision,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : item.materialStatus === statusFilter;

      const matchesRisk =
        riskFilter === "all" ? true : item.riskLevel === riskFilter;

      const itemDecision = item.internalDecision?.decision ?? null;
      const matchesDecision =
        decisionFilter === "all" ? true : itemDecision === decisionFilter;

      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : [
              item.analysisId,
              item.spreadsheetVersionLabel,
              String(item.spreadsheetVersionId),
              item.analysisType,
              item.createdBy,
              item.internalDecision?.despacho ?? "",
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch);

      return matchesStatus && matchesRisk && matchesDecision && matchesSearch;
    });
  }, [items, statusFilter, riskFilter, decisionFilter, searchTerm]);

  const selectedItem = useMemo(
    () => filteredItems.find((item) => item.analysisId === selectedAnalysisId) ?? null,
    [filteredItems, selectedAnalysisId]
  );

  const clearFilters = () => {
    setStatusFilter("all");
    setRiskFilter("all");
    setDecisionFilter("all");
    setSearchTerm("");
  };

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Histórico analítico
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filtros e busca para localizar análises por status, risco, decisão interna
                e referência textual.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FilterAltIcon />}
                onClick={() => setShowFilters((prev) => !prev)}
              >
                {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </Button>

              <Button
                variant="text"
                startIcon={<RestartAltIcon />}
                onClick={clearFilters}
              >
                Limpar
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TimelineIcon fontSize="small" />
                      <Typography variant="subtitle2">Total</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={700}>
                      {summary.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      análises no histórico
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WarningAmberIcon fontSize="small" />
                      <Typography variant="subtitle2">Risco</Typography>
                    </Stack>
                    <Typography variant="body2">
                      Baixo: <strong>{summary.lowRisk}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Médio: <strong>{summary.mediumRisk}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Alto: <strong>{summary.highRisk}</strong>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AssignmentTurnedInIcon fontSize="small" />
                      <Typography variant="subtitle2">Decisão interna</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={700}>
                      {summary.withDecision}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      análises com despacho registrado
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <InsightsOutlinedIcon fontSize="small" />
                      <Typography variant="subtitle2">Resultado filtrado</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={700}>
                      {filteredItems.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      análises visíveis após filtros
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Collapse in={showFilters}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Busca textual"
                    placeholder="analysis id, versão, tipo, despacho..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={2.66}>
                  <TextField
                    select
                    fullWidth
                    label="Status material"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as StatusFilterValue)
                    }
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="exequivel">Exequível</MenuItem>
                    <MenuItem value="exequivel_com_diligencia">
                      Exequível com diligência
                    </MenuItem>
                    <MenuItem value="inexequivel">Inexequível</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={2.66}>
                  <TextField
                    select
                    fullWidth
                    label="Risco"
                    value={riskFilter}
                    onChange={(event) =>
                      setRiskFilter(event.target.value as RiskFilterValue)
                    }
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="low">Baixo</MenuItem>
                    <MenuItem value="medium">Médio</MenuItem>
                    <MenuItem value="high">Alto</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={2.66}>
                  <TextField
                    select
                    fullWidth
                    label="Decisão interna"
                    value={decisionFilter}
                    onChange={(event) =>
                      setDecisionFilter(event.target.value as DecisionFilterValue)
                    }
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="approved">Aprovado</MenuItem>
                    <MenuItem value="approved_with_remarks">
                      Aprovado com ressalvas
                    </MenuItem>
                    <MenuItem value="diligence_requested">Diligência</MenuItem>
                    <MenuItem value="rejected">Rejeitado</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </Stack>
      </Paper>

      {filteredItems.length === 0 ? (
        <Alert severity="info">
          Nenhuma análise corresponde aos filtros aplicados.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={7}>
            <Stack spacing={2}>
              {filteredItems.map((item) => {
                const isSelected = item.analysisId === selectedAnalysisId;

                return (
                  <Card
                    key={item.analysisId}
                    variant="outlined"
                    sx={{
                      borderWidth: isSelected ? 2 : 1,
                      cursor: "pointer",
                    }}
                    onClick={() => onSelectAnalysis(item.analysisId)}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Box>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Chip
                                size="small"
                                label={item.spreadsheetVersionLabel}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={getMaterialStatusLabel(item.materialStatus)}
                                color={getMaterialStatusChipColor(item.materialStatus)}
                              />
                              <Chip
                                size="small"
                                label={`Risco ${getRiskLabel(item.riskLevel)}`}
                                color={getRiskChipColor(item.riskLevel)}
                              />
                              <Chip
                                size="small"
                                label={getDecisionLabel(item.internalDecision?.decision)}
                                color={getDecisionChipColor(item.internalDecision?.decision)}
                                variant="outlined"
                              />
                              {item.isLatest ? (
                                <Chip
                                  size="small"
                                  label="Mais recente"
                                  color="primary"
                                />
                              ) : null}
                            </Stack>

                            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
                              {item.analysisType}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Analysis ID: {item.analysisId}
                            </Typography>
                          </Box>

                          <Stack alignItems={{ xs: "flex-start", md: "flex-end" }}>
                            <Typography variant="body2" color="text.secondary">
                              Criado em
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatDate(item.createdAt)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              por {item.createdBy}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Divider />

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Score global
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                              {item.scoreGlobal}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Valor proposto
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                              {formatCurrency(item.proposedTotalValue)}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Custos obrigatórios
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                              {formatCurrency(item.mandatoryCostTotal)}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Saldo exequibilidade
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                              {formatCurrency(item.executabilityBalance)}
                            </Typography>
                          </Grid>
                        </Grid>

                        {item.internalDecision?.despacho ? (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Despacho interno
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {item.internalDecision.despacho}
                              </Typography>
                            </Box>
                          </>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card variant="outlined" sx={{ position: "sticky", top: 24 }}>
              <CardContent>
                {!selectedItem ? (
                  <Alert severity="info">
                    Selecione uma análise para visualizar o detalhamento.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight={700}>
                        Detalhe da análise selecionada
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={selectedItem.spreadsheetVersionLabel}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={getMaterialStatusLabel(selectedItem.materialStatus)}
                          color={getMaterialStatusChipColor(selectedItem.materialStatus)}
                        />
                        <Chip
                          size="small"
                          label={`Risco ${getRiskLabel(selectedItem.riskLevel)}`}
                          color={getRiskChipColor(selectedItem.riskLevel)}
                        />
                      </Stack>
                    </Stack>

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Analysis ID
                      </Typography>
                      <Typography variant="body2">{selectedItem.analysisId}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Data de criação
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(selectedItem.createdAt)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Decisão interna
                      </Typography>
                      <Typography variant="body2">
                        {getDecisionLabel(selectedItem.internalDecision?.decision)}
                      </Typography>
                    </Box>

                    <Divider />

                    <Stack spacing={1.5}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Explicações disponíveis
                      </Typography>

                      {selectedItem.explanations.length === 0 ? (
                        <Alert severity="warning">
                          Esta análise ainda não possui explicações disponíveis.
                        </Alert>
                      ) : (
                        selectedItem.explanations.map((explanation) => (
                          <Paper key={explanation.id} variant="outlined" sx={{ p: 1.5 }}>
                            <Typography variant="body2" fontWeight={700}>
                              {explanation.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mb: 1 }}
                            >
                              {explanation.type}
                            </Typography>
                            <Typography variant="body2">
                              {explanation.content}
                            </Typography>
                          </Paper>
                        ))
                      )}
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Comparativo financeiro rápido
                      </Typography>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Valor proposto</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(selectedItem.proposedTotalValue)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Custos obrigatórios</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(selectedItem.mandatoryCostTotal)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Custos evidenciários</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(selectedItem.evidentiaryCostTotal)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Retenções</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(selectedItem.retentionTotal)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Saldo exequibilidade</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(selectedItem.executabilityBalance)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Button
                      variant="contained"
                      startIcon={<DifferenceIcon />}
                      onClick={() => onSelectAnalysis(selectedItem.analysisId)}
                    >
                      Manter selecionada
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
