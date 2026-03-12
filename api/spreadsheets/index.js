import { spreadsheets } from "../_data.js";

export default function handler(req, res) {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Método não permitido.",
      });
    }

    const list = spreadsheets.map(
      ({ id, title, description, status, category, updatedAt }) => ({
        id,
        title,
        description,
        status,
        category,
        updatedAt,
      })
    );

    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao carregar a lista de planilhas.",
      detail: error instanceof Error ? error.message : "Erro desconhecido.",
    });
  }
}
