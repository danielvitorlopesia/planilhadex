import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import {
  ServiceCompositionComparisonResult,
  ServiceCompositionFieldDelta,
  ServiceCompositionRowComparison,
} from "../../modules/spreadsheet-editor/engine/serviceCompositionComparisonEngine";

type Props = {
  comparison: ServiceCompositionComparisonResult;
  title?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatValue(value: string | number) {
  if (typeof value === "number") {
    return String(value);
  }
  return value || "—";
}

function getChangeTypeLabel(changeType: ServiceCompositionRowComparison["changeType"]) {
  switch (changeType) {
    case "added":
      return "Incluído";
    case "removed":
      return "Removido";
    case "changed":
      return "Alterado";
    case "unchanged":
      return "Sem alteração";
    default:
      return "Não identificado";
  }
}

function getChangeTypeStyles(changeType: ServiceCompositionRowComparison["changeType"]) {
  switch (changeType) {
    case "added":
      return {
        backgroundColor: "#E7F6EC",
        color: "#2E7D32",
      };
    case "removed":
      return {
        backgroundColor: "#FDECEC",
        color: "#C62828",
      };
    case "changed":
      return {
        backgroundColor: "#FFF3E0",
        color: "#ED6C02",
      };
    case "unchanged":
      return {
        backgroundColor: "#EEF6FD",
        color: "#1565C0",
      };
    default:
      return {
        backgroundColor: "#EFE7F6",
        color: "#8E5AB5",
      };
  }
}

function MetricCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={0.75}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={800} color="#241B3A">
            {value}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function DeltaListCard({
  title,
  values,
}: {
  title: string;
  values: Record<string, number>;
}) {
  const entries = Object.entries(values);

  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0, height: "100%" }}>
      <CardContent>
        <Stack spacing={1.25}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>

          {entries.length > 0 ? (
            entries.map(([key, value]) => (
              <Stack
                key={key}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Typography variant="body2" color="text.secondary">
                  {key}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={800}
                  color={value >= 0 ? "#2E7D32" : "#C62828"}
                >
                  {value >= 0 ? "+" : ""}
                  {formatCurrency(value)}
                </Typography>
              </Stack>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhuma variação consolidada encontrada.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function FieldDeltaList({ deltas }: { deltas: ServiceCompositionFieldDelta[] }) {
  if (deltas.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        Nenhuma alteração de campo detectada.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.75}>
      {deltas.map((delta, index) => (
        <Box
          key={`${delta.field}-${index}`}
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: "#FAF7FC",
            border: "1px solid #EEE4F5",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#5B3A7A" }}>
            {delta.field}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Antes: {formatValue(delta.previousValue)}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Depois: {formatValue(delta.currentValue)}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function ComparisonRowCard({ row }: { row: ServiceCompositionRowComparison }) {
  const changeStyles = getChangeTypeStyles(row.changeType);

  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={800}>
                {row.item || "Item sem nome"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {row.category || "Categoria não identificada"} •{" "}
                {row.recurrenceType || "Recorrência não informada"}
              </Typography>
            </Box>

            <Chip
              label={getChangeTypeLabel(row.changeType)}
              sx={{
                backgroundColor: changeStyles.backgroundColor,
                color: changeStyles.color,
                fontWeight: 700,
              }}
            />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.5,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                p: 1.25,
                borderRadius: 3,
                backgroundColor: "#FAF7FC",
                border: "1px solid #EEE4F5",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Subtotal anterior
              </Typography>
              <Typography variant="body1" fontWeight={800}>
                {formatCurrency(row.previousSubtotal)}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 3,
                backgroundColor: "#FAF7FC",
                border: "1px solid #EEE4F5",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Subtotal atual
              </Typography>
              <Typography variant="body1" fontWeight={800}>
                {formatCurrency(row.currentSubtotal)}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 3,
                backgroundColor: row.subtotalDelta >= 0 ? "#E7F6EC" : "#FDECEC",
                border:
                  row.subtotalDelta >= 0
                    ? "1px solid rgba(46,125,50,0.18)"
                    : "1px solid rgba(198,40,40,0.18)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Impacto
              </Typography>
              <Typography
                variant="body1"
                fontWeight={800}
                color={row.subtotalDelta >= 0 ? "#2E7D32" : "#C62828"}
              >
                {row.subtotalDelta >= 0 ? "+" : ""}
                {formatCurrency(row.subtotalDelta)}
              </Typography>
            </Box>
          </Box>

          {row.changeType === "changed" ? (
            <>
              <Divider />
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  Campos alterados
                </Typography>
                <FieldDeltaList deltas={row.fieldDeltas} />
              </Box>
            </>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ServiceCompositionComparisonPanel({
  comparison,
  title = "Comparação entre versões da composição",
}: Props) {
  const changedRows = useMemo(
    () => comparison.rows.filter((row) => row.changeType !== "unchanged"),
    [comparison.rows]
  );

  const totalDelta = comparison.summary.totalDelta;

  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CompareArrowsOutlinedIcon sx={{ color: "#5E35B1" }} />
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Painel comparativo da composição de serviços entre duas versões, com
            destaque para inclusão, remoção, alteração e impacto financeiro.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
              minWidth: 0,
            }}
          >
            <MetricCard
              label="Itens anteriores"
              value={comparison.summary.previousItemCount}
            />
            <MetricCard
              label="Itens atuais"
              value={comparison.summary.currentItemCount}
            />
            <MetricCard
              label="Total anterior"
              value={formatCurrency(comparison.summary.previousTotal)}
            />
            <MetricCard
              label="Total atual"
              value={formatCurrency(comparison.summary.currentTotal)}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(5, minmax(0, 1fr))",
              },
              gap: 2,
              minWidth: 0,
            }}
          >
            <MetricCard
              label="Incluídos"
              value={comparison.summary.addedCount}
              subtitle="Itens novos na versão atual"
            />
            <MetricCard
              label="Removidos"
              value={comparison.summary.removedCount}
              subtitle="Itens que saíram da composição"
            />
            <MetricCard
              label="Alterados"
              value={comparison.summary.changedCount}
              subtitle="Itens com mudanças estruturais"
            />
            <MetricCard
              label="Sem alteração"
              value={comparison.summary.unchangedCount}
              subtitle="Itens estáveis entre versões"
            />
            <MetricCard
              label="Impacto total"
              value={`${totalDelta >= 0 ? "+" : ""}${formatCurrency(totalDelta)}`}
              subtitle="Diferença total da composição"
            />
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: totalDelta >= 0 ? "#E7F6EC" : "#FDECEC",
              border:
                totalDelta >= 0
                  ? "1px solid rgba(46,125,50,0.18)"
                  : "1px solid rgba(198,40,40,0.18)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              {totalDelta >= 0 ? (
                <TrendingUpOutlinedIcon sx={{ color: "#2E7D32" }} />
              ) : (
                <TrendingDownOutlinedIcon sx={{ color: "#C62828" }} />
              )}

              <Typography
                variant="body1"
                fontWeight={800}
                color={totalDelta >= 0 ? "#2E7D32" : "#C62828"}
              >
                {totalDelta >= 0 ? "A composição aumentou" : "A composição reduziu"} em{" "}
                {formatCurrency(Math.abs(totalDelta))}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                xl: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
              minWidth: 0,
            }}
          >
            <DeltaListCard
              title="Variação por categoria"
              values={comparison.summary.deltaByCategory}
            />
            <DeltaListCard
              title="Variação por recorrência"
              values={comparison.summary.deltaByRecurrence}
            />
          </Box>

          <Divider />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<AddCircleOutlineOutlinedIcon />}
              label={`Incluídos: ${comparison.summary.addedCount}`}
              variant="outlined"
            />
            <Chip
              icon={<RemoveCircleOutlineOutlinedIcon />}
              label={`Removidos: ${comparison.summary.removedCount}`}
              variant="outlined"
            />
            <Chip
              icon={<AutorenewOutlinedIcon />}
              label={`Alterados: ${comparison.summary.changedCount}`}
              variant="outlined"
            />
          </Stack>

          <Box sx={{ overflowX: "auto", width: "100%" }}>
            <Table size="small" sx={{ minWidth: 980 }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Item</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Categoria</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Recorrência</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Situação</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Anterior</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Atual</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Impacto</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Campos alterados</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {changedRows.length > 0 ? (
                  changedRows.map((row) => {
                    const changeStyles = getChangeTypeStyles(row.changeType);

                    return (
                      <TableRow key={row.key}>
                        <TableCell sx={{ minWidth: 220 }}>{row.item || "—"}</TableCell>
                        <TableCell>{row.category || "—"}</TableCell>
                        <TableCell>{row.recurrenceType || "—"}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getChangeTypeLabel(row.changeType)}
                            sx={{
                              backgroundColor: changeStyles.backgroundColor,
                              color: changeStyles.color,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.previousSubtotal)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.currentSubtotal)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 800,
                            color: row.subtotalDelta >= 0 ? "#2E7D32" : "#C62828",
                          }}
                        >
                          {row.subtotalDelta >= 0 ? "+" : ""}
                          {formatCurrency(row.subtotalDelta)}
                        </TableCell>
                        <TableCell sx={{ minWidth: 260 }}>
                          {row.fieldDeltas.length > 0 ? (
                            <Stack spacing={0.35}>
                              {row.fieldDeltas.map((delta, index) => (
                                <Typography
                                  key={`${delta.field}-${index}`}
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {delta.field}: {formatValue(delta.previousValue)} →{" "}
                                  {formatValue(delta.currentValue)}
                                </Typography>
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Não aplicável
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma diferença relevante foi encontrada entre as versões.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {changedRows.length > 0 ? (
            <>
              <Divider />
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Detalhamento das alterações
                </Typography>

                {changedRows.map((row) => (
                  <ComparisonRowCard key={`card-${row.key}`} row={row} />
                ))}
              </Stack>
            </>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
