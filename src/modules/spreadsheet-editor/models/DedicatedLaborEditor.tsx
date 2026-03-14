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
];

function isLaborRow(row: EditorRow) {
  const category = String(row.categoria || "").toLowerCase();
  return (
    category.includes("mão de obra") ||
    category.includes("mao de obra") ||
    category.includes("equipe operacional")
  );
}

function normalizeNumberInput(value: string | number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value).replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
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

function extractLaborRows(rows: EditorRow[]) {
  return rows.filter(isLaborRow).map(recalcSubtotal);
}

function mergeRowsPreservingOrder(
  originalRows: EditorRow[],
  editedLaborRows: EditorRow[]
) {
  let laborCursor = 0;

  const rebuilt: EditorRow[] = [];

  for (const row of originalRows) {
    if (isLaborRow(row)) {
      if (laborCursor < editedLaborRows.length) {
        rebuilt.push(editedLaborRows[laborCursor]);
        laborCursor += 1;
      }
    } else {
      rebuilt.push(row);
    }
  }

  while (laborCursor < editedLaborRows.length) {
    rebuilt.push(editedLaborRows[laborCursor]);
    laborCursor += 1;
  }

  return rebuilt;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export default function DedicatedLaborEditor({
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
    setRows(extractLaborRows(spreadsheet.rows));
  }, [spreadsheet]);

  const totalLabor = useMemo(() => {
    return rows.reduce((sum, row) => sum + (row.subtotal || 0), 0);
  }, [rows]);

  function updateRow(
    index: number,
    field: keyof EditorRow,
    value: string
  ) {
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

  function handleAddRow() {
    setRows((current) => [
      ...current,
      {
        id: `labor_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        item: "Novo posto",
        categoria: "Mão de obra",
        quantidade: 1,
        valorUnitario: 0,
        subtotal: 0,
        status: "Pendente",
        memoriaCalculo: "",
        origem: "edição local",
        automatico: false,
        trainingTags: ["mao_de_obra", "edicao_local"],
      },
    ]);
  }

  function handleRemoveRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function handleSave() {
    try {
      const sanitizedLaborRows = rows.map((row) =>
        recalcSubtotal({
          ...row,
          item: String(row.item || "").trim() || "Item sem nome",
          categoria: String(row.categoria || "").trim() || "Mão de obra",
          quantidade: Math.max(0, Number(row.quantidade || 0)),
          valorUnitario: Math.max(0, Number(row.valorUnitario || 0)),
          status: String(row.status || "").trim() || "Pendente",
        })
      );

      const rebuiltRows = mergeRowsPreservingOrder(
        spreadsheet.rows,
        sanitizedLaborRows
      );

      const monthlyBaseValue = rebuiltRows.reduce(
        (sum, row) => sum + (row.subtotal || 0),
        0
      );

      const headcount = sanitizedLaborRows.reduce(
        (sum, row) => sum + Number(row.quantidade || 0),
        0
      );

      const updated = updateSpreadsheet(spreadsheet.id, {
        rows: rebuiltRows,
        monthlyBaseValue,
        headcount,
        metadata: {
          ...(spreadsheet.metadata ?? {}),
          editorModule: "dedicated_labor",
          lastEditedSection: "labor_rows",
        },
      });

      if (!updated) {
        throw new Error("Não foi possível atualizar a planilha.");
      }

      setFeedback({
        type: "success",
        message: "Linhas de mão de obra salvas com sucesso.",
      });

      onSpreadsheetUpdated?.(updated);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao salvar as linhas.",
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
                Editor — Terceirização com dedicação exclusiva
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Este bloco já permite editar a estrutura de mão de obra da planilha,
                recalculando subtotal por linha e persistindo a alteração localmente.
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
            <Chip label={`Linhas: ${rows.length}`} variant="outlined" />
            <Chip
              label={`Total do módulo: ${formatCurrency(totalLabor)}`}
              variant="outlined"
            />
          </Stack>

          <Divider />

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 240 }}>
                    <strong>Posto / função</strong>
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
                          value={row.categoria}
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
                          onChange={(value) =>
                            updateRow(index, "valorUnitario", value)
                          }
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
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma linha de mão de obra encontrada. Adicione a primeira
                        linha para começar a montar o módulo.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
