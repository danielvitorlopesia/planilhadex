import React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";

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

type LaborCostBreakdown = {
  headcount?: number;
  salaryBaseTotal?: number;
  mandatoryBenefitsTotal?: number;
  additionalTotal?: number;
  monthlyLaborTotal?: number;
  mealAllowanceTotal?: number;
  transportAllowanceTotal?: number;
};

type VersionDescriptor = {
  label: string;
  origin?: string;
  createdAt?: string;
};

type DedicatedLaborComparisonData = {
  versionA?: VersionDescriptor | null;
  versionB?: VersionDescriptor | null;
  laborA?: LaborCostBreakdown | null;
  laborB?: LaborCostBreakdown | null;
  chargesConfigA?: LaborChargesConfig | null;
  chargesConfigB?: LaborChargesConfig | null;
};

type Props = {
  title?: string;
  data?: DedicatedLaborComparisonData | null;
  emptyMessage?: string;
};

type MetricDelta = {
  label: string;
  previousValue: number;
  currentValue: number;
  delta: number;
};

type ConfigDelta = {
  label: string;
  previousValue: number;
  currentValue: number;
  delta: number;
};

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatPercentage(value: number) {
  return `${value.toFixed(2)}%`;
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

function MetricCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={0.75}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={800} color="#241B3A">
            {value}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function VersionCard({
  title,
  version,
}: {
  title: string;
  version?: VersionDescriptor | null;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={800}>
            {title}
          </Typography>

          <Typography variant="body1" fontWeight={700}>
            {version?.label || "Versão não informada"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Origem: {getOriginLabel(version?.origin)}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Data: {formatDateTime(version?.createdAt)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DeltaRow({
  label,
  previousValue,
  currentValue,
  format = "currency",
}: {
  label: string;
  previousValue: number;
  currentValue: number;
  format?: "currency" | "number" | "percentage";
}) {
  const delta = currentValue - previousValue;
  const isPositive = delta >= 0;

  const render = (value: number) => {
    if (format === "currency") return formatCurrency(value);
    if (format === "percentage") return formatPercentage(value);
    return String(value);
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: "1px solid #ECE7F1",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Stack spacing={0.65}>
        <Typography variant="body2" fontWeight={700}>
          {label}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Antes: {render(previousValue)}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Depois: {render(currentValue)}
        </Typography>

        <Typography
          variant="body2"
          fontWeight={800}
          color={isPositive ? "#2E7D32" : "#C62828"}
        >
          {isPositive ? "+" : ""}
          {render(delta)}
        </Typography>
      </Stack>
    </Box>
  );
}

function buildMetricDeltas(
  laborA?: LaborCostBreakdown | null,
  laborB?: LaborCostBreakdown | null
): MetricDelta[] {
  return [
    {
      label: "Quantidade de postos",
      previousValue: toNumber(laborA?.headcount),
      currentValue: toNumber(laborB?.headcount),
      delta: toNumber(laborB?.headcount) - toNumber(laborA?.headcount),
    },
    {
      label: "Salário-base total",
      previousValue: toNumber(laborA?.salaryBaseTotal),
      currentValue: toNumber(laborB?.salaryBaseTotal),
      delta:
        toNumber(laborB?.salaryBaseTotal) - toNumber(laborA?.salaryBaseTotal),
    },
    {
      label: "Benefícios obrigatórios",
      previousValue: toNumber(laborA?.mandatoryBenefitsTotal),
      currentValue: toNumber(laborB?.mandatoryBenefitsTotal),
      delta:
        toNumber(laborB?.mandatoryBenefitsTotal) -
        toNumber(laborA?.mandatoryBenefitsTotal),
    },
    {
      label: "Adicionais",
      previousValue: toNumber(laborA?.additionalTotal),
      currentValue: toNumber(laborB?.additionalTotal),
      delta: toNumber(laborB?.additionalTotal) - toNumber(laborA?.additionalTotal),
    },
    {
      label: "Auxílio-alimentação total",
      previousValue: toNumber(laborA?.mealAllowanceTotal),
      currentValue: toNumber(laborB?.mealAllowanceTotal),
      delta:
        toNumber(laborB?.mealAllowanceTotal) -
        toNumber(laborA?.mealAllowanceTotal),
    },
    {
      label: "Vale-transporte total",
      previousValue: toNumber(laborA?.transportAllowanceTotal),
      currentValue: toNumber(laborB?.transportAllowanceTotal),
      delta:
        toNumber(laborB?.transportAllowanceTotal) -
        toNumber(laborA?.transportAllowanceTotal),
    },
    {
      label: "Total laboral mensal",
      previousValue: toNumber(laborA?.monthlyLaborTotal),
      currentValue: toNumber(laborB?.monthlyLaborTotal),
      delta:
        toNumber(laborB?.monthlyLaborTotal) - toNumber(laborA?.monthlyLaborTotal),
    },
  ];
}

function buildConfigDeltas(
  configA?: LaborChargesConfig | null,
  configB?: LaborChargesConfig | null
): ConfigDelta[] {
  return [
    {
      label: "FGTS",
      previousValue: toNumber(configA?.fgtsRate),
      currentValue: toNumber(configB?.fgtsRate),
      delta: toNumber(configB?.fgtsRate) - toNumber(configA?.fgtsRate),
    },
    {
      label: "INSS",
      previousValue: toNumber(configA?.inssRate),
      currentValue: toNumber(configB?.inssRate),
      delta: toNumber(configB?.inssRate) - toNumber(configA?.inssRate),
    },
    {
      label: "Provisão de férias",
      previousValue: toNumber(configA?.vacationProvisionRate),
      currentValue: toNumber(configB?.vacationProvisionRate),
      delta:
        toNumber(configB?.vacationProvisionRate) -
        toNumber(configA?.vacationProvisionRate),
    },
    {
      label: "Provisão de 13º",
      previousValue: toNumber(configA?.thirteenthSalaryRate),
      currentValue: toNumber(configB?.thirteenthSalaryRate),
      delta:
        toNumber(configB?.thirteenthSalaryRate) -
        toNumber(configA?.thirteenthSalaryRate),
    },
    {
      label: "Provisão rescisória",
      previousValue: toNumber(configA?.terminationProvisionRate),
      currentValue: toNumber(configB?.terminationProvisionRate),
      delta:
        toNumber(configB?.terminationProvisionRate) -
        toNumber(configA?.terminationProvisionRate),
    },
    {
      label: "Outros encargos",
      previousValue: toNumber(configA?.otherChargesRate),
      currentValue: toNumber(configB?.otherChargesRate),
      delta:
        toNumber(configB?.otherChargesRate) - toNumber(configA?.otherChargesRate),
    },
    {
      label: "Encargo efetivo",
      previousValue: toNumber(configA?.effectiveChargesRate),
      currentValue: toNumber(configB?.effectiveChargesRate),
      delta:
        toNumber(configB?.effectiveChargesRate) -
        toNumber(configA?.effectiveChargesRate),
    },
    {
      label: "Total percentual",
      previousValue: toNumber(configA?.totalChargesPercentage),
      currentValue: toNumber(configB?.totalChargesPercentage),
      delta:
        toNumber(configB?.totalChargesPercentage) -
        toNumber(configA?.totalChargesPercentage),
    },
  ];
}

export default function DedicatedLaborComparisonPanel({
  title = "Comparação do bloco laboral",
  data,
  emptyMessage = "Não há dados suficientes para comparar o bloco laboral entre as versões selecionadas.",
}: Props) {
  if (!data?.versionA || !data?.versionB || (!data.laborA && !data.laborB)) {
    return (
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        {emptyMessage}
      </Alert>
    );
  }

  const metricDeltas = buildMetricDeltas(data.laborA, data.laborB);
  const configDeltas = buildConfigDeltas(data.chargesConfigA, data.chargesConfigB);

  const totalPrevious = toNumber(data.laborA?.monthlyLaborTotal);
  const totalCurrent = toNumber(data.laborB?.monthlyLaborTotal);
  const totalDelta = totalCurrent - totalPrevious;
  const isPositive = totalDelta >= 0;

  const changedConfigDeltas = configDeltas.filter((item) => item.delta !== 0);
  const changedMetricDeltas = metricDeltas.filter((item) => item.delta !== 0);

  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CompareArrowsOutlinedIcon sx={{ color: "#5E35B1" }} />
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Painel comparativo do eixo laboral entre duas versões da planilha,
            com leitura de quantitativos, salários, benefícios, adicionais,
            encargos parametrizados e impacto financeiro mensal.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <VersionCard title="Versão A" version={data.versionA} />
            <VersionCard title="Versão B" version={data.versionB} />
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip icon={<Groups2OutlinedIcon />} label="Comparação laboral ativa" variant="outlined" />
            <Chip
              icon={<ReceiptLongOutlinedIcon />}
              label="Encargos parametrizados"
              variant="outlined"
            />
            <Chip
              icon={<AttachMoneyOutlinedIcon />}
              label={`${data.versionA.label} → ${data.versionB.label}`}
              variant="outlined"
            />
          </Stack>

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
            <MetricCard
              label="Postos anteriores"
              value={toNumber(data.laborA?.headcount)}
            />
            <MetricCard
              label="Postos atuais"
              value={toNumber(data.laborB?.headcount)}
            />
            <MetricCard
              label="Total laboral anterior"
              value={formatCurrency(totalPrevious)}
            />
            <MetricCard
              label="Total laboral atual"
              value={formatCurrency(totalCurrent)}
            />
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: isPositive ? "#E7F6EC" : "#FDECEC",
              border: isPositive
                ? "1px solid rgba(46,125,50,0.18)"
                : "1px solid rgba(198,40,40,0.18)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              {isPositive ? (
                <TrendingUpOutlinedIcon sx={{ color: "#2E7D32" }} />
              ) : (
                <TrendingDownOutlinedIcon sx={{ color: "#C62828" }} />
              )}

              <Typography
                variant="body1"
                fontWeight={800}
                color={isPositive ? "#2E7D32" : "#C62828"}
              >
                {isPositive ? "O custo laboral aumentou" : "O custo laboral reduziu"} em{" "}
                {formatCurrency(Math.abs(totalDelta))}
              </Typography>
            </Stack>
          </Box>

          <Divider />

          <Stack spacing={1.25}>
            <Typography variant="h6" fontWeight={700}>
              Variação dos indicadores laborais
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {metricDeltas.map((item) => (
                <DeltaRow
                  key={item.label}
                  label={item.label}
                  previousValue={item.previousValue}
                  currentValue={item.currentValue}
                  format={item.label === "Quantidade de postos" ? "number" : "currency"}
                />
              ))}
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={1.25}>
            <Typography variant="h6" fontWeight={700}>
              Variação da configuração de encargos
            </Typography>

            {changedConfigDeltas.length > 0 ? (
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
                {changedConfigDeltas.map((item) => (
                  <DeltaRow
                    key={item.label}
                    label={item.label}
                    previousValue={item.previousValue}
                    currentValue={item.currentValue}
                    format="percentage"
                  />
                ))}
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Nenhuma alteração de configuração de encargos foi identificada entre as versões comparadas.
              </Alert>
            )}
          </Stack>

          <Divider />

          <Stack spacing={1.25}>
            <Typography variant="h6" fontWeight={700}>
              Leitura executiva do impacto laboral
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Foram identificadas <strong>{changedMetricDeltas.length}</strong> variações
              materiais no bloco laboral e <strong>{changedConfigDeltas.length}</strong>{" "}
              alterações relevantes na configuração de encargos.
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Esse painel já permite sustentar comparação técnica do eixo laboral,
              rastreabilidade de alterações e futura consolidação para repactuação,
              revisão e reequilíbrio.
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
