import React from "react";
import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import type { LaborResult } from "../utils/laborCostCalculator";

type Props = {
  result: LaborResult | null | undefined;
  title?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export default function LaborCostBreakdown({
  result,
  title = "Composição do custo trabalhista",
}: Props) {
  if (!result) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Nenhum detalhamento trabalhista disponível no momento.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2.25}>
          <Stack spacing={0.75}>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Visualização consolidada da base salarial, encargos patronais,
              provisões e benefícios parametrizados do módulo de mão de obra.
            </Typography>
          </Stack>

          <Divider />

          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 1.5,
            }}
          >
            <Stack
              spacing={0.4}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#F8F4FB",
                border: "1px solid rgba(91, 58, 122, 0.10)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Quantidade total
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {result.quantity}
              </Typography>
            </Stack>

            <Stack
              spacing={0.4}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#F8F4FB",
                border: "1px solid rgba(91, 58, 122, 0.10)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Base salarial total
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatCurrency(result.salaryBaseTotal)}
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              Encargos e provisões
            </Typography>

            <Typography variant="body2">
              INSS patronal ({formatPercent(result.config.employerInssRate)}%):{" "}
              <strong>{formatCurrency(result.employerInss)}</strong>
            </Typography>

            <Typography variant="body2">
              FGTS ({formatPercent(result.config.fgtsRate)}%):{" "}
              <strong>{formatCurrency(result.fgts)}</strong>
            </Typography>

            <Typography variant="body2">
              RAT / GILRAT ({formatPercent(result.config.ratRate)}%):{" "}
              <strong>{formatCurrency(result.rat)}</strong>
            </Typography>

            <Typography variant="body2">
              Terceiros ({formatPercent(result.config.thirdPartyRate)}%):{" "}
              <strong>{formatCurrency(result.thirdPartyCharges)}</strong>
            </Typography>

            <Typography variant="body2">
              Provisão de férias ({formatPercent(result.config.vacationProvisionRate)}%):{" "}
              <strong>{formatCurrency(result.feriasProvision)}</strong>
            </Typography>

            <Typography variant="body2">
              Provisão de 13º salário ({formatPercent(result.config.thirteenthProvisionRate)}%):{" "}
              <strong>{formatCurrency(result.thirteenthProvision)}</strong>
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              Benefícios
            </Typography>

            <Typography variant="body2">
              Vale-transporte: <strong>{formatCurrency(result.valeTransporte)}</strong>
            </Typography>

            <Typography variant="body2">
              Vale-alimentação: <strong>{formatCurrency(result.valeAlimentacao)}</strong>
            </Typography>

            <Typography variant="body2">
              Outros benefícios: <strong>{formatCurrency(result.otherBenefits)}</strong>
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="body2">
              Total de encargos: <strong>{formatCurrency(result.totalEncargos)}</strong>
            </Typography>

            <Typography variant="body2">
              Total de benefícios: <strong>{formatCurrency(result.totalBenefits)}</strong>
            </Typography>

            <Typography variant="h6" fontWeight={800}>
              Custo total: {formatCurrency(result.custoTotal)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
