import { useEffect, useState, type CSSProperties } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";
import { theme, commonStyles, getStatusBadgeStyle } from "../theme";

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
          <p style={{ ...styles.message, color: theme.colors.danger }}>
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

                <span style={getStatusBadgeStyle(contract.status)}>
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
  page: commonStyles.page,
  container: commonStyles.container,
  navRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "24px",
  },
  backLink: commonStyles.backLink,
  headerCard: {
    ...commonStyles.card,
    marginBottom: "28px",
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
    color: theme.colors.textMuted,
  },
  title: {
    margin: 0,
    fontSize: "42px",
    lineHeight: 1.1,
    color: theme.colors.primaryDark,
    fontWeight: 800,
    maxWidth: "820px",
  },
  section: {
    marginTop: "28px",
  },
  sectionTitle: commonStyles.sectionTitle,
  contentBox: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radius.lg,
    padding: "28px",
    color: theme.colors.textMedium,
    fontSize: "18px",
    lineHeight: 1.5,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  card: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radius.xl,
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
    color: theme.colors.textMuted,
  },
  cardTitle: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    color: theme.colors.textStrong,
  },
  cardText: {
    margin: 0,
    color: theme.colors.textSoft,
    fontSize: "16px",
  },
  primaryButton: commonStyles.buttonPrimary,
  emptyState: commonStyles.emptyState,
  message: commonStyles.message,
};
