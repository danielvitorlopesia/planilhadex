import React from "react";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Typography,
} from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import theme from "./theme";
import Home from "./pages/Home";
import SpreadsheetDetail from "./pages/SpreadsheetDetail";
import Login from "./pages/Login";
import ModelSelectorPage from "./pages/ModelSelectorPage";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

function SpreadsheetCreatePlaceholder() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 3,
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Criação de planilha em preparação
        </Typography>

        <Typography variant="body1" color="text.secondary">
          A próxima etapa da Rota 1 será a tela de criação inicial com campos
          comuns e condicionais por tipo de modelo. A rota já foi criada para
          não travar a navegação e permitir a evolução incremental do frontend.
        </Typography>
      </Container>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/models/new"
              element={
                <ProtectedRoute>
                  <ModelSelectorPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/models/new/create"
              element={
                <ProtectedRoute>
                  <SpreadsheetCreatePlaceholder />
                </ProtectedRoute>
              }
            />

            <Route
              path="/spreadsheet/:id"
              element={
                <ProtectedRoute>
                  <SpreadsheetDetail />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}