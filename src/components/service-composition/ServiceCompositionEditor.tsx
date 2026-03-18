import React, { useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  MenuItem
} from "@mui/material";

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

const categorias = [
  "Materiais e insumos",
  "Equipamentos",
  "Logística",
  "Apoio operacional",
  "EPIs/uniformes",
  "Consumo"
];

export default function ServiceCompositionEditor({ rows, onChange }: Props) {
  function updateRow(id: string, field: keyof ServiceCompositionRow, value: any) {
    const updated = rows.map((r) =>
      r.id === id ? { ...r, [field]: value } : r
    );
    onChange(updated);
  }

  function addRow(categoria: string) {
    const newRow: ServiceCompositionRow = {
      id: crypto.randomUUID(),
      item: "",
      categoria,
      tipoDemanda: "Não informado",
      quantidade: 1,
      valorUnitario: 0
    };

    onChange([...rows, newRow]);
  }

  const total = useMemo(() => {
    return rows.reduce(
      (sum, r) => sum + (r.quantidade || 0) * (r.valorUnitario || 0),
      0
    );
  }, [rows]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Stack spacing={2}>

          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>
              Editor — Serviços por composição
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button onClick={() => addRow("Materiais e insumos")} variant="outlined">
                Adicionar material
              </Button>

              <Button onClick={() => addRow("Equipamentos")} variant="outlined">
                Adicionar equipamento
              </Button>

              <Button onClick={() => addRow("Logística")} variant="outlined">
                Adicionar logística
              </Button>

              <Button onClick={() => addRow("Apoio operacional")} variant="contained">
                Adicionar apoio
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Qtd.</th>
                  <th>Valor unitário</th>
                  <th>Unidade</th>
                  <th>Periodicidade</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <TextField
                        size="small"
                        value={row.item}
                        onChange={(e) =>
                          updateRow(row.id, "item", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <TextField
                        select
                        size="small"
                        value={row.categoria}
                        onChange={(e) =>
                          updateRow(row.id, "categoria", e.target.value)
                        }
                      >
                        {categorias.map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </TextField>
                    </td>

                    <td>
                      <TextField
                        size="small"
                        value={row.tipoDemanda}
                        onChange={(e) =>
                          updateRow(row.id, "tipoDemanda", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <TextField
                        type="number"
                        size="small"
                        value={row.quantidade}
                        onChange={(e) =>
                          updateRow(row.id, "quantidade", Number(e.target.value))
                        }
                      />
                    </td>

                    <td>
                      <TextField
                        type="number"
                        size="small"
                        value={row.valorUnitario}
                        onChange={(e) =>
                          updateRow(row.id, "valorUnitario", Number(e.target.value))
                        }
                      />
                    </td>

                    <td>
                      <TextField
                        size="small"
                        value={row.unidade || ""}
                        onChange={(e) =>
                          updateRow(row.id, "unidade", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <TextField
                        size="small"
                        value={row.periodicidade || ""}
                        onChange={(e) =>
                          updateRow(row.id, "periodicidade", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Typography fontWeight={700}>
            Total da composição: R$ {total.toLocaleString("pt-BR")}
          </Typography>

        </Stack>
      </CardContent>
    </Card>
  );
}
