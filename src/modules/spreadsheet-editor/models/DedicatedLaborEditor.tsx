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
import LaborCostBreakdown from "../components/LaborCostBreakdown";
import LaborChargesConfigCard from "../components/LaborChargesConfigCard";

import {
  calculateLaborCost,
  DEFAULT_LABOR_CHARGES_CONFIG,
  LaborChargesConfig,
  LaborResult,
  sanitizeLaborChargesConfig,
} from "../utils/laborCostCalculator";

import {
  SpreadsheetRecord,
  updateSpreadsheet,
} from "../../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
  onSpreadsheetUpdated?: (spreadsheet: SpreadsheetRecord) => void;
};

type EditorRow = SpreadsheetRecord["rows"][number];

type VersionHistoryEntry = {
  id: string;
  versionNumber: number;
  label: string;
  createdAt: string;
  reason: string;
  origin: string;
  spreadsheetId: string;
  rows: SpreadsheetRecord["rows"];
  notes?: string;
};

const STATUS_OPTIONS = [
  { value: "Pendente", label: "Pendente" },
  { value: "Conferido", label: "Conferido" },
  { value: "Exemplo do domínio", label: "Exemplo do domínio" },
  { value: "Em elaboração", label: "Em elaboração" },
  { value: "Calculado", label: "Calculado" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLaborRow(row: EditorRow) {
  const category = String(row.categoria || "").toLowerCase();

  return (
    category.includes("mão de obra") ||
    category.includes("mao de obra") ||
    category.includes("equipe operacional")
  );
}

function isDerivedChargeOrBenefitRow(row: EditorRow) {
  const category = String(row.categoria || "").toLowerCase();
  const tags = Array.isArray(row.trainingTags) ? row.trainingTags : [];

  return (
    category.includes("encargos") ||
    category.includes("benefícios") ||
    category.includes("beneficios") ||
    tags.includes("generated_labor_charge") ||
    tags.includes("generated_labor_benefit")
  );
}

function normalizeNumberInput(value: string | number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value).trim().replace(/\./g, "").replace(",", ".");
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

function extractStoredChargesConfig(
  spreadsheet: SpreadsheetRecord
): LaborChargesConfig {
  const metadata = spreadsheet.metadata;

  if (!isRecord(metadata)) {
    return DEFAULT_LABOR_CHARGES_CONFIG;
  }

  const raw = metadata["laborChargesConfig"];

  if (!isRecord(raw)) {
    return DEFAULT_LABOR_CHARGES_CONFIG;
  }

  return sanitizeLaborChargesConfig(raw as Partial<LaborChargesConfig>);
}

function buildDerivedRows(result: LaborResult): EditorRow[] {
  const generatedStatus = "Calculado";

  return [
    {
      id: "derived_inss_patronal",
      item: "INSS patronal",
      categoria: "Encargos",
      quantidade: 1,
      valorUnitario: Number(result.employerInss.toFixed(2)),
      subtotal: Number(result.employerInss.toFixed(2)),
      status: generatedStatus,
      memoriaCalculo: `Base salarial x ${result.config.employerInssRate}%`,
      origem: "motor de encargos",
      automatico: true,
      trainingTags: ["generated_labor_charge"],
    },
    {
      id: "derived_fgts",
      item: "FGTS",
      categoria: "Encargos",
      quantidade: 1,
      valorUnitario: Number(result.fgts.toFixed(2)),
      subtotal: Number(result.fgts.toFixed(2)),
      status: generatedStatus,
      memoriaCalculo: `Base salarial x ${result.config.fgtsRate}%`,
      origem: "motor de encargos",
      automatico: true,
      trainingTags: ["generated_labor_charge"],
    },
    {
      id: "derived_rat",
      item: "RAT / GILRAT",
      categoria: "Encargos",
      quantidade: 1,
      valorUnitario: Number(result.rat.toFixed(2)),
      subtotal: Number(result.rat.toFixed(2)),
      status: generatedStatus,
      memoriaCalculo: `Base salarial x ${result.config.ratRate}%`,
      origem: "motor de encargos",
      automatico: true,
      trainingTags: ["generated_labor_charge"],
    },
    {
      id: "derived_terceiros",
      item: "Terceiros",
      categoria: "Encargos",
      quantidade: 1,
      valorUnitario: Number(result.thirdPartyCharges.toFixed(2)),
      subtotal: Number(result.thirdPartyCharges.toFixed(2)),
      status: generatedStatus,
      memoriaCalculo: `Base salarial x ${result.config.thirdPartyRate}%`,
      origem: "motor de encargos",
      automatico: true,
      trainingTags: ["generated_labor_charge"],
    },
    {
      id: "derived_ferias",
      item: "Provisão de férias",
      categoria: "Encargos",
      quantidade: 1,
      valorUnitario: Number(result.feriasProvision.toFixed(2)),
      subtotal: Number(result.feriasProvision.toFixed(2)),
      status: generatedStatus,
      memoriaCalculo: `Base salarial x ${result.config.vacationProvisionRate}%`,
      origem: "motor de encargos",
      automatico: true,
      trainingTags: ["generated_labor_charge"],
    },
    {
      id: "derived_decimo_terceiro",
      item: "Provisão de 13º salário",
      categoria: "Encargos",
      quantidade: 1,
      valorUnitario: Number(result.thirteenthProvision.toFixed(2)),
      subtotal: Number(result.thirteenthProvision.toFixed(2)),
      status: generatedStatus,
      memoriaCalculo: `Base salarial x ${result.config.thirteenthProvisionRate}%`,
      origem: "motor de encargos",
      automatico: true,
      trainingTags: ["generated_labor_charge"],
    },
    {
      id: "derived_vale_transporte",
      item: "Vale-transporte",
      categoria: "Benefícios",
      quantidade: result.quantity,
      valorUnitario: Number(result.config.valeTransportePerEmployee.toFixed(2)),
      subtotal: Number(result.valeTransporte.toFixed(2)),
      status: generatedStatus,
      memoriaCalculo: "Quantidade x benefício por empregado",
      origem: "motor de benefícios",
      automatico: true,
      trainingTags: ["generated_labor_benefit"],
    },
    {
      id: "derived_vale_alimentacao",
      item: "Vale-alimentação",
      categoria: "Benefícios",
      quantidade: result.quantity,
      valorUnitario: Number(result.config.valeAlimentacaoPerEmployee.toFixed(2)),
      subtotal: Number(result.valeAlimentacao.toFixed(2)),
      status: generatedStatus,
      memoriaCalculo: "Quantidade x benefício por empregado",
      origem: "motor de benefícios",
      automatico: true,
      trainingTags: ["generated_labor_benefit"],
    },
    {
      id: "derived_outros_beneficios",
      item: "Outros benefícios",
      categoria: "Benefícios",
      quantidade: result.quantity,
      valorUnitario: Number(result.config.otherBenefitsPerEmployee.toFixed(2)),
      subtotal: Number(result.otherBenefits.toFixed(2)),
      status: generatedStatus,
      memoriaCalculo: "Quantidade x benefício por empregado",
      origem: "motor de benefícios",
      automatico: true,
      trainingTags: ["generated_labor_benefit"],
    },
  ].filter((row) => Number(row.subtotal || 0) > 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function buildHistoryId(prefix = "version") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function cloneRows(rows: SpreadsheetRecord["rows"]): SpreadsheetRecord["rows"] {
  return rows.map((row) => ({
    ...row,
    trainingTags: Array.isArray(row.trainingTags) ? [...row.trainingTags] : [],
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? { ...(row.metadata as Record<string, unknown>) }
        : row.metadata,
  }));
}

function readVersionHistory(
  spreadsheet: SpreadsheetRecord
): VersionHistoryEntry[] {
  const raw = spreadsheet.metadata?.versionHistory;
  return Array.isArray(raw) ? (raw as VersionHistoryEntry[]) : [];
}

function readCurrentVersionNumber(spreadsheet: SpreadsheetRecord) {
  const raw = spreadsheet.metadata?.versionNumber;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  const history = readVersionHistory(spreadsheet);
  const maxHistoryVersion = history.reduce((max, item) => {
    const value =
      typeof item.versionNumber === "number" && Number.isFinite(item.versionNumber)
        ? item.versionNumber
        : 0;
    return Math.max(max, value);
  }, 0);

  return Math.max(1, maxHistoryVersion + (history.length > 0 ? 1 : 0));
}

function buildPreUpdateSnapshot(
  spreadsheet: SpreadsheetRecord,
  reason: string
): VersionHistoryEntry {
  const currentVersionNumber = readCurrentVersionNumber(spreadsheet);
  const createdAt = new Date().toISOString();

  return {
    id: buildHistoryId("snapshot"),
    versionNumber: currentVersionNumber,
    label: `Versão ${currentVersionNumber}`,
    createdAt,
    reason,
    origin: "auto_snapshot",
    spreadsheetId: spreadsheet.id,
    rows: cloneRows(spreadsheet.rows),
    notes: "Snapshot automático gerado antes da atualização do módulo laboral.",
  };
}

function hasMeaningfulLaborChanges(
  previousRows: SpreadsheetRecord["rows"],
  nextRows: SpreadsheetRecord["rows"],
  previousChargesConfig: LaborChargesConfig,
  nextChargesConfig: LaborChargesConfig
) {
  if (JSON.stringify(previousRows) !== JSON.stringify(nextRows)) {
    return true;
  }

  if (JSON.stringify(previousChargesConfig) !== JSON.stringify(nextChargesConfig)) {
    return true;
  }

  return false;
}

export default function DedicatedLaborEditor({
  spreadsheet,
  onSpreadsheetUpdated,
}: Props) {
  const [rows, setRows] = useState<EditorRow[]>([]);
  const [chargesConfig, setChargesConfig] = useState<LaborChargesConfig>(
    DEFAULT_LABOR_CHARGES_CONFIG
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  useEffect(() => {
    setRows(extractLaborRows(spreadsheet.rows));
    setChargesConfig(extractStoredChargesConfig(spreadsheet));
  }, [spreadsheet]);

  const totalLabor = useMemo(() => {
    return rows.reduce((sum, row) => sum + Number(row.subtotal || 0), 0);
  }, [rows]);

  const totalHeadcount = useMemo(() => {
    return rows.reduce((sum, row) => sum + Number(row.quantidade || 0), 0);
  }, [rows]);

  const laborCost = useMemo(() => {
    return calculateLaborCost({
      salaryBaseTotal: totalLabor,
      quantity: totalHeadcount,
      config: chargesConfig,
    });
  }, [totalLabor, totalHeadcount, chargesConfig]);

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

      const preservedRows = spreadsheet.rows.filter(
        (row) => !isLaborRow(row) && !isDerivedChargeOrBenefitRow(row)
      );

      const recalculatedLaborCost = calculateLaborCost({
        salaryBaseTotal: sanitizedLaborRows.reduce(
          (sum, row) => sum + Number(row.subtotal || 0),
          0
        ),
        quantity: sanitizedLaborRows.reduce(
          (sum, row) => sum + Number(row.quantidade || 0),
          0
        ),
        config: chargesConfig,
      });

      const derivedRows = buildDerivedRows(recalculatedLaborCost);
      const rebuiltRows = [...sanitizedLaborRows, ...derivedRows, ...preservedRows];

      const monthlyBaseValue = rebuiltRows.reduce(
        (sum, row) => sum + Number(row.subtotal || 0),
        0
      );

      const headcount = sanitizedLaborRows.reduce(
        (sum, row) => sum + Number(row.quantidade || 0),
        0
      );

      const currentVersionNumber = readCurrentVersionNumber(spreadsheet);
      const previousRowsSnapshot = cloneRows(spreadsheet.rows);
      const existingHistory = readVersionHistory(spreadsheet);
      const previousChargesConfig = extractStoredChargesConfig(spreadsheet);

      const shouldCreateSnapshot = hasMeaningfulLaborChanges(
        previousRowsSnapshot,
        rebuiltRows,
        previousChargesConfig,
        chargesConfig
      );

      const preUpdateSnapshot = shouldCreateSnapshot
        ? buildPreUpdateSnapshot(
            spreadsheet,
            "Snapshot automático pré-atualização do módulo laboral"
          )
        : null;

      const updated = updateSpreadsheet(spreadsheet.id, {
        rows: rebuiltRows,
        monthlyBaseValue,
        headcount,
        metadata: {
          ...(spreadsheet.metadata ?? {}),
          editorModule: "dedicated_labor",
          lastEditedSection: "labor_rows_and_charges",
          laborChargesConfig: chargesConfig,
          laborCostBreakdown: recalculatedLaborCost,
          previousVersionRows: previousRowsSnapshot,
          previousSpreadsheetId: spreadsheet.id,
          versionNumber: currentVersionNumber + (shouldCreateSnapshot ? 1 : 0),
          versionHistory: preUpdateSnapshot
            ? [preUpdateSnapshot, ...existingHistory]
            : existingHistory,
        },
      });

      if (!updated) {
        throw new Error("Não foi possível atualizar a planilha.");
      }

      setFeedback({
        type: "success",
        message: shouldCreateSnapshot
          ? "Mão de obra, encargos e benefícios salvos com snapshot automático pré-atualização."
          : "Mão de obra, encargos e benefícios salvos com sucesso.",
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
                Este bloco permite editar a estrutura de mão de obra da planilha,
                gerar encargos e benefícios automaticamente e registrar snapshot
                pré-atualização para rastreabilidade.
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
              label={`Total de salários: ${formatCurrency(totalLabor)}`}
              variant="outlined"
            />
            <Chip
              label={`Quantidade total: ${totalHeadcount}`}
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
                    <TableRow key={row.id || `${String(row.item)}-${index}`}>
                      <TableCell>
                        <EditableCell
                          value={String(row.item || "")}
                          onChange={(value) => updateRow(index, "item", value)}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          value={String(row.categoria || "")}
                          onChange={(value) => updateRow(index, "categoria", value)}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="number"
                          value={Number(row.quantidade || 0)}
                          onChange={(value) => updateRow(index, "quantidade", value)}
                          min={0}
                          step={1}
                        />
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="number"
                          value={Number(row.valorUnitario || 0)}
                          onChange={(value) => updateRow(index, "valorUnitario", value)}
                          min={0}
                          step={0.01}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(Number(row.subtotal || 0))}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <EditableCell
                          type="select"
                          value={String(row.status || "")}
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
                        Nenhuma linha de mão de obra encontrada.
                        Adicione a primeira linha para começar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <LaborChargesConfigCard
            config={chargesConfig}
            onChange={setChargesConfig}
          />

          <LaborCostBreakdown result={laborCost} />
        </Stack>
      </CardContent>
    </Card>
  );
}
