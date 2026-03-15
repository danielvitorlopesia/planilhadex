import React, { useCallback, useMemo } from "react";
import DedicatedLaborEditor from "./models/DedicatedLaborEditor";
import NonDedicatedLaborEditor from "./models/NonDedicatedLaborEditor";
import ServiceCompositionEditor from "./models/ServiceCompositionEditor";
import EconomicRebalanceEditor from "./models/EconomicRebalanceEditor";
import { SpreadsheetRecord } from "../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
  onSpreadsheetUpdated?: (spreadsheet: SpreadsheetRecord) => void;
};

type SpreadsheetModelType = SpreadsheetRecord["modelType"];

function safeNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toFixedNumber(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function resolveRowsTotal(rows: SpreadsheetRecord["rows"]) {
  return toFixedNumber(
    rows.reduce((sum, row) => sum + safeNumber(row.subtotal), 0)
  );
}

function resolveLastEditedSection(modelType?: SpreadsheetModelType) {
  switch (modelType) {
    case "dedicated_labor":
      return "dedicated_labor";
    case "non_dedicated_labor":
      return "non_dedicated_labor";
    case "service_composition":
      return "service_composition";
    case "economic_rebalance":
      return "economic_rebalance";
    default:
      return "unknown";
  }
}

function buildEditorRuntime(
  spreadsheet: SpreadsheetRecord,
  rowsTotal: number
): Record<string, unknown> {
  return {
    lastEditorModel: spreadsheet.modelType ?? null,
    lastEditedSection: resolveLastEditedSection(spreadsheet.modelType),
    recalculatedAt: new Date().toISOString(),
    totalRows: Array.isArray(spreadsheet.rows) ? spreadsheet.rows.length : 0,
    rowsGrandTotal: rowsTotal,
    hasLaborCostBreakdown:
      !!spreadsheet.metadata &&
      typeof spreadsheet.metadata === "object" &&
      "laborCostBreakdown" in spreadsheet.metadata,
    hasLaborChargesConfig:
      !!spreadsheet.metadata &&
      typeof spreadsheet.metadata === "object" &&
      "laborChargesConfig" in spreadsheet.metadata,
    hasServiceCompositionSummary:
      !!spreadsheet.metadata &&
      typeof spreadsheet.metadata === "object" &&
      "serviceCompositionSummary" in spreadsheet.metadata,
    hasServiceCompositionMemoryBundle:
      !!spreadsheet.metadata &&
      typeof spreadsheet.metadata === "object" &&
      "serviceCompositionMemoryBundle" in spreadsheet.metadata,
  };
}

function normalizeSpreadsheetAfterModuleSave(
  spreadsheet: SpreadsheetRecord
): SpreadsheetRecord {
  const rows = Array.isArray(spreadsheet.rows) ? spreadsheet.rows : [];
  const rowsGrandTotal = resolveRowsTotal(rows);

  const currentMetadata =
    spreadsheet.metadata && typeof spreadsheet.metadata === "object"
      ? spreadsheet.metadata
      : {};

  const nextMetadata = {
    ...currentMetadata,
    lastEditedSection:
      currentMetadata.lastEditedSection ??
      resolveLastEditedSection(spreadsheet.modelType),
    editorRuntime: buildEditorRuntime(spreadsheet, rowsGrandTotal),
  };

  return {
    ...spreadsheet,
    monthlyBaseValue: rowsGrandTotal,
    metadata: nextMetadata,
  };
}

export default function SpreadsheetEditor({
  spreadsheet,
  onSpreadsheetUpdated,
}: Props) {
  const normalizedSpreadsheet = useMemo(() => spreadsheet, [spreadsheet]);

  const handleModuleUpdated = useCallback(
    (updatedSpreadsheet: SpreadsheetRecord) => {
      const normalized = normalizeSpreadsheetAfterModuleSave(updatedSpreadsheet);
      onSpreadsheetUpdated?.(normalized);
    },
    [onSpreadsheetUpdated]
  );

  switch (normalizedSpreadsheet.modelType) {
    case "dedicated_labor":
      return (
        <DedicatedLaborEditor
          spreadsheet={normalizedSpreadsheet}
          onSpreadsheetUpdated={handleModuleUpdated}
        />
      );

    case "non_dedicated_labor":
      return (
        <NonDedicatedLaborEditor
          spreadsheet={normalizedSpreadsheet}
          onSpreadsheetUpdated={handleModuleUpdated}
        />
      );

    case "service_composition":
      return (
        <ServiceCompositionEditor
          spreadsheet={normalizedSpreadsheet}
          onSpreadsheetUpdated={handleModuleUpdated}
        />
      );

    case "economic_rebalance":
      return (
        <EconomicRebalanceEditor
          spreadsheet={normalizedSpreadsheet}
          onSpreadsheetUpdated={handleModuleUpdated}
        />
      );

    default:
      return <div>Modelo de planilha não reconhecido.</div>;
  }
}
