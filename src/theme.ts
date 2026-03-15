import { createTheme, alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8E5AB5",
      light: "#B88AD6",
      dark: "#5B3A7A",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#1565C0",
      light: "#5E92F3",
      dark: "#003C8F",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F7F3F8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#241B3A",
      secondary: "#6D6186",
    },
    success: {
      main: "#2E7D32",
    },
    warning: {
      main: "#ED6C02",
    },
    error: {
      main: "#C62828",
    },
    divider: "rgba(91, 58, 122, 0.12)",
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

    h4: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F7F3F8",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: "none",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 999,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "small",
        fullWidth: true,
      },
    },
  },
});

export const commonStyles = {
  pageBackground: "#F7F3F8",
  pageSectionGap: 3,
  cardRadius: 4,
  heroRadius: 5,
  borderedCard: {
    borderRadius: 4,
    border: "1px solid rgba(91, 58, 122, 0.12)",
    backgroundColor: "#FFFFFF",
  } satisfies SxProps<Theme>,
  heroCard: {
    borderRadius: 5,
    background:
      "linear-gradient(180deg, rgba(238,229,243,1) 0%, rgba(235,226,240,1) 100%)",
    border: "1px solid rgba(142, 90, 181, 0.12)",
  } satisfies SxProps<Theme>,
  mutedText: {
    color: "#6D6186",
  } satisfies SxProps<Theme>,
  titleText: {
    color: "#241B3A",
    fontWeight: 800,
  } satisfies SxProps<Theme>,
};

export function getStatusBadgeStyle(status?: string): SxProps<Theme> {
  switch (status) {
    case "Em elaboração":
      return {
        backgroundColor: alpha("#8E5AB5", 0.12),
        color: "#8E5AB5",
        fontWeight: 700,
      };

    case "Concluída":
      return {
        backgroundColor: alpha("#2E7D32", 0.12),
        color: "#2E7D32",
        fontWeight: 700,
      };

    case "Em revisão":
      return {
        backgroundColor: alpha("#ED6C02", 0.12),
        color: "#ED6C02",
        fontWeight: 700,
      };

    case "Exemplo nativo":
      return {
        backgroundColor: alpha("#1565C0", 0.12),
        color: "#1565C0",
        fontWeight: 700,
      };

    case "Pendente":
      return {
        backgroundColor: alpha("#ED6C02", 0.12),
        color: "#ED6C02",
        fontWeight: 700,
      };

    case "Conferido":
    case "Calculado":
      return {
        backgroundColor: alpha("#2E7D32", 0.12),
        color: "#2E7D32",
        fontWeight: 700,
      };

    default:
      return {
        backgroundColor: alpha("#8E5AB5", 0.12),
        color: "#8E5AB5",
        fontWeight: 700,
      };
  }
}

export default theme;
