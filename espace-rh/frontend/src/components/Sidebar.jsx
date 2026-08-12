import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DescriptionIcon from "@mui/icons-material/Description";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const drawerWidth = 260;
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";

const PATHS = {
  DASHBOARD: "/",
  DEMANDES_STAGE: "/demandes-stage",
  STAGIAIRES: "/stagiaires",
  PRESENCES: "/presences",
  DOCUMENTS: "/documents",
  SESSIONS: "/sessions",
  ENCADRANTS: "/encadrants",
  DEPARTEMENTS: "/departements",
  PFE_BOOK: "/admin/pfe-book",
};

const menuGroupes = [
  {
    titre: null,
    items: [
      { key: "dashboard", text: "Tableau de bord", icon: <DashboardIcon />, path: PATHS.DASHBOARD },
    ],
  },
  {
    titre: "Recrutement & PFE",
    items: [
      { key: "demandes_stage", text: "Demandes de stage", icon: <AssignmentIndIcon />, path: PATHS.DEMANDES_STAGE },
      { key: "pfe_book", text: "Gestion PFE Book", icon: <MenuBookIcon />, path: PATHS.PFE_BOOK },
    ],
  },
  {
    titre: "Gestion RH",
    items: [
      { key: "stagiaires", text: "Stagiaires", icon: <PeopleIcon />, path: PATHS.STAGIAIRES },
      { key: "presences", text: "Présences", icon: <EventAvailableIcon />, path: PATHS.PRESENCES },
      { key: "documents", text: "Documents", icon: <DescriptionIcon />, path: PATHS.DOCUMENTS },
      { key: "sessions", text: "Sessions", icon: <CalendarMonthIcon />, path: PATHS.SESSIONS },
      { key: "encadrants", text: "Encadrants", icon: <SupervisorAccountIcon />, path: PATHS.ENCADRANTS },
      { key: "departements", text: "Départements", icon: <ApartmentIcon />, path: PATHS.DEPARTEMENTS },
    ],
  },
];

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          backgroundColor: PRIMARY,
          color: "white",
          borderRight: "none",
          boxShadow: "4px 0 20px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{ position: "relative", height: 90, display: "flex", justifyContent: "center", overflow: "visible" }}>
        <Box
          component="img"
          src="/images/sigle-hutchinson.png"
          alt="Hutchinson"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "70px",
            width: "60%",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Box>

      <List sx={{ flexGrow: 1, px: 1.5 }}>
        {menuGroupes.map((groupe, index) => (
          <Box key={groupe.titre || `groupe-${index}`}>
            {groupe.titre && (
              <Box sx={{ mt: 2, mb: 0.5, px: 1.5 }}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 1, fontSize: "0.68rem", textTransform: "uppercase" }}>
                  {groupe.titre}
                </Typography>
              </Box>
            )}
            {groupe.items.map((item) => {
              const active = isActive(item.path);
              return (
                <ListItemButton
                  key={item.key}
                  component={Link}
                  to={item.path}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: active ? SECONDARY : "transparent",
                    "&:hover": { bgcolor: active ? SECONDARY : "rgba(255,255,255,0.08)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "white", minWidth: 38 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{ primary: { fontSize: "0.9rem", fontWeight: active ? 600 : 400 } }}
                  />
                </ListItemButton>
              );
            })}
          </Box>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
