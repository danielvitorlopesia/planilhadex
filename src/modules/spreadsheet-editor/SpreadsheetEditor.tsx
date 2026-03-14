import React from "react";
import DedicatedLaborEditor from "./models/DedicatedLaborEditor";
import NonDedicatedLaborEditor from "./models/NonDedicatedLaborEditor";
import ServiceCompositionEditor from "./models/ServiceCompositionEditor";
import EconomicRebalanceEditor from "./models/EconomicRebalanceEditor";
import { SpreadsheetRecord } from "../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
};

export default function SpreadsheetEditor({ spreadsheet }: Props) {

  switch (spreadsheet.modelType) {

    case "dedicated_labor":
      return <DedicatedLaborEditor spreadsheet={spreadsheet} />;

    case "non_dedicated_labor":
      return <NonDedicatedLaborEditor spreadsheet={spreadsheet} />;

    case "service_composition":
      return <ServiceCompositionEditor spreadsheet={spreadsheet} />;

    case "economic_rebalance":
      return <EconomicRebalanceEditor spreadsheet={spreadsheet} />;

    default:
      return <div>Modelo de planilha não reconhecido.</div>;
  }

}
