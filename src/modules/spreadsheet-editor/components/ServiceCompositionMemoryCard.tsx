import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { ServiceCompositionMemoryItem } from "../utils/serviceCompositionCalculator";

type Props = {
  items: ServiceCompositionMemoryItem[];
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function labelFromDemandType(demandType: string) {
  switch (demandType) {
    case "recorrente":
      return "Recorrente";
    case "eventual":
      return "Eventual";
    case "sob_demanda":
      return "Sob demanda";
    case "nao_informado":
      return "Não informado";
    default:
      return demandType || "Não informado";
  }
}

function labelFromDepreciation(criteria: string) {
  switch (criteria) {
    case "rateio_linear":
      return "Rateio linear";
    case "nao_aplica":
      return "Não se aplica";
    default:
      return criteria || "Não informado";
  }
}

export default function ServiceCompositionMemoryCard({ items }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Memória de cálculo auditável
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              Demonstração item a item da memória técnica registrada, incluindo
              categoria, recorrência, periodicidade, fatores de cálculo, base de
              consumo e justificativa técnica.
            </Typography>
          </Box>

          <Divider />

          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum item disponível para exibir memória de cálculo.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {items.map((item) => (
                <Card key={String(item.rowId)} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={1}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>
                            {item.item}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.category}
                          </Typography>
                        </Box>

                        <Typography variant="subtitle1" fontWeight={800}>
                          {money(item.subtotal)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={`Recorrência: ${labelFromDemandType(item.demandType)}`}
                        />
                        <Chip
                          size="small"
                          label={`Periodicidade: ${item.periodicity || "Não informada"}`}
                        />
                        <Chip
                          size="small"
                          label={`Unidade: ${item.serviceUnit || "Não informada"}`}
                        />
                        <Chip
                          size="small"
                          label={`Depreciação: ${labelFromDepreciation(
                            item.depreciationCriteria
                          )}`}
                        />
                      </Stack>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                          gap: 1.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Quantidade: <strong>{item.quantity}</strong>
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Custo unitário: <strong>{money(item.unitCost)}</strong>
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Fator produtividade:{" "}
                          <strong>{item.productivityFactor}</strong>
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Fator mensal: <strong>{item.monthlyFactor}</strong>
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Status: <strong>{item.status || "Não informado"}</strong>
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Origem: <strong>{item.source || "Não informada"}</strong>
                        </Typography>
                      </Box>

                      {item.memoryText ? (
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            Memória de cálculo
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.memoryText}
                          </Typography>
                        </Box>
                      ) : null}

                      {item.consumptionBase ? (
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            Base de consumo
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.consumptionBase}
                          </Typography>
                        </Box>
                      ) : null}

                      {item.technicalJustification ? (
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            Justificativa técnica
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.technicalJustification}
                          </Typography>
                        </Box>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
