import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import theme from "./theme";

import Home from "./pages/Home";
import SpreadsheetDetail from "./pages/SpreadsheetDetail";
import Login from "./pages/Login";
import ModelSelectorPage from "./pages/ModelSelectorPage";
import SpreadsheetCreatePage from "./pages/SpreadsheetCreatePage";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppShell from "./components/AppShell";

function AppRoutes() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
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

        <Route
          path="/spreadsheet/new"
          element={
            <ProtectedRoute>
              <SpreadsheetCreatePage />
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
              <SpreadsheetCreatePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
