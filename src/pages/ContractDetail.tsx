import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";

type Contract = {
  id: number;
  titulo: string;
  status: string;
  objeto?: string | null;
  municipio?: string | null;
  uf?: string | null;
  data_base?: string | null;
  vigencia_meses?: number | null;
  observacoes?: string | null;
};

type Spreadsheet = {
  id: number;
  contract_id: number;
  nome: string;
  tipo_planilha: string;
  status: string;
};

export default function ContractDetail() {
  const [match, params] = useRoute("/contratacoes/:id");
  const [contract, setContract] = useState<Contract | null>(null);
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!match || !params?.id) return;

      const contractId = Number(params.id);

      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select(
          "id, titulo, status, objeto, municipio, uf, data_base, vigencia_meses, observacoes"
        )
        .eq("id", contractId)
        .single();

      if (contractError) {
        setError(contractError.message);
        setLoading(false);
        return;
      }

      setContract(contractData);

      const { data: spreadsheetsData, error: spreadsheetsError } = await supabase
        .from("spreadsheets")
        .select("id, contract_id, nome, tipo_planilha, status")
        .eq("contract_id", contractId)
        .order("id", { ascending: true });

      if (spreadsheetsError) {
        setError(spreadsheetsError.message);
      } else {
        setSpreadsheets(spreadsheetsData || []);
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
            Carregando contratação...
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

        {!loading && !error && contract && (
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
                  Contratação #{contract.id}
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "32px",
                    color: "#111827",
                  }}
                >
                  {contract.titulo}
                </h1>
              </div>

              <span
                style={{
                  background:
                    contract.status === "em_elaboracao" ? "#fef3c7" : "#e5e7eb",
                  color:
                    contract.status === "em_elaboracao" ? "#92400e" : "#374151",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {contract.status}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <InfoCard label="Município" value={contract.municipio} />
              <InfoCard label="UF" value={contract.uf} />
              <InfoCard label="Data base" value={contract.data_base} />
              <InfoCard
                label="Vigência (meses)"
                value={
                  contract.vigencia_meses !== null &&
                  contract.vigencia_meses !== undefined
                    ? String(contract.vigencia_meses)
                    : null
                }
              />
            </div>

            <Section
              title="Objeto"
              content={contract.objeto || "Não informado."}
            />

            <Section
              title="Observações"
              content={contract.observacoes || "Não informado."}
            />

            <div style={{ marginTop: "32px" }}>
              <h2
                style={{
                  fontSize: "22px",
                  marginBottom: "16px",
                  color: "#111827",
                }}
              >
                Planilhas vinculadas
              </h2>

              {spreadsheets.length === 0 ? (
                <div
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    color: "#6b7280",
                  }}
                >
                  Nenhuma planilha vinculada a esta contratação.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {spreadsheets.map((spreadsheet) => (
                    <div
                      key={spreadsheet.id}
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
                          Planilha #{spreadsheet.id}
                        </div>

                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: "6px",
                          }}
                        >
                          {spreadsheet.nome}
                        </div>

                        <div style={{ color: "#4b5563", fontSize: "14px" }}>
                          Tipo: {spreadsheet.tipo_planilha} • Status:{" "}
                          {spreadsheet.status}
                        </div>
                      </div>

                      <Link href={`/planilhas/${spreadsheet.id}`}>
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
                          Abrir planilha
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

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div style={{ marginTop: "24px" }}>
      <h2
        style={{
          fontSize: "18px",
          marginBottom: "10px",
          color: "#111827",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "16px",
          color: "#374151",
          lineHeight: 1.5,
        }}
      >
        {content}
      </div>
    </div>
  );
}
