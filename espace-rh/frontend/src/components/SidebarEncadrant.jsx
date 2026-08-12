import { useEffect, useState } from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Avatar, Badge } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventNoteIcon from "@mui/icons-material/EventNote";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationsIcon from "@mui/icons-material/Notifications";

const drawerWidth = 260;

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";

const menuItems = [
  { key: "dashboard", text: "Tableau de bord", icon: <DashboardIcon />, path: "/encadrant/dashboard" },
  { key: "stagiaires", text: "Mes stagiaires", icon: <GroupsIcon />, path: "/encadrant/stagiaires" },
  { key: "evaluations", text: "Évaluations", icon: <AssignmentTurnedInIcon />, path: "/encadrant/evaluations" },
  { key: "reunions", text: "Réunions", icon: <EventNoteIcon />, path: "/encadrant/reunions" },
  { key: "presences", text: "Présences", icon: <EventAvailableIcon />, path: "/encadrant/presences" },
  { key: "messagerie", text: "Messagerie", icon: <ChatIcon />, path: "/encadrant/messagerie" },
  { key: "notifications", text: "Notifications", icon: <NotificationsIcon />, path: "/encadrant/notifications" },
];

const STORAGE_KEY = "sidebarEncadrantActiveItem";

const CLE_PAR_PATH_DEDIE = {
  "/encadrant/dashboard": "dashboard",
  "/encadrant/stagiaires": "stagiaires",
  "/encadrant/evaluations": "evaluations",
  "/encadrant/reunions": "reunions",
  "/encadrant/presences": "presences",
  "/encadrant/messagerie": "messagerie",
  "/encadrant/notifications": "notifications",
};

function SidebarEncadrant({ nom, role = "Encadrant", photoUrl, messagesNonLus = 0, notificationsNonLues = 0 }) {
  const location = useLocation();
  const initiale = nom ? nom.trim().charAt(0).toUpperCase() : "?";

  const [activeKey, setActiveKey] = useState(() => {
    const cleDediee = CLE_PAR_PATH_DEDIE[location.pathname];
    if (cleDediee) return cleDediee;
    return sessionStorage.getItem(STORAGE_KEY) || "dashboard";
  });

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
              <ListItemIcon sx={{ color: "white", minWidth: 38 }}>
                {item.key === "messagerie" && messagesNonLus > 0 ? (
                  <Badge badgeContent={messagesNonLus} color="error">
                    {item.icon}
                  </Badge>
                ) : item.key === "notifications" && notificationsNonLues > 0 ? (
                  <Badge badgeContent={notificationsNonLues} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
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

export default SidebarEncadrant;
