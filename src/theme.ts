import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8E5AB5",
      dark: "#5B3A7A",
    },
    secondary: {
      main: "#1565C0",
    },
    error: {
      main: "#C62828",
    },
    background: {
      default: "#F7F3F8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#241B3A",
      secondary: "#6D6186",
    },
  },
});

/*
EXTENSÕES UTILIZADAS PELO SISTEMA
(padrão antigo usado nas telas)
*/

export const colors = {
  white: "#FFFFFF",

  danger: "#C62828",

  primaryDark: "#5B3A7A",

  textMuted: "#9B8BB5",
  textMedium: "#6D6186",
  textSoft: "#7A6F91",
  textStrong: "#241B3A",

  primaryBorder: "#E3D9F1",
};

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
};

export const commonStyles = {
  page: {
    background: "#F7F3F8",
    minHeight: "100vh",
    padding: "40px",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "16px",
    color: "#5B3A7A",
    textDecoration: "none",
    fontWeight: 600,
  },

  sectionTitle: {
    marginBottom: "12px",
    fontSize: "20px",
    fontWeight: 700,
    color: "#241B3A",
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid #E3D9F1",
    borderRadius: "16px",
    padding: "24px",
  },

  buttonPrimary: {
    background: "#8E5AB5",
    color: "#FFFFFF",
    border: "none",
    padding: "12px 20px",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  emptyState: {
    padding: "40px",
    textAlign: "center" as const,
    color: "#6D6186",
  },

  message: {
    marginTop: "12px",
    fontSize: "14px",
  },
};

export function getStatusBadgeStyle(status?: string) {
  switch (status) {
    case "Conferido":
    case "Calculado":
      return {
        background: "#E8F5E9",
        color: "#2E7D32",
        padding: "4px 10px",
        borderRadius: "999px",
        fontWeight: 600,
      };

    case "Pendente":
      return {
        background: "#FFF3E0",
        color: "#ED6C02",
        padding: "4px 10px",
        borderRadius: "999px",
        fontWeight: 600,
      };

    case "Erro":
      return {
        background: "#FFEBEE",
        color: "#C62828",
        padding: "4px 10px",
        borderRadius: "999px",
        fontWeight: 600,
      };

    default:
      return {
        background: "#EDE7F6",
        color: "#5B3A7A",
        padding: "4px 10px",
        borderRadius: "999px",
        fontWeight: 600,
      };
  }
}

export default theme;
