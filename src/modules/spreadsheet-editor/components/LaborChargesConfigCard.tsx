import React from "react";
import { Box, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import type { LaborChargesConfig } from "../utils/laborCostCalculator";

type Props = {
  config: LaborChargesConfig;
  onChange: (next: LaborChargesConfig) => void;
  title?: string;
};

function parseInput(value: string, fallback = 0): number {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function LaborChargesConfigCard({
  config,
  onChange,
  title = "Parâmetros de encargos e benefícios",
}: Props) {
  function updateField<K extends keyof LaborChargesConfig>(
    field: K,
    value: string
  ) {
    onChange({
      ...config,
      [field]: parseInput(value, 0),
    });
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack spacing={0.75}>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Estes parâmetros alimentam o cálculo derivado de encargos patronais,
              provisões e benefícios do módulo de dedicação exclusiva.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <TextField
              label="INSS patronal (%)"
              type="number"
              value={config.employerInssRate}
              onChange={(event) =>
                updateField("employerInssRate", event.target.value)
              }
              inputProps={{ step: 0.01, min: 0 }}
              fullWidth
            />

            <TextField
              label="FGTS (%)"
              type="number"
              value={config.fgtsRate}
              onChange={(event) =>
                updateField("fgtsRate", event.target.value)
              }
              inputProps={{ step: 0.01, min: 0 }}
              fullWidth
            />

            <TextField
              label="RAT / GILRAT (%)"
              type="number"
              value={config.ratRate}
              onChange={(event) =>
                updateField("ratRate", event.target.value)
              }
              inputProps={{ step: 0.01, min: 0 }}
              fullWidth
            />

            <TextField
              label="Terceiros (%)"
              type="number"
              value={config.thirdPartyRate}
              onChange={(event) =>
                updateField("thirdPartyRate", event.target.value)
              }
              inputProps={{ step: 0.01, min: 0 }}
              fullWidth
            />

            <TextField
              label="Provisão de férias (%)"
              type="number"
              value={config.vacationProvisionRate}
              onChange={(event) =>
                updateField("vacationProvisionRate", event.target.value)
              }
              inputProps={{ step: 0.01, min: 0 }}
              fullWidth
            />

            <TextField
              label="Provisão de 13º (%)"
              type="number"
              value={config.thirteenthProvisionRate}
              onChange={(event) =>
                updateField("thirteenthProvisionRate", event.target.value)
              }
              inputProps={{ step: 0.01, min: 0 }}
              fullWidth
            />

            <TextField
              label="Vale-transporte por empregado"
              type="number"
              value={config.valeTransportePerEmployee}
              onChange={(event) =>
                updateField("valeTransportePerEmployee", event.target.value)
              }
              inputProps={{ step: 0.01, min: 0 }}
              fullWidth
            />

            <TextField
              label="Vale-alimentação por empregado"
              type="number"
              value={config.valeAlimentacaoPerEmployee}
              onChange={(event) =>
                updateField("valeAlimentacaoPerEmployee", event.target.value)
              }
              inputProps={{ step: 0.01, min: 0 }}
              fullWidth
            />

            <TextField
              label="Outros benefícios por empregado"
              type="number"
              value={config.otherBenefitsPerEmployee}
              onChange={(event) =>
                updateField("otherBenefitsPerEmployee", event.target.value)
              }
              inputProps={{ step: 0.01, min: 0 }}
              fullWidth
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
