import React from "react";
import { Card, CardContent, Stack, Typography, Chip } from "@mui/material";
import { SpreadsheetRecord } from "../../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
};

export default function EconomicRebalanceEditor({ spreadsheet }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Editor — Repactuação, reajuste e revisão
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Este editor será usado para análise comparativa entre base anterior e
            nova composição, destacando eventos modificadores, itens impactados,
            variações percentuais e saldo de reequilíbrio.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Base anterior" />
            <Chip label="Evento modificador" />
            <Chip label="Itens impactados" />
            <Chip label="Variação percentual" />
            <Chip label="Síntese do reequilíbrio" />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Planilha atual: <strong>{spreadsheet.title}</strong>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
