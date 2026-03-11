import { useEffect, useState, type CSSProperties } from "react";
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

type SpreadsheetTotal = {
  id: number;
  spreadsheet_version_id: number;
  equipment_service_id?: number | null;
  valor_geral_orcado?: number | null;
  valor_total_bdi?: number | null;
  valor_global_orcado?: number | null;
  custo_direto_total?: number | null;
};

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
        .select(
          "id, spreadsheet_version_id, equipment_service_id, valor_geral_orcado, valor_total_bdi, valor_global_orcado, custo_direto_total"
        )
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
                  <InfoCard
                    label="Valor geral orçado"
                    value={formatCurrency(resumo.valor_geral_orcado)}
                  />
                  <InfoCard
                    label="Valor total BDI"
                    value={formatCurrency(resumo.valor_total_bdi)}
                  />
                  <InfoCard
                    label="Valor global orçado"
                    value={formatCurrency(resumo.valor_global_orcado)}
                  />
                  <InfoCard
                    label="Custo direto total"
                    value={formatCurrency(resumo.custo_direto_total)}
                  />
                  <InfoCard
                    label="Equipment / Service ID"
                    value={
                      resumo.equipment_service_id !== null &&
                      resumo.equipment_service_id !== undefined
                        ? String(resumo.equipment_service_id)
                        : "Não informado"
                    }
                  />
                </div>
              )}
            </section>

            {totals.length > 1 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Registros de totais</h2>

                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Equip./Serviço</th>
                        <th style={styles.th}>Valor geral orçado</th>
                        <th style={styles.th}>Valor total BDI</th>
                        <th style={styles.th}>Valor global orçado</th>
                        <th style={styles.th}>Custo direto total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totals.map((item) => (
                        <tr key={item.id}>
                          <td style={styles.td}>{item.id}</td>
                          <td style={styles.td}>{item.equipment_service_id ?? "—"}</td>
                          <td style={styles.td}>{formatCurrency(item.valor_geral_orcado)}</td>
                          <td style={styles.td}>{formatCurrency(item.valor_total_bdi)}</td>
                          <td style={styles.td}>{formatCurrency(item.valor_global_orcado)}</td>
                          <td style={styles.td}>{formatCurrency(item.custo_direto_total)}</td>
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
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div style={styles.infoCard}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value || "Não informado"}</strong>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Não informado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("pt-BR");
}

function formatCurrency(value?: number | null) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
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
    color: "#175cd3",
    textDecoration: "none",
    fontWeight: 600,
  },
  badge: {
    display: "inline-block",
    background: "#e9f2ff",
    color: "#175cd3",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "12px",
  },
  title: {
    fontSize: "32px",
    margin: "0 0 24px 0",
    color: "#101828",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  infoCard: {
    background: "#ffffff",
    border: "1px solid #e4e7ec",
    borderRadius: "16px",
    padding: "16px",
  },
  infoLabel: {
    display: "block",
    fontSize: "13px",
    color: "#475467",
    marginBottom: "8px",
  },
  infoValue: {
    fontSize: "16px",
    color: "#101828",
  },
  section: {
    marginTop: "24px",
  },
  sectionTitle: {
    fontSize: "22px",
    marginBottom: "16px",
    color: "#101828",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e4e7ec",
    borderRadius: "16px",
    padding: "20px",
  },
  cardOverline: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    color: "#475467",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "22px",
    color: "#101828",
  },
  cardText: {
    margin: "0 0 16px 0",
    color: "#344054",
  },
  primaryLink: {
    color: "#175cd3",
    textDecoration: "none",
    fontWeight: 700,
  },
  emptyState: {
    background: "#fff",
    border: "1px solid #e4e7ec",
    borderRadius: "16px",
    padding: "20px",
    color: "#475467",
  },
  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    border: "1px solid #e4e7ec",
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
    borderBottom: "1px solid #e4e7ec",
    fontSize: "13px",
    color: "#475467",
    background: "#f9fafb",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #e4e7ec",
    fontSize: "14px",
    color: "#344054",
    verticalAlign: "top",
  },
  message: {
    fontSize: "16px",
    color: "#344054",
  },
};
