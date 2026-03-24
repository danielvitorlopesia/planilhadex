// src/services/spreadsheetTemplateFactory.ts

export type SpreadsheetTemplateModelType =
  | "dedicated_labor"
  | "non_dedicated_labor"
  | "service_composition"
  | "economic_rebalance";

export type SpreadsheetTemplateStatus =
  | "Em elaboração"
  | "Em revisão"
  | "Concluída"
  | "Exemplo nativo";

export type SpreadsheetTemplateRow = {
  item: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  status?: string;
  memoriaCalculo?: string;
};

export type SpreadsheetTemplateTrainingProfile = {
  domainScenarioLabel?: string;
  interpretationTags?: string[];
  expectedDocuments?: string[];
  expectedCostDrivers?: string[];
  validationFocus?: string[];
  readingHints?: string[];
};

export type SpreadsheetTemplateMetadata = Record<string, unknown>;

export type SpreadsheetTemplateRecord = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: SpreadsheetTemplateStatus;
  modelType: SpreadsheetTemplateModelType;
  updatedAt: string;
  contractReference?: string;
  contractingAgency?: string;
  unitName?: string;
  lotName?: string;
  referenceDate?: string;
  headcount?: number;
  monthlyBaseValue?: number;
  notes?: string;
  domainScenario?: string;
  trainingProfile?: SpreadsheetTemplateTrainingProfile;
  metadata?: SpreadsheetTemplateMetadata;
  rows: SpreadsheetTemplateRow[];
};

export type SpreadsheetTemplateFactoryInput = {
  modelType: SpreadsheetTemplateModelType;
  title?: string;
  description?: string;
  category?: string;
  contractReference?: string;
  contractingAgency?: string;
  unitName?: string;
  lotName?: string;
  referenceDate?: string;
  headcount?: number;
  monthlyBaseValue?: number;
  notes?: string;
  domainScenario?: string;
  municipality?: string;
  state?: string;
  cboCode?: string;
  professionalCategory?: string;
  cctReference?: string;
  taxRegime?: string;
  objectDescription?: string;
  mainShift?: string;
  workScale?: string;
  weeklyHours?: number;
  monthlyHours?: number;
  salaryBase?: number;
  nightAdditional?: number;
  hazardAdditional?: number;
  mealAllowance?: number;
  transportAllowance?: number;
  mandatoryBenefitsNotes?: string;
};

type DedicatedLaborComputation = {
  headcount: number;
  salaryBasePerPost: number;
  nightAdditionalPerPost: number;
  hazardAdditionalPerPost: number;
  mealAllowancePerPost: number;
  transportAllowancePerPost: number;
  monthlyLaborTotal: number;
  mandatoryBenefitsTotal: number;
  additionalTotal: number;
  fgtsTotal: number;
  inssTotal: number;
  vacationProvisionTotal: number;
  thirteenthSalaryProvisionTotal: number;
  subtotalWithCharges: number;
  totalMonthlyCost: number;
};

const DOMAIN_SCENARIO_LABELS: Record<string, string> = {
  reception_administrative_support: "Recepção e apoio administrativo",
  cleaning_conservation: "Limpeza e conservação",
  concierge_access_control: "Portaria e controle de acesso",
  property_security: "Vigilância patrimonial",
};

const DEFAULT_STATUS: SpreadsheetTemplateStatus = "Em elaboração";

function nowIso(): string {
  return new Date().toISOString();
}

function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function buildTemplateId(modelType: SpreadsheetTemplateModelType): string {
  const stamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `tpl_${modelType}_${stamp}_${random}`;
}

function buildDomainScenarioLabel(domainScenario?: string): string {
  if (!domainScenario) return "Não classificado";
  return DOMAIN_SCENARIO_LABELS[domainScenario] ?? domainScenario;
}

function buildTrainingProfile(
  modelType: SpreadsheetTemplateModelType,
  domainScenario?: string
): SpreadsheetTemplateTrainingProfile {
  const domainScenarioLabel = buildDomainScenarioLabel(domainScenario);

  if (modelType === "dedicated_labor") {
    return {
      domainScenarioLabel,
      interpretationTags: [
        "dedicacao_exclusiva",
        "mao_de_obra",
        "encargos_sociais",
        "beneficios",
        "memoria_de_calculo",
      ],
      expectedDocuments: [
        "Convenção coletiva ou instrumento equivalente",
        "Memória de cálculo da composição de custos",
        "Justificativa dos benefícios informados",
        "Parâmetros de encargos sociais",
      ],
      expectedCostDrivers: [
        "salário-base",
        "encargos sociais",
        "provisões",
        "vale-alimentação",
        "vale-transporte",
      ],
      validationFocus: [
        "coerência entre postos e quantitativos",
        "aderência à convenção coletiva",
        "compatibilidade entre salário e encargos",
        "consistência dos benefícios obrigatórios",
      ],
      readingHints: [
        "verificar a suficiência do salário-base por posto",
        "comparar encargos com o regime adotado",
        "observar se benefícios obrigatórios foram contemplados",
        "avaliar risco de inexequibilidade pelo saldo preliminar",
      ],
    };
  }

  if (modelType === "service_composition") {
    return {
      domainScenarioLabel,
      interpretationTags: ["composicao_de_servicos", "insumos", "equipamentos"],
      expectedDocuments: [
        "Memória de cálculo por item",
        "Base de produtividade",
        "Justificativa técnica dos insumos",
      ],
      expectedCostDrivers: ["insumos", "equipamentos", "logística", "apoio operacional"],
      validationFocus: [
        "consistência da composição por item",
        "coerência entre quantidade e unidade",
      ],
      readingHints: [
        "avaliar recorrência dos itens",
        "verificar proporcionalidade dos custos indiretos",
      ],
    };
  }

  return {
    domainScenarioLabel,
    interpretationTags: [modelType],
    expectedDocuments: [],
    expectedCostDrivers: [],
    validationFocus: [],
    readingHints: [],
  };
}

function buildRow(
  item: string,
  categoria: string,
  quantidade: number,
  valorUnitario: number,
  status = "Calculado",
  memoriaCalculo?: string
): SpreadsheetTemplateRow {
  return {
    item,
    categoria,
    quantidade: round2(quantidade),
    valorUnitario: round2(valorUnitario),
    subtotal: round2(quantidade * valorUnitario),
    status,
    memoriaCalculo,
  };
}
function computeDedicatedLabor(input: SpreadsheetTemplateFactoryInput): DedicatedLaborComputation {
  const headcount = Math.max(1, safeNumber(input.headcount, 1));
  const salaryBasePerPost = Math.max(0, safeNumber(input.salaryBase, 0));
  const nightAdditionalPerPost = Math.max(0, safeNumber(input.nightAdditional, 0));
  const hazardAdditionalPerPost = Math.max(0, safeNumber(input.hazardAdditional, 0));
  const mealAllowancePerPost = Math.max(0, safeNumber(input.mealAllowance, 0));
  const transportAllowancePerPost = Math.max(0, safeNumber(input.transportAllowance, 0));

  const monthlyLaborTotal = round2(headcount * salaryBasePerPost);
  const mandatoryBenefitsTotal = round2(
    headcount * (mealAllowancePerPost + transportAllowancePerPost)
  );
  const additionalTotal = round2(
    headcount * (nightAdditionalPerPost + hazardAdditionalPerPost)
  );

  const fgtsRate = 0.08;
  const inssRate = 0.20;
  const vacationProvisionRate = 1 / 12;
  const thirteenthSalaryProvisionRate = 1 / 12;

  const fgtsTotal = round2((monthlyLaborTotal + additionalTotal) * fgtsRate);
  const inssTotal = round2((monthlyLaborTotal + additionalTotal) * inssRate);
  const vacationProvisionTotal = round2(
    (monthlyLaborTotal + additionalTotal) * vacationProvisionRate
  );
  const thirteenthSalaryProvisionTotal = round2(
    (monthlyLaborTotal + additionalTotal) * thirteenthSalaryProvisionRate
  );

  const subtotalWithCharges = round2(
    monthlyLaborTotal +
      additionalTotal +
      mandatoryBenefitsTotal +
      fgtsTotal +
      inssTotal +
      vacationProvisionTotal +
      thirteenthSalaryProvisionTotal
  );

  const totalMonthlyCost = subtotalWithCharges;

  return {
    headcount,
    salaryBasePerPost,
    nightAdditionalPerPost,
    hazardAdditionalPerPost,
    mealAllowancePerPost,
    transportAllowancePerPost,
    monthlyLaborTotal,
    mandatoryBenefitsTotal,
    additionalTotal,
    fgtsTotal,
    inssTotal,
    vacationProvisionTotal,
    thirteenthSalaryProvisionTotal,
    subtotalWithCharges,
    totalMonthlyCost,
  };
}

function buildDedicatedLaborRows(
  input: SpreadsheetTemplateFactoryInput,
  computation: DedicatedLaborComputation
): SpreadsheetTemplateRow[] {
  const professionalCategory =
    safeString(input.professionalCategory) || "Categoria profissional";
  const workScale = safeString(input.workScale) || "Escala não informada";
  const weeklyHours = safeNumber(input.weeklyHours, 44);
  const monthlyHours = safeNumber(input.monthlyHours, 220);

  return [
    buildRow(
      `Salário-base — ${professionalCategory}`,
      "Mão de obra",
      computation.headcount,
      computation.salaryBasePerPost,
      "Calculado",
      `Postos: ${computation.headcount} | Escala: ${workScale} | Jornada semanal: ${weeklyHours}h | Jornada mensal: ${monthlyHours}h`
    ),
    buildRow(
      "Adicional noturno",
      "Encargos e adicionais",
      computation.headcount,
      computation.nightAdditionalPerPost,
      "Calculado",
      "Parcela adicional por posto vinculada ao trabalho noturno"
    ),
    buildRow(
      "Adicional de insalubridade/periculosidade",
      "Encargos e adicionais",
      computation.headcount,
      computation.hazardAdditionalPerPost,
      "Calculado",
      "Parcela adicional por posto vinculada a risco ocupacional"
    ),
    buildRow(
      "Vale-alimentação",
      "Benefícios",
      computation.headcount,
      computation.mealAllowancePerPost,
      "Calculado",
      "Benefício obrigatório ou convencional por posto"
    ),
    buildRow(
      "Vale-transporte",
      "Benefícios",
      computation.headcount,
      computation.transportAllowancePerPost,
      "Calculado",
      "Benefício de deslocamento por posto"
    ),
    buildRow(
      "FGTS",
      "Encargos",
      1,
      computation.fgtsTotal,
      "Calculado",
      "Incidência estimada de 8% sobre remuneração base e adicionais"
    ),
    buildRow(
      "INSS patronal",
      "Encargos",
      1,
      computation.inssTotal,
      "Calculado",
      "Incidência patronal estimada sobre remuneração base e adicionais"
    ),
    buildRow(
      "Provisão de férias",
      "Provisões",
      1,
      computation.vacationProvisionTotal,
      "Calculado",
      "Provisão mensal estimada de férias"
    ),
    buildRow(
      "Provisão de 13º salário",
      "Provisões",
      1,
      computation.thirteenthSalaryProvisionTotal,
      "Calculado",
      "Provisão mensal estimada de 13º salário"
    ),
  ];
}

function buildDedicatedLaborMetadata(
  input: SpreadsheetTemplateFactoryInput,
  computation: DedicatedLaborComputation
): SpreadsheetTemplateMetadata {
  return {
    versionNumber: 1,
    templateOrigin: "spreadsheet_template_factory",
    templateModelType: "dedicated_labor",
    generatedAt: nowIso(),
    editorDraft: {
      contractingAgency: input.contractingAgency ?? "",
      contractReference: input.contractReference ?? "",
      unitName: input.unitName ?? "",
      lotName: input.lotName ?? "",
      referenceDate: input.referenceDate ?? "",
      municipality: input.municipality ?? "",
      state: input.state ?? "",
      cboCode: input.cboCode ?? "",
      professionalCategory: input.professionalCategory ?? "",
      cctReference: input.cctReference ?? "",
      taxRegime: input.taxRegime ?? "lucro_presumido",
      objectDescription: input.objectDescription ?? input.description ?? "",
      domainScenario: input.domainScenario ?? "",
      headcount: String(computation.headcount),
      monthlyBaseValue: String(computation.totalMonthlyCost),
      mainShift: input.mainShift ?? "",
      workScale: input.workScale ?? "",
      weeklyHours: String(safeNumber(input.weeklyHours, 44)),
      monthlyHours: String(safeNumber(input.monthlyHours, 220)),
      salaryBase: String(computation.salaryBasePerPost),
      nightAdditional: String(computation.nightAdditionalPerPost),
      hazardAdditional: String(computation.hazardAdditionalPerPost),
      mealAllowance: String(computation.mealAllowancePerPost),
      transportAllowance: String(computation.transportAllowancePerPost),
      mandatoryBenefitsNotes: input.mandatoryBenefitsNotes ?? "",
      notes: input.notes ?? "",
    },
    laborCostBreakdown: {
      headcount: computation.headcount,
      salaryBaseTotal: computation.monthlyLaborTotal,
      mandatoryBenefitsTotal: computation.mandatoryBenefitsTotal,
      additionalTotal: computation.additionalTotal,
      monthlyLaborTotal: computation.monthlyLaborTotal,
      mealAllowanceTotal: round2(
        computation.headcount * computation.mealAllowancePerPost
      ),
      transportAllowanceTotal: round2(
        computation.headcount * computation.transportAllowancePerPost
      ),
      fgts: computation.fgtsTotal,
      employerInss: computation.inssTotal,
      feriasProvision: computation.vacationProvisionTotal,
      thirteenthProvision: computation.thirteenthSalaryProvisionTotal,
      total: computation.totalMonthlyCost,
      quantity: computation.headcount,
    },
    laborChargesConfig: {
      fgtsRate: 8,
      inssRate: 20,
      vacationProvisionRate: round2((1 / 12) * 100),
      thirteenthSalaryRate: round2((1 / 12) * 100),
      totalChargesPercentage: round2(
        ((computation.fgtsTotal +
          computation.inssTotal +
          computation.vacationProvisionTotal +
          computation.thirteenthSalaryProvisionTotal) /
          Math.max(1, computation.monthlyLaborTotal + computation.additionalTotal)) *
          100
      ),
      effectiveChargesRate: round2(
        ((computation.fgtsTotal +
          computation.inssTotal +
          computation.vacationProvisionTotal +
          computation.thirteenthSalaryProvisionTotal) /
          Math.max(1, computation.monthlyLaborTotal + computation.additionalTotal)) *
          100
      ),
    },
  };
}

function buildDedicatedLaborTemplate(
  input: SpreadsheetTemplateFactoryInput
): SpreadsheetTemplateRecord {
  const computation = computeDedicatedLabor(input);
  const rows = buildDedicatedLaborRows(input, computation);

  const title =
    safeString(input.title) || "Planilha de custos — dedicação exclusiva";
  const description =
    safeString(input.description) ||
    "Estrutura inicial gerada automaticamente para contratação com dedicação exclusiva de mão de obra.";
  const category = safeString(input.category) || "Planilha de custos públicas";

  return {
    id: buildTemplateId("dedicated_labor"),
    title,
    description,
    category,
    status: DEFAULT_STATUS,
    modelType: "dedicated_labor",
    updatedAt: nowIso(),
    contractReference: input.contractReference,
    contractingAgency: input.contractingAgency,
    unitName: input.unitName,
    lotName: input.lotName,
    referenceDate: input.referenceDate,
    headcount: computation.headcount,
    monthlyBaseValue: computation.totalMonthlyCost,
    notes: input.notes,
    domainScenario: input.domainScenario,
    trainingProfile: buildTrainingProfile("dedicated_labor", input.domainScenario),
    metadata: buildDedicatedLaborMetadata(input, computation),
    rows,
  };
}
function buildServiceCompositionTemplate(
  input: SpreadsheetTemplateFactoryInput
): SpreadsheetTemplateRecord {
  const title =
    safeString(input.title) || "Planilha de custos — composição de serviços";
  const description =
    safeString(input.description) ||
    "Estrutura inicial gerada automaticamente para composição de serviços, insumos, equipamentos e apoio operacional.";
  const category = safeString(input.category) || "Planilha de custos públicas";

  const rows: SpreadsheetTemplateRow[] = [
    buildRow(
      "Mão de obra de apoio",
      "Mão de obra",
      Math.max(1, safeNumber(input.headcount, 1)),
      Math.max(0, safeNumber(input.salaryBase, 0)),
      "Estimado",
      "Item inicial parametrizável para apoio operacional"
    ),
    buildRow(
      "Insumos principais",
      "Insumos",
      1,
      0,
      "Pendente",
      "Preencher conforme memória de cálculo por item"
    ),
    buildRow(
      "Equipamentos operacionais",
      "Equipamentos",
      1,
      0,
      "Pendente",
      "Preencher conforme depreciação, locação ou aquisição"
    ),
    buildRow(
      "Logística e apoio operacional",
      "Logística",
      1,
      0,
      "Pendente",
      "Preencher conforme necessidade de execução contratual"
    ),
  ];

  return {
    id: buildTemplateId("service_composition"),
    title,
    description,
    category,
    status: DEFAULT_STATUS,
    modelType: "service_composition",
    updatedAt: nowIso(),
    contractReference: input.contractReference,
    contractingAgency: input.contractingAgency,
    unitName: input.unitName,
    lotName: input.lotName,
    referenceDate: input.referenceDate,
    headcount: Math.max(1, safeNumber(input.headcount, 1)),
    monthlyBaseValue: rows.reduce((sum, row) => sum + row.subtotal, 0),
    notes: input.notes,
    domainScenario: input.domainScenario,
    trainingProfile: buildTrainingProfile("service_composition", input.domainScenario),
    metadata: {
      versionNumber: 1,
      templateOrigin: "spreadsheet_template_factory",
      templateModelType: "service_composition",
      generatedAt: nowIso(),
      editorDraft: {
        contractingAgency: input.contractingAgency ?? "",
        contractReference: input.contractReference ?? "",
        unitName: input.unitName ?? "",
        lotName: input.lotName ?? "",
        referenceDate: input.referenceDate ?? "",
        municipality: input.municipality ?? "",
        state: input.state ?? "",
        cboCode: input.cboCode ?? "",
        professionalCategory: input.professionalCategory ?? "",
        cctReference: input.cctReference ?? "",
        taxRegime: input.taxRegime ?? "lucro_presumido",
        objectDescription: input.objectDescription ?? input.description ?? "",
        domainScenario: input.domainScenario ?? "",
        headcount: String(Math.max(1, safeNumber(input.headcount, 1))),
        monthlyBaseValue: String(rows.reduce((sum, row) => sum + row.subtotal, 0)),
        mainShift: input.mainShift ?? "",
        workScale: input.workScale ?? "",
        weeklyHours: String(safeNumber(input.weeklyHours, 44)),
        monthlyHours: String(safeNumber(input.monthlyHours, 220)),
        salaryBase: String(Math.max(0, safeNumber(input.salaryBase, 0))),
        nightAdditional: String(Math.max(0, safeNumber(input.nightAdditional, 0))),
        hazardAdditional: String(Math.max(0, safeNumber(input.hazardAdditional, 0))),
        mealAllowance: String(Math.max(0, safeNumber(input.mealAllowance, 0))),
        transportAllowance: String(Math.max(0, safeNumber(input.transportAllowance, 0))),
        mandatoryBenefitsNotes: input.mandatoryBenefitsNotes ?? "",
        notes: input.notes ?? "",
      },
      serviceCompositionSummary: {
        itemCount: rows.length,
        total: rows.reduce((sum, row) => sum + row.subtotal, 0),
        workforceTotal: rows
          .filter((row) => row.categoria === "Mão de obra")
          .reduce((sum, row) => sum + row.subtotal, 0),
        materialsTotal: rows
          .filter((row) => row.categoria === "Insumos")
          .reduce((sum, row) => sum + row.subtotal, 0),
        equipmentTotal: rows
          .filter((row) => row.categoria === "Equipamentos")
          .reduce((sum, row) => sum + row.subtotal, 0),
        logisticsTotal: rows
          .filter((row) => row.categoria === "Logística")
          .reduce((sum, row) => sum + row.subtotal, 0),
      },
    },
    rows,
  };
}

function buildFallbackTemplate(
  input: SpreadsheetTemplateFactoryInput
): SpreadsheetTemplateRecord {
  const title = safeString(input.title) || "Planilha de custos";
  const description =
    safeString(input.description) ||
    "Estrutura inicial genérica gerada automaticamente pelo sistema.";
  const category = safeString(input.category) || "Planilha de custos públicas";

  const rows: SpreadsheetTemplateRow[] = [
    buildRow("Item inicial", "Estrutura base", 1, 0, "Pendente", "Preencher conforme objeto"),
  ];

  return {
    id: buildTemplateId(input.modelType),
    title,
    description,
    category,
    status: DEFAULT_STATUS,
    modelType: input.modelType,
    updatedAt: nowIso(),
    contractReference: input.contractReference,
    contractingAgency: input.contractingAgency,
    unitName: input.unitName,
    lotName: input.lotName,
    referenceDate: input.referenceDate,
    headcount: Math.max(1, safeNumber(input.headcount, 1)),
    monthlyBaseValue: rows.reduce((sum, row) => sum + row.subtotal, 0),
    notes: input.notes,
    domainScenario: input.domainScenario,
    trainingProfile: buildTrainingProfile(input.modelType, input.domainScenario),
    metadata: {
      versionNumber: 1,
      templateOrigin: "spreadsheet_template_factory",
      templateModelType: input.modelType,
      generatedAt: nowIso(),
    },
    rows,
  };
}

export function createSpreadsheetTemplate(
  input: SpreadsheetTemplateFactoryInput
): SpreadsheetTemplateRecord {
  switch (input.modelType) {
    case "dedicated_labor":
      return buildDedicatedLaborTemplate(input);
    case "service_composition":
      return buildServiceCompositionTemplate(input);
    case "non_dedicated_labor":
    case "economic_rebalance":
    default:
      return buildFallbackTemplate(input);
  }
}

export default createSpreadsheetTemplate;
