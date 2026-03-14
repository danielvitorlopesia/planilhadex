import React from "react";
import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { LaborResult } from "../utils/laborCostCalculator";

type Props = {
  result: LaborResult;
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export default function LaborCostBreakdown({ result }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={700}>
            Composição do custo trabalhista
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Visualização consolidada dos salários, encargos e benefícios parametrizados.
          </Typography>

          <Divider />

          <Typography variant="body2">
            Salários: <strong>{money(result.salaryBaseTotal)}</strong>
          </Typography>

          <Typography variant="body2">
            INSS patronal: <strong>{money(result.employerInss)}</strong>
          </Typography>

          <Typography variant="body2">
            FGTS: <strong>{money(result.fgts)}</strong>
          </Typography>

          <Typography variant="body2">
            RAT / GILRAT: <strong>{money(result.rat)}</strong>
          </Typography>

          <Typography variant="body2">
            Terceiros: <strong>{money(result.thirdPartyCharges)}</strong>
          </Typography>

          <Typography variant="body2">
            Provisão de férias: <strong>{money(result.feriasProvision)}</strong>
          </Typography>

          <Typography variant="body2">
            Provisão de 13º salário: <strong>{money(result.thirteenthProvision)}</strong>
          </Typography>

          <Typography variant="body2">
            Vale-transporte: <strong>{money(result.valeTransporte)}</strong>
          </Typography>

          <Typography variant="body2">
            Vale-alimentação: <strong>{money(result.valeAlimentacao)}</strong>
          </Typography>

          <Typography variant="body2">
            Outros benefícios: <strong>{money(result.otherBenefits)}</strong>
          </Typography>

          <Divider />

          <Typography variant="body2">
            Total de encargos: <strong>{money(result.totalEncargos)}</strong>
          </Typography>

          <Typography variant="body2">
            Total de benefícios: <strong>{money(result.totalBenefits)}</strong>
          </Typography>

          <Typography variant="h6" fontWeight={800}>
            Custo total: {money(result.custoTotal)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
