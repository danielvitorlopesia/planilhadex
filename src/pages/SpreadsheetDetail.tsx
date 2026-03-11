import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";

type Spreadsheet = {
  id: number;
  contract_id: number;
  nome: string;
  tipo_planilha: string;
  status: string;
};

type SpreadsheetVersion = {
  id: number;
  spreadsheet_id: number;
  numero_versao: number;
  tipo_versao: string;
  status: string;
  criada_em?: string | null;
};

export default function SpreadsheetDetail() {
  const [match, params] = useRoute("/planilhas/:id");
  const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | null>(null);
  const [versions, setVersions] = useState<SpreadsheetVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!match || !params?.id) return;

      const spreadsheetId = Number(params.id);

      const { data: spreadsheetData, error: spreadsheetError } = await supabase
        .from("spreadsheets")
        .select("id, contract_id, nome, tipo_planilha, status")
        .eq("id", spreadsheetId)
        .single();

      if (spreadsheetError) {
        setError(spreadsheetError.message);
        setLoading(false);
        return;
      }

      setSpreadsheet(spreadsheetData);

      const { data: versionsData, error: versionsError } = await supabase
        .from("spreadsheet_versions")
        .select("id, spreadsheet_id, numero_versao, tipo_versao, status, criada_em")
        .eq("spreadsheet_id", spreadsheetId)
        .order("numero_versao", { ascending: true });

      if (versionsError) {
        setError(versionsError.message);
      } else {
        setVersions(versionsData || []);
      }

      setLoading(false);
    }

    loadData();
  }, [match, params?.id]);

  return (
    <main
      style={{
        padding: "32px",
        fontFamily: "Arial, sans-serif",
        background: "#f7f8fa",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <Link href="/" style={{ color: "#2563eb", textDecoration: "none" }}>
            ← Voltar para contratações
          </Link>
          {spreadsheet?.contract_id && (
            <div style={{ marginTop: "8px" }}>
              <Link
                href={`/contratacoes/${spreadsheet.contract_id}`}
                style={{ color: "#2563eb", textDecoration: "none" }}
              >
                ← Voltar para a contratação #{spreadsheet.contract_id}
              </Link>
            </div>
          )}
        </div>

        {loading && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            Carregando planilha...
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            Erro ao carregar: {error}
          </div>
        )}

        {!loading && !error && spreadsheet && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  Planilha #{spreadsheet.id}
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "32px",
                    color: "#111827",
                  }}
                >
                  {spreadsheet.nome}
                </h1>
              </div>

              <span
                style={{
                  background:
                    spreadsheet.status === "ativa" ? "#dcfce7" : "#e5e7eb",
                  color:
                    spreadsheet.status === "ativa" ? "#166534" : "#374151",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {spreadsheet.status}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <InfoCard label="Tipo da planilha" value={spreadsheet.tipo_planilha} />
              <InfoCard
                label="Contratação vinculada"
                value={`#${spreadsheet.contract_id}`}
              />
            </div>

            <div style={{ marginTop: "12px" }}>
              <h2
                style={{
                  fontSize: "22px",
                  marginBottom: "16px",
                  color: "#111827",
                }}
              >
                Versões da planilha
              </h2>

              {versions.length === 0 ? (
                <div
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    color: "#6b7280",
                  }}
                >
                  Nenhuma versão vinculada a esta planilha.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginBottom: "8px",
                          }}
                        >
                          Versão #{version.id}
                        </div>

                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: "6px",
                          }}
                        >
                          Versão {version.numero_versao}
                        </div>

                        <div style={{ color: "#4b5563", fontSize: "14px" }}>
                          Tipo: {version.tipo_versao} • Status: {version.status}
                        </div>
                      </div>

                      <Link href={`/versoes/${version.id}`}>
                        <span
                          style={{
                            display: "inline-block",
                            background: "#111827",
                            color: "#ffffff",
                            borderRadius: "10px",
                            padding: "10px 16px",
                            cursor: "pointer",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Abrir versão
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value?: string | null }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ fontSize: "16px", color: "#111827", fontWeight: 600 }}>
        {value || "Não informado"}
      </div>
    </div>
  );
}
