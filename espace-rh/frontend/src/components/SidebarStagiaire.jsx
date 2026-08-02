import { useEffect, useState } from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Avatar } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import NotificationsIcon from "@mui/icons-material/Notifications";

const drawerWidth = 260;

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";

// Tant que chaque page n'a pas sa propre route dédiée, on distingue les
// items du menu par une clé unique ("key") plutôt que par leur chemin,
// puisque plusieurs items partagent temporairement le même "path".
const menuItems = [
  { key: "dashboard", text: "Tableau de bord", icon: <DashboardIcon />, path: "/stagiaire/dashboard" },
  { key: "profil", text: "Mon profil", icon: <PersonIcon />, path: "/stagiaire/profil" },
  { key: "documents", text: "Mes documents", icon: <DescriptionIcon />, path: "/stagiaire/documents" },
  { key: "activites", text: "Mes activités", icon: <AssignmentTurnedInIcon />, path: "/stagiaire/activites" },
  { key: "presences", text: "Mes présences", icon: <EventAvailableIcon />, path: "/stagiaire/presences" },
  { key: "encadrant", text: "Mon encadrant", icon: <SupervisorAccountIcon />, path: "/stagiaire/encadrant" },
  { key: "notifications", text: "Notifications", icon: <NotificationsIcon />, path: "/stagiaire/notifications" },
];

const STORAGE_KEY = "sidebarStagiaireActiveItem";

// Chemins qui ont leur propre page réelle : on peut s'y fier pour déduire
// l'item actif directement depuis l'URL.
const CLE_PAR_PATH_DEDIE = {
  "/stagiaire/documents": "documents",
  "/stagiaire/profil": "profil",
  "/stagiaire/notifications": "notifications",
};

function SidebarStagiaire({ nom, role = "Stagiaire", photoUrl }) {
  const location = useLocation();
  const initiale = nom ? nom.trim().charAt(0).toUpperCase() : "?";

  const [activeKey, setActiveKey] = useState(() => {
    const cleDediee = CLE_PAR_PATH_DEDIE[location.pathname];
    if (cleDediee) return cleDediee;
    return sessionStorage.getItem(STORAGE_KEY) || "dashboard";
  });

  // Si l'URL correspond à une page dédiée, elle prime toujours sur le
  // dernier clic mémorisé (ex: navigation directe, retour arrière, etc.).
  useEffect(() => {
    const cleDediee = CLE_PAR_PATH_DEDIE[location.pathname];
    if (cleDediee) {
      setActiveKey(cleDediee);
      sessionStorage.setItem(STORAGE_KEY, cleDediee);
    }
  }, [location.pathname]);

  function gererClic(item) {
    setActiveKey(item.key);
    sessionStorage.setItem(STORAGE_KEY, item.key);
  }

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
        {menuItems.map((item) => {
          const active = activeKey === item.key;
          return (
            <ListItemButton
              key={item.key}
              component={Link}
              to={item.path}
              onClick={() => gererClic(item)}
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
      </List>


    </Drawer>
  );
}

export default SidebarStagiaire;
