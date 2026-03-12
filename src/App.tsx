import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import theme from "./theme";
import Home from "./pages/Home";
// Se você já tiver a página de detalhe criada, descomente a linha abaixo:
// import SpreadsheetDetail from "./pages/SpreadsheetDetail";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          {/*
            Se já existir a página de detalhe, use esta rota:
            <Route path="/spreadsheet/:id" element={<SpreadsheetDetail />} />
          */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
