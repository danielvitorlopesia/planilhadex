import React from "react";
import { Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { ServiceCompositionSummary } from "../utils/serviceCompositionCalculator";

type Props = {
  summary: ServiceCompositionSummary;
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1.5}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {money(value)}
      </Typography>
    </Stack>
  );
}

export default function ServiceCompositionSummaryCard({ summary }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Síntese da composição de serviços
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Consolidação por bloco operacional da composição atual.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Itens gerenciados
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {summary.itemCount}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Total da composição
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {money(summary.total)}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Divider />

          <SummaryLine
            label="Equipe técnica / operacional"
            value={summary.workforceTotal}
          />
          <SummaryLine
            label="Materiais e insumos"
            value={summary.materialsTotal}
          />
          <SummaryLine
            label="Equipamentos"
            value={summary.equipmentTotal}
          />
          <SummaryLine
            label="Logística operacional"
            value={summary.logisticsTotal}
          />
          <SummaryLine
            label="Apoio operacional"
            value={summary.supportTotal}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
