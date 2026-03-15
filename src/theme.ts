import { createTheme } from "@mui/material/styles";
import type { CSSProperties } from "react";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8E5AB5",
      dark: "#5B3A7A",
      light: "#B89ACF",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#1565C0",
      dark: "#0D47A1",
      light: "#5E92F3",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#C62828",
    },
    warning: {
      main: "#ED6C02",
    },
    success: {
      main: "#2E7D32",
    },
    background: {
      default: "#F7F3F8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#241B3A",
      secondary: "#6D6186",
    },
    divider: "#E3D9F1",
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),

    h1: { fontSize: "32px", fontWeight: 700 },
    h2: { fontSize: "26px", fontWeight: 700 },
    h3: { fontSize: "22px", fontWeight: 700 },
    h4: { fontSize: "18px", fontWeight: 600 },
    body1: { fontSize: "15px" },
    body2: { fontSize: "14px" },
  },
});

export type AppTheme = typeof muiTheme & {
  colors: {
    white: string;
    danger: string;
    primaryDark: string;
    primaryBorder: string;
    textMuted: string;
    textMedium: string;
    textSoft: string;
    textStrong: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
};

const colors: AppTheme["colors"] = {
  white: "#FFFFFF",
  danger: "#C62828",
  primaryDark: "#5B3A7A",
  primaryBorder: "#E3D9F1",
  textMuted: "#9B8BB5",
  textMedium: "#6D6186",
  textSoft: "#7A6F91",
  textStrong: "#241B3A",
};

const radius: AppTheme["radius"] = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "22px",
};

export const theme: AppTheme = Object.assign(muiTheme, {
  colors,
  radius,
});

export const commonStyles: Record<string, CSSProperties> = {

  page: {
    background: "#F7F3F8",
    minHeight: "100vh",
    padding: "28px",
  },

  /* LARGURA GLOBAL DO SISTEMA */
  container: {
    maxWidth: "1600px",
    margin: "0 auto",
    width: "100%",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "14px",
    color: theme.colors.primaryDark,
    textDecoration: "none",
    fontWeight: 600,
  },

  sectionTitle: {
    margin: "0 0 10px 0",
    fontSize: "18px",
    fontWeight: 700,
    color: theme.colors.textStrong,
  },

  card: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radius.xl,
    padding: "22px",
  },

  cardOverline: {
    margin: "0 0 6px 0",
    fontSize: "13px",
    color: theme.colors.textMuted,
  },

  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    color: theme.colors.textStrong,
    fontWeight: 700,
  },

  cardText: {
    margin: 0,
    color: theme.colors.textSoft,
    fontSize: "14px",
    lineHeight: 1.5,
  },

  buttonPrimary: {
    background: theme.palette.primary.main,
    color: "#FFFFFF",
    border: "none",
    padding: "10px 18px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
    cursor: "pointer",
  },

  primaryButton: {
    background: theme.palette.primary.main,
    color: "#FFFFFF",
    border: "none",
    padding: "10px 18px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
    cursor: "pointer",
  },

  emptyState: {
    padding: "30px",
    textAlign: "center",
    color: theme.colors.textMedium,
  },

  message: {
    marginTop: "10px",
    fontSize: "13px",
  },
};

export function getStatusBadgeStyle(status?: string): CSSProperties {
  switch (status) {
    case "Conferido":
    case "Calculado":
    case "Concluída":
      return {
        background: "#E8F5E9",
        color: "#2E7D32",
        padding: "4px 10px",
        borderRadius: "999px",
        fontWeight: 600,
        fontSize: "12px",
      };

    case "Pendente":
    case "Em revisão":
      return {
        background: "#FFF3E0",
        color: "#ED6C02",
        padding: "4px 10px",
        borderRadius: "999px",
        fontWeight: 600,
        fontSize: "12px",
      };

    case "Erro":
      return {
        background: "#FFEBEE",
        color: "#C62828",
        padding: "4px 10px",
        borderRadius: "999px",
        fontWeight: 600,
        fontSize: "12px",
      };

    default:
      return {
        background: "#EDE7F6",
        color: "#5B3A7A",
        padding: "4px 10px",
        borderRadius: "999px",
        fontWeight: 600,
        fontSize: "12px",
      };
  }
}

export default theme;
