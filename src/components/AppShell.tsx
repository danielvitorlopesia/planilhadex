import React, { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import { Link as RouterLink, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 248;

type AppShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
  match: (pathname: string, search: string) => boolean;
};

export default function AppShell({ children }: AppShellProps) {
  const theme = useTheme();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        label: "Painel",
        to: "/",
        icon: <DashboardOutlinedIcon />,
        match: (pathname) => pathname === "/",
      },
      {
        label: "Modelos",
        to: "/models/new",
        icon: <AddBoxOutlinedIcon />,
        match: (pathname) => pathname.startsWith("/models/new"),
      },
      {
        label: "Planilhas",
        to: "/",
        icon: <TableChartOutlinedIcon />,
        match: (pathname) => pathname.startsWith("/spreadsheet/"),
      },
      {
        label: "Serviços por composição",
        to: "/models/new/create?model=service_composition",
        icon: <AccountTreeOutlinedIcon />,
        match: (pathname, search) =>
          pathname.startsWith("/models/new/create") &&
          search.includes("model=service_composition"),
      },
      {
        label: "Repactuação e revisão",
        to: "/models/new/create?model=economic_rebalance",
        icon: <CompareArrowsOutlinedIcon />,
        match: (pathname, search) =>
          pathname.startsWith("/models/new/create") &&
          search.includes("model=economic_rebalance"),
      },
    ],
    []
  );

  const activeTitle = useMemo(() => {
    const item = navItems.find((entry) =>
      entry.match(location.pathname, location.search)
    );
    return item?.label || "CustoPúblico";
  }, [location.pathname, location.search, navItems]);

  const handleToggleDrawer = () => {
    setMobileOpen((current) => !current);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FFFFFF",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.1} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "#EFE7F6",
              color: "#5B3A7A",
              flexShrink: 0,
            }}
          >
            <AutoAwesomeOutlinedIcon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: "#241B3A", lineHeight: 1.2 }}
            >
              CustoPúblico
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#6D6186", lineHeight: 1.2 }}
            >
              Gestão de Planilhas Públicas
            </Typography>
          </Box>
        </Stack>

        {!isDesktop ? (
          <IconButton onClick={handleToggleDrawer}>
            <ChevronLeftOutlinedIcon />
          </IconButton>
        ) : null}
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Chip
          size="small"
          label="Ambiente de trabalho"
          sx={{
            backgroundColor: "#F4EEFB",
            color: "#5B3A7A",
            fontWeight: 700,
            maxWidth: "100%",
          }}
        />
      </Box>

      <Divider />

      <List sx={{ px: 1.25, py: 1.25 }}>
        {navItems.map((item) => {
          const active = item.match(location.pathname, location.search);

          return (
            <ListItemButton
              key={`${item.label}-${item.to}`}
              component={RouterLink}
              to={item.to}
              onClick={() => {
                if (!isDesktop) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                minHeight: 44,
                backgroundColor: active ? "#F4EEFB" : "transparent",
                color: active ? "#5B3A7A" : "#4B4260",
                px: 1.5,
                "&:hover": {
                  backgroundColor: active ? "#EFE7F6" : "#F8F5FA",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: active ? "#5B3A7A" : "#7A6F91",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 13.5,
                  fontWeight: active ? 800 : 600,
                  noWrap: true,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />

      <Divider />

      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          sx={{
            borderRadius: 2.5,
            minHeight: 44,
            color: "#4B4260",
            px: 1.5,
            "&:hover": {
              backgroundColor: "#F8F5FA",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "#7A6F91" }}>
            <SettingsOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Configurações"
            primaryTypographyProps={{
              fontSize: 13.5,
              fontWeight: 600,
              noWrap: true,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#F7F3F8",
        overflowX: "clip",
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { lg: `${DRAWER_WIDTH}px` },
          bgcolor: "rgba(247,243,248,0.86)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(142, 90, 181, 0.10)",
          color: "#241B3A",
          overflowX: "clip",
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important", px: { xs: 2, md: 2.5 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ width: "100%", minWidth: 0 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
              {!isDesktop ? (
                <IconButton onClick={handleToggleDrawer} edge="start">
                  <MenuIcon />
                </IconButton>
              ) : null}

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "#8B7CA8", fontWeight: 700, lineHeight: 1.1 }}
                >
                  Plataforma
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#241B3A",
                    lineHeight: 1.15,
                    fontSize: "16px",
                  }}
                >
                  {activeTitle}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              <Chip
                label="Versão interna"
                size="small"
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  backgroundColor: "#F4EEFB",
                  color: "#5B3A7A",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              />
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "#8E5AB5",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                C
              </Avatar>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { lg: DRAWER_WIDTH },
          flexShrink: { lg: 0 },
          overflowX: "hidden",
        }}
      >
        <Drawer
          variant={isDesktop ? "permanent" : "temporary"}
          open={isDesktop ? true : mobileOpen}
          onClose={handleToggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid rgba(142, 90, 181, 0.10)",
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
          overflowX: "clip",
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important" }} />
        <Box
          sx={{
            px: { xs: 1.5, sm: 2, lg: 2.5 },
            py: { xs: 1.5, sm: 2 },
            maxWidth: "100%",
            mx: "auto",
            minWidth: 0,
            overflowX: "clip",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
