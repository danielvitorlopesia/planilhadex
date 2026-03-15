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
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import EditableCell from "../components/EditableCell";
import {
  SpreadsheetRecord,
  updateSpreadsheet,
} from "../../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
  onSpreadsheetUpdated?: (spreadsheet: SpreadsheetRecord) => void;
};

type EditorRow = SpreadsheetRecord["rows"][number];

const STATUS_OPTIONS = [
  { value: "Pendente", label: "Pendente" },
  { value: "Conferido", label: "Conferido" },
  { value: "Exemplo do domínio", label: "Exemplo do domínio" },
  { value: "Em elaboração", label: "Em elaboração" },
  { value: "Calculado", label: "Calculado" },
];

const CATEGORY_OPTIONS = [
  { value: "Materiais e insumos", label: "Materiais e insumos" },
  { value: "Equipamentos", label: "Equipamentos" },
  { value: "Logística", label: "Logística" },
  { value: "Apoio operacional", label: "Apoio operacional" },
  { value: "EPIs e uniformes", label: "EPIs e uniformes" },
  { value: "Materiais de consumo", label: "Materiais de consumo" },
];

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeNumberInput(value: string | number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value).trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function recalcSubtotal(row: EditorRow): EditorRow {
  const quantidade = Number(row.quantidade || 0);
  const valorUnitario = Number(row.valorUnitario || 0);

  return {
    ...row,
    quantidade,
    valorUnitario,
    subtotal: Number((quantidade * valorUnitario).toFixed(2)),
  };
}

function categoryIncludes(category: string, terms: string[]) {
  const normalized = category.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function rowHasTrainingTag(row: EditorRow, tag: string) {
  return Array.isArray(row.trainingTags) && row.trainingTags.includes(tag);
}

function isEditableCompositionRow(row: EditorRow) {
  const category = safeString(row.categoria).toLowerCase();
  const item = safeString(row.item).toLowerCase();

  return (
    categoryIncludes(category, [
      "material",
      "insumo",
      "equipamento",
      "logística",
      "logistica",
      "apoio operacional",
      "epi",
      "uniforme",
    ]) ||
    item.includes("equipamento") ||
    item.includes("uniforme") ||
    item.includes("epi") ||
    rowHasTrainingTag(row, "service_composition_editable")
  );
}

function extractEditableRows(rows: EditorRow[]) {
  return rows.filter(isEditableCompositionRow).map(recalcSubtotal);
}

function buildRowId(prefix = "composition") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function buildMaterialRow(): EditorRow {
  return {
    id: buildRowId("material"),
    item: "Novo material",
    categoria: "Materiais e insumos",
    quantidade: 1,
    valorUnitario: 0,
    subtotal: 0,
    status: "Pendente",
    memoriaCalculo: "",
    origem: "edição local",
    automatico: false,
    trainingTags: ["service_composition_editable", "material"],
  };
}

function buildEquipmentRow(): EditorRow {
  return {
    id: buildRowId("equipment"),
    item: "Novo equipamento",
    categoria: "Equipamentos",
    quantidade: 1,
    valorUnitario: 0,
    subtotal: 0,
    status: "Pendente",
    memoriaCalculo: "",
    origem: "edição local",
    automatico: false,
    trainingTags: ["service_composition_editable", "equipment"],
  };
}

function summarizeRows(rows: EditorRow[]) {
  const itemCount = rows.length;

  const total = rows.reduce((sum, row) => sum + Number(row.subtotal || 0), 0);

  const materialsTotal = rows.reduce((sum, row) => {
    const category = safeString(row.categoria).toLowerCase();
    if (
      categoryIncludes(category, ["material", "insumo", "epi", "uniforme"]) &&
      !category.includes("equipamento")
    ) {
      return sum + Number(row.subtotal || 0);
    }
    return sum;
  }, 0);

  const equipmentTotal = rows.reduce((sum, row) => {
    const category = safeString(row.categoria).toLowerCase();
    if (categoryIncludes(category, ["equipamento"])) {
      return sum + Number(row.subtotal || 0);
    }
    return sum;
  }, 0);

  const logisticsTotal = rows.reduce((sum, row) => {
    const category = safeString(row.categoria).toLowerCase();
    if (categoryIncludes(category, ["logística", "logistica"])) {
      return sum + Number(row.subtotal || 0);
    }
    return sum;
  }, 0);

  const supportTotal = rows.reduce((sum, row) => {
    const category = safeString(row.categoria).toLowerCase();
    if (categoryIncludes(category, ["apoio operacional"])) {
      return sum + Number(row.subtotal || 0);
    }
    return sum;
  }, 0);

  const recurringTotal = rows.reduce((sum, row) => {
    const tags = Array.isArray(row.trainingTags) ? row.trainingTags : [];
    if (tags.includes("recorrente")) {
      return sum + Number(row.subtotal || 0);
    }
    return sum;
  }, 0);

  const eventualTotal = rows.reduce((sum, row) => {
    const tags = Array.isArray(row.trainingTags) ? row.trainingTags : [];
    if (tags.includes("eventual")) {
      return sum + Number(row.subtotal || 0);
    }
    return sum;
  }, 0);

  const onDemandTotal = rows.reduce((sum, row) => {
    const tags = Array.isArray(row.trainingTags) ? row.trainingTags : [];
    if (tags.includes("sob_demanda")) {
      return sum + Number(row.subtotal || 0);
    }
    return sum;
  }, 0);

  return {
    itemCount,
    total: Number(total.toFixed(2)),
    workforceTotal: 0,
    materialsTotal: Number(materialsTotal.toFixed(2)),
    equipmentTotal: Number(equipmentTotal.toFixed(2)),
    logisticsTotal: Number(logisticsTotal.toFixed(2)),
    supportTotal: Number(supportTotal.toFixed(2)),
    recurringTotal: Number(recurringTotal.toFixed(2)),
    eventualTotal: Number(eventualTotal.toFixed(2)),
    onDemandTotal: Number(onDemandTotal.toFixed(2)),
  };
}

export default function ServiceCompositionEditor({
  spreadsheet,
  onSpreadsheetUpdated,
}: Props) {
  const [rows, setRows] = useState<EditorRow[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  useEffect(() => {
    setRows(extractEditableRows(spreadsheet.rows));
  }, [spreadsheet]);

  const summary = useMemo(() => summarizeRows(rows), [rows]);

  function updateRow(index: number, field: keyof EditorRow, value: string) {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const nextRow: EditorRow = {
          ...row,
          [field]:
            field === "quantidade" || field === "valorUnitario"
              ? normalizeNumberInput(value)
              : value,
        };

        return recalcSubtotal(nextRow);
      })
    );
  }

  function handleAddMaterialRow() {
    setRows((current) => [...current, buildMaterialRow()]);
  }

  function handleAddEquipmentRow() {
    setRows((current) => [...current, buildEquipmentRow()]);
  }

  function handleRemoveRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function handleSave() {
    try {
      const sanitizedRows = rows.map((row) => {
        const normalizedCategory =
          safeString(row.categoria).trim() || "Materiais e insumos";

        const nextTrainingTags = Array.isArray(row.trainingTags)
          ? [...row.trainingTags]
          : [];

        if (!nextTrainingTags.includes("service_composition_editable")) {
          nextTrainingTags.push("service_composition_editable");
        }

        return recalcSubtotal({
          ...row,
          item: safeString(row.item).trim() || "Item sem nome",
          categoria: normalizedCategory,
          quantidade: Math.max(0, Number(row.quantidade || 0)),
          valorUnitario: Math.max(0, Number(row.valorUnitario || 0)),
          status: safeString(row.status).trim() || "Pendente",
          memoriaCalculo: safeString(row.memoriaCalculo),
          trainingTags: nextTrainingTags,
        });
      });

      const preservedRows = spreadsheet.rows.filter(
        (row) => !isEditableCompositionRow(row)
      );

      const rebuiltRows = [...sanitizedRows, ...preservedRows];

      const monthlyBaseValue = rebuiltRows.reduce(
        (sum, row) => sum + Number(row.subtotal || 0),
        0
      );

      const updated = updateSpreadsheet(spreadsheet.id, {
        rows: rebuiltRows,
        monthlyBaseValue: Number(monthlyBaseValue.toFixed(2)),
        metadata: {
          ...(spreadsheet.metadata ?? {}),
          editorModule: "service_composition",
          lastEditedSection: "materials_equipments_logistics",
          serviceCompositionSummary: summary,
        },
      });

      if (!updated) {
        throw new Error("Não foi possível atualizar a planilha.");
      }

      setFeedback({
        type: "success",
        message:
          "Insumos, materiais e equipamentos salvos com sucesso.",
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
                Este bloco permite editar materiais, insumos, equipamentos,
                logística e apoio operacional, atualizando a composição total da
                planilha.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="outlined"
                startIcon={<Inventory2OutlinedIcon />}
                onClick={handleAddMaterialRow}
              >
                Adicionar material
              </Button>

              <Button
                variant="outlined"
                startIcon={<BuildOutlinedIcon />}
                onClick={handleAddEquipmentRow}
              >
                Adicionar equipamento
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
              label={`Materiais/insumos: ${formatCurrency(summary.materialsTotal)}`}
              variant="outlined"
            />
            <Chip
              label={`Equipamentos: ${formatCurrency(summary.equipmentTotal)}`}
              variant="outlined"
            />
            <Chip
              label={`Logística/apoio: ${formatCurrency(
                summary.logisticsTotal + summary.supportTotal
              )}`}
              variant="outlined"
            />
            <Chip
              label={`Total do módulo: ${formatCurrency(summary.total)}`}
              variant="outlined"
            />
          </Stack>

          <Divider />

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 220 }}>
                    <strong>Item</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 180 }}>
                    <strong>Categoria</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 120 }}>
                    <strong>Quantidade</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 140 }}>
                    <strong>Valor unitário</strong>
                  </TableCell>

                  <TableCell align="right" sx={{ minWidth: 130 }}>
                    <strong>Subtotal</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 160 }}>
                    <strong>Status</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 220 }}>
                    <strong>Memória / justificativa</strong>
                  </TableCell>

                  <TableCell align="center" sx={{ minWidth: 90 }}>
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
                          value={row.categoria}
                          options={CATEGORY_OPTIONS}
                          onChange={(value) => updateRow(index, "categoria", value)}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="number"
                          value={row.quantidade}
                          onChange={(value) => updateRow(index, "quantidade", value)}
                          min={0}
                          step={1}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="number"
                          value={row.valorUnitario}
                          onChange={(value) => updateRow(index, "valorUnitario", value)}
                          min={0}
                          step={0.01}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(row.subtotal || 0)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="select"
                          value={row.status}
                          options={STATUS_OPTIONS}
                          onChange={(value) => updateRow(index, "status", value)}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          value={row.memoriaCalculo || ""}
                          onChange={(value) =>
                            updateRow(index, "memoriaCalculo", value)
                          }
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
                    <TableCell colSpan={8}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum item de composição editável foi encontrado.
                        Adicione materiais ou equipamentos para iniciar este módulo.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <Divider />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Materiais e insumos
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.materialsTotal)}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Equipamentos
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.equipmentTotal)}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Logística e apoio
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.logisticsTotal + summary.supportTotal)}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Total da composição
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.total)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
