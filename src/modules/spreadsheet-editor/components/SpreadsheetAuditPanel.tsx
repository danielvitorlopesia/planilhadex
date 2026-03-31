import React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import {
  SpreadsheetAuditPanelData,
  AuditFinding,
} from "../utils/spreadsheetAuditAnalyzer";

type Props = {
  data: SpreadsheetAuditPanelData;
};

function severityLabel(severity: AuditFinding["severity"]) {
  switch (severity) {
    case "high":
      return "Alto";
    case "medium":
      return "Médio";
    default:
      return "Baixo";
  }
}

function severityColor(severity: AuditFinding["severity"]) {
  switch (severity) {
    case "high":
      return { bg: "#FDECEC", color: "#C62828" };
    case "medium":
      return { bg: "#FFF3E0", color: "#ED6C02" };
    default:
      return { bg: "#E7F6EC", color: "#2E7D32" };
  }
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={0.75}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            {value}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SpreadsheetAuditPanel({ data }: Props) {
  const hasFindings = data.findings.length > 0;

  return (
    <Card variant="outlined" sx={{ borderRadius: 4, minWidth: 0 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <FactCheckOutlinedIcon sx={{ color: "#5E35B1" }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Painel de Consistência e Auditoria Preliminar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Validação automática dos itens, da coerência financeira e dos indícios
                preliminares de risco técnico da planilha.
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(6, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <SummaryCard label="Itens analisados" value={data.summary.analyzedItems} />
            <SummaryCard label="Inconsistências" value={data.summary.findingsCount} />
            <SummaryCard label="Risco alto" value={data.summary.highRiskCount} />
            <SummaryCard label="Sem memória de cálculo" value={data.summary.undocumentedRows} />
            <SummaryCard label="Possíveis duplicidades" value={data.summary.duplicatedEconomicEntries} />
            <SummaryCard label="Índice de consistência" value={`${data.summary.consistencyScore}/100`} />
          </Box>

          {hasFindings ? (
            <>
              <Alert severity="warning" icon={<WarningAmberOutlinedIcon />}>
                Foram identificados indícios preliminares de inconsistência técnica que
                merecem conferência antes da conclusão analítica.
              </Alert>

              <Box sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 920 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Severidade</strong></TableCell>
                      <TableCell><strong>Categoria</strong></TableCell>
                      <TableCell><strong>Título</strong></TableCell>
                      <TableCell><strong>Descrição</strong></TableCell>
                      <TableCell><strong>Recomendação</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.findings.map((finding) => {
                      const tone = severityColor(finding.severity);
                      return (
                        <TableRow key={finding.id}>
                          <TableCell>
                            <Chip
                              size="small"
                              label={severityLabel(finding.severity)}
                              sx={{
                                backgroundColor: tone.bg,
                                color: tone.color,
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell>{finding.category}</TableCell>
                          <TableCell>{finding.title}</TableCell>
                          <TableCell>{finding.description}</TableCell>
                          <TableCell>{finding.recommendation || "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </>
          ) : (
            <Alert severity="success" icon={<VerifiedOutlinedIcon />}>
              Nenhuma inconsistência preliminar relevante foi detectada pelas regras atuais
              de auditoria automática.
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
