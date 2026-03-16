import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import EditableCell from "../components/EditableCell";
import {
  SpreadsheetRecord,
  updateSpreadsheet,
} from "../../../services/spreadsheetService";
import {
  calculateServiceComposition,
  extractEditableCompositionRows,
  ServiceCompositionRow,
  ServiceCompositionDemandType,
} from "../calculators/serviceComposition";

type Props = {
  spreadsheet: SpreadsheetRecord;
  onSpreadsheetUpdated?: (spreadsheet: SpreadsheetRecord) => void;
};

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

const DEMAND_TYPE_OPTIONS: Array<{
  value: ServiceCompositionDemandType;
  label: string;
}> = [
  { value: "recorrente", label: "Recorrente" },
  { value: "eventual", label: "Eventual" },
  { value: "sob_demanda", label: "Sob demanda" },
  { value: "nao_informado", label: "Não informado" },
];

type VersionHistoryEntry = {
  id: string;
  versionNumber: number;
  label: string;
  createdAt: string;
  reason: string;
  origin: string;
  spreadsheetId: string;
  rows: ServiceCompositionRow[];
  isBaseline?: boolean;
  notes?: string;
};

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

function buildRowId(prefix = "composition") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function buildSnapshotId(prefix = "snapshot") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function buildBaseRow(
  item: string,
  categoria: string,
  extraTags: string[] = []
): ServiceCompositionRow {
  return {
    id: buildRowId("composition"),
    item,
    categoria,
    quantidade: 1,
    valorUnitario: 0,
    subtotal: 0,
    status: "Pendente",
    memoriaCalculo: "",
    origem: "edição local",
    automatico: false,
    trainingTags: ["service_composition_editable", ...extraTags],
    metadata: {
      demandType: "nao_informado",
      serviceUnit: "",
      periodicity: "",
      productivityFactor: 1,
      monthlyFactor: 1,
      depreciationCriteria: "",
      consumptionBase: "",
      technicalJustification: "",
    },
  };
}

function buildMaterialRow(): ServiceCompositionRow {
  return buildBaseRow("Novo material", "Materiais e insumos", ["material"]);
}

function buildEquipmentRow(): ServiceCompositionRow {
  return buildBaseRow("Novo equipamento", "Equipamentos", ["equipment"]);
}

function buildLogisticsRow(): ServiceCompositionRow {
  return buildBaseRow("Novo item logístico", "Logística", ["logistics"]);
}

function buildOperationalSupportRow(): ServiceCompositionRow {
  return buildBaseRow("Novo apoio operacional", "Apoio operacional", [
    "operational_support",
  ]);
}

function withMetadata(
  row: ServiceCompositionRow
): ServiceCompositionRow & {
  metadata: Record<string, unknown>;
} {
  return {
    ...row,
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? { ...(row.metadata as Record<string, unknown>) }
        : {},
  };
}

function mergeDemandTypeTags(
  currentTags: string[] | undefined,
  demandType: ServiceCompositionDemandType
) {
  const tags = Array.isArray(currentTags) ? [...currentTags] : [];
  const cleaned = tags.filter(
    (tag) => !["recorrente", "eventual", "sob_demanda"].includes(tag)
  );

  if (demandType === "recorrente") {
    cleaned.push("recorrente");
  } else if (demandType === "eventual") {
    cleaned.push("eventual");
  } else if (demandType === "sob_demanda") {
    cleaned.push("sob_demanda");
  }

  if (!cleaned.includes("service_composition_editable")) {
    cleaned.push("service_composition_editable");
  }

  return cleaned;
}

function cloneRows(rows: ServiceCompositionRow[]): ServiceCompositionRow[] {
  return rows.map((row) => ({
    ...row,
    trainingTags: Array.isArray(row.trainingTags) ? [...row.trainingTags] : [],
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? { ...(row.metadata as Record<string, unknown>) }
        : {},
  }));
}

function readVersionHistory(metadata: unknown): VersionHistoryEntry[] {
  if (!metadata || typeof metadata !== "object") {
    return [];
  }

  const raw = (metadata as Record<string, unknown>).versionHistory;
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw as VersionHistoryEntry[];
}

function readCurrentVersionNumber(metadata: unknown): number {
  if (!metadata || typeof metadata !== "object") {
    return 1;
  }

  const raw = (metadata as Record<string, unknown>).versionNumber;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === "string" && raw.trim()) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 1;
}

export default function ServiceCompositionEditor({
  spreadsheet,
  onSpreadsheetUpdated,
}: Props) {
  const [rows, setRows] = useState<ServiceCompositionRow[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  useEffect(() => {
    setRows(extractEditableCompositionRows(spreadsheet.rows));
  }, [spreadsheet]);

  const calculation = useMemo(() => calculateServiceComposition(rows), [rows]);
  const summary = calculation.summary;
  const memoryBundle = calculation.memoryBundle;
  const normalizedRows = calculation.normalizedRows;

  function updateRow(index: number, field: keyof ServiceCompositionRow, value: string) {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const prepared = withMetadata(row);

        return {
          ...prepared,
          [field]:
            field === "quantidade" || field === "valorUnitario"
              ? normalizeNumberInput(value)
              : value,
        };
      })
    );
  }

  function updateRowMetadata(index: number, key: string, value: string | number) {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const prepared = withMetadata(row);

        return {
          ...prepared,
          metadata: {
            ...prepared.metadata,
            [key]:
              key === "productivityFactor" || key === "monthlyFactor"
                ? normalizeNumberInput(value)
                : value,
          },
        };
      })
    );
  }

  function updateDemandType(index: number, demandType: ServiceCompositionDemandType) {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const prepared = withMetadata(row);

        return {
          ...prepared,
          trainingTags: mergeDemandTypeTags(prepared.trainingTags, demandType),
          metadata: {
            ...prepared.metadata,
            demandType,
          },
        };
      })
    );
  }

  function handleAddMaterialRow() {
    setRows((current) => [...current, buildMaterialRow()]);
  }

  function handleAddEquipmentRow() {
    setRows((current) => [...current, buildEquipmentRow()]);
  }

  function handleAddLogisticsRow() {
    setRows((current) => [...current, buildLogisticsRow()]);
  }

  function handleAddOperationalSupportRow() {
    setRows((current) => [...current, buildOperationalSupportRow()]);
  }

  function handleRemoveRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function handleSave() {
    try {
      const currentMetadata =
        spreadsheet.metadata && typeof spreadsheet.metadata === "object"
          ? { ...(spreadsheet.metadata as Record<string, unknown>) }
          : {};

      const previousEditableRows = extractEditableCompositionRows(spreadsheet.rows);
      const previousEditableRowsCloned = cloneRows(previousEditableRows);

      const sanitizedRows = normalizedRows.map((row) => {
        const metadata = {
          ...(row.metadata && typeof row.metadata === "object"
            ? (row.metadata as Record<string, unknown>)
            : {}),
          demandType: row.demandType,
          serviceUnit: row.serviceUnit,
          periodicity: row.periodicity,
          productivityFactor: row.productivityFactor,
          monthlyFactor: row.monthlyFactor,
          depreciationCriteria: row.depreciationCriteria,
          consumptionBase: row.consumptionBase,
          technicalJustification: row.technicalJustification,
        };

        return {
          ...row,
          item: safeString(row.item).trim() || "Item sem nome",
          categoria: safeString(row.categoria).trim() || "Materiais e insumos",
          quantidade: Math.max(0, Number(row.quantidade || 0)),
          valorUnitario: Math.max(0, Number(row.valorUnitario || 0)),
          subtotal: Number(row.subtotal || 0),
          status: safeString(row.status).trim() || "Pendente",
          memoriaCalculo: safeString(row.memoriaCalculo),
          trainingTags: mergeDemandTypeTags(row.trainingTags, row.demandType),
          metadata,
        };
      });

      const preservedRows = spreadsheet.rows.filter(
        (row) => !extractEditableCompositionRows([row]).length
      );

      const rebuiltRows = [...sanitizedRows, ...preservedRows];

      const monthlyBaseValue = rebuiltRows.reduce(
        (sum, row) => sum + Number(row.subtotal || 0),
        0
      );

      const currentVersionNumber = readCurrentVersionNumber(currentMetadata);
      const nextVersionNumber = currentVersionNumber + 1;
      const nowIso = new Date().toISOString();

      const versionHistory = readVersionHistory(currentMetadata);
      const snapshotReason = "Snapshot pré-atualização do módulo de composição";
      const snapshotOrigin = "auto_snapshot";

      const snapshotEntry: VersionHistoryEntry = {
        id: buildSnapshotId("service_composition_snapshot"),
        versionNumber: currentVersionNumber,
        label: `Versão ${currentVersionNumber}`,
        createdAt: nowIso,
        reason: snapshotReason,
        origin: snapshotOrigin,
        spreadsheetId: spreadsheet.id,
        rows: previousEditableRowsCloned,
        isBaseline: versionHistory.length === 0,
        notes: "Base anterior preservada automaticamente antes do salvamento do módulo.",
      };

      const updated = updateSpreadsheet(spreadsheet.id, {
        rows: rebuiltRows,
        monthlyBaseValue: Number(monthlyBaseValue.toFixed(2)),
        metadata: {
          ...currentMetadata,
          editorModule: "service_composition",
          lastEditedSection: "materials_equipments_logistics",
          versionNumber: nextVersionNumber,
          previousSpreadsheetId: spreadsheet.id,
          previousVersionRows: previousEditableRowsCloned,
          lastSnapshotAt: nowIso,
          lastSnapshotReason: snapshotReason,
          lastSnapshotOrigin: snapshotOrigin,
          serviceCompositionSummary: summary,
          serviceCompositionMemoryBundle: memoryBundle,
          serviceCompositionEngineSnapshot: {
            generatedAt: nowIso,
            itemCount: summary.itemCount,
            total: summary.total,
            totalByCategory: {
              "Materiais e insumos": summary.materialsTotal,
              Equipamentos: summary.equipmentTotal,
              "Logística operacional": summary.logisticsTotal,
              "Apoio operacional": summary.supportTotal,
              "EPIs e uniformes": summary.episAndUniformsTotal,
              "Materiais de consumo": summary.consumablesTotal,
            },
            totalByRecurrence: {
              recorrente: summary.recurringTotal,
              eventual: summary.eventualTotal,
              sob_demanda: summary.onDemandTotal,
            },
          },
          versionHistory: [...versionHistory, snapshotEntry],
        },
      });

      if (!updated) {
        throw new Error("Não foi possível atualizar a planilha.");
      }

      setFeedback({
        type: "success",
        message:
          "Composição de serviços salva com snapshot automático pré-save, cálculo, resumo técnico e memória persistida.",
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
                Este bloco passa a operar com cálculo estruturado, classificando
                materiais, insumos, equipamentos, logística e apoio operacional,
                além de persistir resumo técnico, memória de composição e snapshot
                automático pré-atualização.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              flexWrap="wrap"
              useFlexGap
            >
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
                variant="outlined"
                startIcon={<LocalShippingOutlinedIcon />}
                onClick={handleAddLogisticsRow}
              >
                Adicionar logística
              </Button>

              <Button
                variant="outlined"
                startIcon={<SupportAgentOutlinedIcon />}
                onClick={handleAddOperationalSupportRow}
              >
                Adicionar apoio
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
              label={`Logística: ${formatCurrency(summary.logisticsTotal)}`}
              variant="outlined"
            />
            <Chip
              label={`Apoio operacional: ${formatCurrency(summary.supportTotal)}`}
              variant="outlined"
            />
            <Chip
              label={`EPIs/uniformes: ${formatCurrency(summary.episAndUniformsTotal)}`}
              variant="outlined"
            />
            <Chip
              label={`Consumo: ${formatCurrency(summary.consumablesTotal)}`}
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
                  <TableCell sx={{ minWidth: 200 }}>
                    <strong>Item</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 170 }}>
                    <strong>Categoria</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 120 }}>
                    <strong>Tipo de demanda</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 110 }}>
                    <strong>Qtd.</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 130 }}>
                    <strong>Valor unitário</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 120 }}>
                    <strong>Unidade</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 130 }}>
                    <strong>Periodicidade</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 120 }}>
                    <strong>Produtividade</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 120 }}>
                    <strong>Mensalização</strong>
                  </TableCell>

                  <TableCell align="right" sx={{ minWidth: 130 }}>
                    <strong>Subtotal</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 160 }}>
                    <strong>Status</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 180 }}>
                    <strong>Base de consumo</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 180 }}>
                    <strong>Depreciação</strong>
                  </TableCell>

                  <TableCell sx={{ minWidth: 240 }}>
                    <strong>Memória / justificativa</strong>
                  </TableCell>

                  <TableCell align="center" sx={{ minWidth: 90 }}>
                    <strong>Ação</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {normalizedRows.length > 0 ? (
                  normalizedRows.map((row, index) => {
                    const metadata =
                      row.metadata && typeof row.metadata === "object"
                        ? (row.metadata as Record<string, unknown>)
                        : {};

                    return (
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
                          <Select
                            size="small"
                            fullWidth
                            value={row.demandType}
                            onChange={(event) =>
                              updateDemandType(
                                index,
                                event.target.value as ServiceCompositionDemandType
                              )
                            }
                          >
                            {DEMAND_TYPE_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>

                        <TableCell>
                          <EditableCell
                            type="number"
                            value={row.quantidade}
                            onChange={(value) => updateRow(index, "quantidade", value)}
                            min={0}
                            step={0.01}
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

                        <TableCell>
                          <EditableCell
                            value={safeString(metadata.serviceUnit)}
                            onChange={(value) =>
                              updateRowMetadata(index, "serviceUnit", value)
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <EditableCell
                            value={safeString(metadata.periodicity)}
                            onChange={(value) =>
                              updateRowMetadata(index, "periodicity", value)
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <EditableCell
                            type="number"
                            value={Number(metadata.productivityFactor ?? 1)}
                            onChange={(value) =>
                              updateRowMetadata(index, "productivityFactor", value)
                            }
                            min={0}
                            step={0.01}
                          />
                        </TableCell>

                        <TableCell>
                          <EditableCell
                            type="number"
                            value={Number(metadata.monthlyFactor ?? 1)}
                            onChange={(value) =>
                              updateRowMetadata(index, "monthlyFactor", value)
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

                        <TableCell>
                          <EditableCell
                            value={safeString(metadata.consumptionBase)}
                            onChange={(value) =>
                              updateRowMetadata(index, "consumptionBase", value)
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <EditableCell
                            value={safeString(metadata.depreciationCriteria)}
                            onChange={(value) =>
                              updateRowMetadata(index, "depreciationCriteria", value)
                            }
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
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={15}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum item de composição editável foi encontrado.
                        Adicione materiais, equipamentos, logística ou apoio
                        operacional para iniciar este módulo.
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
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
                xl: "repeat(4, 1fr)",
              },
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
                  Logística
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.logisticsTotal)}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Apoio operacional
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.supportTotal)}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  EPIs e uniformes
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.episAndUniformsTotal)}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Materiais de consumo
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.consumablesTotal)}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Recorrente / eventual / sob demanda
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Recorrente: <strong>{formatCurrency(summary.recurringTotal)}</strong>
                </Typography>
                <Typography variant="body2">
                  Eventual: <strong>{formatCurrency(summary.eventualTotal)}</strong>
                </Typography>
                <Typography variant="body2">
                  Sob demanda: <strong>{formatCurrency(summary.onDemandTotal)}</strong>
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
