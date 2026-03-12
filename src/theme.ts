import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8c58a2",
      light: "#a97abd",
      dark: "#6f3f84",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#6f3f84",
      light: "#8c58a2",
      dark: "#532c63",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f7f4f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#2f2235",
      secondary: "#6f6277",
    },
    divider: "#e7ddeb",
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          backgroundColor: "#f7f4f9",
        },
        "*": {
          boxSizing: "border-box",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(90deg, #6f3f84 0%, #8c58a2 100%)",
          boxShadow: "0 8px 24px rgba(111, 63, 132, 0.18)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0 10px 30px rgba(81, 52, 96, 0.10)",
          border: "1px solid #eee4f3",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 16,
          paddingBlock: 10,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default theme;
