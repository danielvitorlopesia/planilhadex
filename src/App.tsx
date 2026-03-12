import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import theme from "./theme";
import Home from "./pages/Home";
import SpreadsheetDetail from "./pages/SpreadsheetDetail";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spreadsheet/:id" element={<SpreadsheetDetail />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
