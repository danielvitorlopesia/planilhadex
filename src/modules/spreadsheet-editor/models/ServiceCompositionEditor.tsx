import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
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
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import EditableCell from "../components/EditableCell";
import ServiceCompositionMemoryCard from "../components/ServiceCompositionMemoryCard";
import ServiceCompositionSummaryCard from "../components/ServiceCompositionSummaryCard";

import {
  buildServiceCompositionMemoryBundle,
  buildServiceCompositionRowMemory,
  buildServiceCompositionSummary,
  calculateServiceCompositionItemSubtotal,
  inferRecurrenceTypeFromPeriodicity,
  inferServiceCompositionCategory,
  sanitizeServiceCompositionDraftRow,
  SERVICE_COMPOSITION_CATEGORY_OPTIONS,
  SERVICE_COMPOSITION_DEPRECIATION_OPTIONS,
  SERVICE_COMPOSITION_PERIODICITY_OPTIONS,
  SERVICE_COMPOSITION_RECURRENCE_OPTIONS,
  SERVICE_COMPOSITION_STATUS_OPTIONS,
  ServiceCompositionDraftRow,
} from "../utils/serviceCompositionCalculator";

import {
  SpreadsheetRecord,
  updateSpreadsheet,
} from "../../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
  onSpreadsheetUpdated?: (spreadsheet: SpreadsheetRecord) => void;
};

type SpreadsheetRow = SpreadsheetRecord["rows"][number];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function normalizeNumberInput(value: string | number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value).replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function isManagedServiceCompositionRow(row: SpreadsheetRow) {
  const category = String(row.categoria || "").toLowerCase();
  const tags = Array.isArray(row.trainingTags) ? row.trainingTags : [];

  return (
    tags.includes("service_composition_row") ||
    category.includes("materiais e insumos") ||
    category.includes("equipamentos") ||
    category.includes("logística operacional") ||
    category.includes("logistica operacional") ||
    category.includes("apoio operacional") ||
    category.includes("equipe técnica") ||
    category.includes("equipe tecnica") ||
    category.includes("equipe operacional")
  );
}

function extractStoredDraftRows(
  spreadsheet: SpreadsheetRecord
): ServiceCompositionDraftRow[] {
  const raw =
    spreadsheet.metadata &&
    typeof spreadsheet.metadata === "object" &&
    Array.isArray(spreadsheet.metadata.serviceCompositionDraftRows)
      ? (spreadsheet.metadata.serviceCompositionDraftRows as Array<
          Partial<ServiceCompositionDraftRow>
        >)
      : [];

  return raw.map((row) => sanitizeServiceCompositionDraftRow(row));
}

function extractDraftRowsFromSpreadsheetRows(
  rows: SpreadsheetRow[]
): ServiceCompositionDraftRow[] {
  return rows
    .filter(isManagedServiceCompositionRow)
    .map((row) => {
      const category = inferServiceCompositionCategory(String(row.categoria || ""));

      return sanitizeServiceCompositionDraftRow({
        id:
          typeof row.id === "string"
            ? row.id
            : `svc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        item: String(row.item || ""),
        category,
        recurrenceType: inferRecurrenceTypeFromPeriodicity("mensal"),
        serviceUnit: "unidade",
        periodicity: "mensal",
        quantity: Number(row.quantidade || 0),
        unitCost: Number(row.valorUnitario || 0),
        productivityFactor: 1,
        allocationFactor: 1,
        depreciationMethod: category === "Equipamentos" ? "rateio_linear" : "nao_aplica",
        usefulLifeMonths: category === "Equipamentos" ? 12 : 0,
        status: String(row.status || "Pendente"),
        consumptionBasis: "",
        technicalJustification: row.memoriaCalculo || "",
      });
    });
}

function convertDraftRowToSpreadsheetRow(
  row: ServiceCompositionDraftRow
): SpreadsheetRow {
  const subtotal = calculateServiceCompositionItemSubtotal(row);

  return {
    id: row.id,
    item: row.item.trim() || "Item sem nome",
    categoria: row.category,
    quantidade: Math.max(0, Number(row.quantity || 0)),
    valorUnitario: row.quantity > 0 ? Number((subtotal / row.quantity).toFixed(2)) : 0,
    subtotal,
    status: row.status.trim() || "Pendente",
    memoriaCalculo: buildServiceCompositionRowMemory(row),
    origem: "edição local",
    automatico: false,
    trainingTags: [
      "service_composition_row",
      `recurrence_${row.recurrenceType}`,
      row.depreciationMethod === "rateio_linear"
        ? "with_depreciation"
        : "without_depreciation",
    ],
  };
}

export default function ServiceCompositionEditor({
  spreadsheet,
  onSpreadsheetUpdated,
}: Props) {
  const [rows, setRows] = useState<ServiceCompositionDraftRow[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  useEffect(() => {
    const storedDraftRows = extractStoredDraftRows(spreadsheet);

    if (storedDraftRows.length > 0) {
      setRows(storedDraftRows);
      return;
    }

    setRows(extractDraftRowsFromSpreadsheetRows(spreadsheet.rows));
  }, [spreadsheet]);

  const summary = useMemo(() => {
    return buildServiceCompositionSummary(rows);
  }, [rows]);

  const memoryBundle = useMemo(() => {
    return buildServiceCompositionMemoryBundle(rows);
  }, [rows]);

  const totalHeadcount = useMemo(() => {
    return rows
      .filter((row) => row.category === "Equipe técnica / operacional")
      .reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  }, [rows]);

  function updateRow<K extends keyof ServiceCompositionDraftRow>(
    index: number,
    field: K,
    value: string
  ) {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const next: ServiceCompositionDraftRow = {
          ...row,
          [field]:
            field === "quantity" ||
            field === "unitCost" ||
            field === "productivityFactor" ||
            field === "allocationFactor" ||
            field === "usefulLifeMonths"
              ? normalizeNumberInput(value)
              : value,
        } as ServiceCompositionDraftRow;

        if (field === "category" && value === "Equipamentos") {
          if (next.depreciationMethod === "nao_aplica") {
            next.depreciationMethod = "rateio_linear";
          }
          if (!next.usefulLifeMonths || next.usefulLifeMonths <= 0) {
            next.usefulLifeMonths = 12;
          }
        }

        if (field === "category" && value !== "Equipamentos") {
          next.depreciationMethod = "nao_aplica";
          next.usefulLifeMonths = 0;
        }

        if (field === "periodicity") {
          if (value === "sob_demanda") {
            next.recurrenceType = "sob_demanda";
          } else if (next.recurrenceType === "sob_demanda") {
            next.recurrenceType = "recorrente";
          }
        }

        if (field === "depreciationMethod" && value === "nao_aplica") {
          next.usefulLifeMonths = 0;
        }

        if (field === "depreciationMethod" && value === "rateio_linear") {
          next.usefulLifeMonths = next.usefulLifeMonths > 0 ? next.usefulLifeMonths : 12;
        }

        return sanitizeServiceCompositionDraftRow(next);
      })
    );
  }

  function handleAddRow() {
    setRows((current) => [
      ...current,
      sanitizeServiceCompositionDraftRow({
        item: "Novo componente",
        category: "Materiais e insumos",
        recurrenceType: "recorrente",
        serviceUnit: "unidade",
        periodicity: "mensal",
        quantity: 1,
        unitCost: 0,
        productivityFactor: 1,
        allocationFactor: 1,
        depreciationMethod: "nao_aplica",
        usefulLifeMonths: 0,
        status: "Pendente",
        consumptionBasis: "",
        technicalJustification: "",
      }),
    ]);
  }

  function handleRemoveRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function handleSave() {
    try {
      const sanitizedRows = rows.map((row) =>
        sanitizeServiceCompositionDraftRow({
          ...row,
          item: String(row.item || "").trim() || "Item sem nome",
        })
      );

      const managedSpreadsheetRows = sanitizedRows.map((row) =>
        convertDraftRowToSpreadsheetRow(row)
      );

      const preservedRows = spreadsheet.rows.filter(
        (row) => !isManagedServiceCompositionRow(row)
      );

      const rebuiltRows = [...managedSpreadsheetRows, ...preservedRows];

      const monthlyBaseValue = rebuiltRows.reduce(
        (sum, row) => sum + Number(row.subtotal || 0),
        0
      );

      const nextSummary = buildServiceCompositionSummary(sanitizedRows);
      const nextMemoryBundle = buildServiceCompositionMemoryBundle(sanitizedRows);

      const updated = updateSpreadsheet(spreadsheet.id, {
        rows: rebuiltRows,
        monthlyBaseValue,
        headcount: totalHeadcount,
        metadata: {
          ...(spreadsheet.metadata ?? {}),
          editorModule: "service_composition",
          lastEditedSection: "service_composition_rows",
          serviceCompositionDraftRows: sanitizedRows,
          serviceCompositionSummary: nextSummary,
          serviceCompositionMemoryBundle: nextMemoryBundle,
        },
      });

      if (!updated) {
        throw new Error("Não foi possível atualizar a planilha.");
      }

      setFeedback({
        type: "success",
        message: "Composição de serviços salva com sucesso.",
      });

      onSpreadsheetUpdated?.(updated);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao salvar a composição de serviços.",
      });
    }
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1.5}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Editor — Serviços por composição
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Este bloco permite montar a composição material e operacional do
                serviço, com recorrência, periodicidade, produtividade,
                rateio/depreciação, base de consumo e justificativa técnica.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
              >
                Adicionar linha
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                onClick={handleSave}
              >
                Salvar módulo
              </Button>
            </Stack>
          </Stack>

          {feedback.type ? (
            <Alert
              severity={feedback.type}
              onClose={() => setFeedback({ type: null, message: "" })}
            >
              {feedback.message}
            </Alert>
          ) : null}

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Itens: ${summary.itemCount}`} variant="outlined" />
            <Chip
              label={`Total da composição: ${formatCurrency(summary.total)}`}
              variant="outlined"
            />
            <Chip
              label={`Quantidade operacional: ${totalHeadcount}`}
              variant="outlined"
            />
          </Stack>

          <Divider />

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 220 }}>
                    <strong>Componente</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 190 }}>
                    <strong>Bloco</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    <strong>Recorrência</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    <strong>Unidade</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    <strong>Periodicidade</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 120 }}>
                    <strong>Quantidade</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 140 }}>
                    <strong>Custo unitário</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    <strong>Produtividade</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 170 }}>
                    <strong>Rateio contratual</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 170 }}>
                    <strong>Depreciação</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    <strong>Vida útil (meses)</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 220 }}>
                    <strong>Base de consumo</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 240 }}>
                    <strong>Justificativa técnica</strong>
                  </TableCell>

                  <TableCell align="right" sx={{ minWidth: 130 }}>
                    <strong>Subtotal</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    <strong>Status</strong>
                  </TableCell>

                  <TableCell align="center" sx={{ minWidth: 100 }}>
                    <strong>Ação</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <TableRow key={row.id || `${row.item}-${index}`}>
                      <TableCell>
                        <EditableCell
                          value={row.item}
                          onChange={(value) => updateRow(index, "item", value)}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="select"
                          value={row.category}
                          options={SERVICE_COMPOSITION_CATEGORY_OPTIONS}
                          onChange={(value) =>
                            updateRow(index, "category", value)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="select"
                          value={row.recurrenceType}
                          options={SERVICE_COMPOSITION_RECURRENCE_OPTIONS}
                          onChange={(value) =>
                            updateRow(index, "recurrenceType", value)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          value={row.serviceUnit}
                          onChange={(value) =>
                            updateRow(index, "serviceUnit", value)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="select"
                          value={row.periodicity}
                          options={SERVICE_COMPOSITION_PERIODICITY_OPTIONS}
                          onChange={(value) =>
                            updateRow(index, "periodicity", value)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="number"
                          value={row.quantity}
                          onChange={(value) =>
                            updateRow(index, "quantity", value)
                          }
                          min={0}
                          step={1}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="number"
                          value={row.unitCost}
                          onChange={(value) =>
                            updateRow(index, "unitCost", value)
                          }
                          min={0}
                          step={0.01}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="number"
                          value={row.productivityFactor}
                          onChange={(value) =>
                            updateRow(index, "productivityFactor", value)
                          }
                          min={0}
                          step={0.01}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="number"
                          value={row.allocationFactor}
                          onChange={(value) =>
                            updateRow(index, "allocationFactor", value)
                          }
                          min={0}
                          step={0.01}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="select"
                          value={row.depreciationMethod}
                          options={SERVICE_COMPOSITION_DEPRECIATION_OPTIONS}
                          onChange={(value) =>
                            updateRow(index, "depreciationMethod", value)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="number"
                          value={row.usefulLifeMonths}
                          onChange={(value) =>
                            updateRow(index, "usefulLifeMonths", value)
                          }
                          min={0}
                          step={1}
                          disabled={row.depreciationMethod === "nao_aplica"}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          value={row.consumptionBasis}
                          onChange={(value) =>
                            updateRow(index, "consumptionBasis", value)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          value={row.technicalJustification}
                          onChange={(value) =>
                            updateRow(index, "technicalJustification", value)
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(
                            calculateServiceCompositionItemSubtotal(row)
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="select"
                          value={row.status}
                          options={SERVICE_COMPOSITION_STATUS_OPTIONS}
                          onChange={(value) => updateRow(index, "status", value)}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          color="error"
                          variant="text"
                          onClick={() => handleRemoveRow(index)}
                          startIcon={<DeleteOutlineIcon />}
                        >
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={16}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum componente foi identificado ainda. Adicione a primeira
                        linha para começar a montar a composição de serviços.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <ServiceCompositionSummaryCard summary={summary} />

          <ServiceCompositionMemoryCard items={memoryBundle} />
        </Stack>
      </CardContent>
    </Card>
  );
}
