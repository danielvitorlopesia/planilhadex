import React from "react";
import { Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import type {
  ServiceCompositionTechnicalReadout,
  ServiceCompositionMemoryBundleItem,
} from "../utils/technicalReadoutBuilder";

type Props = {
  title?: string;
  readout: ServiceCompositionTechnicalReadout | null | undefined;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function hasPositiveValue(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function BundleItemRow({
  item,
}: {
  item: ServiceCompositionMemoryBundleItem;
}) {
  return (
    <Stack
      spacing={0.75}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: "1px solid rgba(91, 58, 122, 0.10)",
        backgroundColor: "#FCFAFD",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Typography variant="body2" fontWeight={700} color="#241B3A">
          {item.serviceUnit || "Item sem identificação"}
        </Typography>

        <Typography variant="body2" fontWeight={700} color="#241B3A">
          {formatCurrency(item.subtotal)}
        </Typography>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Periodicidade: {item.periodicity || "Não informada"}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Quantidade: {formatNumber(item.quantity)} • Custo unitário:{" "}
        {formatCurrency(item.unitCost)}
      </Typography>

      {(hasPositiveValue(item.productivityFactor) ||
        hasPositiveValue(item.monthlyizationFactor) ||
        hasPositiveValue(item.allocationFactor)) && (
        <Typography variant="caption" color="text.secondary">
          Produtividade: {formatNumber(item.productivityFactor)} •
          Mensalização: {formatNumber(item.monthlyizationFactor)} •
          Alocação: {formatNumber(item.allocationFactor)}
        </Typography>
      )}

      {(item.depreciationMethod || hasPositiveValue(item.depreciationFactor) || hasPositiveValue(item.usefulLifeMonths)) && (
        <Typography variant="caption" color="text.secondary">
          Depreciação: {item.depreciationMethod || "—"} • Fator:{" "}
          {formatNumber(item.depreciationFactor)} • Vida útil:{" "}
          {formatNumber(item.usefulLifeMonths)} mês(es)
        </Typography>
      )}

      {item.consumptionBasis ? (
        <Typography variant="caption" color="text.secondary">
          Base de consumo: {item.consumptionBasis}
        </Typography>
      ) : null}

      {item.formula ? (
        <Typography variant="caption" color="text.secondary">
          Fórmula / memória: {item.formula}
        </Typography>
      ) : null}

      {item.technicalJustification ? (
        <Typography variant="caption" color="text.secondary">
          Justificativa técnica: {item.technicalJustification}
        </Typography>
      ) : null}
    </Stack>
  );
}

export default function TechnicalReadoutCard({
  title = "Leitura técnica da composição",
  readout,
}: Props) {
  const summary = readout?.summary;
  const bundle = Array.isArray(readout?.bundle) ? readout?.bundle : [];
  const highlights = Array.isArray(readout?.highlights) ? readout?.highlights : [];
  const alerts = Array.isArray(readout?.alerts) ? readout?.alerts : [];

  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack spacing={0.75}>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Consolidação técnica da composição de serviços, com síntese econômica,
              memória-base dos itens e sinais relevantes para leitura analítica.
            </Typography>
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Itens: ${summary?.itemCount ?? 0}`}
              variant="outlined"
            />
            <Chip
              label={`Total: ${formatCurrency(summary?.total ?? 0)}`}
              variant="outlined"
            />
            <Chip
              label={`Mão de obra: ${formatCurrency(summary?.workforceTotal ?? 0)}`}
              variant="outlined"
            />
            <Chip
              label={`Materiais: ${formatCurrency(summary?.materialsTotal ?? 0)}`}
              variant="outlined"
            />
            <Chip
              label={`Equipamentos: ${formatCurrency(summary?.equipmentTotal ?? 0)}`}
              variant="outlined"
            />
          </Stack>

          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 1.5,
            }}
          >
            <Stack
              spacing={0.5}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#F8F4FB",
                border: "1px solid rgba(91, 58, 122, 0.10)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Logística
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatCurrency(summary?.logisticsTotal ?? 0)}
              </Typography>
            </Stack>

            <Stack
              spacing={0.5}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#F8F4FB",
                border: "1px solid rgba(91, 58, 122, 0.10)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Apoio / suporte
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatCurrency(summary?.supportTotal ?? 0)}
              </Typography>
            </Stack>

            <Stack
              spacing={0.5}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#F8F4FB",
                border: "1px solid rgba(91, 58, 122, 0.10)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Itens recorrentes
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatCurrency(summary?.recurringTotal ?? 0)}
              </Typography>
            </Stack>

            <Stack
              spacing={0.5}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#F8F4FB",
                border: "1px solid rgba(91, 58, 122, 0.10)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Itens eventuais
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatCurrency(summary?.eventualTotal ?? 0)}
              </Typography>
            </Stack>
          </Stack>

          {highlights.length > 0 ? (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Destaques
                </Typography>

                <Stack spacing={0.75}>
                  {highlights.map((item, index) => (
                    <Typography key={`${item}-${index}`} variant="body2" color="text.secondary">
                      • {item}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </>
          ) : null}

          {alerts.length > 0 ? (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2" fontWeight={700} color="#AD1457">
                  Alertas
                </Typography>

                <Stack spacing={0.75}>
                  {alerts.map((item, index) => (
                    <Typography key={`${item}-${index}`} variant="body2" color="text.secondary">
                      • {item}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </>
          ) : null}

          <Divider />

          <Stack spacing={1.25}>
            <Typography variant="subtitle2" fontWeight={700}>
              Memória técnica resumida
            </Typography>

            {bundle.length > 0 ? (
              <Stack spacing={1}>
                {bundle.map((item, index) => (
                  <BundleItemRow
                    key={`${item.serviceUnit}-${index}-${item.subtotal}`}
                    item={item}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhuma memória técnica estruturada foi encontrada para esta composição.
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
