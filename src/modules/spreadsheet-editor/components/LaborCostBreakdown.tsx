import React from "react"
import { Card, CardContent, Typography, Stack } from "@mui/material"
import { LaborResult } from "../utils/laborCostCalculator"

type Props = {
  result: LaborResult
}

function money(v:number){
  return new Intl.NumberFormat("pt-BR",{
    style:"currency",
    currency:"BRL"
  }).format(v)
}

export default function LaborCostBreakdown({result}:Props){

  return (
    <Card variant="outlined">
      <CardContent>

        <Typography variant="h6">
          Composição do custo trabalhista
        </Typography>

        <Stack spacing={1} mt={2}>

          <Typography>
            Salários: {money(result.salarioTotal)}
          </Typography>

          <Typography>
            INSS: {money(result.inss)}
          </Typography>

          <Typography>
            FGTS: {money(result.fgts)}
          </Typography>

          <Typography>
            Férias: {money(result.ferias)}
          </Typography>

          <Typography>
            13º salário: {money(result.decimoTerceiro)}
          </Typography>

          <Typography fontWeight={700}>
            Custo total: {money(result.custoTotal)}
          </Typography>

        </Stack>

      </CardContent>
    </Card>
  )
}
