import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { authHeaders } from "../auth";
import TopBarStagiaire from "../components/TopBarStagiaire";

const API_URL = "http://127.0.0.1:8001";

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SUCCESS = "#2E7D32";
const DANGER = "#C62828";
const WARNING = "#EF6C00";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";
const BLUE = "#1565C0";
const BLUE_LIGHT = "#E8F0FE";
const RED_LIGHT = "#FDECEC";
const GREEN_LIGHT = "#E8F5E9";
const ORANGE_LIGHT = "#FFF3E0";

const CATEGORIES = {
  documents: {
    label: "Documents",
    icon: DescriptionIcon,
    bg: "#E0EAFF",
    color: "#1D4ED8",
  },
  messages: {
    label: "Messages",
    icon: ChatBubbleOutlineIcon,
    bg: "#FFF4E5",
    color: "#B45309",
  },
  systeme: {
    label: "Système",
    icon: SettingsIcon,
    bg: "#F1F5F9",
    color: "#475569",
  },
  reunion: {
    label: "Réunions",
    icon: EventIcon,
    bg: "#E8F5E9",
    color: "#2E7D32",
  },
};

function styleCategorie(categorie) {
  return CATEGORIES[categorie] || { label: categorie, icon: NotificationsIcon, bg: "#F1F5F9", color: "#475569" };
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

export default function NotificationsStagiaire() {
  const { profil, erreurProfil } = useOutletContext();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ongletActif, setOngletActif] = useState("tous");
  const [rechercheTexte, setRechercheTexte] = useState("");

  function rechargerNotifications() {
    fetch(`${API_URL}/moi/notifications`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNotifications(data))
      .catch(() => {});
  }

  useEffect(() => {
    fetch(`${API_URL}/moi/notifications`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger vos notifications.");
        setLoading(false);
      });
  }, []);

  function marquerLue(notificationId) {
    fetch(`${API_URL}/moi/notifications/${notificationId}/lu`, {
      method: "PUT",
      headers: { ...authHeaders() },
    })
      .then(() => rechargerNotifications())
      .catch(() => {});
  }

  function toutMarquerLu() {
    fetch(`${API_URL}/moi/notifications/tout-lire`, {
      method: "PUT",
      headers: { ...authHeaders() },
    })
      .then(() => rechargerNotifications())
      .catch(() => {});
  }

  const compteurs = useMemo(() => {
    const parCategorie = { tous: 0, documents: 0, messages: 0, systeme: 0, reunion: 0 };
    notifications.forEach((n) => {
      if (!n.lu) {
        parCategorie.tous += 1;
        if (parCategorie[n.categorie] !== undefined) parCategorie[n.categorie] += 1;
      }
    });
    return parCategorie;
  }, [notifications]);

  const notificationsFiltrees = useMemo(() => {
    let resultat = ongletActif === "tous" ? notifications : notifications.filter((n) => n.categorie === ongletActif);

    const recherche = rechercheTexte.trim().toLowerCase();
    if (recherche) {
      resultat = resultat.filter(
        (n) =>
          (n.titre || "").toLowerCase().includes(recherche) ||
          (n.contenu || "").toLowerCase().includes(recherche)
      );
    }

    return resultat;
  }, [notifications, ongletActif, rechercheTexte]);

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

  if (loading) {
    return (
      <>
        <TopBarStagiaire nom={profil?.nom} titre="Notifications" photoUrl={profil?.photo_url ? `${API_URL}${profil.photo_url}` : undefined} />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress sx={{ color: PRIMARY }} />
        </Box>
      </>
    );
  }

  return (
    <>
      <TopBarStagiaire
        nom={profil?.nom}
        titre="Notifications"
        photoUrl={profil?.photo_url ? `${API_URL}${profil.photo_url}` : undefined}
        valeurRecherche={rechercheTexte}
        onRechercheChange={setRechercheTexte}
        placeholderRecherche="Rechercher une notification..."
      />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: "#1F2937" }}>
                Notifications
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                Restez informé de vos documents, messages et mises à jour.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={toutMarquerLu}
              disabled={compteurs.tous === 0}
              sx={{
                borderColor: BORDER,
                color: PRIMARY,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { borderColor: PRIMARY, bgcolor: BACKGROUND },
              }}
            >
              Tout marquer comme lu
            </Button>
          </Box>

          {(error || erreurProfil) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || erreurProfil}
            </Alert>
          )}

          <Paper sx={{ border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, overflow: "visible" }}>
            <Tabs
              value={ongletActif}
              onChange={(e, val) => setOngletActif(val)}
              sx={{
                borderBottom: `1px solid ${BORDER}`,
                px: 1.5,
                pt: 0.5,
                overflow: "visible",
                "& .MuiTabs-scroller": { overflow: "visible !important" },
                "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 52, overflow: "visible" },
                "& .Mui-selected": { color: `${PRIMARY} !important` },
                "& .MuiTabs-indicator": { bgcolor: SECONDARY },
              }}
            >
              <Tab
                value="tous"
                label={
                  <Badge badgeContent={compteurs.tous} color="error" sx={{ "& .MuiBadge-badge": { right: -12, top: -2 } }}>
                    Tous
                  </Badge>
                }
              />
              <Tab
                value="documents"
                label={
                  <Badge badgeContent={compteurs.documents} color="error" sx={{ "& .MuiBadge-badge": { right: -12, top: -2 } }}>
                    Documents
                  </Badge>
                }
              />
              <Tab
                value="messages"
                label={
                  <Badge badgeContent={compteurs.messages} color="error" sx={{ "& .MuiBadge-badge": { right: -12, top: -2 } }}>
                    Messages
                  </Badge>
                }
              />
              <Tab
                value="systeme"
                label={
                  <Badge badgeContent={compteurs.systeme} color="error" sx={{ "& .MuiBadge-badge": { right: -12, top: -2 } }}>
                    Système
                  </Badge>
                }
              />
              <Tab
                value="reunion"
                label={
                  <Badge badgeContent={compteurs.reunion} color="error" sx={{ "& .MuiBadge-badge": { right: -12, top: -2 } }}>
                    Réunions
                  </Badge>
                }
              />
            </Tabs>

            {groupes.length === 0 ? (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <NotificationsIcon sx={{ fontSize: 40, color: TEXT_LIGHT, mb: 1 }} />
                <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                  Aucune notification pour le moment.
                </Typography>
              </Box>
            ) : (
              groupes.map(([libelleGroupe, items]) => (
                <Box key={libelleGroupe}>
                  <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#FAFAFA", borderBottom: `1px solid ${BORDER}` }}>
                    <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {libelleGroupe}
                    </Typography>
                  </Box>

                  {items.map((n) => {
                    const cat = styleCategorie(n.categorie);
                    const IconCat = cat.icon;
                    const estUrgent = n.urgence === "haute";
                    const estMessage = n.categorie === "messages";

                    return (
                      <Box
                        key={n.id}
                        onClick={() => !n.lu && marquerLue(n.id)}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                          p: 2.5,
                          borderBottom: `1px solid ${BORDER}`,
                          bgcolor: n.lu ? "#FFF" : "#F8FAFF",
                          cursor: n.lu ? "default" : "pointer",
                          "&:hover": { bgcolor: n.lu ? "#FAFAFA" : "#F1F5FF" },
                          "&:last-of-type": { borderBottom: "none" },
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
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: "#1F2937" }}>
                              {n.titre}
                            </Typography>
                            {estUrgent && (
                              <Chip
                                icon={<PriorityHighIcon sx={{ fontSize: "14px !important" }} />}
                                label="Urgent"
                                size="small"
                                sx={{
                                  bgcolor: "#FDECEA",
                                  color: SECONDARY,
                                  fontWeight: 700,
                                  height: 22,
                                  "& .MuiChip-icon": { color: SECONDARY },
                                }}
                              />
                            )}
                            {!n.lu && (
                              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: SECONDARY, flexShrink: 0 }} />
                            )}
                          </Box>

                          {n.contenu && (
                            <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 0.3 }}>
                              {n.contenu}
                            </Typography>
                          )}

                          <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block", mt: 0.5 }}>
                            {formaterHeure(n.date_creation)}
                          </Typography>

                          {estMessage && (
                            <Box sx={{ display: "flex", gap: 1, mt: 1.2 }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!n.lu) marquerLue(n.id);
                                  navigate("/stagiaire/encadrant");
                                }}
                                sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#141F45" }, textTransform: "none", fontWeight: 600 }}
                              >
                                Répondre
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!n.lu) marquerLue(n.id);
                                  navigate("/stagiaire/encadrant");
                                }}
                                sx={{ borderColor: BORDER, color: PRIMARY, textTransform: "none", fontWeight: 600 }}
                              >
                                Voir le fil
                              </Button>
                            </Box>
                          )}
                        </Box>

                        {!n.lu && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              marquerLue(n.id);
                            }}
                            title="Marquer comme lu"
                            sx={{ color: TEXT_LIGHT, flexShrink: 0 }}
                          >
                            <DoneAllIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ))
            )}
          </Paper>
      </Box>
    </>
  );
}
