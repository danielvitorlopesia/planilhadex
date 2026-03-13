import React, { useMemo } from "react";

type Nullable<T> = T | null | undefined;

type OpinionHeader = {
  title?: string;
  subtitle?: string;
  opinion_id?: string;
  executability_analysis_id?: string;
  organization_id?: string | null;
  procurement_id?: string | null;
  spreadsheet_id?: string;
  spreadsheet_version_id?: number;
  opinion_status?: string;
  opinion_version?: number;
  generated_at?: string;
  created_at?: string;
  updated_at?: string;
};

type OpinionSummary = {
  executability_status?: string;
  executability_status_label?: string;
  score_global?: number | null;
  risk_level?: string | null;
  risk_level_label?: string | null;
  proposed_total_value?: number | null;
  mandatory_cost_total?: number | null;
  evidentiary_cost_total?: number | null;
  retention_total?: number | null;
  executability_balance?: number | null;
};

type OpinionSection = {
  key: string;
  title: string;
  content: string;
  sort_order?: number;
};

type OpinionExport = {
  preferred_filename?: string;
  print_title?: string;
  print_subtitle?: string;
  allow_pdf?: boolean;
  allow_docx?: boolean;
  allow_html?: boolean;
};

type ExecutabilityOpinionDocument = {
  document_type?: string;
  document_version?: number;
  header?: OpinionHeader;
  summary?: OpinionSummary;
  sections?: OpinionSection[];
  export?: OpinionExport;
};

type ExecutabilityOpinionViewProps = {
  document?: ExecutabilityOpinionDocument | null;
  isLoading?: boolean;
  onExportPdf?: (document: ExecutabilityOpinionDocument) => void;
  onExportDocx?: (document: ExecutabilityOpinionDocument) => void;
  onBack?: () => void;
  className?: string;
  emptyMessage?: string;
};

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const EMPTY_DOCUMENT: ExecutabilityOpinionDocument = {
  document_type: "executability_opinion",
  document_version: 1,
  header: {
    title: "Parecer Consolidado de Exequibilidade",
    subtitle: "Planilha de serviços terceirizados",
  },
  summary: {
    executability_status_label: "Não disponível",
    risk_level_label: "Não classificado",
  },
  sections: [],
  export: {
    preferred_filename: "parecer.html",
    print_title: "Parecer Consolidado de Exequibilidade",
    print_subtitle: "Planilha de serviços terceirizados",
    allow_pdf: true,
    allow_docx: true,
    allow_html: true,
  },
};

const DEMO_DOCUMENT: ExecutabilityOpinionDocument = {
  document_type: "executability_opinion",
  document_version: 1,
  header: {
    title: "Parecer Consolidado de Exequibilidade",
    subtitle: "Planilha de serviços terceirizados",
    opinion_id: "demo-opinion-id",
    executability_analysis_id: "demo-analysis-id",
    spreadsheet_version_id: 1,
    generated_at: new Date().toISOString(),
  },
  summary: {
    executability_status: "exequivel_com_diligencia",
    executability_status_label: "Exequível com diligência",
    score_global: 65,
    risk_level: "medium",
    risk_level_label: "Médio",
    proposed_total_value: 3600,
    mandatory_cost_total: 3200,
    evidentiary_cost_total: 700,
    retention_total: 250,
    executability_balance: 150,
  },
  sections: [
    {
      key: "ementa",
      title: "Ementa",
      content:
        "Parecer consolidado de exequibilidade econômico-operacional de planilha de serviços terceirizados.",
      sort_order: 1,
    },
    {
      key: "conclusao",
      title: "Conclusão",
      content:
        "A proposta demonstra viabilidade material condicionada à diligência e à validação documental complementar.",
      sort_order: 2,
    },
  ],
  export: {
    preferred_filename: "parecer-demo.pdf",
    print_title: "Parecer Consolidado de Exequibilidade",
    print_subtitle: "Planilha de serviços terceirizados",
    allow_pdf: true,
    allow_docx: true,
    allow_html: true,
  },
};

function getSafeDocument(
  input?: ExecutabilityOpinionDocument | null
): ExecutabilityOpinionDocument {
  const base = input ?? EMPTY_DOCUMENT;

  return {
    ...EMPTY_DOCUMENT,
    ...base,
    header: {
      ...EMPTY_DOCUMENT.header,
      ...(base.header ?? {}),
    },
    summary: {
      ...EMPTY_DOCUMENT.summary,
      ...(base.summary ?? {}),
    },
    sections: Array.isArray(base.sections) ? base.sections : [],
    export: {
      ...EMPTY_DOCUMENT.export,
      ...(base.export ?? {}),
    },
  };
}

function formatCurrency(value: Nullable<number>) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return moneyFormatter.format(Number(value));
}

function formatDateTime(value: Nullable<string>) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateTimeFormatter.format(parsed);
}

function normalizeText(text: Nullable<string>) {
  if (!text || !text.trim()) return "Conteúdo não disponível.";
  return text.trim();
}

function scoreTone(score: Nullable<number>) {
  if (score === null || score === undefined) {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }
  if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  if (score >= 40) return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function riskTone(riskLevel: Nullable<string>) {
  switch ((riskLevel || "").toLowerCase()) {
    case "low":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "critical":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function statusTone(status: Nullable<string>) {
  switch ((status || "").toLowerCase()) {
    case "exequivel":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "exequivel_com_diligencia":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "inexequivel":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "inconclusiva_por_falta_de_prova":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\\\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function downloadHtmlDocument(documentPayload: ExecutabilityOpinionDocument) {
  if (typeof window === "undefined") return;

  const safeDocument = getSafeDocument(documentPayload);
  const title =
    safeDocument.export?.print_title || safeDocument.header?.title || "Parecer";
  const subtitle =
    safeDocument.export?.print_subtitle ||
    safeDocument.header?.subtitle ||
    "";
  const filename =
    safeDocument.export?.preferred_filename?.replace(/\.pdf$/i, ".html") ||
    "parecer.html";

  const summary = safeDocument.summary || {};
  const sections = [...(safeDocument.sections || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 40px; line-height: 1.6; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 14px; font-weight: 400; color: #475569; margin-top: 0; margin-bottom: 24px; }
    h3 { font-size: 16px; margin-top: 28px; margin-bottom: 8px; }
    .meta, .summary { margin-bottom: 20px; }
    .meta div, .summary div { margin-bottom: 4px; }
    .label { font-weight: 700; }
    .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .section { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <h2>${escapeHtml(subtitle)}</h2>
  <div class="card meta">
    <div><span class="label">Parecer:</span> ${escapeHtml(
      safeDocument.header?.opinion_id || "—"
    )}</div>
    <div><span class="label">Versão da planilha:</span> ${escapeHtml(
      String(safeDocument.header?.spreadsheet_version_id ?? "—")
    )}</div>
    <div><span class="label">Status:</span> ${escapeHtml(
      summary.executability_status_label || "—"
    )}</div>
    <div><span class="label">Score:</span> ${escapeHtml(
      String(summary.score_global ?? "—")
    )}</div>
    <div><span class="label">Risco:</span> ${escapeHtml(
      summary.risk_level_label || "—"
    )}</div>
  </div>
  <div class="card summary">
    <div><span class="label">Valor proposto:</span> ${escapeHtml(
      formatCurrency(summary.proposed_total_value)
    )}</div>
    <div><span class="label">Custos mandatórios:</span> ${escapeHtml(
      formatCurrency(summary.mandatory_cost_total)
    )}</div>
    <div><span class="label">Custos evidenciários:</span> ${escapeHtml(
      formatCurrency(summary.evidentiary_cost_total)
    )}</div>
    <div><span class="label">Retenções:</span> ${escapeHtml(
      formatCurrency(summary.retention_total)
    )}</div>
    <div><span class="label">Saldo de exequibilidade:</span> ${escapeHtml(
      formatCurrency(summary.executability_balance)
    )}</div>
  </div>
  ${sections
    .map(
      (section) => `
      <div class="card">
        <h3>${escapeHtml(section.title)}</h3>
        <div class="section">${escapeHtml(normalizeText(section.content))}</div>
      </div>`
    )
    .join("")}
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function MetricCard({
  label,
  value,
  toneClassName,
}: {
  label: string;
  value: React.ReactNode;
  toneClassName?: string;
}) {
  return (
    <div
      className={joinClasses(
        "rounded-2xl border p-4 shadow-sm bg-white",
        toneClassName
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold leading-tight">{value}</div>
    </div>
  );
}

function SectionCard({ title, content }: { title: string; content: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:break-inside-avoid">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {normalizeText(content)}
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Parecer indisponível
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export function ExecutabilityOpinionViewExample() {
  return <ExecutabilityOpinionView document={DEMO_DOCUMENT} />;
}

export default function ExecutabilityOpinionView({
  document,
  isLoading = false,
  onExportPdf,
  onExportDocx,
  onBack,
  className,
  emptyMessage = "Nenhum parecer consolidado foi carregado para exibição.",
}: ExecutabilityOpinionViewProps) {
  const safeDocument = useMemo(() => getSafeDocument(document), [document]);
  const header = safeDocument.header || {};
  const summary = safeDocument.summary || {};
  const sections = useMemo(
    () =>
      [...(safeDocument.sections || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      ),
    [safeDocument.sections]
  );
  const hasMeaningfulContent = sections.length > 0 || Boolean(header.opinion_id);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className={joinClasses("min-h-screen bg-slate-50", className)}>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:shadow-none">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={joinClasses(
                    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                    statusTone(summary.executability_status)
                  )}
                >
                  {summary.executability_status_label || "Status não informado"}
                </span>
                <span
                  className={joinClasses(
                    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                    riskTone(summary.risk_level)
                  )}
                >
                  Risco {summary.risk_level_label || "não classificado"}
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                  {header.title || "Parecer Consolidado de Exequibilidade"}
                </h1>
                <p className="mt-1 text-sm text-slate-600 md:text-base">
                  {header.subtitle || "Planilha de serviços terceirizados"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="font-medium text-slate-500">Parecer</div>
                  <div className="break-all text-slate-800">
                    {header.opinion_id || "—"}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-slate-500">Análise</div>
                  <div className="break-all text-slate-800">
                    {header.executability_analysis_id || "—"}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-slate-500">
                    Versão da planilha
                  </div>
                  <div className="text-slate-800">
                    {header.spreadsheet_version_id ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-slate-500">Emitido em</div>
                  <div className="text-slate-800">
                    {formatDateTime(header.generated_at)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 print:hidden">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Voltar
                </button>
              )}

              <button
                type="button"
                onClick={() => typeof window !== "undefined" && window.print()}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Imprimir
              </button>

              {safeDocument.export?.allow_html && (
                <button
                  type="button"
                  onClick={() => downloadHtmlDocument(safeDocument)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Baixar HTML
                </button>
              )}

              {safeDocument.export?.allow_pdf && (
                <button
                  type="button"
                  onClick={() => onExportPdf?.(safeDocument)}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Exportar PDF
                </button>
              )}

              {safeDocument.export?.allow_docx && (
                <button
                  type="button"
                  onClick={() => onExportDocx?.(safeDocument)}
                  className="rounded-2xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  Exportar DOCX
                </button>
              )}
            </div>
          </div>
        </div>

        {!hasMeaningfulContent ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                label="Status"
                value={summary.executability_status_label || "—"}
                toneClassName={statusTone(summary.executability_status)}
              />
              <MetricCard
                label="Score Global"
                value={summary.score_global ?? "—"}
                toneClassName={scoreTone(summary.score_global)}
              />
              <MetricCard
                label="Risco"
                value={summary.risk_level_label || "—"}
                toneClassName={riskTone(summary.risk_level)}
              />
              <MetricCard
                label="Valor Proposto"
                value={formatCurrency(summary.proposed_total_value)}
              />
              <MetricCard
                label="Saldo de Exequibilidade"
                value={formatCurrency(summary.executability_balance)}
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="Custos Mandatórios"
                value={formatCurrency(summary.mandatory_cost_total)}
              />
              <MetricCard
                label="Custos Evidenciários"
                value={formatCurrency(summary.evidentiary_cost_total)}
              />
              <MetricCard
                label="Retenções"
                value={formatCurrency(summary.retention_total)}
              />
            </div>

            <div className="space-y-5">
              {sections.map((section) => (
                <SectionCard
                  key={section.key}
                  title={section.title}
                  content={section.content}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export {
  DEMO_DOCUMENT,
  EMPTY_DOCUMENT,
  downloadHtmlDocument,
  formatCurrency,
  formatDateTime,
  getSafeDocument,
  normalizeText,
};

export type {
  ExecutabilityOpinionDocument,
  ExecutabilityOpinionViewProps,
  OpinionExport,
  OpinionHeader,
  OpinionSection,
  OpinionSummary,
};
