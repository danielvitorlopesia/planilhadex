import {
  SpreadsheetModelTemplate,
  SpreadsheetModelType,
} from "../types/spreadsheetModels";
import { DOMAIN_SCENARIO_OPTIONS } from "./domainScenarioCatalog";

const commonInitialFields = [
  {
    name: "title",
    label: "Título da planilha",
    type: "text" as const,
    required: false,
    placeholder: "Ex.: Vigilância patrimonial - Campus Central",
    hint: "Se não for preenchido, o sistema monta um título automaticamente a partir do cenário escolhido.",
  },
  {
    name: "domainScenario",
    label: "Exemplo setorial de partida",
    type: "select" as const,
    required: true,
    options: DOMAIN_SCENARIO_OPTIONS,
    hint:
      "Escolha um cenário nativo do domínio para o sistema gerar uma estrutura inicial coerente e também registrar pistas para leitura e análise futura.",
  },
  {
    name: "contractingAgency",
    label: "Órgão ou entidade",
    type: "text" as const,
    required: false,
    placeholder: "Ex.: Secretaria Municipal de Administração",
  },
  {
    name: "contractReference",
    label: "Referência contratual ou processo",
    type: "text" as const,
    required: false,
    placeholder: "Ex.: PE 012/2026 ou Processo 12345/2026",
  },
  {
    name: "unitName",
    label: "Unidade ou local principal",
    type: "text" as const,
    required: false,
    placeholder: "Ex.: Sede administrativa",
  },
  {
    name: "lotName",
    label: "Lote, grupo ou frente de serviço",
    type: "text" as const,
    required: false,
    placeholder: "Ex.: Lote 01",
  },
  {
    name: "referenceDate",
    label: "Data-base da composição",
    type: "date" as const,
    required: false,
  },
  {
    name: "headcount",
    label: "Quantidade inicial de profissionais/unidades",
    type: "number" as const,
    required: false,
    min: 1,
    step: 1,
    defaultValue: 1,
  },
  {
    name: "monthlyBaseValue",
    label: "Valor mensal de referência",
    type: "number" as const,
    required: false,
    min: 0,
    step: 0.01,
    defaultValue: 0,
  },
  {
    name: "description",
    label: "Descrição resumida",
    type: "textarea" as const,
    required: false,
    placeholder: "Descreva o objeto, a unidade atendida e a lógica resumida da composição.",
  },
  {
    name: "notes",
    label: "Observações iniciais",
    type: "textarea" as const,
    required: false,
    placeholder: "Anote premissas, riscos iniciais, vigência ou informações relevantes para a montagem.",
  },
];

export const MODEL_TEMPLATES: Record<SpreadsheetModelType, SpreadsheetModelTemplate> = {
  dedicated_labor: {
    type: "dedicated_labor",
    title: "Terceirização com dedicação exclusiva de mão de obra",
    shortDescription:
      "Modelo para serviços contínuos estruturados por postos, salários, encargos, benefícios e insumos mínimos.",
    useCases: [
      "recepção e apoio administrativo",
      "portaria e controle de acesso",
      "vigilância patrimonial",
      "apoio operacional com postos fixos",
    ],
    mainBlocks: [
      "postos e jornadas",
      "salários e adicionais",
      "encargos sociais e trabalhistas",
      "benefícios obrigatórios e estimados",
      "uniformes, EPIs e insumos mínimos",
    ],
    fields: commonInitialFields,
  },
  non_dedicated_labor: {
    type: "non_dedicated_labor",
    title: "Terceirização sem dedicação exclusiva de mão de obra",
    shortDescription:
      "Modelo para contratações em que a medição não depende de postos fixos exclusivos, mas ainda exige coerência de insumos, mão de obra e parâmetros técnicos.",
    useCases: [
      "serviços sob demanda",
      "apoio técnico eventual",
      "equipes não alocadas em posto exclusivo",
    ],
    mainBlocks: [
      "unidades de serviço",
      "mão de obra por unidade",
      "materiais e equipamentos",
      "encargos agregados",
      "premissas de medição",
    ],
    fields: commonInitialFields,
  },
  service_composition: {
    type: "service_composition",
    title: "Serviços por composição de itens, equipes e insumos",
    shortDescription:
      "Modelo para composição por grupos, equipes, materiais, equipamentos, logística e produtividade operacional.",
    useCases: [
      "limpeza e conservação",
      "serviços operacionais por área",
      "composição de equipes e materiais",
    ],
    mainBlocks: [
      "grupos e subgrupos",
      "equipe técnica ou operacional",
      "materiais e insumos recorrentes",
      "equipamentos e logística",
      "consolidação por composição",
    ],
    fields: commonInitialFields,
  },
  economic_rebalance: {
    type: "economic_rebalance",
    title: "Repactuação, reajuste, revisão e reequilíbrio",
    shortDescription:
      "Modelo para revisão econômica a partir de base anterior, evento modificador e diferença consolidada.",
    useCases: [
      "repactuação anual",
      "revisão por fato superveniente",
      "recomposição de custos por alteração de parâmetros",
    ],
    mainBlocks: [
      "planilha-base anterior",
      "evento econômico modificador",
      "itens impactados",
      "variação absoluta e percentual",
      "justificativa técnica da diferença",
    ],
    fields: [
      ...commonInitialFields,
      {
        name: "previousMonthlyValue",
        label: "Valor mensal anterior",
        type: "number",
        required: false,
        min: 0,
        step: 0.01,
      },
      {
        name: "rebalanceReason",
        label: "Evento motivador",
        type: "textarea",
        required: false,
        placeholder:
          "Ex.: nova CCT, alteração de benefício obrigatório, revisão extraordinária ou fato imprevisível.",
      },
    ],
  },
};

export const MODEL_TEMPLATE_LIST = Object.values(MODEL_TEMPLATES);

/**
 * Compatibilidade com imports antigos do projeto.
 */
export const spreadsheetModelTemplates = MODEL_TEMPLATES;

/**
 * Compatibilidade adicional com alias antigo.
 */
export const modelTemplates = MODEL_TEMPLATES;

/**
 * Função principal para buscar template por tipo.
 */
export function getModelTemplateByType(modelType?: string) {
  if (!modelType) {
    return undefined;
  }

  return MODEL_TEMPLATES[modelType as SpreadsheetModelType];
}

/**
 * Compatibilidade com código legado que usa este nome.
 */
export function getSpreadsheetModelTemplate(modelType?: string) {
  return getModelTemplateByType(modelType);
}
