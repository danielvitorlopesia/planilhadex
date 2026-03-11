import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";

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
      return ![
        "id",
        "spreadsheet_version_id",
        "created_at",
        "updated_at",
      ].includes(key);
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
          <p style={{ ...styles.message, color: "#b42318" }}>
            Erro ao carregar: {error}
          </p>
        )}

        {!loading && !error && version && (
          <>
            <span style={styles.badge}>Versão #{version.id}</span>
            <h1 style={styles.title}>Versão {version.numero_versao}</h1>

            <div style={styles.grid}>
              <InfoCard label="Tipo da versão" value={version.tipo_versao} />
              <InfoCard label="Status" value={version.status} />
              <InfoCard label="Criada em" value={formatDate(version.criada_em)} />
              <InfoCard label="ID da planilha" value={String(version.spreadsheet_id)} />
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

                  <Link href={`/planilhas/${spreadsheet.id}`} style={styles.primaryLink}>
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
                <div style={styles.grid}>
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
  },
  badge: {
    display: "inline-block",
    background: "#efe7f3",
    color: "#8c58a2",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "12px",
  },
  title: {
    fontSize: "32px",
    margin: "0 0 24px 0",
    color: "#6f4381",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  infoCard: {
    background: "#ffffff",
    border: "1px solid #dccde4",
    borderRadius: "16px",
    padding: "16px",
  },
  infoCardHighlight: {
    background: "#8c58a2",
    border: "1px solid #8c58a2",
    boxShadow: "0 10px 24px rgba(140, 88, 162, 0.18)",
  },
  infoLabel: {
    display: "block",
    fontSize: "13px",
    color: "#6f5a78",
    marginBottom: "8px",
  },
  infoLabelHighlight: {
    color: "#f3eefa",
  },
  infoValue: {
    fontSize: "16px",
    color: "#2f2038",
  },
  infoValueHighlight: {
    color: "#ffffff",
    fontSize: "28px",
    lineHeight: 1.2,
  },
  section: {
    marginTop: "24px",
  },
  sectionTitle: {
    fontSize: "22px",
    marginBottom: "16px",
    color: "#6f4381",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #dccde4",
    borderRadius: "16px",
    padding: "20px",
  },
  cardOverline: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    color: "#7b6a84",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "22px",
    color: "#2f2038",
  },
  cardText: {
    margin: "0 0 16px 0",
    color: "#5d4b68",
  },
  primaryLink: {
    color: "#8c58a2",
    textDecoration: "none",
    fontWeight: 700,
  },
  emptyState: {
    background: "#fff",
    border: "1px solid #dccde4",
    borderRadius: "16px",
    padding: "20px",
    color: "#6f5a78",
  },
  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    border: "1px solid #dccde4",
    borderRadius: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    borderBottom: "1px solid #dccde4",
    fontSize: "13px",
    color: "#6f5a78",
    background: "#f6f0f8",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #ece2f0",
    fontSize: "14px",
    color: "#4b3a56",
    verticalAlign: "top",
  },
  message: {
    fontSize: "16px",
    color: "#4b3a56",
  },
};
