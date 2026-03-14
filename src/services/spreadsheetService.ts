export type SpreadsheetModelType =
  | "dedicated_labor"
  | "non_dedicated_labor"
  | "service_composition"
  | "economic_rebalance";

export interface SpreadsheetRow {
  item: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  status: string;
}

export interface SpreadsheetRecord {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  updatedAt: string;
  modelType: SpreadsheetModelType;
  rows: SpreadsheetRow[];
}

const STORAGE_KEY = "custopublico_spreadsheets";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function getModelCategory(modelType: SpreadsheetModelType): string {
  switch (modelType) {
    case "dedicated_labor":
      return "Modelo 01";
    case "non_dedicated_labor":
      return "Modelo 02";
    case "service_composition":
      return "Modelo 03";
    case "economic_rebalance":
      return "Modelo 04";
    default:
      return "Modelo";
  }
}

function buildRowsFromModel(modelType: SpreadsheetModelType): SpreadsheetRow[] {
  switch (modelType) {
    case "dedicated_labor":
      return [
        {
          item: "Salário-base",
          categoria: "Remuneração",
          quantidade: 1,
          valorUnitario: 1800,
          subtotal: 1800,
          status: "Pendente",
        },
        {
          item: "Encargos sociais",
          categoria: "Encargos",
          quantidade: 1,
          valorUnitario: 900,
          subtotal: 900,
          status: "Pendente",
        },
        {
          item: "Benefícios",
          categoria: "Benefícios",
          quantidade: 1,
          valorUnitario: 650,
          subtotal: 650,
          status: "Pendente",
        },
        {
          item: "Insumos / uniformes / EPIs",
          categoria: "Insumos",
          quantidade: 1,
          valorUnitario: 220,
          subtotal: 220,
          status: "Pendente",
        },
      ];

    case "non_dedicated_labor":
      return [
        {
          item: "Mão de obra por unidade",
          categoria: "Composição unitária",
          quantidade: 1,
          valorUnitario: 850,
          subtotal: 850,
          status: "Pendente",
        },
        {
          item: "Materiais",
          categoria: "Insumos",
          quantidade: 1,
          valorUnitario: 300,
          subtotal: 300,
          status: "Pendente",
        },
        {
          item: "Equipamentos",
          categoria: "Equipamentos",
          quantidade: 1,
          valorUnitario: 180,
          subtotal: 180,
          status: "Pendente",
        },
      ];

    case "service_composition":
      return [
        {
          item: "Equipe técnica",
          categoria: "Mão de obra",
          quantidade: 1,
          valorUnitario: 2200,
          subtotal: 2200,
          status: "Pendente",
        },
        {
          item: "Materiais e insumos",
          categoria: "Materiais",
          quantidade: 1,
          valorUnitario: 780,
          subtotal: 780,
          status: "Pendente",
        },
        {
          item: "Equipamentos e logística",
          categoria: "Operacional",
          quantidade: 1,
          valorUnitario: 640,
          subtotal: 640,
          status: "Pendente",
        },
      ];

    case "economic_rebalance":
      return [
        {
          item: "Valor-base anterior",
          categoria: "Referência contratual",
          quantidade: 1,
          valorUnitario: 10000,
          subtotal: 10000,
          status: "Pendente",
        },
        {
          item: "Impacto do evento modificador",
          categoria: "Revisão",
          quantidade: 1,
          valorUnitario: 1200,
          subtotal: 1200,
          status: "Pendente",
        },
        {
          item: "Diferença consolidada",
          categoria: "Impacto financeiro",
          quantidade: 1,
          valorUnitario: 1200,
          subtotal: 1200,
          status: "Pendente",
        },
      ];

    default:
      return [];
  }
}

export function getStoredSpreadsheets(): SpreadsheetRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as SpreadsheetRecord[];
  } catch {
    return [];
  }
}

export function saveStoredSpreadsheets(items: SpreadsheetRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function createSpreadsheetFromModel(params: {
  modelType: SpreadsheetModelType;
  title: string;
  description: string;
}): SpreadsheetRecord {
  const now = new Date();

  const newSpreadsheet: SpreadsheetRecord = {
    id: crypto.randomUUID(),
    title: params.title,
    description: params.description,
    status: "Em elaboração",
    category: getModelCategory(params.modelType),
    updatedAt: formatDate(now),
    modelType: params.modelType,
    rows: buildRowsFromModel(params.modelType),
  };

  const existing = getStoredSpreadsheets();
  saveStoredSpreadsheets([newSpreadsheet, ...existing]);

  return newSpreadsheet;
}

export function getSpreadsheetById(id: string): SpreadsheetRecord | null {
  const existing = getStoredSpreadsheets();
  return existing.find((item) => item.id === id) ?? null;
}
