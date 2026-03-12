import { spreadsheets } from "../_data.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Método não permitido.",
    });
  }

  const { id } = req.query;

  const spreadsheet = spreadsheets.find((item) => item.id === String(id));

  if (!spreadsheet) {
    return res.status(404).json({
      message: "Planilha não encontrada.",
    });
  }

  return res.status(200).json(spreadsheet);
}
