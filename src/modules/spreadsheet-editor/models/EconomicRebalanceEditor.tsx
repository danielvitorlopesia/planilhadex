import React from "react";
import { Card, CardContent, Stack, Typography, Chip } from "@mui/material";
import { SpreadsheetRecord } from "../../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
  onSpreadsheetUpdated?: (spreadsheet: SpreadsheetRecord) => void;
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
            nova composição, com destaque para itens impactados e variação econômica.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Base anterior" />
            <Chip label="Evento modificador" />
            <Chip label="Itens impactados" />
            <Chip label="Variação percentual" />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Planilha atual: <strong>{spreadsheet.title}</strong>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
