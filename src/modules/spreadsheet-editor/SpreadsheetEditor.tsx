import React from "react";
import DedicatedLaborEditor from "./models/DedicatedLaborEditor";
import NonDedicatedLaborEditor from "./models/NonDedicatedLaborEditor";
import ServiceCompositionEditor from "./models/ServiceCompositionEditor";
import EconomicRebalanceEditor from "./models/EconomicRebalanceEditor";
import { SpreadsheetRecord } from "../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
  onSpreadsheetUpdated?: (spreadsheet: SpreadsheetRecord) => void;
};

export default function SpreadsheetEditor({
  spreadsheet,
  onSpreadsheetUpdated,
}: Props) {
  switch (spreadsheet.modelType) {
    case "dedicated_labor":
      return (
        <DedicatedLaborEditor
          spreadsheet={spreadsheet}
          onSpreadsheetUpdated={onSpreadsheetUpdated}
        />
      );

    case "non_dedicated_labor":
      return (
        <NonDedicatedLaborEditor
          spreadsheet={spreadsheet}
          onSpreadsheetUpdated={onSpreadsheetUpdated}
        />
      );

    case "service_composition":
      return (
        <ServiceCompositionEditor
          spreadsheet={spreadsheet}
          onSpreadsheetUpdated={onSpreadsheetUpdated}
        />
      );

    case "economic_rebalance":
      return (
        <EconomicRebalanceEditor
          spreadsheet={spreadsheet}
          onSpreadsheetUpdated={onSpreadsheetUpdated}
        />
      );

    default:
      return <div>Modelo de planilha não reconhecido.</div>;
  }
}
