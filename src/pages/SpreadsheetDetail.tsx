import { useEffect, useState, type CSSProperties } from "react";
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
        .select("id, spreadsheet_id, numero_versao, tipo_versao, status")
        .eq("spreadsheet_id", spreadsheetId)
        .order("id", { ascending: true });

      if (versionsError) {
        setError(versionsError.message);
        setLoading(false);
        return;
      }

      setVersions(versionsData || []);
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

          {spreadsheet?.contract_id && (
            <Link
              href={`/contratacoes/${spreadsheet.contract_id}`}
              style={styles.backLink}
            >
              ← Voltar para a contratação #{spreadsheet.contract_id}
            </Link>
          )}
        </div>

        {loading && <p style={styles.message}>Carregando planilha...</p>}

        {error && (
          <p style={{ ...styles.message, color: "#b42318" }}>
            Erro ao carregar: {error}
          </p>
        )}

        {!loading && !error && spreadsheet && (
          <>
            <div style={styles.headerCard}>
              <div style={styles.headerTop}>
                <div>
                  <p style={styles.overline}>Planilha #{spreadsheet.id}</p>
                  <h1 style={styles.title}>{spreadsheet.nome}</h1>
                </div>

                <span style={styles.statusBadge}>
                  {spreadsheet.status || "sem_status"}
                </span>
              </div>
            </div>

            <section style={styles.section}>
              <div style={styles.infoGrid}>
                <div style={styles.infoCard}>
                  <span style={styles.infoLabel}>Tipo da planilha</span>
                  <strong style={styles.infoValue}>
                    {spreadsheet.tipo_planilha}
                  </strong>
                </div>

                <div style={styles.infoCard}>
                  <span style={styles.infoLabel}>Contratação vinculada</span>
                  <strong style={styles.infoValue}>
                    #{spreadsheet.contract_id}
                  </strong>
                </div>
              </div>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Versões da planilha</h2>

              <div style={styles.list}>
                {versions.length === 0 ? (
                  <div style={styles.emptyState}>
                    Nenhuma versão encontrada para esta planilha.
                  </div>
                ) : (
                  versions.map((version) => (
                    <div key={version.id} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <div>
                          <p style={styles.cardOverline}>Versão #{version.id}</p>
                          <h3 style={styles.cardTitle}>
                            Versão {version.numero_versao}
                          </h3>
                          <p style={styles.cardText}>
                            Tipo: {version.tipo_versao} • Status: {version.status}
                          </p>
                        </div>

                        <Link
                          href={`/versoes/${version.id}`}
                          style={styles.primaryButton}
                        >
                          Abrir versão
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {!loading && !error && !spreadsheet && (
          <p style={styles.message}>Planilha não encontrada.</p>
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
    background: "#e7f6ea",
    color: "#1f7a3d",
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
    margin: "0 0 16px 0",
    color: "#6f4381",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  infoCard: {
    background: "#ffffff",
    border: "1px solid #dccde4",
    borderRadius: "20px",
    padding: "24px",
  },
  infoLabel: {
    display: "block",
    fontSize: "16px",
    color: "#6f5a78",
    marginBottom: "10px",
  },
  infoValue: {
    fontSize: "22px",
    color: "#2f2038",
    fontWeight: 700,
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
