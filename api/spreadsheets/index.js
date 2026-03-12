import { spreadsheets } from "../_data.js";

export default function handler(req, res) {
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
}
