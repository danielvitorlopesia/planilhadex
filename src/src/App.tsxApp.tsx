import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import ContractDetail from "./pages/ContractDetail";
import SpreadsheetDetail from "./pages/SpreadsheetDetail";
import VersionDetail from "./pages/VersionDetail";

function NotFound() {
  return (
    <main style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
      <h1>404</h1>
      <p>Página não encontrada.</p>
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
