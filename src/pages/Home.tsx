import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { theme, commonStyles } from "../theme";

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
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>PlanilhaDEX</h1>
          <p style={styles.subtitle}>Lista de contratações</p>
        </header>

        {loading && <p style={styles.message}>Carregando contratações...</p>}

        {error && (
          <p style={{ ...styles.message, color: theme.colors.danger }}>
            Erro ao carregar: {error}
          </p>
        )}

        {!loading && !error && contracts.length === 0 && (
          <div style={styles.emptyState}>Nenhuma contratação encontrada.</div>
        )}

        <div style={styles.list}>
          {contracts.map((contract) => (
            <div key={contract.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <p style={styles.cardOverline}>Contratação #{contract.id}</p>
                  <h2 style={styles.cardTitle}>{contract.titulo}</h2>
                </div>

                <span style={styles.statusBadge}>
                  {contract.status || "sem_status"}
                </span>
              </div>

              <Link
                href={`/contratacoes/${contract.id}`}
                style={styles.primaryButton}
              >
                Abrir contratação
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: commonStyles.page,
  container: commonStyles.container,
  header: {
    marginBottom: "28px",
  },
  title: {
    fontSize: "48px",
    lineHeight: 1.1,
    margin: "0 0 10px 0",
    color: theme.colors.primaryDark,
    fontWeight: 800,
  },
  subtitle: {
    margin: 0,
    fontSize: "18px",
    color: theme.colors.textSoft,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  card: {
    ...commonStyles.card,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  cardOverline: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: theme.colors.textMuted,
  },
  cardTitle: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.2,
    color: theme.colors.textStrong,
    maxWidth: "760px",
  },
  statusBadge: {
    background: theme.colors.primarySoft,
    color: theme.colors.primary,
    padding: "12px 18px",
    borderRadius: theme.radius.pill,
    fontWeight: 700,
    fontSize: "14px",
  },
  primaryButton: {
    ...commonStyles.buttonPrimary,
  },
  emptyState: {
    ...commonStyles.emptyState,
  },
  message: {
    ...commonStyles.message,
  },
};
