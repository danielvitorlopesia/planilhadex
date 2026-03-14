import React from "react";
import { Card, CardContent, Stack, Typography, Chip } from "@mui/material";
import { SpreadsheetRecord } from "../../../services/spreadsheetService";

type Props = {
  spreadsheet: SpreadsheetRecord;
};

export default function DedicatedLaborEditor({ spreadsheet }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Editor — Terceirização com dedicação exclusiva
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Este editor será a base da PCFP para serviços contínuos com dedicação
            exclusiva de mão de obra, em alinhamento com a lógica normativa e com
            a futura memória de cálculo do sistema.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Mão de obra" />
            <Chip label="Encargos sociais" />
            <Chip label="Benefícios" />
            <Chip label="Insumos mínimos" />
            <Chip label="Custos indiretos" />
            <Chip label="Tributos e lucro" />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Planilha atual: <strong>{spreadsheet.title}</strong>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
