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
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import TableChartIcon from "@mui/icons-material/TableChart";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlaylistAddCheckCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCheckCircleOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
import FunctionsOutlinedIcon from "@mui/icons-material/FunctionsOutlined";
import { Link as RouterLink, useParams } from "react-router-dom";
import SpreadsheetEditor from "../modules/spreadsheet-editor/SpreadsheetEditor";
import ServiceCompositionComparisonPanel from "../components/service-composition/ServiceCompositionComparisonPanel";
import {
  SpreadsheetRecord,
  getSpreadsheetById,
  updateSpreadsheetEditorDraft,
} from "../services/spreadsheetService";
import {
  buildServiceCompositionComparisonContext,
  compareServiceCompositionSpreadsheets,
} from "../modules/spreadsheet-editor/adapters/serviceCompositionVersionAdapter";

type LoadState = "loading" | "success" | "error";
type SaveState = "idle" | "saving" | "success" | "error";

type SpreadsheetDetailRow = SpreadsheetRecord["rows"][number];

type SpreadsheetDetailRecord = SpreadsheetRecord & {
  contractReference?: string;
  contractingAgency?: string;
  unitName?: string;
  lotName?: string;
  referenceDate?: string;
  headcount?: number;
  monthlyBaseValue?: number;
  notes?: string;
  domainScenario?: string;
  rows: SpreadsheetDetailRow[];
  trainingProfile?: {
    domainScenarioLabel?: string;
    interpretationTags?: string[];
    expectedDocuments?: string[];
    expectedCostDrivers?: string[];
    validationFocus?: string[];
    readingHints?: string[];
  };
  metadata?: Record<string, unknown>;
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
      return sum + Number(row.subtotal || 0);
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
    laborRows.reduce((sum, row) => sum + Number(row.quantidade || 0), 0);

  const inferredMonthlyBaseValue =
    record.monthlyBaseValue ??
    laborBreakdown?.monthlyLaborTotal ??
    record.rows.reduce((sum, row) => sum + Number(row.subtotal || 0), 0);

  const inferredSalaryBase =
    laborBreakdown?.salaryBaseTotal && inferredHeadcount > 0
      ? laborBreakdown.salaryBaseTotal / inferredHeadcount
      : Number(firstLaborRow?.valorUnitario || 0);

  const inferredMealAllowance =
    laborBreakdown?.mealAllowanceTotal && inferredHeadcount > 0
      ? laborBreakdown.mealAllowanceTotal / inferredHeadcount
      : Number(mealAllowanceRow?.valorUnitario || 0);

  const inferredTransportAllowance =
    laborBreakdown?.transportAllowanceTotal && inferredHeadcount > 0
      ? laborBreakdown.transportAllowanceTotal / inferredHeadcount
      : Number(transportAllowanceRow?.valorUnitario || 0);

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
    objectDescription: storedDraft.objectDescription ?? record.description ?? "",
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
    category.includes("encargos") ||
    item.includes("encargos") ||
    item.includes("fgts") ||
    item.includes("inss") ||
    item.includes("férias") ||
    item.includes("ferias") ||
    item.includes("13º") ||
    item.includes("13o")
  ) {
    return "module_2";
  }

  if (
    category.includes("benefícios") ||
    category.includes("beneficios") ||
    item.includes("vale") ||
    item.includes("alimentação") ||
    item.includes("alimentacao") ||
    item.includes("transporte")
  ) {
    return "module_3";
  }

  if (
    category.includes("insumos") ||
    category.includes("materiais") ||
    item.includes("uniforme") ||
    item.includes("epi") ||
    item.includes("saneante")
  ) {
    return "module_4";
  }

  if (
    category.includes("equipamentos") ||
    category.includes("logística") ||
    category.includes("logistica") ||
    category.includes("apoio operacional") ||
    item.includes("equipamento") ||
    item.includes("aspirador") ||
    item.includes("enceradeira") ||
    item.includes("rádio") ||
    item.includes("radio") ||
    item.includes("lanterna")
  ) {
    return "module_5";
  }

  if (
    category.includes("mão de obra") ||
    category.includes("mao de obra") ||
    category.includes("equipe operacional")
  ) {
    return "module_1";
  }

  return "module_5";
}

function buildPcfpModuleGroups(rows: SpreadsheetDetailRow[]): PcfpModuleGroup[] {
  const groups = PCFP_MODULES.map((moduleDef) => ({
    ...moduleDef,
    rows: [] as SpreadsheetDetailRow[],
    total: 0,
  }));

  rows.forEach((row) => {
    const moduleKey = classifyRowToModule(row);
    const target = groups.find((group) => group.key === moduleKey);

    if (target) {
      target.rows.push(row);
      target.total += Number(row.subtotal || 0);
    }
  });

  return groups;
}

function ExecutiveMetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4, height: "100%", minWidth: 0 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography
          variant="h4"
          fontWeight={800}
          color="#241B3A"
          sx={{ wordBreak: "break-word" }}
        >
          {value}
        </Typography>
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
    <Card variant="outlined" sx={{ borderRadius: 4, height: "100%", minWidth: 0 }}>
      <CardContent>
        <Stack spacing={1.25} sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>
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
        <Stack spacing={1.2} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            {module.icon}
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {module.shortTitle}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {module.rows.length} item(ns)
          </Typography>

          <Typography variant="h6" fontWeight={800} color="#241B3A">
            {formatCurrency(module.total)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ModuleDetailCard({ module }: { module: PcfpModuleGroup }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 2.25,
            py: 2,
            backgroundColor: module.backgroundColor,
            borderBottom: `1px solid ${module.borderColor}`,
            minWidth: 0,
          }}
        >
          <Stack spacing={0.8} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
              {module.icon}
              <Typography variant="h6" fontWeight={800}>
                {module.title}
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {module.description}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={`${module.rows.length} item(ns)`} variant="outlined" />
              <Chip size="small" label={formatCurrency(module.total)} variant="outlined" />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Table size="small" sx={{ minWidth: 680 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Item</strong>
                </TableCell>
                <TableCell>
                  <strong>Categoria</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Quantidade</strong>
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
              {module.rows.length > 0 ? (
                module.rows.map((row, index) => (
                  <TableRow key={`${module.key}-${String(row.item)}-${index}`}>
                    <TableCell sx={{ minWidth: 220 }}>
                      <Stack spacing={0.35}>
                        <Typography variant="body2">{String(row.item || "")}</Typography>
                        {row.memoriaCalculo ? (
                          <Typography variant="caption" color="text.secondary">
                            {String(row.memoriaCalculo)}
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell>{String(row.categoria || "")}</TableCell>
                    <TableCell align="right">{Number(row.quantidade || 0)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(Number(row.valorUnitario || 0))}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(Number(row.subtotal || 0))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhum item ainda identificado neste módulo preliminar.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
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
  if (!summary && !engineSnapshot && memoryItems.length === 0) {
    return null;
  }

  const totalByCategory = summary?.totalsByCategory ?? engineSnapshot?.totalByCategory ?? {};
  const totalByRecurrence =
    summary?.totalsByRecurrence ?? engineSnapshot?.totalByRecurrence ?? {};

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: "rgba(46, 125, 50, 0.18)",
        background:
          "linear-gradient(180deg, rgba(239,248,240,1) 0%, rgba(255,255,255,1) 100%)",
        minWidth: 0,
      }}
    >
      <CardContent>
        <Stack spacing={2.25} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            <MemoryOutlinedIcon sx={{ color: "#2E7D32" }} />
            <Typography variant="h6" fontWeight={700}>
              Composição de serviços persistida
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Esta seção lê diretamente os blocos persistidos pelo motor de composição,
            priorizando o resumo consolidado, a memória técnica por item e o snapshot
            executivo da rodada de cálculo.
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
              minWidth: 0,
            }}
          >
            <ExecutiveMetricCard
              label="Itens persistidos"
              value={summary?.itemCount ?? engineSnapshot?.itemCount ?? memoryItems.length}
            />
            <ExecutiveMetricCard
              label="Total persistido"
              value={formatCurrency(Number(summary?.total ?? engineSnapshot?.total ?? 0))}
            />
            <CompactInfoCard title="Resumo por recorrência">
              <Typography variant="body2" color="text.secondary">
                Recorrente:{" "}
                <strong>{formatCurrency(Number(totalByRecurrence["recorrente"] || 0))}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Eventual:{" "}
                <strong>{formatCurrency(Number(totalByRecurrence["eventual"] || 0))}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sob demanda:{" "}
                <strong>{formatCurrency(Number(totalByRecurrence["sob_demanda"] || 0))}</strong>
              </Typography>
            </CompactInfoCard>
            <CompactInfoCard title="Snapshot do motor">
              <Typography variant="body2" color="text.secondary">
                Gerado em:
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {engineSnapshot?.generatedAt
                  ? new Date(engineSnapshot.generatedAt).toLocaleString("pt-BR")
                  : "Não informado"}
              </Typography>
            </CompactInfoCard>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(5, minmax(0, 1fr))",
              },
              gap: 2,
              minWidth: 0,
            }}
          >
            <ExecutiveMetricCard
              label="Equipe técnica / operacional"
              value={formatCurrency(Number(totalByCategory["Equipe técnica / operacional"] || 0))}
            />
            <ExecutiveMetricCard
              label="Materiais e insumos"
              value={formatCurrency(Number(totalByCategory["Materiais e insumos"] || 0))}
            />
            <ExecutiveMetricCard
              label="Equipamentos"
              value={formatCurrency(Number(totalByCategory["Equipamentos"] || 0))}
            />
            <ExecutiveMetricCard
              label="Logística operacional"
              value={formatCurrency(Number(totalByCategory["Logística operacional"] || 0))}
            />
            <ExecutiveMetricCard
              label="Apoio operacional"
              value={formatCurrency(Number(totalByCategory["Apoio operacional"] || 0))}
            />
          </Box>

          <CompactInfoCard title="Leitura técnica consolidada">
            <Typography variant="body2" color="text.secondary">
              O motor consolidou <strong>{memoryItems.length}</strong> item(ns) com
              fórmula, fatores de produtividade, rateio, periodicidade e técnica
              declarada.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Este bloco já está apto a sustentar comparação entre versões,
              explicabilidade e parecer automatizado.
            </Typography>
          </CompactInfoCard>

          <Box sx={{ overflowX: "auto", width: "100%" }}>
            <Table size="small" sx={{ minWidth: 1180 }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Item</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Categoria</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Recorrência</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Periodicidade</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Qtd.</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Unitário</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Subtotal</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Fórmula</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Base / justificativa</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {memoryItems.length > 0 ? (
                  memoryItems.map((item, index) => (
                    <TableRow key={`${String(item.id)}-${index}`}>
                      <TableCell sx={{ minWidth: 200 }}>
                        {safeString(item.item) || "Item sem nome"}
                      </TableCell>
                      <TableCell>{safeString(item.category)}</TableCell>
                      <TableCell>{safeString(item.recurrenceType)}</TableCell>
                      <TableCell>{safeString(item.periodicity)}</TableCell>
                      <TableCell align="right">{Number(item.quantity || 0)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(Number(item.unitCost || 0))}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(Number(item.subtotal || 0))}
                      </TableCell>
                      <TableCell sx={{ minWidth: 280 }}>
                        <Typography variant="caption" color="text.secondary">
                          {safeString(item.formula) || "Sem fórmula registrada"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 260 }}>
                        <Stack spacing={0.35}>
                          {safeString(item.consumptionBasis) ? (
                            <Typography variant="caption" color="text.secondary">
                              Base: {safeString(item.consumptionBasis)}
                            </Typography>
                          ) : null}
                          {safeString(item.technicalJustification) ? (
                            <Typography variant="caption" color="text.secondary">
                              Justificativa: {safeString(item.technicalJustification)}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Sem justificativa técnica registrada.
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum item estruturado foi encontrado no bundle persistido.
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

export default function SpreadsheetDetail() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetDetailRecord | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "local" | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");

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
            setDataSource(localDraftOverride ? "local" : "api");
            setState("success");
          }
          return;
        }

        if (localSpreadsheet) {
          if (isMounted) {
            setSpreadsheet(localSpreadsheet);
            setEditor(buildInitialEditorState(localSpreadsheet));
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
    return spreadsheet.rows.reduce((sum, row) => sum + Number(row.subtotal || 0), 0);
  }, [spreadsheet]);

  const totalItems = spreadsheet?.rows.length ?? 0;
  const pendingItems =
    spreadsheet?.rows.filter((row) => String(row.status || "") === "Pendente").length ?? 0;

  const laborRows = useMemo(() => {
    if (!spreadsheet) return [];
    return spreadsheet.rows.filter((row) =>
      categoryMatches(String(row.categoria || ""), ["mão de obra", "equipe operacional"])
    );
  }, [spreadsheet]);

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

  const mandatoryCostTotal = useMemo(() => {
    if (!spreadsheet) return 0;

    const persistedLaborMandatory =
      Number(laborCostBreakdown?.salaryBaseTotal || 0) +
      Number(laborCostBreakdown?.mandatoryBenefitsTotal || 0) +
      Number(laborCostBreakdown?.additionalTotal || 0);

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

    const persistedCompositionTotal = Number(
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
    const persisted = Number(laborCostBreakdown?.headcount || 0);
    if (persisted > 0) {
      return persisted;
    }
    return parseNumber(editor?.headcount);
  }, [laborCostBreakdown, editor]);

  const effectiveMonthlyReference = useMemo(() => {
    const persistedLabor = Number(laborCostBreakdown?.monthlyLaborTotal || 0);
    const persistedComposition = Number(
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
      const updated = updateSpreadsheetEditorDraft(spreadsheet.id, {
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

      if (!updated) {
        throw new Error("Não foi possível salvar a edição local.");
      }

      setSpreadsheet(updated);
      setEditor(buildInitialEditorState(updated));
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
                      <AutoAwesomeOutlinedIcon
                        sx={{ fontSize: 16, color: "#9C6BC0" }}
                      />
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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                xl: "minmax(0, 1.55fr) minmax(320px, 0.95fr)",
              },
              gap: 2,
              alignItems: "start",
              minWidth: 0,
            }}
          >
            <Stack spacing={2} sx={{ minWidth: 0 }}>
              {(serviceCompositionSummary ||
                serviceCompositionEngineSnapshot ||
                serviceCompositionMemoryBundle.length > 0) &&
              spreadsheet.modelType === "service_composition" ? (
                <PersistedCompositionCard
                  summary={serviceCompositionSummary}
                  memoryItems={serviceCompositionMemoryBundle}
                  engineSnapshot={serviceCompositionEngineSnapshot}
                />
              ) : null}

              {serviceCompositionComparisonContext &&
              spreadsheet.modelType === "service_composition" ? (
                <ServiceCompositionComparisonPanel
                  comparison={serviceCompositionComparisonContext.comparison}
                  title="Comparação entre versões da composição"
                />
              ) : null}

              <CompactInfoCard title="Leitura persistida de cálculo">
                <Typography variant="body2" color="text.secondary">
                  <strong>Labor breakdown persistido:</strong>{" "}
                  {laborCostBreakdown ? "Sim" : "Não"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Configuração de encargos persistida:</strong>{" "}
                  {laborChargesConfig ? "Sim" : "Não"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Resumo da composição persistido:</strong>{" "}
                  {serviceCompositionSummary ? "Sim" : "Não"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Memória técnica da composição:</strong>{" "}
                  {serviceCompositionMemoryBundle.length > 0 ? "Sim" : "Não"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Snapshot do motor:</strong>{" "}
                  {serviceCompositionEngineSnapshot ? "Sim" : "Não"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Base comparativa anterior:</strong>{" "}
                  {serviceCompositionComparisonContext ? "Sim" : "Não"}
                </Typography>
              </CompactInfoCard>

              <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
                <CardContent>
                  <Stack spacing={2} sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <PlaylistAddCheckCircleOutlinedIcon sx={{ color: "#5E35B1" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Dados iniciais da contratação
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                        gap: 2,
                        minWidth: 0,
                      }}
                    >
                      <TextField
                        label="Órgão ou entidade"
                        value={editor.contractingAgency}
                        onChange={(event) =>
                          updateEditorField("contractingAgency", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Referência contratual / processo"
                        value={editor.contractReference}
                        onChange={(event) =>
                          updateEditorField("contractReference", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Unidade principal"
                        value={editor.unitName}
                        onChange={(event) =>
                          updateEditorField("unitName", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Lote / grupo"
                        value={editor.lotName}
                        onChange={(event) =>
                          updateEditorField("lotName", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Data-base"
                        type="date"
                        value={editor.referenceDate}
                        onChange={(event) =>
                          updateEditorField("referenceDate", event.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />

                      <TextField
                        label="Exemplo setorial"
                        value={editor.domainScenario}
                        onChange={(event) =>
                          updateEditorField("domainScenario", event.target.value)
                        }
                        select
                        fullWidth
                      >
                        <MenuItem value="">Não definido</MenuItem>
                        <MenuItem value="reception_administrative_support">
                          Recepção e apoio administrativo
                        </MenuItem>
                        <MenuItem value="cleaning_conservation">
                          Limpeza e conservação
                        </MenuItem>
                        <MenuItem value="concierge_access_control">
                          Portaria e controle de acesso
                        </MenuItem>
                        <MenuItem value="property_security">
                          Vigilância patrimonial
                        </MenuItem>
                      </TextField>

                      <TextField
                        label="Município"
                        value={editor.municipality}
                        onChange={(event) =>
                          updateEditorField("municipality", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="UF"
                        value={editor.state}
                        onChange={(event) => updateEditorField("state", event.target.value)}
                        fullWidth
                      />

                      <TextField
                        label="Código CBO"
                        value={editor.cboCode}
                        onChange={(event) =>
                          updateEditorField("cboCode", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Categoria profissional"
                        value={editor.professionalCategory}
                        onChange={(event) =>
                          updateEditorField("professionalCategory", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="CCT / ACT / Dissídio paradigma"
                        value={editor.cctReference}
                        onChange={(event) =>
                          updateEditorField("cctReference", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Regime tributário"
                        value={editor.taxRegime}
                        onChange={(event) =>
                          updateEditorField("taxRegime", event.target.value)
                        }
                        select
                        fullWidth
                      >
                        <MenuItem value="lucro_presumido">Lucro presumido</MenuItem>
                        <MenuItem value="lucro_real">Lucro real</MenuItem>
                        <MenuItem value="simples_nacional">Simples nacional</MenuItem>
                        <MenuItem value="nao_informado">Não informado</MenuItem>
                      </TextField>
                    </Box>

                    <TextField
                      label="Descrição resumida do objeto"
                      value={editor.objectDescription}
                      onChange={(event) =>
                        updateEditorField("objectDescription", event.target.value)
                      }
                      multiline
                      minRows={3}
                      fullWidth
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
                <CardContent>
                  <Stack spacing={2} sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <ManageSearchOutlinedIcon sx={{ color: "#1565C0" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Postos e jornadas
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                        gap: 2,
                        minWidth: 0,
                      }}
                    >
                      <TextField
                        label="Quantidade total estimada"
                        value={editor.headcount}
                        onChange={(event) =>
                          updateEditorField("headcount", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Valor mensal de referência"
                        value={editor.monthlyBaseValue}
                        onChange={(event) =>
                          updateEditorField("monthlyBaseValue", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Turno / arranjo predominante"
                        value={editor.mainShift}
                        onChange={(event) =>
                          updateEditorField("mainShift", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Escala"
                        value={editor.workScale}
                        onChange={(event) =>
                          updateEditorField("workScale", event.target.value)
                        }
                        placeholder="Ex.: 12x36, comercial, 44h"
                        fullWidth
                      />

                      <TextField
                        label="Jornada semanal"
                        value={editor.weeklyHours}
                        onChange={(event) =>
                          updateEditorField("weeklyHours", event.target.value)
                        }
                        placeholder="Ex.: 44"
                        fullWidth
                      />

                      <TextField
                        label="Horas mensais"
                        value={editor.monthlyHours}
                        onChange={(event) =>
                          updateEditorField("monthlyHours", event.target.value)
                        }
                        placeholder="Ex.: 220"
                        fullWidth
                      />
                    </Box>

                    <Box sx={{ overflowX: "auto", borderRadius: 3, border: "1px solid #ECE7F1" }}>
                      <Table size="small" sx={{ minWidth: 680 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <strong>Posto / função</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Categoria</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Quantidade</strong>
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
                          {laborRows.map((row, index) => (
                            <TableRow key={`${String(row.item)}-${index}`}>
                              <TableCell sx={{ minWidth: 200 }}>{String(row.item || "")}</TableCell>
                              <TableCell>{String(row.categoria || "")}</TableCell>
                              <TableCell align="right">{Number(row.quantidade || 0)}</TableCell>
                              <TableCell align="right">
                                {formatCurrency(Number(row.valorUnitario || 0))}
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(Number(row.subtotal || 0))}
                              </TableCell>
                            </TableRow>
                          ))}

                          {laborRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5}>
                                <Typography variant="body2" color="text.secondary">
                                  Nenhum posto de trabalho foi identificado automaticamente
                                  na estrutura atual desta planilha.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </TableBody>
                      </Table>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
                <CardContent>
                  <Stack spacing={2} sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <AttachMoneyOutlinedIcon sx={{ color: "#2E7D32" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Custos mínimos relevantes
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                        gap: 2,
                        minWidth: 0,
                      }}
                    >
                      <TextField
                        label="Salário-base"
                        value={editor.salaryBase}
                        onChange={(event) =>
                          updateEditorField("salaryBase", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Adicional noturno"
                        value={editor.nightAdditional}
                        onChange={(event) =>
                          updateEditorField("nightAdditional", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Adicional de insalubridade/periculosidade"
                        value={editor.hazardAdditional}
                        onChange={(event) =>
                          updateEditorField("hazardAdditional", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Auxílio-alimentação"
                        value={editor.mealAllowance}
                        onChange={(event) =>
                          updateEditorField("mealAllowance", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Vale-transporte"
                        value={editor.transportAllowance}
                        onChange={(event) =>
                          updateEditorField("transportAllowance", event.target.value)
                        }
                        fullWidth
                      />
                    </Box>

                    <TextField
                      label="Observações sobre benefícios obrigatórios"
                      value={editor.mandatoryBenefitsNotes}
                      onChange={(event) =>
                        updateEditorField("mandatoryBenefitsNotes", event.target.value)
                      }
                      multiline
                      minRows={3}
                      fullWidth
                    />
                  </Stack>
                </CardContent>
              </Card>

              <SpreadsheetEditor
                spreadsheet={spreadsheet}
                onSpreadsheetUpdated={(updated) => {
                  const next = updated as SpreadsheetDetailRecord;
                  setSpreadsheet(next);
                  setEditor(buildInitialEditorState(next));
                  setDataSource("local");
                }}
              />

              <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
                <CardContent>
                  <Stack spacing={2} sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <ViewAgendaOutlinedIcon sx={{ color: "#7B1FA2" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Estrutura modular preliminar da PCFP
                      </Typography>
                    </Stack>

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

                    <Stack spacing={2} sx={{ minWidth: 0 }}>
                      {pcfpModules
                        .filter((module) => module.key !== "module_6")
                        .map((module) => (
                          <ModuleDetailCard key={module.key} module={module} />
                        ))}

                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 4,
                          borderColor: "rgba(123, 31, 162, 0.16)",
                          backgroundColor: "#F8ECFB",
                          minWidth: 0,
                        }}
                      >
                        <CardContent>
                          <Stack spacing={1.5} sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <SummarizeOutlinedIcon sx={{ fontSize: 18 }} />
                              <Typography variant="h6" fontWeight={800}>
                                Módulo 6 — Síntese preliminar
                              </Typography>
                            </Stack>

                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                  xs: "1fr",
                                  md: "repeat(3, minmax(0, 1fr))",
                                },
                                gap: 2,
                                minWidth: 0,
                              }}
                            >
                              <ExecutiveMetricCard
                                label="Total dos módulos 1 a 5"
                                value={formatCurrency(
                                  pcfpModules
                                    .filter((module) => module.key !== "module_6")
                                    .reduce((sum, module) => sum + module.total, 0)
                                )}
                              />
                              <ExecutiveMetricCard
                                label="Base mensal declarada"
                                value={formatCurrency(effectiveMonthlyReference)}
                              />
                              <ExecutiveMetricCard
                                label="Saldo preliminar"
                                value={formatCurrency(executabilityBalance)}
                              />
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ px: 2.25, py: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Estrutura inicial da planilha
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      Itens-base identificados nesta versão da planilha.
                    </Typography>
                  </Box>

                  <Divider />

                  <Box sx={{ overflowX: "auto", width: "100%" }}>
                    <Table sx={{ minWidth: 820 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Item</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Categoria</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>Quantidade</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>Valor unitário</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>Subtotal</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Status</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {spreadsheet.rows.map((row, index) => (
                          <TableRow key={`${String(row.item)}-${index}`}>
                            <TableCell sx={{ minWidth: 240 }}>
                              <Stack spacing={0.4}>
                                <Typography variant="body2">{String(row.item || "")}</Typography>
                                {row.memoriaCalculo ? (
                                  <Typography variant="caption" color="text.secondary">
                                    {String(row.memoriaCalculo)}
                                  </Typography>
                                ) : null}
                              </Stack>
                            </TableCell>
                            <TableCell>{String(row.categoria || "")}</TableCell>
                            <TableCell align="right">{Number(row.quantidade || 0)}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(Number(row.valorUnitario || 0))}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(Number(row.subtotal || 0))}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={String(row.status || "")}
                                sx={{
                                  backgroundColor:
                                    String(row.status || "") === "Pendente"
                                      ? "#FFF3E0"
                                      : String(row.status || "") === "Exemplo do domínio"
                                      ? "#E3F2FD"
                                      : "#E7F6EC",
                                  color:
                                    String(row.status || "") === "Pendente"
                                      ? "#EF6C00"
                                      : String(row.status || "") === "Exemplo do domínio"
                                      ? "#1565C0"
                                      : "#2E7D32",
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}

                        {spreadsheet.rows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <Typography variant="body2" color="text.secondary">
                                Nenhum item encontrado nesta planilha.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Stack>

            <Stack
              spacing={2}
              sx={{
                minWidth: 0,
                position: { xl: "sticky" },
                top: { xl: 20 },
              }}
            >
              <CompactInfoCard title="Resumo executivo">
                <Typography variant="body2" color="text.secondary">
                  <strong>Tipo do modelo:</strong>{" "}
                  {getModelLabel(spreadsheet.modelType)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong> {spreadsheet.status}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Categoria:</strong> {spreadsheet.category}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Domínio:</strong>{" "}
                  {DOMAIN_SCENARIO_LABELS[editor.domainScenario] || domainScenarioLabel}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Quantidade estimada:</strong> {effectiveHeadcount}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Referência mensal:</strong>{" "}
                  {formatCurrency(effectiveMonthlyReference)}
                </Typography>

                <Stack direction="row" spacing={0.75} alignItems="center">
                  <AccessTimeIcon sx={{ fontSize: 16, color: "#7A708D" }} />
                  <Typography variant="body2" color="text.secondary">
                    Atualizado em {spreadsheet.updatedAt}
                  </Typography>
                </Stack>
              </CompactInfoCard>

              <CompactInfoCard title="Quadro preliminar de exequibilidade">
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: exequibilityRisk.backgroundColor,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: exequibilityRisk.color, fontWeight: 800 }}
                  >
                    {exequibilityRisk.label}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  <strong>Custos obrigatórios estimados:</strong>{" "}
                  {formatCurrency(mandatoryCostTotal)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Custos comprobatórios / materiais:</strong>{" "}
                  {formatCurrency(evidentiaryCostTotal)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Saldo preliminar de exequibilidade:</strong>{" "}
                  {formatCurrency(executabilityBalance)}
                </Typography>
              </CompactInfoCard>

              {laborCostBreakdown || laborChargesConfig ? (
                <CompactInfoCard title="Bloco laboral persistido">
                  <Typography variant="body2" color="text.secondary">
                    <strong>Headcount:</strong>{" "}
                    {Number(laborCostBreakdown?.headcount || 0)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Total salarial:</strong>{" "}
                    {formatCurrency(Number(laborCostBreakdown?.salaryBaseTotal || 0))}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Benefícios obrigatórios:</strong>{" "}
                    {formatCurrency(
                      Number(laborCostBreakdown?.mandatoryBenefitsTotal || 0)
                    )}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Adicionais:</strong>{" "}
                    {formatCurrency(Number(laborCostBreakdown?.additionalTotal || 0))}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Total laboral mensal:</strong>{" "}
                    {formatCurrency(Number(laborCostBreakdown?.monthlyLaborTotal || 0))}
                  </Typography>
                </CompactInfoCard>
              ) : null}

              {(serviceCompositionEngineSnapshot || serviceCompositionMemoryBundle.length > 0) &&
              spreadsheet.modelType === "service_composition" ? (
                <CompactInfoCard title="Snapshot do motor de composição">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FunctionsOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={700}>
                      Rodada consolidada de cálculo
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Itens:</strong>{" "}
                    {serviceCompositionEngineSnapshot?.itemCount ??
                      serviceCompositionMemoryBundle.length}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Total:</strong>{" "}
                    {formatCurrency(
                      Number(serviceCompositionEngineSnapshot?.total ?? 0)
                    )}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Gerado em:</strong>{" "}
                    {serviceCompositionEngineSnapshot?.generatedAt
                      ? new Date(
                          serviceCompositionEngineSnapshot.generatedAt
                        ).toLocaleString("pt-BR")
                      : "Não informado"}
                  </Typography>
                </CompactInfoCard>
              ) : null}

              {serviceCompositionComparisonContext &&
              spreadsheet.modelType === "service_composition" ? (
                <CompactInfoCard title="Comparativo resumido">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CompareArrowsOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={700}>
                      Versão atual x versão anterior
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Incluídos:</strong>{" "}
                    {serviceCompositionComparisonContext.comparison.summary.addedCount}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Removidos:</strong>{" "}
                    {serviceCompositionComparisonContext.comparison.summary.removedCount}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Alterados:</strong>{" "}
                    {serviceCompositionComparisonContext.comparison.summary.changedCount}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Impacto total:</strong>{" "}
                    {formatCurrency(
                      serviceCompositionComparisonContext.comparison.summary.totalDelta
                    )}
                  </Typography>
                </CompactInfoCard>
              ) : null}

              <CompactInfoCard title="Painel modular">
                {pcfpModules.map((module) => (
                  <Box
                    key={module.key}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: `1px solid ${module.borderColor}`,
                      backgroundColor: module.backgroundColor,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {module.shortTitle}
                      </Typography>
                      <Typography variant="body2" fontWeight={800}>
                        {formatCurrency(module.total)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </CompactInfoCard>

              <CompactInfoCard title="Leitura e análise do domínio">
                <Typography variant="body2" color="text.secondary">
                  <strong>Cenário identificado:</strong> {domainScenarioLabel}
                </Typography>

                {expectedDocuments.length > 0 ? (
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                      Documentos esperados
                    </Typography>
                    <Stack spacing={0.6}>
                      {expectedDocuments.map((item, index) => (
                        <Typography key={`${item}-${index}`} variant="body2" color="text.secondary">
                          • {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                {expectedCostDrivers.length > 0 ? (
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                      Vetores de custo esperados
                    </Typography>
                    <Stack spacing={0.6}>
                      {expectedCostDrivers.map((item, index) => (
                        <Typography key={`${item}-${index}`} variant="body2" color="text.secondary">
                          • {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                {validationFocus.length > 0 ? (
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                      Focos de validação
                    </Typography>
                    <Stack spacing={0.6}>
                      {validationFocus.map((item, index) => (
                        <Typography key={`${item}-${index}`} variant="body2" color="text.secondary">
                          • {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                {readingHints.length > 0 ? (
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                      Pistas de leitura
                    </Typography>
                    <Stack spacing={0.6}>
                      {readingHints.map((item, index) => (
                        <Typography key={`${item}-${index}`} variant="body2" color="text.secondary">
                          • {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                ) : null}
              </CompactInfoCard>

              <CompactInfoCard title="Observações internas">
                <TextField
                  label="Anotações preparatórias"
                  value={editor.notes}
                  onChange={(event) => updateEditorField("notes", event.target.value)}
                  multiline
                  minRows={4}
                  fullWidth
                />

                <Typography variant="caption" color="text.secondary">
                  Este campo já prepara a futura integração com histórico analítico,
                  decisão interna, parecer consolidado e trilha de auditoria.
                </Typography>
              </CompactInfoCard>
            </Stack>
          </Box>
        </Stack>
      </Container>

      <Snackbar
        open={saveState === "success" || saveState === "error"}
        autoHideDuration={3500}
        onClose={() => setSaveState("idle")}
      >
        <Alert
          onClose={() => setSaveState("idle")}
          severity={saveState === "success" ? "success" : "error"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {saveMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
