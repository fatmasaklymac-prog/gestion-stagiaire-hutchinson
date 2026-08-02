import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Alert,
  TextField,
  InputAdornment,
  Badge,
  Tooltip,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DescriptionIcon from "@mui/icons-material/Description";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CampaignIcon from "@mui/icons-material/Campaign";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SchoolIcon from "@mui/icons-material/School";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

const GROUPES_PAR_PAGE = 2;

const CATEGORIES = {
  evaluation: {
    label: "Évaluation",
    icon: PriorityHighIcon,
    bg: "#FDECEA",
    color: "#C62828",
  },
  document: {
    label: "Document",
    icon: DescriptionIcon,
    bg: "#E0EAFF",
    color: "#1D4ED8",
  },
  rh: {
    label: "RH",
    icon: CampaignIcon,
    bg: "#E8F0FE",
    color: "#1565C0",
  },
  presence: {
    label: "Présence",
    icon: CheckCircleIcon,
    bg: "#E8F5E9",
    color: "#2E7D32",
  },
};

function styleCategorie(categorie) {
  return (
    CATEGORIES[categorie] || {
      label: categorie,
      icon: NotificationsNoneIcon,
      bg: "#F1F5F9",
      color: "#475569",
    }
  );
}

function memeJour(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function estHier(date) {
  const hier = new Date();
  hier.setDate(hier.getDate() - 1);
  return memeJour(date, hier);
}

function formaterHeure(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formaterDateGroupe(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Plus ancien";
  const aujourdHui = new Date();

  if (memeJour(d, aujourdHui)) return "Aujourd'hui";
  if (estHier(d)) return "Hier";

  const libelle = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  return libelle.charAt(0).toUpperCase() + libelle.slice(1);
}

function CarteNotification({ n, marquerLue, navigate }) {
  const cat = styleCategorie(n.categorie);
  const IconCat = cat.icon;
  const estUrgent = n.urgence === "haute";
  const estEvaluation = n.categorie === "evaluation";

  return (
    <Box
      onClick={() => !n.lu && marquerLue(n.id)}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        p: 2.5,
        bgcolor: WHITE,
        borderRadius: 3,
        border: `1px solid ${BORDER}`,
        borderLeft: estUrgent ? `4px solid ${SECONDARY}` : `1px solid ${BORDER}`,
        cursor: n.lu ? "default" : "pointer",
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
        "&:hover": { boxShadow: "0 2px 6px rgba(16, 24, 40, 0.08)" },
        height: "100%",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: cat.bg,
          color: cat.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <IconCat fontSize="small" />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: "#1F2937" }}>
              {n.titre}
            </Typography>
            {!n.lu && (
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: SECONDARY, flexShrink: 0 }} />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: TEXT_LIGHT, flexShrink: 0, whiteSpace: "nowrap" }}>
            {formaterHeure(n.date_creation)}
          </Typography>
        </Box>

        {n.contenu && (
          <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 0.4 }}>
            {n.contenu}
          </Typography>
        )}

        {estEvaluation && (
          <Box sx={{ display: "flex", gap: 2, mt: 1.4, alignItems: "center" }}>
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                if (!n.lu) marquerLue(n.id);
                if (n.stagiaire_id) navigate(`/encadrant/evaluations/${n.stagiaire_id}`);
              }}
              sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#141F45" }, textTransform: "none", fontWeight: 600 }}
            >
              Évaluer maintenant
            </Button>
            <Typography
              variant="body2"
              onClick={(e) => {
                e.stopPropagation();
                if (!n.lu) marquerLue(n.id);
              }}
              sx={{ color: TEXT_LIGHT, fontWeight: 600, cursor: "pointer", "&:hover": { color: PRIMARY } }}
            >
              Ignorer
            </Typography>
          </Box>
        )}
      </Box>

      {!n.lu && (
        <Tooltip title="Marquer comme lu">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              marquerLue(n.id);
            }}
            sx={{ color: TEXT_LIGHT, flexShrink: 0 }}
          >
            <DoneAllIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

function NotificationsEncadrant() {
  const { erreurProfil } = useOutletContext();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rechercheTexte, setRechercheTexte] = useState("");
  const [nonLues, setNonLues] = useState(0);
  const [groupesAffiches, setGroupesAffiches] = useState(GROUPES_PAR_PAGE);
  const [banniereVisible, setBanniereVisible] = useState(true);

  function chargerCompteur() {
    fetch(`${API_URL}/encadrant/notifications/non-lues`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : { non_lues: 0 }))
      .then((data) => setNonLues(data.non_lues || 0))
      .catch(() => {});
  }

  function chargerNotifications() {
    fetch(`${API_URL}/encadrant/notifications`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setNotifications(data);
        setError("");
      })
      .catch(() => setError("Impossible de charger vos notifications."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    chargerNotifications();
    chargerCompteur();
  }, []);

  function marquerLue(notificationId) {
    fetch(`${API_URL}/encadrant/notifications/${notificationId}/lu`, {
      method: "PUT",
      headers: { ...authHeaders() },
    })
      .then(() => {
        chargerNotifications();
        chargerCompteur();
      })
      .catch(() => {});
  }

  function toutMarquerLu() {
    fetch(`${API_URL}/encadrant/notifications/tout-lire`, {
      method: "PUT",
      headers: { ...authHeaders() },
    })
      .then(() => {
        chargerNotifications();
        chargerCompteur();
      })
      .catch(() => {});
  }

  function toutEffacer() {
    if (!window.confirm("Effacer toutes les notifications ? Cette action est irréversible.")) return;
    fetch(`${API_URL}/encadrant/notifications`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
      .then(() => {
        chargerNotifications();
        chargerCompteur();
      })
      .catch(() => {});
  }

  const notificationsFiltrees = useMemo(() => {
    const recherche = rechercheTexte.trim().toLowerCase();
    if (!recherche) return notifications;
    return notifications.filter(
      (n) =>
        (n.titre || "").toLowerCase().includes(recherche) ||
        (n.contenu || "").toLowerCase().includes(recherche)
    );
  }, [notifications, rechercheTexte]);

  const groupes = useMemo(() => {
    const tri = [...notificationsFiltrees].sort(
      (a, b) => new Date(b.date_creation) - new Date(a.date_creation)
    );
    const map = new Map();
    tri.forEach((n) => {
      const cle = formaterDateGroupe(n.date_creation);
      if (!map.has(cle)) map.set(cle, []);
      map.get(cle).push(n);
    });
    return Array.from(map.entries());
  }, [notificationsFiltrees]);

  const groupesVisibles = groupes.slice(0, groupesAffiches);
  const ilResteDesGroupes = groupes.length > groupesAffiches;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100%", position: "relative" }}>
      {/* Barre du haut */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: { xs: 2, md: 3 },
          bgcolor: WHITE,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <TextField
          size="small"
          placeholder="Rechercher une notification..."
          value={rechercheTexte}
          onChange={(e) => setRechercheTexte(e.target.value)}
          sx={{ width: { xs: "100%", sm: 360 }, "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: BACKGROUND } }}
          slotProps={{
  input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: TEXT_LIGHT, fontSize: 20 }} />
              </InputAdornment>
            ),
            },
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton>
            <Badge badgeContent={nonLues} color="error">
              <NotificationsNoneIcon sx={{ color: PRIMARY }} />
            </Badge>
          </IconButton>
          <IconButton>
            <AccountCircleIcon sx={{ color: TEXT_LIGHT, fontSize: 32 }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: PRIMARY }}>
              Centre de notifications
            </Typography>
            <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
              Gérez les alertes et les mises à jour de vos stagiaires en temps réel.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={toutMarquerLu}
              disabled={nonLues === 0}
              sx={{
                borderColor: BORDER,
                color: PRIMARY,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: WHITE,
                "&:hover": { borderColor: PRIMARY, bgcolor: BACKGROUND },
              }}
            >
              Marquer comme lu
            </Button>
            <Button
              variant="contained"
              startIcon={<DeleteSweepIcon />}
              onClick={toutEffacer}
              disabled={notifications.length === 0}
              sx={{
                bgcolor: SECONDARY,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#B71C1C" },
              }}
            >
              Tout effacer
            </Button>
          </Box>
        </Box>

        {(error || erreurProfil) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || erreurProfil}
          </Alert>
        )}

        {groupes.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center", bgcolor: WHITE, borderRadius: 3, border: `1px solid ${BORDER}` }}>
            <NotificationsNoneIcon sx={{ fontSize: 40, color: TEXT_LIGHT, mb: 1 }} />
            <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
              Aucune notification pour le moment.
            </Typography>
          </Box>
        ) : (
          <>
            {groupesVisibles.map(([libelleGroupe, items]) => {
              const estAujourdHui = libelleGroupe === "Aujourd'hui";
              return (
                <Box key={libelleGroupe} sx={{ mb: 3 }}>
                  <Chip
                    label={libelleGroupe.toUpperCase()}
                    size="small"
                    sx={{
                      mb: 1.5,
                      bgcolor: "#EEF0F5",
                      color: TEXT_LIGHT,
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      letterSpacing: 0.5,
                    }}
                  />

                  {estAujourdHui ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {items.map((n) => (
                        <CarteNotification key={n.id} n={n} marquerLue={marquerLue} navigate={navigate} />
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                        gap: 1.5,
                        alignItems: "stretch",
                      }}
                    >
                      {items.map((n) => (
                        <CarteNotification key={n.id} n={n} marquerLue={marquerLue} navigate={navigate} />
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}

            {ilResteDesGroupes && (
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Button
                  onClick={() => setGroupesAffiches((n) => n + GROUPES_PAR_PAGE)}
                  endIcon={<ExpandMoreIcon />}
                  sx={{ color: PRIMARY, fontWeight: 700, textTransform: "none" }}
                >
                  Charger les notifications précédentes
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Bandeau flottant : purement visuel, aucune fonctionnalité de formation n'existe encore */}
      {banniereVisible && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 10,
          }}
        >
          <Button
            variant="contained"
            startIcon={<SchoolIcon />}
            onClick={() => setBanniereVisible(false)}
            sx={{
              bgcolor: PRIMARY,
              color: WHITE,
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2.5,
              px: 2.5,
              py: 1.2,
              boxShadow: "0 4px 12px rgba(29, 43, 91, 0.35)",
              "&:hover": { bgcolor: "#141F45" },
            }}
          >
            Nouveau module de formation disponible
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default NotificationsEncadrant;
