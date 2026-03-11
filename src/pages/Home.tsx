import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";

type Contract = {
  id: number;
  titulo: string;
  status: string;
};

export default function Home() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContracts() {
      const { data, error } = await supabase
        .from("contracts")
        .select("id, titulo, status")
        .order("id", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setContracts(data || []);
      }

      setLoading(false);
    }

    loadContracts();
  }, []);

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
          <h1 style={{ fontSize: "32px", margin: 0, color: "#111827" }}>
            PlanilhaDEX
          </h1>
          <p style={{ marginTop: "8px", color: "#6b7280", fontSize: "16px" }}>
            Lista de contratações
          </p>
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
            Carregando contratações...
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

        {!loading && !error && contracts.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            Nenhuma contratação encontrada.
          </div>
        )}

        {!loading && !error && contracts.length > 0 && (
          <div style={{ display: "grid", gap: "16px" }}>
            {contracts.map((contract) => (
              <div
                key={contract.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "20px",
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

                    <h2
                      style={{
                        margin: 0,
                        fontSize: "22px",
                        color: "#111827",
                      }}
                    >
                      {contract.titulo}
                    </h2>
                  </div>

                  <span
                    style={{
                      background:
                        contract.status === "em_elaboracao"
                          ? "#fef3c7"
                          : "#e5e7eb",
                      color:
                        contract.status === "em_elaboracao"
                          ? "#92400e"
                          : "#374151",
                      padding: "8px 12px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {contract.status}
                  </span>
                </div>

                <div style={{ marginTop: "18px" }}>
                  <Link href={`/contratacoes/${contract.id}`}>
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
                      Abrir contratação
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
