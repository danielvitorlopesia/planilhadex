import { useEffect, useState, type CSSProperties } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";

type Contract = {
  id: number;
  titulo: string;
  objeto: string;
  observacoes?: string | null;
  status: string;
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
        .select("id, titulo, objeto, observacoes, status")
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
        setLoading(false);
        return;
      }

      setSpreadsheets(spreadsheetsData || []);
      setLoading(false);
    }

    loadData();
  }, [match, params?.id]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.navRow}>
          <Link href="/" style={styles.backLink}>
            ← Voltar para contratações
          </Link>
        </div>

        {loading && <p style={styles.message}>Carregando contratação...</p>}

        {error && (
          <p style={{ ...styles.message, color: "#b42318" }}>
            Erro ao carregar: {error}
          </p>
        )}

        {!loading && !error && contract && (
          <>
            <div style={styles.headerCard}>
              <div style={styles.headerTop}>
                <div>
                  <p style={styles.overline}>Contratação #{contract.id}</p>
                  <h1 style={styles.title}>{contract.titulo}</h1>
                </div>

                <span style={styles.statusBadge}>
                  {contract.status || "sem_status"}
                </span>
              </div>
            </div>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Objeto</h2>
              <div style={styles.contentBox}>{contract.objeto || "—"}</div>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Observações</h2>
              <div style={styles.contentBox}>
                {contract.observacoes || "Sem observações registradas."}
              </div>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Planilhas vinculadas</h2>

              <div style={styles.list}>
                {spreadsheets.length === 0 ? (
                  <div style={styles.emptyState}>
                    Nenhuma planilha vinculada a esta contratação.
                  </div>
                ) : (
                  spreadsheets.map((spreadsheet) => (
                    <div key={spreadsheet.id} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <div>
                          <p style={styles.cardOverline}>
                            Planilha #{spreadsheet.id}
                          </p>
                          <h3 style={styles.cardTitle}>{spreadsheet.nome}</h3>
                          <p style={styles.cardText}>
                            Tipo: {spreadsheet.tipo_planilha} • Status:{" "}
                            {spreadsheet.status}
                          </p>
                        </div>

                        <Link
                          href={`/planilhas/${spreadsheet.id}`}
                          style={styles.primaryButton}
                        >
                          Abrir planilha
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {!loading && !error && !contract && (
          <p style={styles.message}>Contratação não encontrada.</p>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f4f9",
    fontFamily: "Arial, sans-serif",
    padding: "32px 16px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  navRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "24px",
  },
  backLink: {
    color: "#8c58a2",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "16px",
  },
  headerCard: {
    background: "#ffffff",
    border: "1px solid #dccde4",
    borderRadius: "24px",
    padding: "28px",
    marginBottom: "28px",
    boxShadow: "0 8px 24px rgba(140, 88, 162, 0.06)",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  overline: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: "#7b6a84",
  },
  title: {
    margin: 0,
    fontSize: "42px",
    lineHeight: 1.1,
    color: "#6f4381",
    fontWeight: 800,
    maxWidth: "820px",
  },
  statusBadge: {
    background: "#efe7f3",
    color: "#8c58a2",
    padding: "12px 18px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "14px",
  },
  section: {
    marginTop: "28px",
  },
  sectionTitle: {
    fontSize: "22px",
    margin: "0 0 14px 0",
    color: "#6f4381",
  },
  contentBox: {
    background: "#ffffff",
    border: "1px solid #dccde4",
    borderRadius: "20px",
    padding: "28px",
    color: "#4b3a56",
    fontSize: "18px",
    lineHeight: 1.5,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #dccde4",
    borderRadius: "24px",
    padding: "28px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  cardOverline: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: "#7b6a84",
  },
  cardTitle: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    color: "#2f2038",
  },
  cardText: {
    margin: 0,
    color: "#5d4b68",
    fontSize: "16px",
  },
  primaryButton: {
    display: "inline-block",
    background: "#6f4381",
    color: "#ffffff",
    textDecoration: "none",
    padding: "16px 22px",
    borderRadius: "18px",
    fontWeight: 700,
    fontSize: "16px",
  },
  emptyState: {
    background: "#ffffff",
    border: "1px solid #dccde4",
    borderRadius: "20px",
    padding: "24px",
    color: "#6f5a78",
  },
  message: {
    fontSize: "16px",
    color: "#4b3a56",
  },
};
