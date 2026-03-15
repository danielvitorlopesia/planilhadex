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
    borderRadius: 12,
  },

  typography: {
    fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
    h1: { fontSize: "28px", fontWeight: 700 },
    h2: { fontSize: "24px", fontWeight: 700 },
    h3: { fontSize: "20px", fontWeight: 700 },
    h4: { fontSize: "17px", fontWeight: 700 },
    h5: { fontSize: "15px", fontWeight: 700 },
    h6: { fontSize: "14px", fontWeight: 700 },
    body1: { fontSize: "14px" },
    body2: { fontSize: "13px" },
    subtitle1: { fontSize: "14px" },
    subtitle2: { fontSize: "13px" },
    caption: { fontSize: "12px" },
    button: {
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "none",
    },
  },

  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "12px",
          paddingRight: "12px",
          "@media (min-width:600px)": {
            paddingLeft: "16px",
            paddingRight: "16px",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 18,
          "&:last-child": {
            paddingBottom: 18,
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 14,
          paddingRight: 14,
          minHeight: 38,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: 12,
          height: 28,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontSize: 14,
        },
        input: {
          paddingTop: 10,
          paddingBottom: 10,
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: 13,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: 13,
          paddingTop: 10,
          paddingBottom: 10,
        },
        head: {
          fontWeight: 700,
        },
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
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
  xl: "20px",
};

export const theme: AppTheme = Object.assign(muiTheme, {
  colors,
  radius,
});

export const commonStyles: Record<string, CSSProperties> = {
  page: {
    background: "#F7F3F8",
    minHeight: "100vh",
    padding: "20px",
  },

  container: {
    maxWidth: "100%",
    margin: "0 auto",
    width: "100%",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "12px",
    color: theme.colors.primaryDark,
    textDecoration: "none",
    fontWeight: 600,
  },

  sectionTitle: {
    margin: "0 0 8px 0",
    fontSize: "17px",
    fontWeight: 700,
    color: theme.colors.textStrong,
  },

  card: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radius.xl,
    padding: "18px",
  },

  cardOverline: {
    margin: "0 0 6px 0",
    fontSize: "12px",
    color: theme.colors.textMuted,
  },

  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    color: theme.colors.textStrong,
    fontWeight: 700,
  },

  cardText: {
    margin: 0,
    color: theme.colors.textSoft,
    fontSize: "14px",
    lineHeight: 1.45,
  },

  buttonPrimary: {
    background: theme.palette.primary.main,
    color: "#FFFFFF",
    border: "none",
    padding: "9px 16px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
    cursor: "pointer",
  },

  primaryButton: {
    background: theme.palette.primary.main,
    color: "#FFFFFF",
    border: "none",
    padding: "9px 16px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
    cursor: "pointer",
  },

  emptyState: {
    padding: "24px",
    textAlign: "center",
    color: theme.colors.textMedium,
  },

  message: {
    marginTop: "8px",
    fontSize: "12px",
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
