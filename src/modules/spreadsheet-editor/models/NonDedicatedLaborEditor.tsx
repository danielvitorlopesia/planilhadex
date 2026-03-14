import React from "react";
import { Card, CardContent, Stack, Typography, Chip } from "@mui/material";
import { SpreadsheetRecord } from "../../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
  onSpreadsheetUpdated?: (spreadsheet: SpreadsheetRecord) => void;
};

export default function NonDedicatedLaborEditor({ spreadsheet }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Editor — Terceirização sem dedicação exclusiva
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Este editor será a base para serviços sem posto exclusivo permanente,
            com foco em unidades de serviço, parâmetros técnicos e composição agregada.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Unidades de serviço" />
            <Chip label="Equipe não exclusiva" />
            <Chip label="Materiais" />
            <Chip label="Equipamentos" />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Planilha atual: <strong>{spreadsheet.title}</strong>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
