import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import ContractDetail from "./pages/ContractDetail";
import SpreadsheetDetail from "./pages/SpreadsheetDetail";
import VersionDetail from "./pages/VersionDetail";
import { theme } from "./theme";

function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.pageBackground,
        padding: "32px 16px",
        fontFamily: theme.font.family,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: theme.colors.white,
          border: `1px solid ${theme.colors.primaryBorder}`,
          borderRadius: theme.radius.xl,
          padding: "32px",
          boxShadow: theme.shadow.soft,
        }}
      >
        <p
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            color: theme.colors.textMuted,
          }}
        >
          Erro de navegação
        </p>

        <h1
          style={{
            margin: "0 0 12px 0",
            fontSize: "40px",
            color: theme.colors.primaryDark,
            fontWeight: 800,
          }}
        >
          404
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: "18px",
            color: theme.colors.textMedium,
          }}
        >
          Página não encontrada.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/contratacoes/:id" component={ContractDetail} />
      <Route path="/planilhas/:id" component={SpreadsheetDetail} />
      <Route path="/versoes/:id" component={VersionDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}
