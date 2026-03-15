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
    borderRadius: 16,
  },
  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
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
  xl: "24px",
};

export const theme: AppTheme = Object.assign(muiTheme, {
  colors,
  radius,
});

export const commonStyles: Record<string, CSSProperties> = {
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
    color: theme.colors.primaryDark,
    textDecoration: "none",
    fontWeight: 600,
  },

  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "20px",
    fontWeight: 700,
    color: theme.colors.textStrong,
  },

  card: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radius.xl,
    padding: "28px",
  },

  cardOverline: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: theme.colors.textMuted,
  },

  cardTitle: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    color: theme.colors.textStrong,
    fontWeight: 700,
  },

  cardText: {
    margin: 0,
    color: theme.colors.textSoft,
    fontSize: "16px",
    lineHeight: 1.5,
  },

  buttonPrimary: {
    background: theme.palette.primary.main,
    color: "#FFFFFF",
    border: "none",
    padding: "12px 20px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
    cursor: "pointer",
  },

  primaryButton: {
    background: theme.palette.primary.main,
    color: "#FFFFFF",
    border: "none",
    padding: "12px 20px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
    cursor: "pointer",
  },

  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: theme.colors.textMedium,
  },

  message: {
    marginTop: "12px",
    fontSize: "14px",
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
      };

    case "Pendente":
    case "Em revisão":
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
