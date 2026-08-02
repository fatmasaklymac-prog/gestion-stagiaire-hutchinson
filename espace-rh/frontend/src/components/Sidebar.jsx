import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DescriptionIcon from "@mui/icons-material/Description";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import MenuBookIcon from "@mui/icons-material/MenuBook"; // <--- AJOUTÉ POUR PFE BOOK

const drawerWidth = 260;
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";

// Définition centralisée des chemins pour éviter les erreurs de frappe
const PATHS = {
  DASHBOARD: "/",
  DEMANDES_STAGE: "/demandes-stage",
  STAGIAIRES: "/stagiaires",
  PRESENCES: "/presences",
  DOCUMENTS: "/documents",
  SESSIONS: "/sessions",
  ENCADRANTS: "/encadrants",
  DEPARTEMENTS: "/departements",
  PFE_BOOK: "/admin/pfe-book", // <--- CHEMIN VERS LE PANEL ADMIN PFE
};

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Helper pour vérifier si une route est active
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
        },
      }}
    >
      {/* Logo Hutchinson */}
      <Toolbar sx={{ py: 3, px: 3, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: "white", display: "flex", alignItems: "center", justifyContent: "center", p: 1, mb: 0.5 }}>
          <Box component="img" src="/logo-hutchinson.png" alt="Hutchinson" sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: "white", lineHeight: 1.2 }}>Hutchinson</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>Management System</Typography>
        </Box>
      </Toolbar>

      {/* Séparateur */}
      <Box sx={{ mx: 2, height: "1px", bgcolor: "rgba(255,255,255,0.1)", mb: 1 }} />

      {/* Menu Principal */}
      <List sx={{ px: 1.5, pt: 1 }}>
        
        {/* Dashboard */}
        <ListItemButton component={Link} to={PATHS.DASHBOARD} selected={isActive(PATHS.DASHBOARD)} sx={{ color: isActive(PATHS.DASHBOARD) ? "white" : "rgba(255,255,255,0.7)", borderRadius: 2.5, mb: 0.5, py: 1.2, px: 2, transition: "all 0.2s ease", "&.Mui-selected": { backgroundColor: SECONDARY, "&:hover": { backgroundColor: SECONDARY } }, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "white" } }}>
          <ListItemIcon sx={{ color: isActive(PATHS.DASHBOARD) ? "white" : "rgba(255,255,255,0.7)", minWidth: 40 }}><DashboardIcon /></ListItemIcon>
          <ListItemText><Typography sx={{ fontWeight: isActive(PATHS.DASHBOARD) ? 600 : 500, fontSize: "0.9rem", color: isActive(PATHS.DASHBOARD) ? "white" : "rgba(255,255,255,0.7)" }}>Dashboard</Typography></ListItemText>
        </ListItemButton>

        {/* Groupe Recrutement & PFE */}
        <Box sx={{ mt: 2, mb: 0.5, px: 2 }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 1 }}>RECRUTEMENT & PFE</Typography>
        </Box>

        <ListItemButton component={Link} to={PATHS.DEMANDES_STAGE} selected={isActive(PATHS.DEMANDES_STAGE)} sx={{ color: isActive(PATHS.DEMANDES_STAGE) ? "white" : "rgba(255,255,255,0.7)", borderRadius: 2.5, mb: 0.5, py: 1.2, px: 2, transition: "all 0.2s ease", "&.Mui-selected": { backgroundColor: SECONDARY, "&:hover": { backgroundColor: SECONDARY } }, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "white" } }}>
          <ListItemIcon sx={{ color: isActive(PATHS.DEMANDES_STAGE) ? "white" : "rgba(255,255,255,0.7)", minWidth: 40 }}><AssignmentIndIcon /></ListItemIcon>
          <ListItemText><Typography sx={{ fontWeight: isActive(PATHS.DEMANDES_STAGE) ? 600 : 500, fontSize: "0.9rem", color: isActive(PATHS.DEMANDES_STAGE) ? "white" : "rgba(255,255,255,0.7)" }}>Demandes de stage</Typography></ListItemText>
        </ListItemButton>

        {/* LIEN VERS LE PANEL ADMIN PFE BOOK */}
        <ListItemButton component={Link} to={PATHS.PFE_BOOK} selected={isActive(PATHS.PFE_BOOK)} sx={{ color: isActive(PATHS.PFE_BOOK) ? "white" : "rgba(255,255,255,0.7)", borderRadius: 2.5, mb: 0.5, py: 1.2, px: 2, transition: "all 0.2s ease", "&.Mui-selected": { backgroundColor: SECONDARY, "&:hover": { backgroundColor: SECONDARY } }, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "white" } }}>
          <ListItemIcon sx={{ color: isActive(PATHS.PFE_BOOK) ? "white" : "rgba(255,255,255,0.7)", minWidth: 40 }}><MenuBookIcon /></ListItemIcon>
          <ListItemText><Typography sx={{ fontWeight: isActive(PATHS.PFE_BOOK) ? 600 : 500, fontSize: "0.9rem", color: isActive(PATHS.PFE_BOOK) ? "white" : "rgba(255,255,255,0.7)" }}>Gestion PFE Book</Typography></ListItemText>
        </ListItemButton>

        {/* Groupe Gestion RH */}
        <Box sx={{ mt: 2, mb: 0.5, px: 2 }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 1 }}>GESTION RH</Typography>
        </Box>

        <ListItemButton component={Link} to={PATHS.STAGIAIRES} selected={isActive(PATHS.STAGIAIRES)} sx={{ color: isActive(PATHS.STAGIAIRES) ? "white" : "rgba(255,255,255,0.7)", borderRadius: 2.5, mb: 0.5, py: 1.2, px: 2, transition: "all 0.2s ease", "&.Mui-selected": { backgroundColor: SECONDARY, "&:hover": { backgroundColor: SECONDARY } }, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "white" } }}>
          <ListItemIcon sx={{ color: isActive(PATHS.STAGIAIRES) ? "white" : "rgba(255,255,255,0.7)", minWidth: 40 }}><PeopleIcon /></ListItemIcon>
          <ListItemText><Typography sx={{ fontWeight: isActive(PATHS.STAGIAIRES) ? 600 : 500, fontSize: "0.9rem", color: isActive(PATHS.STAGIAIRES) ? "white" : "rgba(255,255,255,0.7)" }}>Stagiaires</Typography></ListItemText>
        </ListItemButton>

        <ListItemButton component={Link} to={PATHS.PRESENCES} selected={isActive(PATHS.PRESENCES)} sx={{ color: isActive(PATHS.PRESENCES) ? "white" : "rgba(255,255,255,0.7)", borderRadius: 2.5, mb: 0.5, py: 1.2, px: 2, transition: "all 0.2s ease", "&.Mui-selected": { backgroundColor: SECONDARY, "&:hover": { backgroundColor: SECONDARY } }, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "white" } }}>
          <ListItemIcon sx={{ color: isActive(PATHS.PRESENCES) ? "white" : "rgba(255,255,255,0.7)", minWidth: 40 }}><EventAvailableIcon /></ListItemIcon>
          <ListItemText><Typography sx={{ fontWeight: isActive(PATHS.PRESENCES) ? 600 : 500, fontSize: "0.9rem", color: isActive(PATHS.PRESENCES) ? "white" : "rgba(255,255,255,0.7)" }}>Présences</Typography></ListItemText>
        </ListItemButton>

        <ListItemButton component={Link} to={PATHS.DOCUMENTS} selected={isActive(PATHS.DOCUMENTS)} sx={{ color: isActive(PATHS.DOCUMENTS) ? "white" : "rgba(255,255,255,0.7)", borderRadius: 2.5, mb: 0.5, py: 1.2, px: 2, transition: "all 0.2s ease", "&.Mui-selected": { backgroundColor: SECONDARY, "&:hover": { backgroundColor: SECONDARY } }, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "white" } }}>
          <ListItemIcon sx={{ color: isActive(PATHS.DOCUMENTS) ? "white" : "rgba(255,255,255,0.7)", minWidth: 40 }}><DescriptionIcon /></ListItemIcon>
          <ListItemText><Typography sx={{ fontWeight: isActive(PATHS.DOCUMENTS) ? 600 : 500, fontSize: "0.9rem", color: isActive(PATHS.DOCUMENTS) ? "white" : "rgba(255,255,255,0.7)" }}>Documents</Typography></ListItemText>
        </ListItemButton>

        <ListItemButton component={Link} to={PATHS.SESSIONS} selected={isActive(PATHS.SESSIONS)} sx={{ color: isActive(PATHS.SESSIONS) ? "white" : "rgba(255,255,255,0.7)", borderRadius: 2.5, mb: 0.5, py: 1.2, px: 2, transition: "all 0.2s ease", "&.Mui-selected": { backgroundColor: SECONDARY, "&:hover": { backgroundColor: SECONDARY } }, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "white" } }}>
          <ListItemIcon sx={{ color: isActive(PATHS.SESSIONS) ? "white" : "rgba(255,255,255,0.7)", minWidth: 40 }}><CalendarMonthIcon /></ListItemIcon>
          <ListItemText><Typography sx={{ fontWeight: isActive(PATHS.SESSIONS) ? 600 : 500, fontSize: "0.9rem", color: isActive(PATHS.SESSIONS) ? "white" : "rgba(255,255,255,0.7)" }}>Sessions</Typography></ListItemText>
        </ListItemButton>

        <ListItemButton component={Link} to={PATHS.ENCADRANTS} selected={isActive(PATHS.ENCADRANTS)} sx={{ color: isActive(PATHS.ENCADRANTS) ? "white" : "rgba(255,255,255,0.7)", borderRadius: 2.5, mb: 0.5, py: 1.2, px: 2, transition: "all 0.2s ease", "&.Mui-selected": { backgroundColor: SECONDARY, "&:hover": { backgroundColor: SECONDARY } }, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "white" } }}>
          <ListItemIcon sx={{ color: isActive(PATHS.ENCADRANTS) ? "white" : "rgba(255,255,255,0.7)", minWidth: 40 }}><SupervisorAccountIcon /></ListItemIcon>
          <ListItemText><Typography sx={{ fontWeight: isActive(PATHS.ENCADRANTS) ? 600 : 500, fontSize: "0.9rem", color: isActive(PATHS.ENCADRANTS) ? "white" : "rgba(255,255,255,0.7)" }}>Encadrants</Typography></ListItemText>
        </ListItemButton>

        <ListItemButton component={Link} to={PATHS.DEPARTEMENTS} selected={isActive(PATHS.DEPARTEMENTS)} sx={{ color: isActive(PATHS.DEPARTEMENTS) ? "white" : "rgba(255,255,255,0.7)", borderRadius: 2.5, mb: 0.5, py: 1.2, px: 2, transition: "all 0.2s ease", "&.Mui-selected": { backgroundColor: SECONDARY, "&:hover": { backgroundColor: SECONDARY } }, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "white" } }}>
          <ListItemIcon sx={{ color: isActive(PATHS.DEPARTEMENTS) ? "white" : "rgba(255,255,255,0.7)", minWidth: 40 }}><ApartmentIcon /></ListItemIcon>
          <ListItemText><Typography sx={{ fontWeight: isActive(PATHS.DEPARTEMENTS) ? 600 : 500, fontSize: "0.9rem", color: isActive(PATHS.DEPARTEMENTS) ? "white" : "rgba(255,255,255,0.7)" }}>Départements</Typography></ListItemText>
        </ListItemButton>

      </List>
    </Drawer>
  );
}

export default Sidebar;