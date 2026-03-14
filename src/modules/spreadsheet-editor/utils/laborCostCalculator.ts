export type LaborInput = {
  salarioBase: number
  quantidade: number
  valeTransporte?: number
  valeAlimentacao?: number
}

export type LaborResult = {
  salarioTotal: number
  inss: number
  fgts: number
  ferias: number
  decimoTerceiro: number
  custoTotal: number
}

export function calculateLaborCost(input: LaborInput): LaborResult {

  const salarioTotal = input.salarioBase * input.quantidade

  const inss = salarioTotal * 0.20
  const fgts = salarioTotal * 0.08

  const ferias = salarioTotal / 12
  const decimoTerceiro = salarioTotal / 12

  const beneficios =
    (input.valeTransporte || 0) +
    (input.valeAlimentacao || 0)

  const custoTotal =
    salarioTotal +
    inss +
    fgts +
    ferias +
    decimoTerceiro +
    beneficios

  return {
    salarioTotal,
    inss,
    fgts,
    ferias,
    decimoTerceiro,
    custoTotal
  }
}
