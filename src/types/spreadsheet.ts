export type SpreadsheetStatus =
  | "Em elaboração"
  | "Em revisão"
  | "Conferido"
  | "Concluído"
  | "Pendente"
  | "Em andamento"
  | string;

export type SpreadsheetListItem = {
  id: string;
  spreadsheet_id?: string | null;
  spreadsheetId?: string | null;
  title: string;
  description: string;
  status: SpreadsheetStatus;
  category: string;
  updatedAt: string;
};

export type SpreadsheetRow = {
  item: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  status: string;
};

export type SpreadsheetVersion = {
  versao: string;
  data: string;
  responsavel: string;
  observacao: string;
};

export type SpreadsheetDocument = {
  nome: string;
  tipo: string;
  atualizacao: string;
};

export type SpreadsheetDetailData = SpreadsheetListItem & {
  rows: SpreadsheetRow[];
  versions: SpreadsheetVersion[];
  documents: SpreadsheetDocument[];
};
