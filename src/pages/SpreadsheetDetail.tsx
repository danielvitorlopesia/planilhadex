import { useEffect, useState, type CSSProperties } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";
import { theme, commonStyles, getStatusBadgeStyle } from "../theme";

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
          <p style={{ ...styles.message, color: theme.colors.danger }}>
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

                <span style={getStatusBadgeStyle(spreadsheet.status)}>
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
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  infoCard: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radius.lg,
    padding: "24px",
  },
  infoLabel: {
    display: "block",
    fontSize: "16px",
    color: theme.colors.textSoft,
    marginBottom: "10px",
  },
  infoValue: {
    fontSize: "22px",
    color: theme.colors.textStrong,
    fontWeight: 700,
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
