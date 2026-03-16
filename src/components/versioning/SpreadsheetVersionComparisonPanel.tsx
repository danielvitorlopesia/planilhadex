import React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";

type ComparisonSummary = {
  addedCount?: number;
  removedCount?: number;
  changedCount?: number;
  totalDelta?: number;
};

type ComparisonPayload = {
  summary?: ComparisonSummary;
};

type VersionDescriptor = {
  label: string;
  origin?: string;
  createdAt?: string;
};

type Props = {
  title?: string;
  versionA?: VersionDescriptor | null;
  versionB?: VersionDescriptor | null;
  comparison?: ComparisonPayload | null;
  emptyMessage?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDateTime(value?: string) {
  if (!value) {
    return "Não informado";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("pt-BR");
}

function getOriginLabel(origin?: string) {
  switch (origin) {
    case "auto_snapshot":
      return "Snapshot automático";
    case "manual_snapshot":
      return "Snapshot manual";
    case "pre_update":
      return "Pré-atualização";
    case "restore":
      return "Restauração";
    case "baseline":
      return "Baseline";
    case "api":
      return "API";
    case "local":
      return "Local";
    default:
      return origin || "Não informado";
  }
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={800} color="#241B3A">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function SpreadsheetVersionComparisonPanel({
  title = "Comparação entre versões",
  versionA,
  versionB,
  comparison,
  emptyMessage = "Não há dados suficientes para comparar as versões selecionadas.",
}: Props) {
  const summary = comparison?.summary;

  if (!comparison || !summary || !versionA || !versionB) {
    return (
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        {emptyMessage}
      </Alert>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: "rgba(21, 101, 192, 0.16)",
        background:
          "linear-gradient(180deg, rgba(238,246,253,1) 0%, rgba(255,255,255,1) 100%)",
      }}
    >
      <CardContent>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CompareArrowsOutlinedIcon sx={{ color: "#1565C0" }} />
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={800}>
                    Versão A
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {versionA.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Origem: {getOriginLabel(versionA.origin)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data: {formatDateTime(versionA.createdAt)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={800}>
                    Versão B
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {versionB.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Origem: {getOriginLabel(versionB.origin)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data: {formatDateTime(versionB.createdAt)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Leitura comparativa ativa" color="primary" variant="outlined" />
            <Chip label={`${versionA.label} → ${versionB.label}`} variant="outlined" />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <MetricCard label="Itens incluídos" value={summary.addedCount ?? 0} />
            <MetricCard label="Itens removidos" value={summary.removedCount ?? 0} />
            <MetricCard label="Itens alterados" value={summary.changedCount ?? 0} />
            <MetricCard
              label="Impacto financeiro"
              value={formatCurrency(Number(summary.totalDelta ?? 0))}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
