import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Chip, Grid, Avatar, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Stack, Alert, AlertTitle, Divider
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EmailIcon from "@mui/icons-material/Email";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import WarningIcon from "@mui/icons-material/Warning";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8001";

// === COULEURS ===
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SUCCESS = "#2E7D32";
const DANGER = "#C62828";
const WARNING = "#EF6C00";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT = "#1F2937";
const TEXT_LIGHT = "#6B7280";
const BLUE_LIGHT = "#E8F0FE";
const RED_LIGHT = "#FDECEC";
const GREEN_LIGHT = "#E8F5E9";
const ORANGE_LIGHT = "#FFF3E0";

function Dashboard() {
  const navigate = useNavigate();
  const [stagiaires, setStagiaires] = useState([]);
  const [activites, setActivites] = useState([]);
  const [stats, setStats] = useState({
    total: 0, en_cours: 0, termine: 0, certificats: 0
  });

  useEffect(() => {
    fetch(`${API_URL}/stagiaires`)
      .then((r) => r.json())
      .then((data) => {
        setStagiaires(data);
        const total = data.length;
        const en_cours = data.filter((s) => s.statut === "en_cours").length;
        const termine = data.filter((s) => s.statut === "termine").length;
        setStats({
          total,
          en_cours,
          termine,
          certificats: termine,
        });
      })
      .catch((err) => console.error("Erreur stagiaires:", err));

    // Gestion d'erreur pour activites
    fetch(`${API_URL}/activites`)
      .then((r) => {
        if (!r.ok) throw new Error("Erreur activites");
        return r.json();
      })
      .then((data) => {
        setActivites(data.slice(0, 5));
      })
      .catch((err) => {
        console.error("Erreur activites:", err);
        setActivites([]); // fallback vide
      });
  }, []);

  const getAlertesFinStage = () => {
    const aujourdhui = new Date();
    const dans7Jours = new Date();
    dans7Jours.setDate(aujourdhui.getDate() + 7);

    return stagiaires.filter((s) => {
      if (!s.date_fin || s.statut === "termine") return false;
      const dateFin = new Date(s.date_fin);
      return dateFin >= aujourdhui && dateFin <= dans7Jours;
    });
  };

  const alertes = getAlertesFinStage();

  const getAvatarColor = (id) => {
    const colors = [PRIMARY, SECONDARY, "#64748B", SUCCESS, "#1565c0", WARNING];
    return colors[(id || 0) % colors.length];
  };

  const getChipProps = (statut) => {
    switch (statut) {
      case "en_cours":
        return { label: "En cours", sx: { bgcolor: GREEN_LIGHT, color: SUCCESS, fontWeight: 600, borderRadius: 1.5 } };
      case "termine":
      case "complete":
        return { label: "Complété", sx: { bgcolor: BLUE_LIGHT, color: "#1565c0", fontWeight: 600, borderRadius: 1.5 } };
      case "en_attente":
      case "programme":
        return { label: "Programmé", sx: { bgcolor: ORANGE_LIGHT, color: WARNING, fontWeight: 600, borderRadius: 1.5 } };
      case "a_reviser":
        return { label: "À réviser", sx: { bgcolor: RED_LIGHT, color: DANGER, fontWeight: 600, borderRadius: 1.5 } };
      default:
        return { label: statut, sx: { bgcolor: "#f5f5f5", color: "#616161", fontWeight: 600, borderRadius: 1.5 } };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const heures = Math.floor(diff / (1000 * 60 * 60));
    const jours = Math.floor(heures / 24);

    if (heures < 1) return "À l'instant";
    if (heures < 24) return `Il y a ${heures}h`;
    if (jours === 1) return "Hier";
    if (jours < 7) return `Il y a ${jours} jours`;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };

  const getInitials = (nom) => {
    return nom?.split(" ").map(n => n[0]).join("").toUpperCase() || "??";
  };

  const sessions = [
    { date: "12", mois: "OCT", titre: "Sécurité Industrielle", heure: "14:00", salle: "Salle A4" },
    { date: "15", mois: "OCT", titre: "Onboarding Nouveaux", heure: "09:30", salle: "Distanciel" },
  ];

  const carteStat = (titre, valeur, sousTitre, Icone, couleurIcone, couleurFond, badge) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: BORDER,
        bgcolor: WHITE,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.25s ease",
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: couleurFond,
            color: couleurIcone,
          }}
        >
          <Icone sx={{ fontSize: 24 }} />
        </Box>
        {badge && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: SUCCESS, 
              fontWeight: 600, 
              bgcolor: GREEN_LIGHT, 
              px: 1.2, 
              py: 0.4, 
              borderRadius: 1.5,
              fontSize: "0.75rem"
            }}
          >
            {badge}
          </Typography>
        )}
      </Box>
      <Typography 
        variant="body2" 
        sx={{ 
          color: TEXT_LIGHT, 
          fontWeight: 600, 
          textTransform: "uppercase", 
          letterSpacing: 0.5, 
          fontSize: "0.7rem",
          mb: 1.5
        }}
      >
        {titre}
      </Typography>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700, 
          color: PRIMARY, 
          lineHeight: 1,
          mb: 1,
          fontSize: "2rem"
        }}
      >
        {valeur.toLocaleString("fr-FR")}
      </Typography>
      {sousTitre && (
        <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>
          {sousTitre}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box
      sx={{
        bgcolor: BACKGROUND,
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: PRIMARY,
            mb: 0.5,
            fontSize: "1.75rem"
          }}
        >
          Tableau de Bord
        </Typography>
        <Typography
          sx={{
            color: TEXT_LIGHT,
            fontSize: 14,
          }}
        >
          Bienvenue, voici l'aperçu de vos programmes de formation aujourd'hui.
        </Typography>
      </Box>

      {/* ALERTES FINS DE STAGE */}
      {alertes.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            sx={{
              borderRadius: 3,
              bgcolor: "#FFF8E1",
              color: "#E65100",
              border: "1px solid #FFE082",
              py: 1.5,
              "& .MuiAlert-icon": { color: WARNING },
            }}
          >
            <AlertTitle sx={{ fontWeight: 700, color: "#E65100", fontSize: "0.95rem" }}>
              {alertes.length} stage{alertes.length > 1 ? "s" : ""} se termine{alertes.length > 1 ? "nt" : ""} dans les 7 prochains jours
            </AlertTitle>
            <Box sx={{ mt: 1 }}>
              {alertes.map((s) => (
                <Box
                  key={s.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 0.5,
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={() => navigate(`/stagiaires/${s.id}`)}
                >
                  <Avatar 
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      fontSize: "0.75rem", 
                      bgcolor: getAvatarColor(s.id),
                      fontWeight: 700
                    }}
                  >
                    {`${s.prenom[0]}${s.nom[0]}`.toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: "#E65100" }}>
                    <strong>{s.prenom} {s.nom}</strong> — fin le {new Date(s.date_fin).toLocaleDateString("fr-FR")}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Alert>
        </Box>
      )}

      {/* Cartes statistiques */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {carteStat(
            "Total Stagiaires",
            stats.total,
            "Actuellement enregistrés",
            PeopleIcon,
            PRIMARY,
            "#E8EAF6",
            "+12%"
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {carteStat(
            "Stages en Cours",
            stats.en_cours,
            "Actuellement actifs",
            AccessTimeIcon,
            SECONDARY,
            "#FFEBEE",
            null
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {carteStat(
            "Stages Complétés",
            stats.termine,
            "Total historique",
            CheckCircleIcon,
            SUCCESS,
            "#E8F5E9",
            null
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {carteStat(
            "Certificats Émis",
            stats.certificats,
            "Délivrés",
            DescriptionIcon,
            WARNING,
            "#FFF3E0",
            null
          )}
        </Grid>
      </Grid>

      {/* Section principale */}
      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        {/* Activité Récente */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: BORDER,
              bgcolor: WHITE,
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.1rem" }}>
                Activité Récente
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: PRIMARY,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 0.8,
                  fontSize: "0.85rem",
                  "&:hover": {
                    bgcolor: "#16224a"
                  }
                }}
              >
                Voir tout
              </Button>
            </Box>

            {activites.length === 0 ? (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6 }}>
                <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center" }}>
                  Aucune activité récente
                </Typography>
              </Box>
            ) : (
              <TableContainer
                sx={{
                  borderRadius: 3,
                  overflow: "hidden"
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 700, color: PRIMARY, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "none", py: 1.5 }}>Stagiaire</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: PRIMARY, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "none", py: 1.5 }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: PRIMARY, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "none", py: 1.5 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: PRIMARY, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "none", py: 1.5 }}>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activites.map((a) => (
                      <TableRow 
                        key={a.id} 
                        hover
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "#F8FAFC"
                          },
                          "&:last-child td": { borderBottom: "none" }
                        }}
                      >
                        <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: getAvatarColor(a.id), 
                                width: 36, 
                                height: 36, 
                                fontSize: 13, 
                                fontWeight: 700 
                              }}
                            >
                              {getInitials(a.stagiaire_nom || a.stagiaire || "User")}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: TEXT, fontSize: "0.85rem" }}>
                              {a.stagiaire_nom || a.stagiaire || "Utilisateur"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 1.5 }}>
                          <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.85rem" }}>{a.action || a.description || "—"}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 1.5 }}>
                          <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.85rem" }}>{formatDate(a.date || a.created_at)}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 1.5 }}>
                          <Chip size="small" {...getChipProps(a.statut || a.type)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Colonne de droite */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3} sx={{ height: "100%" }}>
            {/* Actions Rapides */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid",
                borderColor: BORDER,
                bgcolor: WHITE,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, mb: 3, fontSize: "1.1rem" }}>
                Actions Rapides
              </Typography>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/stagiaires")}
                  sx={{
                    bgcolor: PRIMARY,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.2,
                    justifyContent: "flex-start",
                    px: 2,
                    "&:hover": { bgcolor: "#16224a" }
                  }}
                >
                  Ajouter un stagiaire
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.2,
                    justifyContent: "flex-start",
                    px: 2,
                    borderColor: BORDER,
                    color: TEXT,
                    "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT }
                  }}
                >
                  Importer des documents
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.2,
                    justifyContent: "flex-start",
                    px: 2,
                    borderColor: BORDER,
                    color: TEXT,
                    "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT }
                  }}
                >
                  Générer un rapport
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.2,
                    justifyContent: "flex-start",
                    px: 2,
                    borderColor: BORDER,
                    color: TEXT,
                    "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT }
                  }}
                >
                  Envoyer un message
                </Button>
              </Stack>
            </Paper>

            {/* Sessions à venir */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid",
                borderColor: BORDER,
                bgcolor: WHITE,
                flex: 1,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.1rem" }}>
                  Sessions à venir
                </Typography>
                <IconButton size="small" sx={{ color: TEXT_LIGHT }}>
                  <MoreHorizIcon />
                </IconButton>
              </Box>

              <Stack spacing={2.5}>
                {sessions.map((session, index) => (
                  <Box key={index}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                      {/* Date */}
                      <Box
                        sx={{
                          minWidth: 52,
                          height: 52,
                          borderRadius: 3,
                          bgcolor: BLUE_LIGHT,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: PRIMARY,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.65rem", lineHeight: 1, textTransform: "uppercase" }}>
                          {session.mois}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1 }}>
                          {session.date}
                        </Typography>
                      </Box>

                      {/* Infos */}
                      <Box sx={{ flex: 1, pt: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: TEXT, mb: 0.5, fontSize: "0.9rem" }}>
                          {session.titre}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: TEXT_LIGHT }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccessTimeFilledIcon sx={{ fontSize: 13 }} />
                            <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                              {session.heure}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 13 }} />
                            <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                              {session.salle}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    {index < sessions.length - 1 && (
                      <Divider sx={{ mt: 2.5, borderColor: "#f1f5f9" }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;