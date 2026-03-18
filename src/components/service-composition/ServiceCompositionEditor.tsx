import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";

export type ServiceCompositionRow = {
  id: string;
  item: string;
  categoria: string;
  tipoDemanda: string;
  quantidade: number;
  valorUnitario: number;
  unidade?: string;
  periodicidade?: string;
};

type Props = {
  rows: ServiceCompositionRow[];
  onChange: (rows: ServiceCompositionRow[]) => void;
};

const CATEGORY_OPTIONS = [
  "Materiais e insumos",
  "Equipamentos",
  "Logística",
  "Apoio operacional",
  "EPIs / uniformes",
  "Consumo",
];

const DEMAND_OPTIONS = [
  "Recorrente",
  "Eventual",
  "Sob demanda",
  "Não informado",
];

function createEmptyRow(category: string): ServiceCompositionRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    item: "",
    categoria: category,
    tipoDemanda: "Não informado",
    quantidade: 1,
    valorUnitario: 0,
    unidade: "",
    periodicidade: "",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function ChipLike({ label }: { label: string }) {
  return (
    <Box
      sx={{
        px: 1.4,
        py: 0.7,
        borderRadius: 999,
        border: "1px solid #D8CCE6",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, color: "#4A3A60" }}>
        {label}
      </Typography>
    </Box>
  );
}

function SummaryMiniCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={800}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ServiceCompositionEditor({ rows, onChange }: Props) {
  function updateRow(
    id: string,
    field: keyof ServiceCompositionRow,
    value: string | number
  ) {
    const nextRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    onChange(nextRows);
  }

  function addRow(category: string) {
    onChange([...rows, createEmptyRow(category)]);
  }

  function removeRow(id: string) {
    onChange(rows.filter((row) => row.id !== id));
  }

  const totals = rows.reduce(
    (acc, row) => {
      const subtotal = Number(row.quantidade || 0) * Number(row.valorUnitario || 0);

      if (row.categoria === "Materiais e insumos") acc.materials += subtotal;
      else if (row.categoria === "Equipamentos") acc.equipment += subtotal;
      else if (row.categoria === "Logística") acc.logistics += subtotal;
      else if (row.categoria === "Apoio operacional") acc.support += subtotal;
      else if (row.categoria === "EPIs / uniformes") acc.epis += subtotal;
      else if (row.categoria === "Consumo") acc.consumption += subtotal;

      acc.total += subtotal;
      return acc;
    },
    {
      materials: 0,
      equipment: 0,
      logistics: 0,
      support: 0,
      epis: 0,
      consumption: 0,
      total: 0,
    }
  );

  const actionButtonSx = {
    width: "100%",
    minHeight: 56,
    justifyContent: "flex-start",
    px: 2.25,
    borderRadius: 3,
    textTransform: "none" as const,
    fontWeight: 700,
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: "rgba(142, 90, 181, 0.18)",
        background:
          "linear-gradient(180deg, rgba(253,251,255,1) 0%, rgba(248,243,252,1) 100%)",
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", xl: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", xl: "flex-start" }}
            spacing={2}
          >
            <Box sx={{ maxWidth: 560 }}>
              <Typography variant="h6" fontWeight={700}>
                Editor — Serviços por composição
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Este bloco opera com cálculo estruturado, classificação por natureza
                do custo, persistência da memória técnica e snapshot automático antes
                do salvamento de alterações relevantes.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.5,
                width: { xs: "100%", xl: 520 },
                flexShrink: 0,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Inventory2OutlinedIcon />}
                sx={actionButtonSx}
                onClick={() => addRow("Materiais e insumos")}
              >
                Adicionar material
              </Button>

              <Button
                variant="outlined"
                startIcon={<PrecisionManufacturingOutlinedIcon />}
                sx={actionButtonSx}
                onClick={() => addRow("Equipamentos")}
              >
                Adicionar equipamento
              </Button>

              <Button
                variant="outlined"
                startIcon={<LocalShippingOutlinedIcon />}
                sx={actionButtonSx}
                onClick={() => addRow("Logística")}
              >
                Adicionar logística
              </Button>

              <Button
                variant="outlined"
                startIcon={<SupportAgentOutlinedIcon />}
                sx={actionButtonSx}
                onClick={() => addRow("Apoio operacional")}
              >
                Adicionar apoio
              </Button>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <ChipLike label={`Itens: ${rows.length}`} />
            <ChipLike label={`Materiais/insumos: ${formatCurrency(totals.materials)}`} />
            <ChipLike label={`Equipamentos: ${formatCurrency(totals.equipment)}`} />
            <ChipLike label={`Logística: ${formatCurrency(totals.logistics)}`} />
            <ChipLike label={`Apoio operacional: ${formatCurrency(totals.support)}`} />
            <ChipLike label={`EPIs/uniformes: ${formatCurrency(totals.epis)}`} />
            <ChipLike label={`Consumo: ${formatCurrency(totals.consumption)}`} />
            <ChipLike label={`Total do módulo: ${formatCurrency(totals.total)}`} />
          </Stack>

          <Box sx={{ overflowX: "auto" }}>
            <Box
              sx={{
                minWidth: 1180,
                display: "grid",
                gap: 1.25,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.4fr 1.2fr 0.8fr 1fr 0.9fr 1fr 0.8fr",
                  gap: 1,
                  px: 0.5,
                }}
              >
                <Typography variant="caption" fontWeight={700}>
                  Item
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  Categoria
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  Tipo de demanda
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  Qtd.
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  Valor unitário
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  Unidade
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  Periodicidade
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  Ação
                </Typography>
              </Box>

              {rows.length > 0 ? (
                rows.map((row) => (
                  <Box
                    key={row.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "2fr 1.4fr 1.2fr 0.8fr 1fr 0.9fr 1fr 0.8fr",
                      gap: 1,
                      p: 1,
                      borderRadius: 2,
                      border: "1px solid #E7E0EF",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <TextField
                      size="small"
                      value={row.item}
                      onChange={(e) => updateRow(row.id, "item", e.target.value)}
                    />

                    <TextField
                      select
                      size="small"
                      value={row.categoria}
                      onChange={(e) => updateRow(row.id, "categoria", e.target.value)}
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      size="small"
                      value={row.tipoDemanda}
                      onChange={(e) => updateRow(row.id, "tipoDemanda", e.target.value)}
                    >
                      {DEMAND_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      size="small"
                      type="number"
                      value={row.quantidade}
                      onChange={(e) =>
                        updateRow(row.id, "quantidade", Number(e.target.value))
                      }
                    />

                    <TextField
                      size="small"
                      type="number"
                      value={row.valorUnitario}
                      onChange={(e) =>
                        updateRow(row.id, "valorUnitario", Number(e.target.value))
                      }
                    />

                    <TextField
                      size="small"
                      value={row.unidade || ""}
                      onChange={(e) => updateRow(row.id, "unidade", e.target.value)}
                    />

                    <TextField
                      size="small"
                      value={row.periodicidade || ""}
                      onChange={(e) =>
                        updateRow(row.id, "periodicidade", e.target.value)
                      }
                    />

                    <Button
                      color="error"
                      variant="text"
                      onClick={() => removeRow(row.id)}
                    >
                      Remover
                    </Button>
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px dashed #D6CBE3",
                    backgroundColor: "#FCFAFD",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Nenhum item adicionado ainda. Use os botões acima para começar a compor o módulo.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

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
            <SummaryMiniCard
              title="Materiais e insumos"
              value={formatCurrency(totals.materials)}
            />
            <SummaryMiniCard
              title="Equipamentos"
              value={formatCurrency(totals.equipment)}
            />
            <SummaryMiniCard
              title="Logística"
              value={formatCurrency(totals.logistics)}
            />
            <SummaryMiniCard
              title="Apoio operacional"
              value={formatCurrency(totals.support)}
            />
            <SummaryMiniCard
              title="EPIs e uniformes"
              value={formatCurrency(totals.epis)}
            />
            <SummaryMiniCard
              title="Materiais de consumo"
              value={formatCurrency(totals.consumption)}
            />
            <SummaryMiniCard
              title="Recorrente / eventual / sob demanda"
              value="Conforme classificação"
            />
            <SummaryMiniCard
              title="Total da composição"
              value={formatCurrency(totals.total)}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
