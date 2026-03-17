import React from "react";
import { Card, CardContent, Stack, Typography, Box } from "@mui/material";

type LaborBreakdown = {
  salaryBaseTotal?: number;
  employerInss?: number;
  fgts?: number;
  rat?: number;
  thirdPartyCharges?: number;
  feriasProvision?: number;
  thirteenthProvision?: number;
  valeTransporte?: number;
  valeAlimentacao?: number;
  otherBenefits?: number;
  total?: number;
  quantity?: number;
};

type Props = {
  versionA?: LaborBreakdown | null;
  versionB?: LaborBreakdown | null;
  labelA?: string;
  labelB?: string;
};

function currency(v?: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v || 0));
}

function diff(a?: number, b?: number) {
  return Number((Number(b || 0) - Number(a || 0)).toFixed(2));
}

function Metric({
  label,
  a,
  b,
}: {
  label: string;
  a?: number;
  b?: number;
}) {
  const delta = diff(a, b);

  return (
    <Box
      sx={{
        border: "1px solid #E0E0E0",
        borderRadius: 3,
        p: 2,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography variant="body2">
        A: <strong>{currency(a)}</strong>
      </Typography>

      <Typography variant="body2">
        B: <strong>{currency(b)}</strong>
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 0.5,
          color: delta >= 0 ? "#2E7D32" : "#C62828",
        }}
      >
        Δ {currency(delta)}
      </Typography>
    </Box>
  );
}

export default function LaborVersionComparisonPanel({
  versionA,
  versionB,
  labelA,
  labelB,
}: Props) {
  if (!versionA || !versionB) {
    return null;
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Comparação — Mão de obra
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {labelA} → {labelB}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3,1fr)",
              },
              gap: 2,
            }}
          >
            <Metric
              label="Salário base"
              a={versionA.salaryBaseTotal}
              b={versionB.salaryBaseTotal}
            />

            <Metric
              label="INSS patronal"
              a={versionA.employerInss}
              b={versionB.employerInss}
            />

            <Metric
              label="FGTS"
              a={versionA.fgts}
              b={versionB.fgts}
            />

            <Metric
              label="Encargos terceiros"
              a={versionA.thirdPartyCharges}
              b={versionB.thirdPartyCharges}
            />

            <Metric
              label="Provisão férias"
              a={versionA.feriasProvision}
              b={versionB.feriasProvision}
            />

            <Metric
              label="13º salário"
              a={versionA.thirteenthProvision}
              b={versionB.thirteenthProvision}
            />

            <Metric
              label="Vale transporte"
              a={versionA.valeTransporte}
              b={versionB.valeTransporte}
            />

            <Metric
              label="Vale alimentação"
              a={versionA.valeAlimentacao}
              b={versionB.valeAlimentacao}
            />

            <Metric
              label="Outros benefícios"
              a={versionA.otherBenefits}
              b={versionB.otherBenefits}
            />

            <Metric
              label="Total mensal"
              a={versionA.total}
              b={versionB.total}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
