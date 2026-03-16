import { SpreadsheetRecord } from "../../../services/spreadsheetService";
import { ServiceCompositionDraftRow } from "../utils/serviceCompositionCalculator";
import {
  compareServiceCompositionVersions,
  ServiceCompositionComparisonResult,
} from "../engine/serviceCompositionComparisonEngine";

type SpreadsheetRow = SpreadsheetRecord["rows"][number];

function safeString(value: unknown, fallback = "") {
  return
