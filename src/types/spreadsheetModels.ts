export type SpreadsheetModelType =
  | "dedicated_labor"
  | "non_dedicated_labor"
  | "service_composition"
  | "economic_rebalance";

export type DomainScenarioKey =
  | "reception_administrative_support"
  | "cleaning_conservation"
  | "concierge_access_control"
  | "property_security";

export type SpreadsheetFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "date";

export interface SpreadsheetFieldOption {
  value: string;
  label: string;
}

export interface SpreadsheetModelField {
  name: string;
  label: string;
  type: SpreadsheetFieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  min?: number;
  step?: number;
  options?: SpreadsheetFieldOption[];
  defaultValue?: string | number;
}

export interface SpreadsheetModelTemplate {
  type: SpreadsheetModelType;
  title: string;
  shortDescription: string;
  useCases: string[];
  mainBlocks: string[];
  fields: SpreadsheetModelField[];
}

export interface SpreadsheetCreationDraft {
  modelType: SpreadsheetModelType;
  title?: string;
  description?: string;
  category?: string;
  contractingAgency?: string;
  contractReference?: string;
  unitName?: string;
  lotName?: string;
  referenceDate?: string;
  headcount?: number;
  monthlyBaseValue?: number;
  domainScenario?: DomainScenarioKey;
  notes?: string;
  [key: string]: string | number | undefined;
}

export interface SpreadsheetRow {
  id?: string;
  item: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  status: string;
  memoriaCalculo?: string;
  origem?: string;
  automatico?: boolean;
  trainingTags?: string[];
}

export interface SpreadsheetTrainingProfile {
  domainScenarioKey: DomainScenarioKey;
  domainScenarioLabel: string;
  interpretationTags: string[];
  expectedDocuments: string[];
  expectedCostDrivers: string[];
  validationFocus: string[];
  readingHints: string[];
}

export interface LocalSpreadsheet {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  updatedAt: string;
  modelType: SpreadsheetModelType;
  domainScenario?: DomainScenarioKey;
  rows: SpreadsheetRow[];
  source?: "local" | "api" | "seed_example";
  isSeedExample?: boolean;
  contractReference?: string;
  contractingAgency?: string;
  unitName?: string;
  lotName?: string;
  referenceDate?: string;
  headcount?: number;
  monthlyBaseValue?: number;
  notes?: string;
  trainingProfile?: SpreadsheetTrainingProfile;
  metadata?: Record<string, unknown>;
}

export interface DomainScenarioDefinition {
  key: DomainScenarioKey;
  label: string;
  summary: string;
  recommendedModels: SpreadsheetModelType[];
  serviceFamily: string;
  defaultCategory: string;
  exampleTitle: string;
  interpretationTags: string[];
  expectedDocuments: string[];
  expectedCostDrivers: string[];
  validationFocus: string[];
  readingHints: string[];
  defaultDraftValues: Partial<SpreadsheetCreationDraft>;
  seedRows: SpreadsheetRow[];
}

export const SPREADSHEET_MODEL_LABELS: Record<SpreadsheetModelType, string> = {
  dedicated_labor: "Terceirização com dedicação exclusiva de mão de obra",
  non_dedicated_labor: "Terceirização sem dedicação exclusiva de mão de obra",
  service_composition: "Serviços por composição de itens, equipes e insumos",
  economic_rebalance: "Repactuação, reajuste, revisão e reequilíbrio",
};

export const DOMAIN_SCENARIO_LABELS: Record<DomainScenarioKey, string> = {
  reception_administrative_support: "Recepção e apoio administrativo",
  cleaning_conservation: "Limpeza e conservação",
  concierge_access_control: "Portaria e controle de acesso",
  property_security: "Vigilância patrimonial",
};

export function isSpreadsheetModelType(value: string): value is SpreadsheetModelType {
  return Object.prototype.hasOwnProperty.call(SPREADSHEET_MODEL_LABELS, value);
}

export function isDomainScenarioKey(value: string): value is DomainScenarioKey {
  return Object.prototype.hasOwnProperty.call(DOMAIN_SCENARIO_LABELS, value);
}
