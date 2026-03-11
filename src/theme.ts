import type { CSSProperties } from "react";

export const theme = {
  colors: {
    primary: "#8c58a2",
    primaryDark: "#6f4381",
    primarySoft: "#efe7f3",
    primaryBorder: "#dccde4",
    pageBackground: "#f7f4f9",

    textStrong: "#2f2038",
    textMedium: "#4b3a56",
    textSoft: "#6f5a78",
    textMuted: "#7b6a84",

    white: "#ffffff",
    danger: "#b42318",

    successBg: "#e7f6ea",
    successText: "#1f7a3d",

    tableHeader: "#f6f0f8",
    tableBorder: "#ece2f0",
  },

  radius: {
    sm: "12px",
    md: "16px",
    lg: "20px",
    xl: "24px",
    pill: "999px",
  },

  shadow: {
    soft: "0 8px 24px rgba(140, 88, 162, 0.06)",
    highlight: "0 10px 24px rgba(140, 88, 162, 0.18)",
  },

  spacing: {
    page: "32px 16px",
    card: "28px",
    cardCompact: "20px",
  },

  font: {
    family: "Arial, sans-serif",
  },
};

export const commonStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: theme.colors.pageBackground,
    fontFamily: theme.font.family,
    padding: theme.spacing.page,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  backLink: {
    color: theme.colors.primary,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "16px",
  },
  sectionTitle: {
    fontSize: "22px",
    margin: "0 0 16px 0",
    color: theme.colors.primaryDark,
  },
  card: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.card,
    boxShadow: theme.shadow.soft,
  },
  buttonPrimary: {
    display: "inline-block",
    background: theme.colors.primaryDark,
    color: theme.colors.white,
    textDecoration: "none",
    padding: "16px 22px",
    borderRadius: "18px",
    fontWeight: 700,
    fontSize: "16px",
  },
  emptyState: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radius.lg,
    padding: "24px",
    color: theme.colors.textSoft,
  },
  message: {
    fontSize: "16px",
    color: theme.colors.textMedium,
  },
};
