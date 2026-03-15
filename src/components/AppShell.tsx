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

const DRAWER_WIDTH = 280;

type AppShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
  match: (pathname: string) => boolean;
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
        match: (pathname) =>
          pathname.startsWith("/models/new/create") &&
          location.search.includes("model=service_composition"),
      },
      {
        label: "Repactuação e revisão",
        to: "/models/new/create?model=economic_rebalance",
        icon: <CompareArrowsOutlinedIcon />,
        match: (pathname) =>
          pathname.startsWith("/models/new/create") &&
          location.search.includes("model=economic_rebalance"),
      },
    ],
    [location.search]
  );

  const activeTitle = useMemo(() => {
    const item = navItems.find((entry) => entry.match(location.pathname));
    return item?.label || "CustoPúblico";
  }, [location.pathname, navItems]);

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
      }}
    >
      <Box
        sx={{
          px: 2.25,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "#EFE7F6",
              color: "#5B3A7A",
            }}
          >
            <AutoAwesomeOutlinedIcon fontSize="small" />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#241B3A" }}>
              CustoPúblico
            </Typography>
            <Typography variant="caption" sx={{ color: "#6D6186" }}>
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

      <Box sx={{ px: 2.25, pb: 2 }}>
        <Chip
          size="small"
          label="Ambiente de trabalho"
          sx={{
            backgroundColor: "#F4EEFB",
            color: "#5B3A7A",
            fontWeight: 700,
          }}
        />
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 1.5 }}>
        {navItems.map((item) => {
          const active = item.match(location.pathname);

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
                borderRadius: 3,
                mb: 0.75,
                minHeight: 48,
                backgroundColor: active ? "#F4EEFB" : "transparent",
                color: active ? "#5B3A7A" : "#4B4260",
                "&:hover": {
                  backgroundColor: active ? "#EFE7F6" : "#F8F5FA",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: active ? "#5B3A7A" : "#7A6F91",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: active ? 800 : 600,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />

      <Divider />

      <Box sx={{ p: 2 }}>
        <ListItemButton
          sx={{
            borderRadius: 3,
            minHeight: 48,
            color: "#4B4260",
            "&:hover": {
              backgroundColor: "#F8F5FA",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "#7A6F91" }}>
            <SettingsOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Configurações"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 600,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F7F3F8" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { lg: `${DRAWER_WIDTH}px` },
          bgcolor: "rgba(247,243,248,0.82)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(142, 90, 181, 0.10)",
          color: "#241B3A",
        }}
      >
        <Toolbar sx={{ minHeight: "72px !important", px: { xs: 2, md: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ width: "100%" }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {!isDesktop ? (
                <IconButton onClick={handleToggleDrawer} edge="start">
                  <MenuIcon />
                </IconButton>
              ) : null}

              <Box>
                <Typography variant="caption" sx={{ color: "#8B7CA8", fontWeight: 700 }}>
                  Plataforma
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#241B3A" }}>
                  {activeTitle}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.25} alignItems="center">
              <Chip
                label="Versão interna"
                size="small"
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  backgroundColor: "#F4EEFB",
                  color: "#5B3A7A",
                  fontWeight: 700,
                }}
              />
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#8E5AB5",
                  fontSize: 14,
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
        }}
      >
        <Toolbar sx={{ minHeight: "72px !important" }} />
        <Box
          sx={{
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 2, sm: 3 },
            maxWidth: "1680px",
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
