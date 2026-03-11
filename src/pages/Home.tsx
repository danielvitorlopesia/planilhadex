import { useEffect, useState, type CSSProperties } from "react";
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
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>PlanilhaDEX</h1>
          <p style={styles.subtitle}>Lista de contratações</p>
        </header>

        {loading && <p style={styles.message}>Carregando contratações...</p>}

        {error && (
          <p style={{ ...styles.message, color: "#b42318" }}>
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
  header: {
    marginBottom: "28px",
  },
  title: {
    fontSize: "48px",
    lineHeight: 1.1,
    margin: "0 0 10px 0",
    color: "#6f4381",
    fontWeight: 800,
  },
  subtitle: {
    margin: 0,
    fontSize: "18px",
    color: "#6f5a78",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #dccde4",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 8px 24px rgba(140, 88, 162, 0.06)",
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
    color: "#7b6a84",
  },
  cardTitle: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.2,
    color: "#2f2038",
    maxWidth: "760px",
  },
  statusBadge: {
    background: "#efe7f3",
    color: "#8c58a2",
    padding: "12px 18px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "14px",
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
