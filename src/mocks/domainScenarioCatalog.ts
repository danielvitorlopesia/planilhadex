import {
  DOMAIN_SCENARIO_LABELS,
  DomainScenarioDefinition,
  DomainScenarioKey,
} from "../types/spreadsheetModels";

const buildRow = (
  item: string,
  categoria: string,
  quantidade: number,
  valorUnitario: number,
  status = "Exemplo do domínio",
  memoriaCalculo?: string,
  trainingTags: string[] = []
) => ({
  item,
  categoria,
  quantidade,
  valorUnitario,
  subtotal: Number((quantidade * valorUnitario).toFixed(2)),
  status,
  memoriaCalculo,
  origem: "catálogo nativo do domínio",
  automatico: true,
  trainingTags,
});

export const DOMAIN_SCENARIOS: Record<DomainScenarioKey, DomainScenarioDefinition> = {
  reception_administrative_support: {
    key: "reception_administrative_support",
    label: DOMAIN_SCENARIO_LABELS.reception_administrative_support,
    summary:
      "Cenário-base de serviços continuados de recepção, atendimento ao público e apoio administrativo.",
    recommendedModels: ["dedicated_labor", "economic_rebalance"],
    serviceFamily: "Serviços administrativos continuados",
    defaultCategory: "Apoio administrativo",
    exampleTitle: "Recepção e apoio administrativo - estrutura inicial",
    interpretationTags: [
      "atendimento ao público",
      "postos administrativos",
      "mão de obra contínua",
      "benefícios recorrentes",
    ],
    expectedDocuments: [
      "termo de referência",
      "estimativa de postos",
      "convenção coletiva aplicável",
      "memória de cálculo dos benefícios",
    ],
    expectedCostDrivers: [
      "salário-base",
      "encargos sociais",
      "vale-transporte",
      "vale-alimentação",
      "cobertura de postos por jornada",
    ],
    validationFocus: [
      "aderência entre quantidade de postos e jornada",
      "compatibilidade entre benefícios e CCT",
      "rastreabilidade da base salarial",
      "coerência entre posto administrativo e insumos mínimos",
    ],
    readingHints: [
      "Esperar predominância de mão de obra e baixa materialidade de insumos físicos.",
      "Alertar quando houver excesso de materiais operacionais sem justificativa.",
      "Verificar se a quantidade de postos acompanha a carga horária contratada.",
    ],
    defaultDraftValues: {
      modelType: "dedicated_labor",
      category: "Apoio administrativo",
      headcount: 4,
      monthlyBaseValue: 25000,
      description:
        "Modelo inicial para recepção, triagem de atendimento e apoio administrativo contínuo.",
    },
    seedRows: [
      buildRow(
        "Recepcionista",
        "Mão de obra",
        2,
        2650,
        "Exemplo do domínio",
        "2 postos fixos para recepção principal.",
        ["mao_de_obra", "atendimento", "posto_fixo"]
      ),
      buildRow(
        "Auxiliar administrativo",
        "Mão de obra",
        2,
        2890,
        "Exemplo do domínio",
        "2 postos de apoio administrativo interno.",
        ["mao_de_obra", "apoio_administrativo"]
      ),
      buildRow(
        "Encargos sociais e trabalhistas",
        "Encargos",
        1,
        6480,
        "Exemplo do domínio",
        "Projeção consolidada sobre a folha da estrutura exemplo.",
        ["encargos", "incidencia_folha"]
      ),
      buildRow(
        "Vale-transporte",
        "Benefícios",
        4,
        280,
        "Exemplo do domínio",
        "Estimativa mensal por colaborador.",
        ["beneficio", "deslocamento"]
      ),
      buildRow(
        "Vale-alimentação",
        "Benefícios",
        4,
        560,
        "Exemplo do domínio",
        "Estimativa mensal por colaborador.",
        ["beneficio", "alimentacao"]
      ),
      buildRow(
        "Uniformes e identificação funcional",
        "Insumos",
        4,
        95,
        "Exemplo do domínio",
        "Kit básico de identificação e apresentação.",
        ["insumo", "uniforme"]
      ),
    ],
  },
  cleaning_conservation: {
    key: "cleaning_conservation",
    label: DOMAIN_SCENARIO_LABELS.cleaning_conservation,
    summary:
      "Cenário-base para limpeza predial, conservação de áreas internas e externas e suporte com materiais de consumo.",
    recommendedModels: ["service_composition", "dedicated_labor", "economic_rebalance"],
    serviceFamily: "Serviços operacionais contínuos",
    defaultCategory: "Limpeza e conservação",
    exampleTitle: "Limpeza e conservação - estrutura inicial",
    interpretationTags: [
      "produtividade por área",
      "saneantes",
      "mão de obra operacional",
      "equipamentos de limpeza",
    ],
    expectedDocuments: [
      "levantamento de áreas",
      "frequência de execução",
      "caderno de materiais",
      "memória de produtividade",
    ],
    expectedCostDrivers: [
      "quantidade de serventes",
      "consumo de materiais",
      "equipamentos leves",
      "encargos e benefícios",
    ],
    validationFocus: [
      "compatibilidade entre metragem e quantidade de profissionais",
      "coerência do consumo de materiais",
      "distinção entre item contínuo e item eventual",
      "rastreabilidade dos equipamentos previstos",
    ],
    readingHints: [
      "Esperar presença mais intensa de materiais e equipamentos do que em serviços administrativos.",
      "Alertar quando houver mão de obra sem suporte mínimo de saneantes, EPIs e utensílios.",
      "Checar se a lógica produtiva por área está minimamente representada na estrutura.",
    ],
    defaultDraftValues: {
      modelType: "service_composition",
      category: "Limpeza e conservação",
      headcount: 10,
      monthlyBaseValue: 52000,
      description:
        "Modelo inicial para limpeza predial com equipe operacional, materiais recorrentes e equipamentos leves.",
    },
    seedRows: [
      buildRow(
        "Servente de limpeza",
        "Equipe operacional",
        8,
        2100,
        "Exemplo do domínio",
        "Equipe-base distribuída por áreas internas e externas.",
        ["mao_de_obra", "limpeza"]
      ),
      buildRow(
        "Encarregado de limpeza",
        "Equipe operacional",
        1,
        3150,
        "Exemplo do domínio",
        "Supervisão operacional de campo.",
        ["mao_de_obra", "supervisao"]
      ),
      buildRow(
        "Materiais saneantes e descartáveis",
        "Materiais e insumos",
        1,
        6900,
        "Exemplo do domínio",
        "Projeção mensal consolidada de produtos e descartáveis.",
        ["material", "saneante", "consumo_recorrente"]
      ),
      buildRow(
        "Equipamentos leves de limpeza",
        "Equipamentos",
        1,
        2850,
        "Exemplo do domínio",
        "Aspirador, enceradeira, carrinhos e utensílios básicos.",
        ["equipamento", "limpeza"]
      ),
      buildRow(
        "EPIs e uniformes",
        "Materiais e insumos",
        10,
        145,
        "Exemplo do domínio",
        "Kit periódico por colaborador.",
        ["epi", "uniforme"]
      ),
      buildRow(
        "Encargos e benefícios da equipe",
        "Encargos",
        1,
        14850,
        "Exemplo do domínio",
        "Projeção agregada da equipe exemplo.",
        ["encargos", "beneficios"]
      ),
    ],
  },
  concierge_access_control: {
    key: "concierge_access_control",
    label: DOMAIN_SCENARIO_LABELS.concierge_access_control,
    summary:
      "Cenário-base para postos de portaria, recepção de entrada e controle de circulação de pessoas e veículos.",
    recommendedModels: ["dedicated_labor", "economic_rebalance"],
    serviceFamily: "Serviços de controle operacional",
    defaultCategory: "Portaria",
    exampleTitle: "Portaria e controle de acesso - estrutura inicial",
    interpretationTags: [
      "postos por turno",
      "escala contínua",
      "controle de entrada",
      "apoio operacional",
    ],
    expectedDocuments: [
      "escala de cobertura",
      "mapa de portarias e acessos",
      "termo de referência",
      "base salarial da categoria",
    ],
    expectedCostDrivers: [
      "quantidade de postos 12x36 ou comercial",
      "adicional noturno, quando houver",
      "benefícios e cobertura de férias",
      "uniformização mínima",
    ],
    validationFocus: [
      "compatibilidade entre número de acessos e dimensionamento dos postos",
      "coerência da escala declarada",
      "presença de adicional noturno quando aplicável",
      "separação entre portaria e vigilância armada",
    ],
    readingHints: [
      "Esperar estrutura baseada em postos contínuos e não em produtividade por área.",
      "Alertar se houver rubricas típicas de vigilância armada em serviço meramente de portaria.",
      "Conferir se cobertura de turnos está refletida na quantidade de profissionais.",
    ],
    defaultDraftValues: {
      modelType: "dedicated_labor",
      category: "Portaria",
      headcount: 6,
      monthlyBaseValue: 36000,
      description:
        "Modelo inicial para postos de portaria e controle de acesso com cobertura contínua.",
    },
    seedRows: [
      buildRow(
        "Porteiro diurno",
        "Mão de obra",
        3,
        2540,
        "Exemplo do domínio",
        "Cobertura de acessos principais em turno diurno.",
        ["mao_de_obra", "portaria", "turno_diurno"]
      ),
      buildRow(
        "Porteiro noturno",
        "Mão de obra",
        3,
        2840,
        "Exemplo do domínio",
        "Cobertura noturna com adicional projetado.",
        ["mao_de_obra", "portaria", "turno_noturno"]
      ),
      buildRow(
        "Encargos sociais e trabalhistas",
        "Encargos",
        1,
        9620,
        "Exemplo do domínio",
        "Projeção global da equipe de portaria.",
        ["encargos", "incidencia_folha"]
      ),
      buildRow(
        "Vale-transporte",
        "Benefícios",
        6,
        310,
        "Exemplo do domínio",
        "Estimativa média mensal por colaborador.",
        ["beneficio", "deslocamento"]
      ),
      buildRow(
        "Uniformes e rádio comunicador",
        "Insumos",
        6,
        180,
        "Exemplo do domínio",
        "Kit de apresentação e comunicação básica.",
        ["uniforme", "equipamento_leve"]
      ),
    ],
  },
  property_security: {
    key: "property_security",
    label: DOMAIN_SCENARIO_LABELS.property_security,
    summary:
      "Cenário-base para vigilância patrimonial, proteção de áreas sensíveis e cobertura contínua de postos críticos.",
    recommendedModels: ["dedicated_labor", "economic_rebalance"],
    serviceFamily: "Serviços de segurança patrimonial",
    defaultCategory: "Vigilância patrimonial",
    exampleTitle: "Vigilância patrimonial - estrutura inicial",
    interpretationTags: [
      "postos críticos",
      "cobertura 24x7",
      "adicionais específicos",
      "uniformização e equipamentos",
    ],
    expectedDocuments: [
      "dimensionamento dos postos críticos",
      "plano de cobertura",
      "base normativa da categoria",
      "justificativa operacional dos turnos",
    ],
    expectedCostDrivers: [
      "vigilantes por turno",
      "adicional noturno",
      "uniformes e equipamentos operacionais",
      "encargos e substituições",
    ],
    validationFocus: [
      "aderência entre postos críticos e quantitativo de vigilantes",
      "correta incidência de adicionais",
      "distinção entre vigilância e portaria",
      "coerência da provisão de uniformes e equipamentos",
    ],
    readingHints: [
      "Esperar maior sensibilidade em adicionais e cobertura integral de turnos.",
      "Alertar se a estrutura parecer subdimensionada para cobertura contínua.",
      "Separar com clareza rubricas de vigilância patrimonial das de recepção e portaria.",
    ],
    defaultDraftValues: {
      modelType: "dedicated_labor",
      category: "Vigilância patrimonial",
      headcount: 8,
      monthlyBaseValue: 61000,
      description:
        "Modelo inicial para vigilância patrimonial com postos críticos e cobertura contínua.",
    },
    seedRows: [
      buildRow(
        "Vigilante patrimonial diurno",
        "Mão de obra",
        4,
        3320,
        "Exemplo do domínio",
        "Cobertura de postos críticos em turno diurno.",
        ["mao_de_obra", "vigilancia", "turno_diurno"]
      ),
      buildRow(
        "Vigilante patrimonial noturno",
        "Mão de obra",
        4,
        3710,
        "Exemplo do domínio",
        "Cobertura noturna com adicional projetado.",
        ["mao_de_obra", "vigilancia", "turno_noturno"]
      ),
      buildRow(
        "Encargos sociais e trabalhistas",
        "Encargos",
        1,
        15840,
        "Exemplo do domínio",
        "Projeção consolidada da equipe exemplo.",
        ["encargos", "incidencia_folha"]
      ),
      buildRow(
        "Vale-alimentação",
        "Benefícios",
        8,
        620,
        "Exemplo do domínio",
        "Estimativa mensal por vigilante.",
        ["beneficio", "alimentacao"]
      ),
      buildRow(
        "Uniformes, lanternas e equipamentos básicos",
        "Insumos",
        8,
        260,
        "Exemplo do domínio",
        "Kit operacional mínimo por profissional.",
        ["uniforme", "equipamento_operacional"]
      ),
    ],
  },
};

export const DOMAIN_SCENARIO_OPTIONS = Object.values(DOMAIN_SCENARIOS).map((scenario) => ({
  value: scenario.key,
  label: scenario.label,
}));

export function getDomainScenario(key?: string) {
  if (!key) {
    return undefined;
  }

  return DOMAIN_SCENARIOS[key as DomainScenarioKey];
}
