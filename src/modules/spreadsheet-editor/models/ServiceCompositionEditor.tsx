import React from "react";
import { Card, CardContent, Stack, Typography, Chip } from "@mui/material";
import { SpreadsheetRecord } from "../../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
};

export default function ServiceCompositionEditor({ spreadsheet }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Editor — Serviços por composição
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Este editor será a base para serviços estruturados por equipes,
            materiais, equipamentos, logística e produtividade operacional,
            especialmente útil para limpeza, conservação e composições híbridas.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Equipes" />
            <Chip label="Materiais e insumos" />
            <Chip label="Equipamentos" />
            <Chip label="Produtividade" />
            <Chip label="Composição técnica" />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Planilha atual: <strong>{spreadsheet.title}</strong>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
