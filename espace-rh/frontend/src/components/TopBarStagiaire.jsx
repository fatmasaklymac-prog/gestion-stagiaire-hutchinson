import { Box, InputBase, IconButton, Avatar, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsIcon from "@mui/icons-material/Settings";

const BORDER = "#E5E7EB";

function TopBarStagiaire({ nom, titre = "Tableau de bord", photoUrl, valeurRecherche, onRechercheChange, placeholderRecherche = "Rechercher..." }) {
  const navigate = useNavigate();
  const initiale = nom ? nom.trim().charAt(0).toUpperCase() : "?";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        py: 1.5,
        bgcolor: "white",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1F2937" }}>
        {titre}
      </Typography>

<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton size="small" onClick={() => navigate("/stagiaire/notifications")}>
          <NotificationsNoneIcon />
        </IconButton>
        <IconButton size="small" onClick={() => navigate("/stagiaire/profil")}>
          <SettingsIcon />
        </IconButton>
        <Avatar src={photoUrl || undefined} sx={{ width: 34, height: 34, bgcolor: "#1D2B5B", fontSize: "0.85rem", ml: 1 }}>
          {initiale}
        </Avatar>
      </Box>
    </Box>
  );
}

export default TopBarStagiaire;
