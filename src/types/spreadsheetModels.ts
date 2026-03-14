export type SpreadsheetModelType =
  | "dedicated_labor"
  | "non_dedicated_labor"
  | "service_composition"
  | "economic_rebalance";

export interface SpreadsheetModelDefinition {
  type: SpreadsheetModelType;
  title: string;
  shortTitle: string;
  description: string;
  useCases: string[];
  complexityLabel: "Essencial" | "Intermediário" | "Avançado";
  badgeLabel: string;
  recommendedForPublicBodies: boolean;
  requiresReferenceSpreadsheet: boolean;
  primaryBlocks: string[];
}

export interface SpreadsheetModelTemplate
  extends SpreadsheetModelDefinition {
  creationHints: string[];
  initialFormFields: ModelInitialFieldDefinition[];
}

export type ModelInitialFieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "number";

export interface ModelInitialFieldOption {
  value: string;
  label: string;
}

export interface ModelInitialFieldDefinition {
  key: string;
  label: string;
  type: ModelInitialFieldType;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  options?: ModelInitialFieldOption[];
}

export interface SpreadsheetCreateDraft {
  title: string;
  organization: string;
  objectDescription: string;
  processReference: string;
  city: string;
  state: string;
  baseDate: string;
  contractTermMonths: string;
  taxRegime: string;
  notes: string;
  referenceSpreadsheetId?: string;
  referenceSpreadsheetVersionId?: string;
  rebalanceEventType?: string;
  rebalanceEventDate?: string;
}