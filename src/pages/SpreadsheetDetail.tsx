import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Link,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import TableChartIcon from "@mui/icons-material/TableChart";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import FunctionsOutlinedIcon from "@mui/icons-material/FunctionsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import { Link as RouterLink, useParams } from "react-router-dom";
import SpreadsheetVersionComparisonPanel from "../components/versioning/SpreadsheetVersionComparisonPanel";
import ServiceCompositionComparisonPanel from "../components/service-composition/ServiceCompositionComparisonPanel";
import ServiceCompositionEditor, {
  ServiceCompositionRow,
} from "../components/service-composition/ServiceCompositionEditor";
import LaborVersionComparisonPanel from "../modules/spreadsheet-editor/components/LaborVersionComparisonPanel";
import {
  SpreadsheetRecord,
  getSpreadsheetById,
  restoreSpreadsheetVersion,
  updateSpreadsheetEditorDraft,
} from "../services/spreadsheetService";
import {
  buildServiceCompositionComparisonContext,
  compareServiceCompositionSpreadsheets,
} from "../modules/spreadsheet-editor/adapters/serviceCompositionVersionAdapter";
import generateTechnicalOpinion, {
  TechnicalOpinionOutput,
} from "../services/technicalOpinionGenerator";

type LoadState = "loading" | "success" | "error";
type SaveState = "idle" | "saving" | "success" | "error";

type SpreadsheetDetailRow = SpreadsheetRecord["rows"][number];

type SpreadsheetDetailRecord = SpreadsheetRecord & {
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  modelType?: string;
  updatedAt?: string;
  contractReference?: string;
  contractingAgency?: string;
  unitName?: string;
  lotName?: string;
  referenceDate?: string;
  headcount?: number;
  monthlyBaseValue?: number;
  notes?: string;
  domainScenario?: string;
  trainingProfile?: {
    domainScenarioLabel?: string;
    interpretationTags?: string[];
    expectedDocuments?: string[];
    expectedCostDrivers?: string[];
    validationFocus?: string[];
    readingHints?: string[];
  };
  metadata?: Record<string, unknown>;
  rows: SpreadsheetDetailRow[];
};

type EditorState = {
  contractingAgency: string;
  contractReference: string;
  unitName: string;
  lotName: string;
  referenceDate: string;
  municipality: string;
  state: string;
  cboCode: string;
  professionalCategory: string;
  cctReference: string;
  taxRegime: string;
  objectDescription: string;
  domainScenario: string;
  headcount: string;
  monthlyBaseValue: string;
  mainShift: string;
  workScale: string;
  weeklyHours: string;
  monthlyHours: string;
  salaryBase: string;
  nightAdditional: string;
  hazardAdditional: string;
  mealAllowance: string;
  transportAllowance: string;
  mandatoryBenefitsNotes: string;
  notes: string;
};

type PcfpModuleKey =
  | "module_1"
  | "module_2"
  | "module_3"
  | "module_4"
  | "module_5"
  | "module_6";

type PcfpModuleDefinition = {
  key: PcfpModuleKey;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ReactNode;
  borderColor: string;
  backgroundColor: string;
};

type PcfpModuleGroup = PcfpModuleDefinition & {
  rows: SpreadsheetDetailRow[];
  total: number;
};

type LaborCostBreakdown = {
  headcount?: number;
  salaryBaseTotal?: number;
  mandatoryBenefitsTotal?: number;
  additionalTotal?: number;
  monthlyLaborTotal?: number;
  mealAllowanceTotal?: number;
  transportAllowanceTotal?: number;
  employerInss?: number;
  fgts?: number;
  rat?: number;
  thirdPartyCharges?: number;
  feriasProvision?: number;
  thirteenthProvision?: number;
  valeTransporte?: number;
  valeAlimentacao?: number;
  otherBenefits?: number;
  total?: number;
  quantity?: number;
};

type LaborChargesConfig = {
  fgtsRate?: number;
  inssRate?: number;
  vacationProvisionRate?: number;
  thirteenthSalaryRate?: number;
  terminationProvisionRate?: number;
  otherChargesRate?: number;
  effectiveChargesRate?: number;
  totalChargesPercentage?: number;
};

type ServiceCompositionSummary = {
  itemCount?: number;
  total?: number;
  workforceTotal?: number;
  materialsTotal?: number;
  equipmentTotal?: number;
  logisticsTotal?: number;
  supportTotal?: number;
  recurringTotal?: number;
  eventualTotal?: number;
  onDemandTotal?: number;
  episAndUniformsTotal?: number;
  consumablesTotal?: number;
  totalsByCategory?: Record<string, number>;
  totalsByRecurrence?: Record<string, number>;
};

type ServiceCompositionMemoryItem = {
  id?: string;
  item?: string;
  category?: string;
  recurrenceType?: string;
  serviceUnit?: string;
  periodicity?: string;
  quantity?: number;
  unitCost?: number;
  productivityFactor?: number;
  monthlyizationFactor?: number;
  allocationFactor?: number;
  depreciationMethod?: string;
  depreciationFactor?: number;
  usefulLifeMonths?: number;
  subtotal?: number;
  formula?: string;
  consumptionBasis?: string;
  technicalJustification?: string;
};

type ServiceCompositionEngineSnapshot = {
  generatedAt?: string;
  itemCount?: number;
  total?: number;
  totalByCategory?: Record<string, number>;
  totalByRecurrence?: Record<string, number>;
};

type VersionHistoryItem = {
  id: string;
  versionNumber: number | null;
  label: string;
  createdAt?: string;
  reason?: string;
  origin?: string;
  isBaseline?: boolean;
  isCurrent?: boolean;
  spreadsheetId?: string;
  rows?: SpreadsheetDetailRow[];
  notes?: string;
};

const DOMAIN_SCENARIO_LABELS: Record<string, string> = {
  reception_administrative_support: "Recepção e apoio administrativo",
  cleaning_conservation: "Limpeza e conservação",
  concierge_access_control: "Portaria e controle de acesso",
  property_security: "Vigilância patrimonial",
};

const PCFP_MODULES: PcfpModuleDefinition[] = [
  {
    key: "module_1",
    title: "Módulo 1 — Remuneração",
    shortTitle: "Remuneração",
    description:
      "Postos de trabalho, salários-base, funções operacionais e parcelas diretamente relacionadas à remuneração principal.",
    icon: <Groups2OutlinedIcon sx={{ fontSize: 18 }} />,
    borderColor: "rgba(94, 53, 177, 0.16)",
    backgroundColor: "#F4EEFB",
  },
  {
    key: "module_2",
    title: "Módulo 2 — Encargos e provisões",
    shortTitle: "Encargos",
    description:
      "Encargos sociais, reflexos, provisões e demais incidências sobre a folha e a estrutura remuneratória.",
    icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />,
    borderColor: "rgba(21, 101, 192, 0.16)",
    backgroundColor: "#EEF6FD",
  },
  {
    key: "module_3",
    title: "Módulo 3 — Benefícios",
    shortTitle: "Benefícios",
    description:
      "Vale-transporte, auxílio-alimentação e demais benefícios associados à categoria e ao contrato.",
    icon: <AttachMoneyOutlinedIcon sx={{ fontSize: 18 }} />,
    borderColor: "rgba(46, 125, 50, 0.16)",
    backgroundColor: "#EEF8F0",
  },
  {
    key: "module_4",
    title: "Módulo 4 — Insumos, uniformes e EPIs",
    shortTitle: "Insumos e EPIs",
    description:
      "Materiais de consumo, saneantes, uniformização mínima e equipamentos de proteção individual.",
    icon: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />,
    borderColor: "rgba(239, 108, 0, 0.16)",
    backgroundColor: "#FFF4EA",
  },
  {
    key: "module_5",
    title: "Módulo 5 — Equipamentos e apoio operacional",
    shortTitle: "Equipamentos",
    description:
      "Equipamentos operacionais, utensílios, logística e apoio de execução.",
    icon: <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 18 }} />,
    borderColor: "rgba(0, 121, 107, 0.16)",
    backgroundColor: "#ECF8F6",
  },
  {
    key: "module_6",
    title: "Módulo 6 — Síntese preliminar",
    shortTitle: "Síntese",
    description:
      "Consolidação preliminar dos blocos anteriores para leitura executiva e preparação do parecer técnico.",
    icon: <SummarizeOutlinedIcon sx={{ fontSize: 18 }} />,
    borderColor: "rgba(123, 31, 162, 0.16)",
    backgroundColor: "#F8ECFB",
  },
];
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function parseNumber(value: string | number | undefined | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (!value) {
    return 0;
  }
  const normalized = String(value).trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function safeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function stringifyNumber(value: number | undefined | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "";
  }
  return String(value);
}

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item : ""))
    .filter(Boolean);
}

function safeRowsArray(value: unknown): SpreadsheetDetailRow[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value as SpreadsheetDetailRow[];
}

function getRowExtraValue(row: SpreadsheetDetailRow, key: string): unknown {
  const candidate = row as unknown as Record<string, unknown>;
  return candidate[key];
}

function normalizeVersionNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatDateTime(value?: string) {
  if (!value) {
    return "Não informado";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("pt-BR");
}

function getVersionLabel(item: VersionHistoryItem) {
  if (item.versionNumber !== null) {
    return `Versão ${item.versionNumber}`;
  }
  return item.label || "Versão sem número";
}

function getOriginLabel(origin?: string) {
  switch (origin) {
    case "auto_snapshot":
      return "Snapshot automático";
    case "manual_snapshot":
      return "Snapshot manual";
    case "pre_update":
      return "Pré-atualização";
    case "restore":
      return "Restauração";
    case "baseline":
      return "Baseline";
    case "api":
      return "API";
    case "local":
      return "Local";
    default:
      return origin || "Não informado";
  }
}

function getModelLabel(modelType?: string) {
  switch (modelType) {
    case "dedicated_labor":
      return "Terceirização com dedicação exclusiva";
    case "non_dedicated_labor":
      return "Terceirização sem dedicação exclusiva";
    case "service_composition":
      return "Serviços por composição";
    case "economic_rebalance":
      return "Repactuação / revisão";
    default:
      return "Planilha";
  }
}

function getModelIcon(modelType?: string) {
  switch (modelType) {
    case "dedicated_labor":
      return <Groups2OutlinedIcon sx={{ fontSize: 18 }} />;
    case "non_dedicated_labor":
      return <TableChartOutlinedIcon sx={{ fontSize: 18 }} />;
    case "service_composition":
      return <AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />;
    case "economic_rebalance":
      return <CompareArrowsOutlinedIcon sx={{ fontSize: 18 }} />;
    default:
      return <TableChartIcon sx={{ fontSize: 18 }} />;
  }
}

function getModelChipStyles(modelType?: string) {
  switch (modelType) {
    case "dedicated_labor":
      return { backgroundColor: "#EDE7F6", color: "#5E35B1" };
    case "non_dedicated_labor":
      return { backgroundColor: "#E3F2FD", color: "#1565C0" };
    case "service_composition":
      return { backgroundColor: "#E8F5E9", color: "#2E7D32" };
    case "economic_rebalance":
      return { backgroundColor: "#FFF3E0", color: "#EF6C00" };
    default:
      return { backgroundColor: "#EDE7F6", color: "#5E35B1" };
  }
}

function getStatusChipStyles(status?: string) {
  switch (status) {
    case "Em elaboração":
      return { backgroundColor: "#EFE7F6", color: "#8E5AB5" };
    case "Concluída":
      return { backgroundColor: "#E7F6EC", color: "#2E7D32" };
    case "Em revisão":
      return { backgroundColor: "#FFF3E0", color: "#ED6C02" };
    case "Exemplo nativo":
      return { backgroundColor: "#E3F2FD", color: "#1565C0" };
    default:
      return { backgroundColor: "#EFE7F6", color: "#8E5AB5" };
  }
}

function categoryMatches(category: string, terms: string[]) {
  const normalized = category.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function itemMatches(item: string, terms: string[]) {
  const normalized = item.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function sumRowsByCategory(rows: SpreadsheetDetailRow[], terms: string[]) {
  return rows.reduce((sum, row) => {
    if (categoryMatches(String(row.categoria || ""), terms)) {
      return sum + safeNumber(row.subtotal);
    }
    return sum;
  }, 0);
}

function findFirstRowByItem(rows: SpreadsheetDetailRow[], terms: string[]) {
  return rows.find((row) => itemMatches(String(row.item || ""), terms));
}

function getDomainScenarioLabel(record?: SpreadsheetDetailRecord | null) {
  const key = record?.domainScenario;
  if (key && DOMAIN_SCENARIO_LABELS[key]) {
    return DOMAIN_SCENARIO_LABELS[key];
  }
  if (record?.trainingProfile?.domainScenarioLabel) {
    return record.trainingProfile.domainScenarioLabel;
  }
  return "Não classificado";
}

function extractStoredEditorDraft(record: SpreadsheetDetailRecord) {
  const metadata = record.metadata;
  if (!isRecord(metadata)) {
    return {};
  }
  const raw = metadata["editorDraft"];
  if (!isRecord(raw)) {
    return {};
  }
  return raw as Partial<EditorState>;
}

function readMetadataRecord(
  record: SpreadsheetDetailRecord | null | undefined,
  key: string
): Record<string, unknown> | null {
  if (!record || !isRecord(record.metadata)) {
    return null;
  }
  const raw = record.metadata[key];
  return isRecord(raw) ? raw : null;
}

function readMetadataArray<T>(
  record: SpreadsheetDetailRecord | null | undefined,
  key: string
): T[] {
  if (!record || !isRecord(record.metadata)) {
    return [];
  }
  const raw = record.metadata[key];
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function readLaborCostBreakdown(
  record: SpreadsheetDetailRecord | null | undefined
): LaborCostBreakdown | null {
  const raw = readMetadataRecord(record, "laborCostBreakdown");
  return raw ? (raw as LaborCostBreakdown) : null;
}

function readLaborChargesConfig(
  record: SpreadsheetDetailRecord | null | undefined
): LaborChargesConfig | null {
  const raw = readMetadataRecord(record, "laborChargesConfig");
  return raw ? (raw as LaborChargesConfig) : null;
}

function readServiceCompositionSummary(
  record: SpreadsheetDetailRecord | null | undefined
): ServiceCompositionSummary | null {
  const raw = readMetadataRecord(record, "serviceCompositionSummary");
  return raw ? (raw as ServiceCompositionSummary) : null;
}

function readServiceCompositionMemoryBundle(
  record: SpreadsheetDetailRecord | null | undefined
): ServiceCompositionMemoryItem[] {
  return readMetadataArray<ServiceCompositionMemoryItem>(
    record,
    "serviceCompositionMemoryBundle"
  );
}

function readServiceCompositionEngineSnapshot(
  record: SpreadsheetDetailRecord | null | undefined
): ServiceCompositionEngineSnapshot | null {
  const raw = readMetadataRecord(record, "serviceCompositionEngineSnapshot");
  return raw ? (raw as ServiceCompositionEngineSnapshot) : null;
}

function buildVersionHistoryItemFromRecord(
  record: SpreadsheetDetailRecord,
  options?: Partial<VersionHistoryItem>
): VersionHistoryItem {
  const rawVersion =
    isRecord(record.metadata) && record.metadata["versionNumber"] !== undefined
      ? record.metadata["versionNumber"]
      : undefined;

  return {
    id: options?.id ?? `current-${record.id}`,
    versionNumber: options?.versionNumber ?? normalizeVersionNumber(rawVersion),
    label: options?.label ?? record.title ?? "Versão atual",
    createdAt: options?.createdAt ?? record.updatedAt,
    reason: options?.reason,
    origin: options?.origin,
    isBaseline: options?.isBaseline,
    isCurrent: options?.isCurrent ?? false,
    spreadsheetId: options?.spreadsheetId ?? record.id,
    rows: options?.rows ?? record.rows,
    notes: options?.notes,
  };
}

function sortVersionHistoryDesc(a: VersionHistoryItem, b: VersionHistoryItem) {
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

  if (aTime !== bTime) {
    return bTime - aTime;
  }

  const aVersion = a.versionNumber ?? -1;
  const bVersion = b.versionNumber ?? -1;
  return bVersion - aVersion;
}

function readVersionHistoryFromMetadata(
  spreadsheet: SpreadsheetDetailRecord | null,
  previousSpreadsheetCandidate: SpreadsheetRecord | null
): VersionHistoryItem[] {
  if (!spreadsheet) {
    return [];
  }

  const items: VersionHistoryItem[] = [];
  const seen = new Set<string>();

  const pushUnique = (item: VersionHistoryItem | null) => {
    if (!item) return;
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  pushUnique(
    buildVersionHistoryItemFromRecord(spreadsheet, {
      id: `current-${spreadsheet.id}`,
      label: spreadsheet.title || "Versão atual",
      createdAt: spreadsheet.updatedAt,
      origin: "local",
      isCurrent: true,
      rows: spreadsheet.rows,
      spreadsheetId: spreadsheet.id,
    })
  );

  if (previousSpreadsheetCandidate) {
    const previousAsDetail = previousSpreadsheetCandidate as SpreadsheetDetailRecord;
    pushUnique(
      buildVersionHistoryItemFromRecord(previousAsDetail, {
        id: `previous-${previousSpreadsheetCandidate.id}`,
        label: previousSpreadsheetCandidate.title || "Versão anterior",
        createdAt: previousAsDetail.updatedAt,
        reason: "Base anterior disponível para comparação",
        origin: "baseline",
        isBaseline: true,
        spreadsheetId: previousSpreadsheetCandidate.id,
        rows: previousSpreadsheetCandidate.rows as SpreadsheetDetailRow[],
      })
    );
  }

  if (!spreadsheet.metadata || !isRecord(spreadsheet.metadata)) {
    return items.sort(sortVersionHistoryDesc);
  }

  const candidateKeys = [
    "versionHistory",
    "versionTimeline",
    "spreadsheetVersions",
    "versions",
    "history",
  ];

  candidateKeys.forEach((key) => {
    const raw = spreadsheet.metadata?.[key];
    if (!Array.isArray(raw)) {
      return;
    }

    raw.forEach((entry, index) => {
      if (!isRecord(entry)) {
        return;
      }

      const id =
        safeString(entry.id) ||
        safeString(entry.versionId) ||
        safeString(entry.spreadsheetVersionId) ||
        safeString(entry.spreadsheet_id) ||
        `${key}-${index}`;

      const versionNumber =
        normalizeVersionNumber(entry.versionNumber) ??
        normalizeVersionNumber(entry.version) ??
        normalizeVersionNumber(entry.number);

      const createdAt =
        safeString(entry.createdAt) ||
        safeString(entry.created_at) ||
        safeString(entry.timestamp) ||
        safeString(entry.updatedAt);

      const reason =
        safeString(entry.reason) ||
        safeString(entry.snapshotReason) ||
        safeString(entry.description) ||
        safeString(entry.changeReason);

      const origin =
        safeString(entry.origin) ||
        safeString(entry.snapshotOrigin) ||
        safeString(entry.source);

      const label =
        safeString(entry.label) ||
        safeString(entry.title) ||
        (versionNumber !== null ? `Versão ${versionNumber}` : `Snapshot ${index + 1}`);

      const spreadsheetId =
        safeString(entry.spreadsheetId) ||
        safeString(entry.spreadsheet_id) ||
        safeString(entry.sourceSpreadsheetId);

      const rows =
        safeRowsArray(entry.rows) ||
        safeRowsArray(entry.snapshotRows) ||
        safeRowsArray(entry.previousVersionRows);

      const isBaseline =
        entry.isBaseline === true ||
        entry.baseline === true ||
        safeString(entry.role) === "baseline";

      pushUnique({
        id,
        versionNumber,
        label,
        createdAt,
        reason,
        origin,
        isBaseline,
        isCurrent: false,
        spreadsheetId,
        rows,
        notes: safeString(entry.notes),
      });
    });
  });

  return items.sort(sortVersionHistoryDesc);
}

function resolveVersionHistoryRecord(
  item: VersionHistoryItem,
  currentSpreadsheet: SpreadsheetDetailRecord
): SpreadsheetRecord | null {
  if (item.isCurrent) {
    return currentSpreadsheet;
  }

  if (item.spreadsheetId) {
    const existing = getSpreadsheetById(item.spreadsheetId);
    if (existing) {
      return existing;
    }
  }

  if (item.rows && item.rows.length > 0) {
    return {
      ...currentSpreadsheet,
      id: item.spreadsheetId || item.id,
      title: item.label || currentSpreadsheet.title,
      rows: item.rows,
    };
  }

  return null;
}

function readPreviousSpreadsheetCandidate(
  spreadsheet: SpreadsheetDetailRecord | null
): SpreadsheetRecord | null {
  if (!spreadsheet || !isRecord(spreadsheet.metadata)) {
    return null;
  }

  const previousSpreadsheetId = safeString(spreadsheet.metadata["previousSpreadsheetId"]);
  if (previousSpreadsheetId) {
    const previous = getSpreadsheetById(previousSpreadsheetId);
    if (previous) {
      return previous;
    }
  }

  const previousVersionRows = spreadsheet.metadata["previousVersionRows"];
  if (Array.isArray(previousVersionRows)) {
    return {
      ...spreadsheet,
      id: `${spreadsheet.id}_previous_snapshot`,
      title: `${spreadsheet.title} — versão anterior`,
      rows: previousVersionRows as SpreadsheetDetailRow[],
    };
  }

  return null;
}
function buildInitialEditorState(record: SpreadsheetDetailRecord): EditorState {
  const storedDraft = extractStoredEditorDraft(record);

  const laborRows = record.rows.filter((row) =>
    categoryMatches(String(row.categoria || ""), ["mão de obra", "equipe operacional"])
  );

  const firstLaborRow = laborRows[0];
  const mealAllowanceRow = findFirstRowByItem(record.rows, [
    "vale-alimentação",
    "vale alimentação",
    "alimentação",
  ]);
  const transportAllowanceRow = findFirstRowByItem(record.rows, [
    "vale-transporte",
    "vale transporte",
    "transporte",
  ]);

  const laborBreakdown = readLaborCostBreakdown(record);

  const inferredHeadcount =
    laborBreakdown?.headcount ??
    record.headcount ??
    laborRows.reduce((sum, row) => sum + safeNumber(row.quantidade), 0);

  const inferredMonthlyBaseValue =
    record.monthlyBaseValue ??
    laborBreakdown?.monthlyLaborTotal ??
    record.rows.reduce((sum, row) => sum + safeNumber(row.subtotal), 0);

  const inferredSalaryBase =
    laborBreakdown?.salaryBaseTotal && inferredHeadcount > 0
      ? laborBreakdown.salaryBaseTotal / inferredHeadcount
      : safeNumber(firstLaborRow?.valorUnitario);

  const inferredMealAllowance =
    laborBreakdown?.mealAllowanceTotal && inferredHeadcount > 0
      ? laborBreakdown.mealAllowanceTotal / inferredHeadcount
      : safeNumber(mealAllowanceRow?.valorUnitario);

  const inferredTransportAllowance =
    laborBreakdown?.transportAllowanceTotal && inferredHeadcount > 0
      ? laborBreakdown.transportAllowanceTotal / inferredHeadcount
      : safeNumber(transportAllowanceRow?.valorUnitario);

  return {
    contractingAgency:
      storedDraft.contractingAgency ?? safeString(record.contractingAgency),
    contractReference:
      storedDraft.contractReference ?? safeString(record.contractReference),
    unitName: storedDraft.unitName ?? safeString(record.unitName),
    lotName: storedDraft.lotName ?? safeString(record.lotName),
    referenceDate: storedDraft.referenceDate ?? safeString(record.referenceDate),
    municipality: storedDraft.municipality ?? "",
    state: storedDraft.state ?? "",
    cboCode: storedDraft.cboCode ?? "",
    professionalCategory:
      storedDraft.professionalCategory ?? safeString(firstLaborRow?.item),
    cctReference: storedDraft.cctReference ?? "",
    taxRegime: storedDraft.taxRegime ?? "lucro_presumido",
    objectDescription: storedDraft.objectDescription ?? safeString(record.description),
    domainScenario: storedDraft.domainScenario ?? safeString(record.domainScenario),
    headcount: storedDraft.headcount ?? stringifyNumber(inferredHeadcount),
    monthlyBaseValue:
      storedDraft.monthlyBaseValue ?? stringifyNumber(inferredMonthlyBaseValue),
    mainShift: storedDraft.mainShift ?? (laborRows.length > 0 ? "Postos contínuos" : ""),
    workScale: storedDraft.workScale ?? "",
    weeklyHours: storedDraft.weeklyHours ?? "",
    monthlyHours: storedDraft.monthlyHours ?? "",
    salaryBase: storedDraft.salaryBase ?? stringifyNumber(inferredSalaryBase),
    nightAdditional: storedDraft.nightAdditional ?? "",
    hazardAdditional: storedDraft.hazardAdditional ?? "",
    mealAllowance:
      storedDraft.mealAllowance ?? stringifyNumber(inferredMealAllowance),
    transportAllowance:
      storedDraft.transportAllowance ?? stringifyNumber(inferredTransportAllowance),
    mandatoryBenefitsNotes: storedDraft.mandatoryBenefitsNotes ?? "",
    notes: storedDraft.notes ?? safeString(record.notes),
  };
}

function getExequibilityRisk(
  mandatoryCostTotal: number,
  referenceValue: number,
  totalRowsValue: number
) {
  const base = referenceValue > 0 ? referenceValue : totalRowsValue;
  if (base <= 0) {
    return {
      label: "Sem base suficiente",
      color: "#6D6186",
      backgroundColor: "#F3EAF7",
    };
  }

  const ratio = mandatoryCostTotal / base;

  if (ratio <= 0.75) {
    return {
      label: "Baixo risco preliminar",
      color: "#2E7D32",
      backgroundColor: "#E7F6EC",
    };
  }

  if (ratio <= 0.9) {
    return {
      label: "Atenção moderada",
      color: "#ED6C02",
      backgroundColor: "#FFF3E0",
    };
  }

  return {
    label: "Alto risco preliminar",
    color: "#C62828",
    backgroundColor: "#FDECEC",
  };
}

function classifyRowToModule(row: SpreadsheetDetailRow): PcfpModuleKey {
  const category = String(row.categoria || "").toLowerCase();
  const item = String(row.item || "").toLowerCase();

  if (
    categoryMatches(category, ["mão de obra", "equipe operacional", "remuneração"]) ||
    itemMatches(item, ["salário", "posto", "vigia", "porteiro", "recepcionista", "auxiliar"])
  ) {
    return "module_1";
  }

  if (
    categoryMatches(category, ["encargos", "provisões", "provisoes", "reflexos"]) ||
    itemMatches(item, ["inss", "fgts", "férias", "ferias", "13º", "provisão", "provisao"])
  ) {
    return "module_2";
  }

  if (
    categoryMatches(category, ["benefícios", "beneficios"]) ||
    itemMatches(item, ["vale", "alimentação", "alimentacao", "transporte", "auxílio", "auxilio"])
  ) {
    return "module_3";
  }

  if (
    categoryMatches(category, ["insumos", "materiais", "uniforme", "epi"]) ||
    itemMatches(item, ["uniforme", "epi", "insumo", "material", "saneante"])
  ) {
    return "module_4";
  }

  if (
    categoryMatches(category, ["equipamentos", "logística", "logistica", "apoio operacional"]) ||
    itemMatches(item, ["equipamento", "máquina", "maquina", "utensílio", "utensilio", "apoio"])
  ) {
    return "module_5";
  }

  return "module_6";
}

function buildPcfpModuleGroups(rows: SpreadsheetDetailRow[]): PcfpModuleGroup[] {
  return PCFP_MODULES.map((module) => {
    const moduleRows = rows.filter((row) => classifyRowToModule(row) === module.key);

    return {
      ...module,
      rows: moduleRows,
      total: moduleRows.reduce((sum, row) => sum + safeNumber(row.subtotal), 0),
    };
  });
}

function ExecutiveMetricCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={0.8}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "#2B2340", wordBreak: "break-word" }}
          >
            {value}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CompactInfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ModuleSummaryCard({ module }: { module: PcfpModuleGroup }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: module.borderColor,
        backgroundColor: module.backgroundColor,
        minWidth: 0,
      }}
    >
      <CardContent>
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={1} alignItems="center">
            {module.icon}
            <Typography variant="subtitle2" fontWeight={700}>
              {module.shortTitle}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {module.rows.length} item(ns)
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            {formatCurrency(module.total)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ModuleDetailCard({ module }: { module: PcfpModuleGroup }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: module.borderColor,
        minWidth: 0,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            {module.icon}
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {module.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {module.description}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body2">
            <strong>Total:</strong> {formatCurrency(module.total)}
          </Typography>

          {module.rows.length > 0 ? (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Item</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Categoria</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Qtd.</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Valor unitário</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Subtotal</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {module.rows.map((row, index) => (
                    <TableRow key={`${module.key}-${index}-${row.item}`}>
                      <TableCell>{String(row.item || "—")}</TableCell>
                      <TableCell>{String(row.categoria || "—")}</TableCell>
                      <TableCell align="right">{safeNumber(row.quantidade)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(safeNumber(row.valorUnitario))}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(safeNumber(row.subtotal))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhum item classificado neste módulo.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PersistedCompositionCard({
  summary,
  memoryItems,
  engineSnapshot,
}: {
  summary: ServiceCompositionSummary | null;
  memoryItems: ServiceCompositionMemoryItem[];
  engineSnapshot: ServiceCompositionEngineSnapshot | null;
}) {
  const total =
    safeNumber(summary?.total) || safeNumber(engineSnapshot?.total) || 0;

  const itemCount =
    safeNumber(summary?.itemCount) || safeNumber(engineSnapshot?.itemCount) || 0;

  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <SummarizeOutlinedIcon sx={{ color: "#2E7D32" }} />
            <Typography variant="h6" fontWeight={700}>
              Persistência da composição de serviços
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <ExecutiveMetricCard label="Itens persistidos" value={itemCount} />
            <ExecutiveMetricCard label="Memória técnica" value={memoryItems.length} />
            <ExecutiveMetricCard label="Total persistido" value={formatCurrency(total)} />
          </Box>

          <Typography variant="body2" color="text.secondary">
            Este bloco mostra o resumo persistido da composição, a quantidade de itens na
            memória de cálculo e o snapshot do motor para leitura técnica posterior.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function TechnicalOpinionCard({
  opinion,
}: {
  opinion: TechnicalOpinionOutput | null;
}) {
  if (!opinion) {
    return null;
  }

  const toneColor =
    opinion.riskLevel === "high"
      ? "#C62828"
      : opinion.riskLevel === "medium"
      ? "#ED6C02"
      : "#2E7D32";

  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <GavelOutlinedIcon sx={{ color: "#5E35B1" }} />
            <Typography variant="h6" fontWeight={700}>
              Parecer técnico automático
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Camada automatizada de síntese analítica, recomendação e conclusão,
            construída a partir do quadro atual da planilha, do comparativo de versões
            e da leitura preliminar de exequibilidade.
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${toneColor}22`,
              backgroundColor: `${toneColor}10`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: toneColor, mb: 0.75 }}>
              Ementa
            </Typography>
            <Typography variant="body2">{opinion.ementa}</Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {opinion.indicadores.map((indicator) => (
              <ExecutiveMetricCard
                key={`${indicator.label}-${indicator.value}`}
                label={indicator.label}
                value={indicator.value}
              />
            ))}
          </Box>

          <CompactInfoCard title="Resumo executivo">
            <Typography variant="body2">{opinion.resumoExecutivo}</Typography>
          </CompactInfoCard>

          <CompactInfoCard title="Fundamentação técnica">
            <Typography variant="body2">{opinion.fundamentacaoTecnica}</Typography>
          </CompactInfoCard>

          <CompactInfoCard title="Fundamentação técnico-jurídica">
            <Typography variant="body2">{opinion.fundamentacaoTecnicoJuridica}</Typography>
          </CompactInfoCard>

          <CompactInfoCard title="Conclusão">
            <Typography variant="body2">{opinion.conclusao}</Typography>
          </CompactInfoCard>

          <CompactInfoCard title="Recomendação final">
            <Typography variant="body2">{opinion.recomendacaoFinal}</Typography>
          </CompactInfoCard>

          <CompactInfoCard title="Versão para gestor">
            <Typography variant="body2">{opinion.versaoGestor}</Typography>
          </CompactInfoCard>

          <CompactInfoCard title="Diligências sugeridas">
            <Stack spacing={1}>
              {opinion.diligenciasSugeridas.length > 0 ? (
                opinion.diligenciasSugeridas.map((item, index) => (
                  <Stack key={`${index}-${item}`} direction="row" spacing={1.25} alignItems="flex-start">
                    <RuleOutlinedIcon sx={{ fontSize: 18, color: "#7A708D", mt: "2px" }} />
                    <Typography variant="body2">{item}</Typography>
                  </Stack>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma diligência adicional foi sugerida.
                </Typography>
              )}
            </Stack>
          </CompactInfoCard>
        </Stack>
      </CardContent>
    </Card>
  );
}

function mapSpreadsheetRowsToCompositionRows(
  record: SpreadsheetDetailRecord | null
): ServiceCompositionRow[] {
  if (!record || record.modelType !== "service_composition") {
    return [];
  }

  return record.rows.map((row, index) => ({
    id: String(getRowExtraValue(row, "id") ?? `${record.id}-${index}`),
    item: safeString(row.item),
    categoria: safeString(row.categoria),
    tipoDemanda:
      safeString(getRowExtraValue(row, "tipoDemanda")) ||
      safeString(getRowExtraValue(row, "tipo_demanda")) ||
      "Não informado",
    quantidade: safeNumber(row.quantidade),
    valorUnitario: safeNumber(row.valorUnitario),
    unidade: safeString(getRowExtraValue(row, "unidade")) || "",
    periodicidade: safeString(getRowExtraValue(row, "periodicidade")) || "",
  }));
}

function mapCompositionRowsToSpreadsheetRows(
  rows: ServiceCompositionRow[]
): SpreadsheetDetailRow[] {
  return rows.map((row) => ({
    item: row.item,
    categoria: row.categoria,
    quantidade: row.quantidade,
    valorUnitario: row.valorUnitario,
    subtotal: safeNumber(row.quantidade) * safeNumber(row.valorUnitario),
    status: "Editado",
    memoriaCalculo:
      `${row.tipoDemanda || "Não informado"} | ${row.unidade || "sem unidade"} | ${row.periodicidade || "sem periodicidade"}` as SpreadsheetDetailRow["memoriaCalculo"],
  }));
}

export default function SpreadsheetDetail() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetDetailRecord | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "local" | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [baselineVersionId, setBaselineVersionId] = useState("");
  const [compositionRows, setCompositionRows] = useState<ServiceCompositionRow[]>([]);

  useEffect(() => {
    document.title = "CustoPúblico — Detalhe da Planilha";
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSpreadsheet() {
      if (!id) {
        if (!isMounted) return;
        setState("error");
        setErrorMessage("ID da planilha não informado.");
        return;
      }

      setState("loading");
      setErrorMessage("");
      setSpreadsheet(null);
      setEditor(null);
      setCompositionRows([]);

      const localSpreadsheet = getSpreadsheetById(id) as SpreadsheetDetailRecord | undefined;

      try {
        const response = await fetch(`/api/spreadsheets/${id}`);

        if (response.ok) {
          const data = await response.json();
          const apiPayload = (data?.spreadsheet ?? data) as SpreadsheetDetailRecord;

          const localDraftOverride =
            localSpreadsheet &&
            isRecord(localSpreadsheet.metadata) &&
            localSpreadsheet.metadata["localDraftOverride"] === true;

          const payload = localDraftOverride ? localSpreadsheet : apiPayload;

          if (isMounted) {
            setSpreadsheet(payload);
            setEditor(buildInitialEditorState(payload));
            setCompositionRows(mapSpreadsheetRowsToCompositionRows(payload));
            setDataSource(localDraftOverride ? "local" : "api");
            setState("success");
          }
          return;
        }

        if (localSpreadsheet) {
          if (isMounted) {
            setSpreadsheet(localSpreadsheet);
            setEditor(buildInitialEditorState(localSpreadsheet));
            setCompositionRows(mapSpreadsheetRowsToCompositionRows(localSpreadsheet));
            setDataSource("local");
            setState("success");
          }
          return;
        }

        const data = await response.json().catch(() => null);
        const message =
          data?.message ??
          `Falha ao carregar /api/spreadsheets/${id}. Status ${response.status}.`;

        if (isMounted) {
          setState("error");
          setErrorMessage(message);
        }
      } catch (error) {
        if (localSpreadsheet) {
          if (isMounted) {
            setSpreadsheet(localSpreadsheet);
            setEditor(buildInitialEditorState(localSpreadsheet));
            setCompositionRows(mapSpreadsheetRowsToCompositionRows(localSpreadsheet));
            setDataSource("local");
            setState("success");
          }
          return;
        }

        if (isMounted) {
          setState("error");
          setErrorMessage(
            error instanceof Error
              ? error.message
                          : "Erro inesperado ao carregar a planilha."
          );
        }
      }
    }

    loadSpreadsheet();

    return () => {
      isMounted = false;
    };
  }, [id]);
    const totalValue = useMemo(() => {
    if (!spreadsheet) return 0;
    return spreadsheet.rows.reduce((sum, row) => sum + safeNumber(row.subtotal), 0);
  }, [spreadsheet]);

  const totalItems = spreadsheet?.rows.length ?? 0;
  const pendingItems =
    spreadsheet?.rows.filter((row) => String(row.status || "") === "Pendente").length ?? 0;

  const laborCostBreakdown = useMemo(() => readLaborCostBreakdown(spreadsheet), [spreadsheet]);
  const laborChargesConfig = useMemo(() => readLaborChargesConfig(spreadsheet), [spreadsheet]);
  const serviceCompositionSummary = useMemo(
    () => readServiceCompositionSummary(spreadsheet),
    [spreadsheet]
  );
  const serviceCompositionMemoryBundle = useMemo(
    () => readServiceCompositionMemoryBundle(spreadsheet),
    [spreadsheet]
  );
  const serviceCompositionEngineSnapshot = useMemo(
    () => readServiceCompositionEngineSnapshot(spreadsheet),
    [spreadsheet]
  );

  const previousSpreadsheetCandidate = useMemo(
    () => readPreviousSpreadsheetCandidate(spreadsheet),
    [spreadsheet]
  );

  const versionHistory = useMemo(
    () => readVersionHistoryFromMetadata(spreadsheet, previousSpreadsheetCandidate),
    [spreadsheet, previousSpreadsheetCandidate]
  );

  useEffect(() => {
    if (versionHistory.length === 0) {
      setSelectedVersionId("");
      setBaselineVersionId("");
      return;
    }

    const defaultBaseline =
      versionHistory.find((item) => item.isBaseline && !item.isCurrent) ??
      versionHistory.find((item) => !item.isCurrent) ??
      versionHistory[0];

    const defaultSelected =
      versionHistory.find((item) => !item.isCurrent) ?? versionHistory[0];

    setBaselineVersionId(defaultBaseline?.id ?? "");
    setSelectedVersionId(defaultSelected?.id ?? "");
  }, [versionHistory]);

  const selectedVersionItem = useMemo(
    () => versionHistory.find((item) => item.id === selectedVersionId) ?? null,
    [versionHistory, selectedVersionId]
  );

  const baselineVersionItem = useMemo(
    () => versionHistory.find((item) => item.id === baselineVersionId) ?? null,
    [versionHistory, baselineVersionId]
  );

  const resolvedSelectedVersionRecord = useMemo(() => {
    if (!spreadsheet || !selectedVersionItem) {
      return null;
    }
    return resolveVersionHistoryRecord(selectedVersionItem, spreadsheet);
  }, [selectedVersionItem, spreadsheet]);

  const resolvedBaselineVersionRecord = useMemo(() => {
    if (!spreadsheet || !baselineVersionItem) {
      return null;
    }
    return resolveVersionHistoryRecord(baselineVersionItem, spreadsheet);
  }, [baselineVersionItem, spreadsheet]);

  const baselineVersionLaborBreakdown = useMemo(
    () => readLaborCostBreakdown(resolvedBaselineVersionRecord as SpreadsheetDetailRecord | null),
    [resolvedBaselineVersionRecord]
  );

  const selectedVersionLaborBreakdown = useMemo(
    () => readLaborCostBreakdown(resolvedSelectedVersionRecord as SpreadsheetDetailRecord | null),
    [resolvedSelectedVersionRecord]
  );

  const serviceCompositionComparisonContext = useMemo(() => {
    if (!spreadsheet) {
      return null;
    }

    const context = buildServiceCompositionComparisonContext({
      previousSpreadsheet: previousSpreadsheetCandidate,
      currentSpreadsheet: spreadsheet,
    });

    if (!context.hasComparableData || !context.hasPreviousRows) {
      return null;
    }

    return context;
  }, [previousSpreadsheetCandidate, spreadsheet]);

  const selectedVersionComparison = useMemo(() => {
    if (
      !spreadsheet ||
      spreadsheet.modelType !== "service_composition" ||
      !resolvedSelectedVersionRecord ||
      resolvedSelectedVersionRecord.id === spreadsheet.id
    ) {
      return null;
    }

    try {
      return compareServiceCompositionSpreadsheets({
        previousSpreadsheet: resolvedSelectedVersionRecord,
        currentSpreadsheet: spreadsheet,
      });
    } catch {
      return null;
    }
  }, [resolvedSelectedVersionRecord, spreadsheet]);

  const baselineToSelectedComparison = useMemo(() => {
    if (
      !spreadsheet ||
      spreadsheet.modelType !== "service_composition" ||
      !resolvedBaselineVersionRecord ||
      !resolvedSelectedVersionRecord ||
      resolvedBaselineVersionRecord.id === resolvedSelectedVersionRecord.id
    ) {
      return null;
    }

    try {
      return compareServiceCompositionSpreadsheets({
        previousSpreadsheet: resolvedBaselineVersionRecord,
        currentSpreadsheet: resolvedSelectedVersionRecord,
      });
    } catch {
      return null;
    }
  }, [resolvedBaselineVersionRecord, resolvedSelectedVersionRecord, spreadsheet]);

  const mandatoryCostTotal = useMemo(() => {
    if (!spreadsheet) return 0;

    const persistedLaborMandatory =
      safeNumber(laborCostBreakdown?.salaryBaseTotal) +
      safeNumber(laborCostBreakdown?.mandatoryBenefitsTotal) +
      safeNumber(laborCostBreakdown?.additionalTotal);

    if (persistedLaborMandatory > 0) {
      return persistedLaborMandatory;
    }

    return sumRowsByCategory(spreadsheet.rows, [
      "mão de obra",
      "equipe operacional",
      "encargos",
      "benefícios",
      "beneficios",
    ]);
  }, [spreadsheet, laborCostBreakdown]);

  const evidentiaryCostTotal = useMemo(() => {
    if (!spreadsheet) return 0;

    const persistedCompositionTotal = safeNumber(
      serviceCompositionSummary?.total ?? serviceCompositionEngineSnapshot?.total ?? 0
    );

    if (persistedCompositionTotal > 0) {
      return persistedCompositionTotal;
    }

    return sumRowsByCategory(spreadsheet.rows, [
      "insumos",
      "equipamentos",
      "materiais",
      "logística",
      "logistica",
      "apoio operacional",
      "epi",
      "uniforme",
    ]);
  }, [spreadsheet, serviceCompositionSummary, serviceCompositionEngineSnapshot]);

  const analysisReferenceValue = useMemo(() => {
    if (!editor) return 0;
    return parseNumber(editor.monthlyBaseValue);
  }, [editor]);

  const executabilityBalance = useMemo(() => {
    const base = analysisReferenceValue > 0 ? analysisReferenceValue : totalValue;
    return base - mandatoryCostTotal;
  }, [analysisReferenceValue, totalValue, mandatoryCostTotal]);

  const exequibilityRisk = useMemo(() => {
    return getExequibilityRisk(mandatoryCostTotal, analysisReferenceValue, totalValue);
  }, [mandatoryCostTotal, analysisReferenceValue, totalValue]);

  const pcfpModules = useMemo(() => {
    if (!spreadsheet) return [];
    return buildPcfpModuleGroups(spreadsheet.rows);
  }, [spreadsheet]);

  const effectiveHeadcount = useMemo(() => {
    const persisted = safeNumber(laborCostBreakdown?.headcount);
    if (persisted > 0) {
      return persisted;
    }
    return parseNumber(editor?.headcount);
  }, [laborCostBreakdown, editor]);

  const effectiveMonthlyReference = useMemo(() => {
    const persistedLabor = safeNumber(laborCostBreakdown?.monthlyLaborTotal);
    const persistedComposition = safeNumber(
      serviceCompositionSummary?.total ?? serviceCompositionEngineSnapshot?.total ?? 0
    );
    const explicitEditor = parseNumber(editor?.monthlyBaseValue);

    if (explicitEditor > 0) {
      return explicitEditor;
    }

    if (persistedLabor + persistedComposition > 0) {
      return persistedLabor + persistedComposition;
    }

    return totalValue;
  }, [
    laborCostBreakdown,
    serviceCompositionSummary,
    serviceCompositionEngineSnapshot,
    editor,
    totalValue,
  ]);

  const technicalOpinion = useMemo<TechnicalOpinionOutput | null>(() => {
    if (!spreadsheet) {
      return null;
    }

    try {
      return generateTechnicalOpinion({
        spreadsheet,
        metadata: spreadsheet.metadata,
        comparison: baselineToSelectedComparison ?? selectedVersionComparison ?? null,
        executability: {
          mandatoryCostTotal,
          evidentiaryCostTotal,
          effectiveMonthlyReference,
          executabilityBalance,
          riskLabel: exequibilityRisk.label,
          riskColor: exequibilityRisk.color,
        },
        validation: {
          score:
            exequibilityRisk.color === "#C62828"
              ? 82
              : exequibilityRisk.color === "#ED6C02"
              ? 58
              : 24,
          riskLevel:
            exequibilityRisk.color === "#C62828"
              ? "high"
              : exequibilityRisk.color === "#ED6C02"
              ? "medium"
              : "low",
        },
      });
    } catch {
      return null;
    }
  }, [
    spreadsheet,
    baselineToSelectedComparison,
    selectedVersionComparison,
    mandatoryCostTotal,
    evidentiaryCostTotal,
    effectiveMonthlyReference,
    executabilityBalance,
    exequibilityRisk,
  ]);

  function updateEditorField(field: keyof EditorState, value: string) {
    setEditor((current) => {
      if (!current) return current;
      return {
        ...current,
        [field]: value,
      };
    });
  }

  function handleSaveLocalDraft() {
    if (!spreadsheet || !editor) {
      return;
    }

    setSaveState("saving");
    setSaveMessage("");

    try {
      const normalizedRows: SpreadsheetDetailRow[] =
        spreadsheet.modelType === "service_composition"
          ? mapCompositionRowsToSpreadsheetRows(compositionRows)
          : spreadsheet.rows;

      const updatedBase = updateSpreadsheetEditorDraft(spreadsheet.id, {
        contractingAgency: editor.contractingAgency,
        contractReference: editor.contractReference,
        unitName: editor.unitName,
        lotName: editor.lotName,
        referenceDate: editor.referenceDate,
        municipality: editor.municipality,
        state: editor.state,
        cboCode: editor.cboCode,
        professionalCategory: editor.professionalCategory,
        cctReference: editor.cctReference,
        taxRegime: editor.taxRegime,
        objectDescription: editor.objectDescription,
        domainScenario: editor.domainScenario,
        headcount: editor.headcount,
        monthlyBaseValue: editor.monthlyBaseValue,
        mainShift: editor.mainShift,
        workScale: editor.workScale,
        weeklyHours: editor.weeklyHours,
        monthlyHours: editor.monthlyHours,
        salaryBase: editor.salaryBase,
        nightAdditional: editor.nightAdditional,
        hazardAdditional: editor.hazardAdditional,
        mealAllowance: editor.mealAllowance,
        transportAllowance: editor.transportAllowance,
        mandatoryBenefitsNotes: editor.mandatoryBenefitsNotes,
        notes: editor.notes,
      }) as SpreadsheetDetailRecord | null;

      if (!updatedBase) {
        throw new Error("Não foi possível salvar a edição local.");
      }

      const updated: SpreadsheetDetailRecord = {
        ...updatedBase,
        rows: normalizedRows,
        metadata: {
          ...(updatedBase.metadata ?? {}),
          localDraftOverride: true,
        },
      };

      setSpreadsheet(updated);
      setEditor(buildInitialEditorState(updated));
      setCompositionRows(mapSpreadsheetRowsToCompositionRows(updated));
      setDataSource("local");
      setSaveState("success");
      setSaveMessage("Edição local salva com sucesso.");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao salvar a edição local."
      );
    }
  }

  function handleRestoreVersion(item: VersionHistoryItem) {
    if (!spreadsheet) {
      return;
    }

    const restored = restoreSpreadsheetVersion(spreadsheet.id, item.id);

    if (!restored) {
      setSaveState("error");
      setSaveMessage(
        "Não foi possível restaurar esta versão com os dados atualmente disponíveis."
      );
      return;
    }

    const next = restored as SpreadsheetDetailRecord;
    setSpreadsheet(next);
    setEditor(buildInitialEditorState(next));
    setCompositionRows(mapSpreadsheetRowsToCompositionRows(next));
    setDataSource("local");
    setSaveState("success");
    setSaveMessage(`${getVersionLabel(item)} restaurada localmente para análise.`);
  }

  if (state === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F7F3F8",
          display: "grid",
          placeItems: "center",
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">
            Carregando detalhes da planilha...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (state === "error" || !spreadsheet || !editor) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#F7F3F8", py: 2 }}>
        <Container maxWidth={false} disableGutters sx={{ width: "100%", minWidth: 0 }}>
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
              <Link component={RouterLink} underline="hover" color="inherit" to="/">
                Início
              </Link>
              <Typography color="text.primary">Planilha</Typography>
            </Breadcrumbs>

            <Alert severity="error">
              Falha ao carregar <strong>/api/spreadsheets/{id}</strong>. {errorMessage}
            </Alert>

            <Button
              component={RouterLink}
              to="/"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ alignSelf: "flex-start" }}
            >
              Voltar ao painel
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  const modelStyles = getModelChipStyles(spreadsheet.modelType);
  const statusStyles = getStatusChipStyles(spreadsheet.status);
  const domainScenarioLabel = getDomainScenarioLabel(spreadsheet);

  const expectedDocuments = safeStringArray(spreadsheet.trainingProfile?.expectedDocuments);
  const expectedCostDrivers = safeStringArray(spreadsheet.trainingProfile?.expectedCostDrivers);
  const validationFocus = safeStringArray(spreadsheet.trainingProfile?.validationFocus);
  const readingHints = safeStringArray(spreadsheet.trainingProfile?.readingHints);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F7F3F8", py: 1 }}>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
            <Link component={RouterLink} underline="hover" color="inherit" to="/">
              Início
            </Link>
            <Typography color="text.primary">Planilha</Typography>
          </Breadcrumbs>

          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              background:
                "linear-gradient(180deg, rgba(238,229,243,1) 0%, rgba(235,226,240,1) 100%)",
              border: "1px solid rgba(142, 90, 181, 0.12)",
              minWidth: 0,
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack spacing={2} sx={{ minWidth: 0 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                  sx={{ minWidth: 0 }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <AutoAwesomeOutlinedIcon sx={{ fontSize: 16, color: "#9C6BC0" }} />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          color: "#9C6BC0",
                          textTransform: "uppercase",
                        }}
                      >
                        CustoPúblico
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: "#2B2340",
                        lineHeight: 1.15,
                        wordBreak: "break-word",
                      }}
                    >
                      {spreadsheet.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "#6D6186",
                        mt: 1.25,
                        lineHeight: 1.65,
                        maxWidth: "100%",
                      }}
                    >
                      {spreadsheet.description}
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                      component={RouterLink}
                      to="/"
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                    >
                      Voltar
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<SaveOutlinedIcon />}
                      onClick={handleSaveLocalDraft}
                      disabled={saveState === "saving"}
                    >
                      {saveState === "saving" ? "Salvando..." : "Salvar edição local"}
                    </Button>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={getModelIcon(spreadsheet.modelType)}
                    label={getModelLabel(spreadsheet.modelType)}
                    sx={{
                      backgroundColor: modelStyles.backgroundColor,
                      color: modelStyles.color,
                      fontWeight: 700,
                    }}
                  />

                  <Chip
                    label={spreadsheet.category}
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      borderColor: "rgba(91, 58, 122, 0.24)",
                      color: "#5B3A7A",
                    }}
                  />

                  <Chip
                    label={spreadsheet.status}
                    sx={{
                      backgroundColor: statusStyles.backgroundColor,
                      color: statusStyles.color,
                      fontWeight: 700,
                    }}
                  />

                  <Chip
                    label={domainScenarioLabel}
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      borderColor: "rgba(21, 101, 192, 0.24)",
                      color: "#1565C0",
                    }}
                  />

                  <Chip
                    label={dataSource === "local" ? "Origem local" : "Origem API"}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Alert
            icon={<InfoOutlinedIcon fontSize="inherit" />}
            severity="info"
            sx={{ borderRadius: 3 }}
          >
            Esta tela já consome o resumo, a memória técnica, o snapshot do motor e,
            quando existir uma base anterior, o comparativo entre versões da composição.
          </Alert>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
              gap: 2,
              minWidth: 0,
            }}
          >
            <ExecutiveMetricCard label="Itens da planilha" value={totalItems} />
            <ExecutiveMetricCard label="Itens pendentes" value={pendingItems} />
            <ExecutiveMetricCard
              label="Valor total estimado"
              value={formatCurrency(totalValue)}
            />
          </Box>

          <TechnicalOpinionCard opinion={technicalOpinion} />

          <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <HistoryOutlinedIcon sx={{ color: "#5E35B1" }} />
                  <Typography variant="h6" fontWeight={700}>
                    Histórico e versionamento da planilha
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Este painel consolida as versões já visíveis localmente, snapshots
                  identificados em metadados, baseline de comparação e restauração
                  operacional quando houver dados suficientes disponíveis no cliente.
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      lg: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  <ExecutiveMetricCard
                    label="Versões identificadas"
                    value={versionHistory.length}
                  />
                  <ExecutiveMetricCard
                    label="Baseline atual"
                    value={baselineVersionItem ? getVersionLabel(baselineVersionItem) : "—"}
                  />
                  <ExecutiveMetricCard
                    label="Versão selecionada"
                    value={selectedVersionItem ? getVersionLabel(selectedVersionItem) : "—"}
                  />
                </Box>
                                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      xl: "minmax(0, 1.3fr) minmax(360px, 0.9fr)",
                    },
                    gap: 2,
                    alignItems: "start",
                  }}
                >
                  <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <LayersOutlinedIcon sx={{ color: "#1565C0" }} />
                          <Typography variant="subtitle1" fontWeight={700}>
                            Versões disponíveis
                          </Typography>
                        </Stack>

                        <Box sx={{ overflowX: "auto", width: "100%" }}>
                          <Table size="small" sx={{ minWidth: 940 }}>
                            <TableHead>
                              <TableRow>
                                <TableCell>
                                  <strong>Versão</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>Data / hora</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>Motivo</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>Origem</strong>
                                </TableCell>
                                <TableCell>
                                  <strong>Status</strong>
                                </TableCell>
                                <TableCell align="right">
                                  <strong>Ações</strong>
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {versionHistory.length > 0 ? (
                                versionHistory.map((item) => {
                                  const isBaseline = baselineVersionId === item.id;
                                  const isSelected = selectedVersionId === item.id;

                                  return (
                                    <TableRow key={item.id}>
                                      <TableCell sx={{ minWidth: 150 }}>
                                        <Stack spacing={0.4}>
                                          <Typography variant="body2" fontWeight={700}>
                                            {getVersionLabel(item)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {item.label}
                                          </Typography>
                                        </Stack>
                                      </TableCell>

                                      <TableCell sx={{ minWidth: 160 }}>
                                        {formatDateTime(item.createdAt)}
                                      </TableCell>

                                      <TableCell sx={{ minWidth: 220 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          {item.reason || "Sem motivo registrado"}
                                        </Typography>
                                      </TableCell>

                                      <TableCell>{getOriginLabel(item.origin)}</TableCell>

                                      <TableCell sx={{ minWidth: 170 }}>
                                        <Stack
                                          direction="row"
                                          spacing={0.75}
                                          flexWrap="wrap"
                                          useFlexGap
                                        >
                                          {item.isCurrent ? (
                                            <Chip
                                              size="small"
                                              label="Atual"
                                              color="primary"
                                              variant="outlined"
                                            />
                                          ) : null}
                                          {isBaseline ? (
                                            <Chip
                                              size="small"
                                              label="Baseline ativa"
                                              color="secondary"
                                              variant="outlined"
                                            />
                                          ) : null}
                                          {isSelected ? (
                                            <Chip
                                              size="small"
                                              label="Selecionada"
                                              variant="outlined"
                                            />
                                          ) : null}
                                        </Stack>
                                      </TableCell>

                                      <TableCell align="right" sx={{ minWidth: 280 }}>
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          justifyContent="flex-end"
                                          flexWrap="wrap"
                                          useFlexGap
                                        >
                                          <Button
                                            size="small"
                                            variant={isSelected ? "contained" : "outlined"}
                                            startIcon={<CompareArrowsOutlinedIcon />}
                                            onClick={() => setSelectedVersionId(item.id)}
                                          >
                                            Comparar
                                          </Button>

                                          <Button
                                            size="small"
                                            variant={isBaseline ? "contained" : "outlined"}
                                            color="secondary"
                                            startIcon={<FlagOutlinedIcon />}
                                            onClick={() => setBaselineVersionId(item.id)}
                                          >
                                            Baseline
                                          </Button>

                                          <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<RestoreOutlinedIcon />}
                                            onClick={() => handleRestoreVersion(item)}
                                            disabled={!item.rows && !item.spreadsheetId}
                                          >
                                            Restaurar
                                          </Button>
                                        </Stack>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Nenhuma versão adicional foi identificada nos metadados
                                      ou no repositório local desta planilha.
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

                  <Stack spacing={2}>
                    <CompactInfoCard title="Controles de comparação">
                      <TextField
                        label="Selecionar versão para comparação"
                        value={selectedVersionId}
                        onChange={(event) => setSelectedVersionId(event.target.value)}
                        select
                        fullWidth
                      >
                        {versionHistory.length === 0 ? (
                          <MenuItem value="">Nenhuma versão disponível</MenuItem>
                        ) : (
                          versionHistory.map((item) => (
                            <MenuItem key={`compare-${item.id}`} value={item.id}>
                              {getVersionLabel(item)} — {formatDateTime(item.createdAt)}
                            </MenuItem>
                          ))
                        )}
                      </TextField>

                      <TextField
                        label="Selecionar baseline"
                        value={baselineVersionId}
                        onChange={(event) => setBaselineVersionId(event.target.value)}
                        select
                        fullWidth
                      >
                        {versionHistory.length === 0 ? (
                          <MenuItem value="">Nenhuma baseline disponível</MenuItem>
                        ) : (
                          versionHistory.map((item) => (
                            <MenuItem key={`baseline-${item.id}`} value={item.id}>
                              {getVersionLabel(item)} — {formatDateTime(item.createdAt)}
                            </MenuItem>
                          ))
                        )}
                      </TextField>

                      <Typography variant="body2" color="text.secondary">
                        <strong>Baseline ativa:</strong>{" "}
                        {baselineVersionItem
                          ? `${getVersionLabel(baselineVersionItem)} (${getOriginLabel(
                              baselineVersionItem.origin
                            )})`
                          : "Não definida"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        <strong>Versão para comparar:</strong>{" "}
                        {selectedVersionItem
                          ? `${getVersionLabel(selectedVersionItem)} (${getOriginLabel(
                              selectedVersionItem.origin
                            )})`
                          : "Não definida"}
                      </Typography>
                    </CompactInfoCard>

                    <CompactInfoCard title="Linha do tempo resumida">
                      <Stack spacing={1}>
                        {versionHistory.length > 0 ? (
                          versionHistory.map((item) => (
                            <Box
                              key={`timeline-${item.id}`}
                              sx={{
                                p: 1.5,
                                borderRadius: 3,
                                border: "1px solid #ECE7F1",
                                backgroundColor: item.isCurrent ? "#F4EEFB" : "#FFFFFF",
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <TimelineOutlinedIcon sx={{ fontSize: 18, color: "#7A708D" }} />
                                <Typography variant="body2" fontWeight={700}>
                                  {getVersionLabel(item)}
                                </Typography>
                              </Stack>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatDateTime(item.createdAt)}
                              </Typography>

                              <Typography variant="body2" color="text.secondary">
                                {item.reason || "Sem motivo registrado"}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={0.75}
                                mt={1}
                                flexWrap="wrap"
                                useFlexGap
                              >
                                <Chip
                                  size="small"
                                  label={getOriginLabel(item.origin)}
                                  variant="outlined"
                                />
                                {item.isCurrent ? (
                                  <Chip
                                    size="small"
                                    label="Versão atual"
                                    color="primary"
                                    variant="outlined"
                                  />
                                ) : null}
                                {baselineVersionId === item.id ? (
                                  <Chip
                                    size="small"
                                    label="Baseline"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                ) : null}
                              </Stack>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Ainda não há eventos de linha do tempo suficientes para exibição.
                          </Typography>
                        )}
                      </Stack>
                    </CompactInfoCard>
                  </Stack>
                </Box>

                <SpreadsheetVersionComparisonPanel
                  title="Comparação executiva entre baseline e versão selecionada"
                  versionA={
                    baselineVersionItem
                      ? {
                          label: getVersionLabel(baselineVersionItem),
                          origin: baselineVersionItem.origin,
                          createdAt: baselineVersionItem.createdAt,
                        }
                      : null
                  }
                  versionB={
                    selectedVersionItem
                      ? {
                          label: getVersionLabel(selectedVersionItem),
                          origin: selectedVersionItem.origin,
                          createdAt: selectedVersionItem.createdAt,
                        }
                      : null
                  }
                  comparison={baselineToSelectedComparison}
                  emptyMessage="Selecione uma baseline e uma versão comparável para ativar a leitura executiva A × B."
                />
              </Stack>
            </CardContent>
          </Card>

          {spreadsheet.modelType === "service_composition" ? (
            <Stack spacing={2.5}>
              <ServiceCompositionEditor
                rows={compositionRows}
                onChange={setCompositionRows}
              />

              <PersistedCompositionCard
                summary={serviceCompositionSummary}
                memoryItems={serviceCompositionMemoryBundle}
                engineSnapshot={serviceCompositionEngineSnapshot}
              />

              {serviceCompositionComparisonContext ? (
                <ServiceCompositionComparisonPanel
                  title="Comparação — versão anterior x atual"
                  previousLabel="Versão anterior"
                  currentLabel="Versão atual"
                  comparison={serviceCompositionComparisonContext.comparison}
                />
              ) : null}

              {selectedVersionComparison ? (
                <ServiceCompositionComparisonPanel
                  title="Comparação — versão selecionada x atual"
                  previousLabel={
                    selectedVersionItem
                      ? getVersionLabel(selectedVersionItem)
                      : "Versão selecionada"
                  }
                  currentLabel="Versão atual"
                  comparison={selectedVersionComparison}
                />
              ) : null}
            </Stack>
          ) : null}

          <LaborVersionComparisonPanel
            versionA={baselineVersionLaborBreakdown}
            versionB={selectedVersionLaborBreakdown}
            labelA={baselineVersionItem ? getVersionLabel(baselineVersionItem) : "Baseline"}
            labelB={
              selectedVersionItem ? getVersionLabel(selectedVersionItem) : "Versão selecionada"
            }
          />

          <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <FunctionsOutlinedIcon sx={{ color: "#5E35B1" }} />
                  <Typography variant="h6" fontWeight={700}>
                    Estrutura preliminar da planilha
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Os itens abaixo são classificados automaticamente nos módulos
                  preliminares da planilha de custos para apoiar leitura técnica,
                  auditoria e preparação de memória de cálculo.
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      xl: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 2,
                    minWidth: 0,
                  }}
                >
                  {pcfpModules.map((module) => (
                    <ModuleSummaryCard key={module.key} module={module} />
                  ))}
                </Box>

                <Divider />

                <Stack spacing={2}>
                  {pcfpModules.map((module) => (
                    <ModuleDetailCard key={`detail-${module.key}`} module={module} />
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <InsightsOutlinedIcon sx={{ color: "#1565C0" }} />
                  <Typography variant="h6" fontWeight={700}>
                    Leitura preliminar de exequibilidade
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Esta leitura utiliza parâmetros preliminares da planilha e
                  blocos persistidos para sinalizar equilíbrio ou risco de
                  exequibilidade contratual.
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
                  }}
                >
                  <ExecutiveMetricCard
                    label="Custo obrigatório estimado"
                    value={formatCurrency(mandatoryCostTotal)}
                  />

                  <ExecutiveMetricCard
                    label="Custo evidenciável"
                    value={formatCurrency(evidentiaryCostTotal)}
                  />

                  <ExecutiveMetricCard
                    label="Referência mensal"
                    value={formatCurrency(effectiveMonthlyReference)}
                  />

                  <ExecutiveMetricCard
                    label="Saldo preliminar"
                    value={formatCurrency(executabilityBalance)}
                  />
                </Box>

                <Alert
                  severity={
                    exequibilityRisk.color === "#C62828"
                      ? "error"
                      : exequibilityRisk.color === "#ED6C02"
                      ? "warning"
                      : "success"
                  }
                  sx={{ borderRadius: 3 }}
                >
                  <strong>{exequibilityRisk.label}</strong> — A proporção entre
                  custos obrigatórios e valor de referência indica o nível
                  preliminar de risco de exequibilidade.
                </Alert>

                <Typography variant="body2" color="text.secondary">
                  <strong>Postos estimados:</strong> {effectiveHeadcount || 0}
                </Typography>

                {laborChargesConfig ? (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Encargos efetivos persistidos:</strong>{" "}
                    {laborChargesConfig.effectiveChargesRate ??
                      laborChargesConfig.totalChargesPercentage ??
                      0}
                    %
                  </Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <ManageSearchOutlinedIcon sx={{ color: "#5E35B1" }} />
                  <Typography variant="h6" fontWeight={700}>
                    Contexto interpretativo da planilha
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Informações auxiliares usadas pela IA do sistema para leitura
                  técnica, validação documental e preparação de parecer.
                </Typography>

                <Stack spacing={1}>
                  {expectedDocuments.length > 0 ? (
                    <Typography variant="body2">
                      <strong>Documentos esperados:</strong>{" "}
                      {expectedDocuments.join(", ")}
                    </Typography>
                  ) : null}

                  {expectedCostDrivers.length > 0 ? (
                    <Typography variant="body2">
                      <strong>Drivers de custo:</strong>{" "}
                      {expectedCostDrivers.join(", ")}
                    </Typography>
                  ) : null}

                  {validationFocus.length > 0 ? (
                    <Typography variant="body2">
                      <strong>Pontos de validação:</strong>{" "}
                      {validationFocus.join(", ")}
                    </Typography>
                  ) : null}

                  {readingHints.length > 0 ? (
                    <Typography variant="body2">
                      <strong>Dicas de leitura:</strong>{" "}
                      {readingHints.join(", ")}
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Dados editoriais complementares
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Órgão contratante"
                    value={editor.contractingAgency}
                    onChange={(e) => updateEditorField("contractingAgency", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Referência do contrato"
                    value={editor.contractReference}
                    onChange={(e) => updateEditorField("contractReference", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Unidade"
                    value={editor.unitName}
                    onChange={(e) => updateEditorField("unitName", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Lote"
                    value={editor.lotName}
                    onChange={(e) => updateEditorField("lotName", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Data de referência"
                    value={editor.referenceDate}
                    onChange={(e) => updateEditorField("referenceDate", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Cenário"
                    value={editor.domainScenario}
                    onChange={(e) => updateEditorField("domainScenario", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Quantidade de postos"
                    value={editor.headcount}
                    onChange={(e) => updateEditorField("headcount", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Valor mensal de referência"
                    value={editor.monthlyBaseValue}
                    onChange={(e) => updateEditorField("monthlyBaseValue", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Salário-base"
                    value={editor.salaryBase}
                    onChange={(e) => updateEditorField("salaryBase", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Vale-alimentação"
                    value={editor.mealAllowance}
                    onChange={(e) => updateEditorField("mealAllowance", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Vale-transporte"
                    value={editor.transportAllowance}
                    onChange={(e) => updateEditorField("transportAllowance", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Categoria profissional"
                    value={editor.professionalCategory}
                    onChange={(e) =>
                      updateEditorField("professionalCategory", e.target.value)
                    }
                    fullWidth
                  />
                </Box>

                <TextField
                  label="Objeto / descrição"
                  value={editor.objectDescription}
                  onChange={(e) => updateEditorField("objectDescription", e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />

                <TextField
                  label="Observações"
                  value={editor.notes}
                  onChange={(e) => updateEditorField("notes", e.target.value)}
                  multiline
                  minRows={4}
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>

          <Snackbar
            open={saveState === "success" || saveState === "error"}
            autoHideDuration={4000}
            onClose={() => setSaveState("idle")}
            message={saveMessage}
          />
        </Stack>
      </Container>
    </Box>
  );
}
