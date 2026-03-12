import { spreadsheets } from "../_data.js";

function extractId(req) {
  if (req?.query?.id) {
    if (Array.isArray(req.query.id)) {
      return req.query.id[0];
    }
    return String(req.query.id);
  }

  if (req?.url) {
    const cleanUrl = req.url.split("?")[0];
    const parts = cleanUrl.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  }

  return null;
}

export default function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Método não permitido.",
      });
    }

    const id = extractId(req);

    if (!id) {
      return res.status(400).json({
        message: "Identificador da planilha não informado.",
      });
    }

    const spreadsheet = spreadsheets.find((item) => item.id === String(id));

    if (!spreadsheet) {
      return res.status(404).json({
        message: "Planilha não encontrada.",
      });
    }

    return res.status(200).json(spreadsheet);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao carregar o detalhe da planilha.",
      detail: error instanceof Error ? error.message : "Erro desconhecido.",
    });
  }
}import { spreadsheets } from "../_data.js";

function extractId(req) {
  if (req?.query?.id) {
    if (Array.isArray(req.query.id)) {
      return req.query.id[0];
    }
    return String(req.query.id);
  }

  if (req?.url) {
    const cleanUrl = req.url.split("?")[0];
    const parts = cleanUrl.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  }

  return null;
}

export default function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Método não permitido.",
      });
    }

    const id = extractId(req);

    if (!id) {
      return res.status(400).json({
        message: "Identificador da planilha não informado.",
      });
    }

    const spreadsheet = spreadsheets.find((item) => item.id === String(id));

    if (!spreadsheet) {
      return res.status(404).json({
        message: "Planilha não encontrada.",
      });
    }

    return res.status(200).json(spreadsheet);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao carregar o detalhe da planilha.",
      detail: error instanceof Error ? error.message : "Erro desconhecido.",
    });
  }
}
