import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";
import { theme, commonStyles, getStatusBadgeStyle } from "../theme";

type SpreadsheetVersion = {
  id: number;
  spreadsheet_id: number;
  numero_versao: number;
  tipo_versao: string;
  status: string;
  criada_em?: string | null;
};

type Spreadsheet = {
  id: number;
  contract_id: number;
  nome: string;
  tipo_planilha: string;
  status: string;
};

type SpreadsheetTotal = Record<string, string | number | null>;

export default function VersionDetail() {
  const [match, params] = useRoute("/versoes/:id");
  const [version, setVersion] = useState<SpreadsheetVersion | null>(null);
  const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | null>(null);
  const [totals, setTotals] = useState<SpreadsheetTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!match || !params?.id) return;

      const versionId = Number(params.id);

      const { data: versionData, error: versionError } = await supabase
        .from("spreadsheet_versions")
        .select("id, spreadsheet_id, numero_versao, tipo_versao, status, criada_em")
        .eq("id", versionId)
        .single();

      if (versionError) {
        setError(versionError.message);
        setLoading(false);
        return;
      }

      setVersion(versionData);

      const { data: spreadsheetData, error: spreadsheetError } = await supabase
        .from("spreadsheets")
        .select("id, contract_id, nome, tipo_planilha, status")
        .eq("id", versionData.spreadsheet_id)
        .single();

      if (spreadsheetError) {
        setError(spreadsheetError.message);
        setLoading(false);
        return;
      }

      setSpreadsheet(spreadsheetData);

      const { data: totalsData, error: totalsError } = await supabase
        .from("spreadsheet_totals")
        .select("*")
        .eq("spreadsheet_version_id", versionId)
        .order("id", { ascending: true });

      if (totalsError) {
        setError(totalsError.message);
        setLoading(false);
        return;
      }

      setTotals(totalsData || []);
      setLoading(false);
    }

    loadData();
  }, [match, params?.id]);

  const resumo = totals[0] || null;

  const summaryEntries = useMemo(() => {
    if (!resumo) return [];

    return Object.entries(resumo).filter(([key]) => {
      return !["id", "spreadsheet_version_id", "created_at", "updated_at"].includes(
        key
      );
    });
  }, [resumo]);

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

          {version?.spreadsheet_id && (
            <Link
              href={`/planilhas/${version.spreadsheet_id}`}
              style={styles.backLink}
            >
              ← Voltar para a planilha #{version.spreadsheet_id}
            </Link>
          )}
        </div>

        {loading && <p style={styles.message}>Carregando versão...</p>}

        {error && (
          <p style={{ ...styles.message, color: theme.colors.danger }}>
            Erro ao carregar: {error}
          </p>
        )}

        {!loading && !error && version && (
          <>
            <span style={styles.badge}>Versão #{version.id}</span>
            <h1 style={styles.title}>Versão {version.numero_versao}</h1>

            <div style={styles.metaGrid}>
              <InfoCard label="Tipo da versão" value={version.tipo_versao} />

              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Status</span>
                <span style={getStatusBadgeStyle(version.status)}>
                  {version.status || "sem_status"}
                </span>
              </div>

              <InfoCard label="Criada em" value={formatDate(version.criada_em)} />
              <InfoCard
                label="ID da planilha"
                value={String(version.spreadsheet_id)}
              />
            </div>

            {spreadsheet && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Planilha vinculada</h2>

                <div style={styles.card}>
                  <p style={styles.cardOverline}>Planilha #{spreadsheet.id}</p>
                  <h3 style={styles.cardTitle}>{spreadsheet.nome}</h3>
                  <p style={styles.cardText}>
                    Tipo: {spreadsheet.tipo_planilha} • Status: {spreadsheet.status}
                  </p>

                  <Link
                    href={`/planilhas/${spreadsheet.id}`}
                    style={styles.primaryButton}
                  >
                    Abrir planilha
                  </Link>
                </div>
              </section>
            )}

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Resumo financeiro da versão</h2>

              {!resumo ? (
                <div style={styles.emptyState}>
                  Nenhum total consolidado encontrado para esta versão.
                </div>
              ) : (
                <div style={styles.summaryGrid}>
                  {summaryEntries.map(([key, value]) => {
                    const isMainTotal = key.toLowerCase().includes("global");

                    return (
                      <InfoCard
                        key={key}
                        label={beautifyKey(key)}
                        value={formatDynamicValue(value, key)}
                        highlight={isMainTotal}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {totals.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Registros de totais</h2>

                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {Object.keys(totals[0]).map((key) => (
                          <th key={key} style={styles.th}>
                            {beautifyKey(key)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {totals.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.keys(totals[0]).map((key) => (
                            <td key={key} style={styles.td}>
                              {formatDynamicValue(row[key], key)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {!loading && !error && !version && (
          <p style={styles.message}>Versão não encontrada.</p>
        )}
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.infoCard,
        ...(highlight ? styles.infoCardHighlight : {}),
      }}
    >
      <span
        style={{
          ...styles.infoLabel,
          ...(highlight ? styles.infoLabelHighlight : {}),
        }}
      >
        {label}
      </span>
      <strong
        style={{
          ...styles.infoValue,
          ...(highlight ? styles.infoValueHighlight : {}),
        }}
      >
        {value || "Não informado"}
      </strong>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Não informado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR");
}

function formatCurrency(value?: number | null) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function beautifyKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDynamicValue(
  value: string | number | null | undefined,
  key: string
) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const lowerKey = key.toLowerCase();

  if (
    lowerKey.includes("valor") ||
    lowerKey.includes("custo") ||
    lowerKey.includes("total") ||
    lowerKey.includes("orcado") ||
    lowerKey.includes("orçado") ||
    lowerKey.includes("lucro") ||
    lowerKey.includes("tributo")
  ) {
    return formatCurrency(Number(value));
  }

  if (
    lowerKey.includes("created_at") ||
    lowerKey.includes("updated_at") ||
    lowerKey.includes("criada_em")
  ) {
    return formatDate(String(value));
  }

  return String(value);
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
  badge: {
    display: "inline-block",
    background: theme.colors.primarySoft,
    color: theme.colors.primary,
    padding: "6px 10px",
    borderRadius: theme.radius.pill,
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "12px",
  },
  title: {
    fontSize: "32px",
    margin: "0 0 24px 0",
    color: theme.colors.primaryDark,
    fontWeight: 800,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  infoCard: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radius.md,
    padding: "16px",
  },
  infoCardHighlight: {
    background: theme.colors.primary,
    border: `1px solid ${theme.colors.primary}`,
    boxShadow: theme.shadow.highlight,
  },
  infoLabel: {
    display: "block",
    fontSize: "13px",
    color: theme.colors.textSoft,
    marginBottom: "8px",
  },
  infoLabelHighlight: {
    color: "#f3eefa",
  },
  infoValue: {
    fontSize: "16px",
    color: theme.colors.textStrong,
  },
  infoValueHighlight: {
    color: theme.colors.white,
    fontSize: "28px",
    lineHeight: 1.2,
  },
  section: {
    marginTop: "24px",
  },
  sectionTitle: commonStyles.sectionTitle,
  card: {
    ...commonStyles.card,
    padding: "20px",
  },
  cardOverline: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "22px",
    color: theme.colors.textStrong,
  },
  cardText: {
    margin: "0 0 16px 0",
    color: theme.colors.textMedium,
  },
  primaryButton: commonStyles.buttonPrimary,
  emptyState: commonStyles.emptyState,
  tableWrapper: {
    overflowX: "auto",
    background: theme.colors.white,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radius.md,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    borderBottom: `1px solid ${theme.colors.primaryBorder}`,
    fontSize: "13px",
    color: theme.colors.textSoft,
    background: theme.colors.tableHeader,
  },
  td: {
    padding: "14px 16px",
    borderBottom: `1px solid ${theme.colors.tableBorder}`,
    fontSize: "14px",
    color: theme.colors.textMedium,
    verticalAlign: "top",
  },
  message: commonStyles.message,
};
