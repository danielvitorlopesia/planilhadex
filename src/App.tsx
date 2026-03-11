import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import ContractDetail from "./pages/ContractDetail";
import SpreadsheetDetail from "./pages/SpreadsheetDetail";
import VersionDetail from "./pages/VersionDetail";

function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4f9",
        padding: "32px 16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          border: "1px solid #dccde4",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 8px 24px rgba(140, 88, 162, 0.06)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            color: "#7b6a84",
          }}
        >
          Erro de navegação
        </p>

        <h1
          style={{
            margin: "0 0 12px 0",
            fontSize: "40px",
            color: "#6f4381",
            fontWeight: 800,
          }}
        >
          404
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: "18px",
            color: "#4b3a56",
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
