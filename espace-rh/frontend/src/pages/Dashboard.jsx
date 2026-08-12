import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Typography, Paper, Chip, Grid, Avatar, Button,
  IconButton, Stack, Divider, TextField, InputAdornment,
  FormControl, Select, MenuItem, Fab, Tooltip,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import UploadIcon from "@mui/icons-material/Upload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import WarningIcon from "@mui/icons-material/Warning";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { authHeaders } from "../auth";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import TodayIcon from "@mui/icons-material/Today";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const API_URL = "http://127.0.0.1:8001";

const PRIMARY = "#152451";
const SECONDARY = "#E31E24";
const SUCCESS = "#1E8E5A";
const DANGER = "#C0392B";
const WARNING = "#C77700";
const BACKGROUND = "#F4F6FA";
const WHITE = "#FFFFFF";
const BORDER = "#E7E9F0";
const TEXT = "#1B2033";
const TEXT_LIGHT = "#6B7280";
const BLUE = "#2952CC";
const BLUE_LIGHT = "#EAF0FE";
const RED_LIGHT = "#FCEBEB";
const GREEN_LIGHT = "#E9F7EF";
const ORANGE_LIGHT = "#FDF1E3";
const PURPLE = "#6D28D9";
const PURPLE_LIGHT = "#F0EBFC";

const CARD_SHADOW = "0 1px 2px rgba(16, 24, 64, 0.04), 0 6px 20px -8px rgba(16, 24, 64, 0.08)";
const CARD_SX = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: BORDER,
  bgcolor: WHITE,
  boxShadow: CARD_SHADOW,
};

const DEPT_COLORS = [PRIMARY, SECONDARY, BLUE, WARNING, SUCCESS, PURPLE];
const JOURS_SEMAINE = ["L", "M", "M", "J", "V", "S", "D"];

const STATUTS_DEMANDE = {
  en_attente: { libelle: "En attente", couleur: "#B45309", fond: "#FEF3C7" },
  en_etude: { libelle: "En étude", couleur: "#1D4ED8", fond: "#DBEAFE" },
  entretien_programme: { libelle: "Entretien", couleur: PURPLE, fond: PURPLE_LIGHT },
  acceptee: { libelle: "Acceptée", couleur: "#15803D", fond: "#DCFCE7" },
  refusee: { libelle: "Refusée", couleur: "#B91C1C", fond: "#FEE2E2" },
};

function EnTeteSection({ icone: Icone, iconeCouleur = PRIMARY, iconeFond = BLUE_LIGHT, titre, action }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
        {Icone && (
          <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: iconeFond, color: iconeCouleur, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icone sx={{ fontSize: 18 }} />
          </Box>
        )}
        <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.02rem", letterSpacing: -0.2 }}>
          {titre}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [stagiaires, setStagiaires] = useState([]);
  const [activites, setActivites] = useState([]);
  const [presencesJour, setPresencesJour] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, en_cours: 0, termine: 0, certificats: 0 });
  const [demandesStage, setDemandesStage] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterUniversite, setFilterUniversite] = useState("");
  const [filterTuteur, setFilterTuteur] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [profil, setProfil] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/moi`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setProfil(data))
      .catch(() => setProfil(null));

    fetch(`${API_URL}/stagiaires`)
      .then((r) => r.json())
      .then((data) => {
        setStagiaires(data);
        const total = data.length;
        const en_cours = data.filter((s) => s.statut === "en_cours").length;
        const termine = data.filter((s) => s.statut === "termine").length;
        setStats({ total, en_cours, termine, certificats: termine });
      })
      .catch((err) => console.error("Erreur stagiaires:", err));

    fetch(`${API_URL}/activites`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setActivites(data.slice(0, 5)))
      .catch(() => setActivites([]));

    fetch(`${API_URL}/presences/jour`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setPresencesJour(data))
      .catch(() => setPresencesJour(null));

    fetch(`${API_URL}/sessions/a-venir`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setSessions([...data].sort((a, b) => new Date(a.date) - new Date(b.date))))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));

    fetch(`${API_URL}/demandes-stage`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setDemandesStage(data))
      .catch(() => setDemandesStage([]));
  }, []);

  // === EXPORT EXCEL ===
  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/stagiaires/export-excel`);
      if (!response.ok) throw new Error("Échec de l'export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stagiaires_hutchinson.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur export:", error);
      alert("Une erreur est survenue lors de l'exportation.");
    }
  };

  // === IMPORT EXCEL ===
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("Veuillez sélectionner un fichier Excel valide (.xlsx ou .xls)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/stagiaires/import-excel`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Échec de l'import");
      }

      const result = await response.json();
      alert(result.message);
      window.location.reload();
    } catch (error) {
      console.error("Erreur import:", error);
      alert(`Erreur : ${error.message}`);
    } finally {
      event.target.value = null;
    }
  };

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
    const colors = [PRIMARY, SECONDARY, "#64748B", SUCCESS, BLUE, WARNING];
    return colors[(id || 0) % colors.length];
  };
  const getInitials = (nom) => nom?.split(" ").map((n) => n[0]).join("").toUpperCase() || "??";

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

  const formatSessionDate = (dateStr) => {
    if (!dateStr) return { jour: "—", mois: "—" };
    const d = new Date(dateStr);
    return {
      jour: d.toLocaleDateString("fr-FR", { day: "2-digit" }),
      mois: d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "").toUpperCase(),
    };
  };

  const joursRestants = (dateStr) => {
    const dateFin = new Date(dateStr);
    const aujourdhui = new Date();
    return Math.max(0, Math.ceil((dateFin - aujourdhui) / (1000 * 60 * 60 * 24)));
  };

  const carteStat = (titre, valeur, Icone, couleurIcone, couleurFond, badge) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${BORDER}`,
        bgcolor: WHITE,
        height: "100%",
        transition: "all 0.25s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
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
          <Typography variant="caption" sx={{ color: SUCCESS, fontWeight: 700, bgcolor: GREEN_LIGHT, px: 1.2, py: 0.4, borderRadius: 1.5, fontSize: "0.75rem" }}>
            {badge}
          </Typography>
        )}
      </Box>
      <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem", mb: 1 }}>
        {titre}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 700, color: PRIMARY, lineHeight: 1, fontSize: "2rem" }}>
        {(valeur ?? 0).toLocaleString("fr-FR")}
      </Typography>
    </Paper>
  );

  const departementData = useMemo(() => {
    const total = stagiaires.length || 1;
    const groupes = stagiaires.reduce((acc, s) => {
      const dep = s.departements || "Non défini";
      acc[dep] = (acc[dep] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(groupes).map(([departement, count]) => ({ departement, count, pourcentage: Math.round((count / total) * 100) })).sort((a, b) => b.count - a.count);
  }, [stagiaires]);

  const listeDepartements = useMemo(() => [...new Set(stagiaires.map((s) => s.departements).filter(Boolean))], [stagiaires]);
  const listeUniversites = useMemo(() => [...new Set(stagiaires.map((s) => s.universite).filter(Boolean))], [stagiaires]);
  const listeTuteurs = useMemo(() => [...new Set(stagiaires.map((s) => s.tuteur || s.encadrant).filter(Boolean))], [stagiaires]);

  const statsRecrutement = useMemo(() => {
    const aujourdhui = new Date().toISOString().slice(0, 10);
    return {
      enAttente: demandesStage.filter((d) => d.statut === "en_attente").length,
      entretiensProgrammes: demandesStage.filter((d) => d.statut === "entretien_programme").length,
      aujourdhui: demandesStage.filter((d) => d.statut === "entretien_programme" && d.date_entretien === aujourdhui).length,
    };
  }, [demandesStage]);

  const candidaturesRecentes = useMemo(() => demandesStage.slice(0, 5), [demandesStage]);

  const handleSearchSubmit = (e) => {
    if (e.key !== "Enter") return;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterDept) params.set("departement", filterDept);
    if (filterUniversite) params.set("universite", filterUniversite);
    if (filterTuteur) params.set("tuteur", filterTuteur);
    navigate(`/stagiaires?${params.toString()}`);
  };

  const resetFiltres = () => {
    setSearch("");
    setFilterDept("");
    setFilterUniversite("");
    setFilterTuteur("");
  };

  const handleRelance = (e, s) => {
    e.stopPropagation();
    if (s.email) {
      window.location.href = `mailto:${s.email}?subject=${encodeURIComponent("Fin de stage prochaine")}`;
    } else {
      console.warn("Aucune adresse email pour ce stagiaire, impossible de relancer.");
    }
  };

  const buildMonthCells = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = startWeekday - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, current: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
    while (cells.length % 7 !== 0) cells.push({ day: cells.length - startWeekday - daysInMonth + 1, current: false });
    return cells;
  };

  const monthCells = useMemo(() => buildMonthCells(calendarDate), [calendarDate]);
  const eventDays = useMemo(() => {
    const set = new Set();
    sessions.forEach((s) => {
      if (!s.date) return;
      const d = new Date(s.date);
      if (d.getFullYear() === calendarDate.getFullYear() && d.getMonth() === calendarDate.getMonth()) set.add(d.getDate());
    });
    return set;
  }, [sessions, calendarDate]);

  const today = new Date();
  const isCurrentMonthShown = today.getFullYear() === calendarDate.getFullYear() && today.getMonth() === calendarDate.getMonth();
  const nomMois = calendarDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }).replace(/^./, (c) => c.toUpperCase());
  const changerMois = (delta) => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + delta, 1));
  const presencePourcentage = presencesJour && presencesJour.total ? Math.round((presencesJour.present / presencesJour.total) * 100) : null;

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      {/* En-tête */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", alignItems: "flex-start", mb: 3, pb: 3, borderBottom: "1px solid", borderColor: BORDER }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, mb: 0.4, fontSize: "1.6rem", letterSpacing: -0.5 }}>Bienvenue, {profil?.nom || "—"} !</Typography>
          <Typography sx={{ color: TEXT_LIGHT, fontSize: 14 }}>Voici un aperçu de l'activité de vos stagiaires aujourd'hui.</Typography>
        </Box>
        <Stack direction="row" spacing={1.25} useFlexGap sx={{ flexWrap: "wrap" }}>
          {/* BOUTON IMPORTER FONCTIONNEL */}
          
          {/* BOUTON EXPORTER FONCTIONNEL */}
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={handleImportClick} sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600, borderColor: BORDER, color: TEXT, bgcolor: WHITE, "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT } }}>Importer Excel</Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" style={{ display: "none" }} />
          <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={handleExport} sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600, bgcolor: PRIMARY, color: WHITE, "&:hover": { bgcolor: "#0F1B3D" } }}>Exporter</Button>
          
          <Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={() => navigate("/creer-compte-stagiaire")} sx={{ bgcolor: SECONDARY, borderRadius: 2.5, textTransform: "none", fontWeight: 700, px: 2.5, boxShadow: "0 6px 16px rgba(227,30,36,.22)", "&:hover": { bgcolor: "#c4171d", boxShadow: "0 8px 20px rgba(227,30,36,.3)" } }}>Créer un compte stagiaire</Button>
        </Stack>
      </Box>

    

      {/* Cartes statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>{carteStat("Total Stagiaires", stats.total, PeopleIcon, PRIMARY, "#E9ECF6", null)}</Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>{carteStat("Stages en Cours", stats.en_cours, AccessTimeIcon, SECONDARY, RED_LIGHT, null)}</Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>{carteStat("Stages Complétés", stats.termine, CheckCircleIcon, SUCCESS, GREEN_LIGHT, null)}</Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>{carteStat("Certificats Émis", stats.certificats, DescriptionIcon, WARNING, ORANGE_LIGHT, null)}</Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>{carteStat("Présence Jour", presencesJour ? presencesJour.present : 0, EventAvailableIcon, BLUE, BLUE_LIGHT, presencePourcentage != null ? `${presencePourcentage}%` : null)}</Grid>
      </Grid>

      {/* Module Recrutement */}
      <Paper elevation={0} sx={{ ...CARD_SX, p: 3, mb: 3 }}>
        <EnTeteSection icone={AssignmentIndIcon} iconeCouleur={PURPLE} iconeFond={PURPLE_LIGHT} titre="Recrutement" action={<Button size="small" endIcon={<ArrowForwardIcon fontSize="small" />} onClick={() => navigate("/demandes-stage")} sx={{ textTransform: "none", fontWeight: 700, color: PRIMARY, "&:hover": { bgcolor: BLUE_LIGHT } }}>Voir toutes les demandes</Button>} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1.25}>
              <Box onClick={() => navigate("/demandes-stage")} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2.5, bgcolor: "#FFFBEB", cursor: "pointer", transition: "background-color 0.15s ease", "&:hover": { bgcolor: "#FEF3C7" } }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#FEF3C7", color: "#B45309", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><HourglassTopIcon fontSize="small" /></Box>
                <Box><Typography variant="h6" sx={{ fontWeight: 800, color: "#B45309", lineHeight: 1 }}>{statsRecrutement.enAttente}</Typography><Typography variant="caption" sx={{ color: TEXT_LIGHT }}>Candidatures en attente</Typography></Box>
              </Box>
              <Box onClick={() => navigate("/demandes-stage")} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2.5, bgcolor: PURPLE_LIGHT, cursor: "pointer", transition: "background-color 0.15s ease", "&:hover": { bgcolor: "#E3DAFB" } }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#E3DAFB", color: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><EventAvailableIcon fontSize="small" /></Box>
                <Box><Typography variant="h6" sx={{ fontWeight: 800, color: PURPLE, lineHeight: 1 }}>{statsRecrutement.entretiensProgrammes}</Typography><Typography variant="caption" sx={{ color: TEXT_LIGHT }}>Entretiens programmés</Typography></Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2.5, bgcolor: RED_LIGHT }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#F8D7D5", color: DANGER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><TodayIcon fontSize="small" /></Box>
                <Box><Typography variant="h6" sx={{ fontWeight: 800, color: DANGER, lineHeight: 1 }}>{statsRecrutement.aujourdhui}</Typography><Typography variant="caption" sx={{ color: TEXT_LIGHT }}>Entretiens aujourd'hui</Typography></Box>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: TEXT_LIGHT, mb: 1.5, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Candidatures récentes</Typography>
            {candidaturesRecentes.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}><Typography variant="body2" sx={{ color: TEXT_LIGHT }}>Aucune candidature reçue pour le moment</Typography></Box>
            ) : (
              <Stack divider={<Divider sx={{ borderColor: "#F1F2F6" }} />} spacing={0}>
                {candidaturesRecentes.map((d) => {
                  const infoStatut = STATUTS_DEMANDE[d.statut] || STATUTS_DEMANDE.en_attente;
                  return (
                    <Box key={d.id} onClick={() => navigate(`/demandes-stage/${d.id}`)} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.1, px: 1, borderRadius: 2, cursor: "pointer", "&:hover": { bgcolor: BACKGROUND } }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: "0.72rem", fontWeight: 700, bgcolor: getAvatarColor(d.id) }}>{getInitials(`${d.prenom} ${d.nom}`)}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: TEXT, fontSize: "0.84rem" }} noWrap>{d.prenom} {d.nom}</Typography>
                        <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.74rem" }} noWrap>{d.etablissements} • {d.departements}</Typography>
                      </Box>
                      <Chip label={infoStatut.libelle} size="small" sx={{ bgcolor: infoStatut.fond, color: infoStatut.couleur, fontWeight: 700, borderRadius: "999px", flexShrink: 0, height: 24, fontSize: "0.7rem" }} />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Répartition par département + Dates Clés */}
      <Grid container spacing={2.5} sx={{ mb: 3, alignItems: "stretch" }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ ...CARD_SX, p: 3, height: "100%" }}>
            <EnTeteSection titre="Répartition par Département" iconeFond={BLUE_LIGHT} iconeCouleur={PRIMARY} />
            {departementData.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}><Typography variant="body2" sx={{ color: TEXT_LIGHT }}>Aucune donnée disponible</Typography></Box>
            ) : (
              <Stack spacing={2.25}>
                {departementData.map((d, index) => (
                  <Box key={d.departement}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: TEXT, fontSize: "0.82rem" }}>{d.departement}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: TEXT_LIGHT, fontSize: "0.8rem" }}>{d.count} · {d.pourcentage}%</Typography>
                    </Box>
                    <Box sx={{ width: "100%", height: 8, borderRadius: 5, bgcolor: "#EEF1F6", overflow: "hidden" }}>
                      <Box sx={{ width: `${d.pourcentage}%`, height: "100%", borderRadius: 5, bgcolor: DEPT_COLORS[index % DEPT_COLORS.length], transition: "width 0.4s ease" }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ ...CARD_SX, p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.02rem", letterSpacing: -0.2 }}>Dates Clés</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, bgcolor: BACKGROUND, borderRadius: 2, p: 0.25 }}>
                <IconButton size="small" onClick={() => changerMois(-1)} sx={{ color: TEXT_LIGHT }}><ChevronLeftIcon fontSize="small" /></IconButton>
                <Typography variant="caption" sx={{ color: TEXT, fontWeight: 700, minWidth: 92, textAlign: "center" }}>{nomMois}</Typography>
                <IconButton size="small" onClick={() => changerMois(1)} sx={{ color: TEXT_LIGHT }}><ChevronRightIcon fontSize="small" /></IconButton>
              </Box>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 2 }}>
              {JOURS_SEMAINE.map((j, i) => (<Typography key={`${j}-${i}`} variant="caption" sx={{ textAlign: "center", color: TEXT_LIGHT, fontWeight: 700, fontSize: "0.68rem" }}>{j}</Typography>))}
              {monthCells.map((cell, i) => {
                const isToday = cell.current && isCurrentMonthShown && cell.day === today.getDate();
                const hasEvent = cell.current && eventDays.has(cell.day);
                return (
                  <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 0.4 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: isToday ? PRIMARY : "transparent", color: isToday ? WHITE : cell.current ? TEXT : "#CBD5E1", fontSize: "0.74rem", fontWeight: isToday ? 700 : 500 }}>{cell.day}</Box>
                    <Box sx={{ width: 4, height: 4, borderRadius: "50%", mt: 0.3, bgcolor: hasEvent && !isToday ? SECONDARY : "transparent" }} />
                  </Box>
                );
              })}
            </Box>
            <Divider sx={{ mb: 2, borderColor: "#F1F2F6" }} />
            {sessionsLoading ? (
              <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.85rem" }}>Chargement des sessions...</Typography>
            ) : sessions.length === 0 ? (
              <Box sx={{ py: 3, textAlign: "center" }}><Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.85rem" }}>Aucune session programmée</Typography></Box>
            ) : (
              <Stack spacing={1.5}>
                {sessions.slice(0, 3).map((session, index) => {
                  const { jour, mois } = formatSessionDate(session.date);
                  const urgent = joursRestants(session.date) <= 3;
                  return (
                    <Box key={session.id ?? index} onClick={() => navigate("/sessions")} sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", p: 1, borderRadius: 2, transition: "background-color 0.15s ease", "&:hover": { bgcolor: BACKGROUND } }}>
                      <Box sx={{ minWidth: 44, textAlign: "center", borderRadius: 2, py: 0.6, bgcolor: urgent ? RED_LIGHT : BLUE_LIGHT, color: urgent ? DANGER : PRIMARY }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", lineHeight: 1 }}>{jour}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.58rem", lineHeight: 1.4 }}>{mois}</Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: TEXT, fontSize: "0.84rem" }} noWrap>{session.titre}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: TEXT_LIGHT }}>
                          {session.heure && <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>{session.heure}</Typography>}
                          {session.salle && (<Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}><LocationOnIcon sx={{ fontSize: 12 }} /><Typography variant="caption" sx={{ fontSize: "0.7rem" }}>{session.salle}</Typography></Box>)}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Alertes fins de stage + Logs récents */}
      <Grid container spacing={2.5} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ ...CARD_SX, p: 3, height: "100%" }}>
            <EnTeteSection titre="Alertes Fins de Stage" iconeFond={ORANGE_LIGHT} iconeCouleur={WARNING} icone={WarningIcon} action={alertes.length > 0 && (<Chip label={`${alertes.length} Échéance${alertes.length > 1 ? "s" : ""} Proche${alertes.length > 1 ? "s" : ""}`} size="small" sx={{ bgcolor: RED_LIGHT, color: DANGER, fontWeight: 700, borderRadius: 1.5 }} />)} />
            {alertes.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}><Typography variant="body2" sx={{ color: TEXT_LIGHT }}>Aucune fin de stage dans les 7 prochains jours</Typography></Box>
            ) : (
              <Stack spacing={1.25}>
                {alertes.map((s) => {
                  const jours = joursRestants(s.date_fin);
                  const urgent = jours <= 3;
                  return (
                    <Box key={s.id} onClick={() => navigate(`/stagiaires/${s.id}`)} sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.75, borderRadius: 2.5, bgcolor: urgent ? RED_LIGHT : "#FFF8E9", cursor: "pointer", transition: "box-shadow 0.15s ease", "&:hover": { boxShadow: "0 2px 8px rgba(16,24,64,0.08)" } }}>
                      <Box sx={{ width: 38, height: 38, borderRadius: 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: urgent ? "#F8D7D5" : "#FCE9BE", color: urgent ? DANGER : WARNING }}>{urgent ? <AccessTimeFilledIcon fontSize="small" /> : <WarningIcon fontSize="small" />}</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: urgent ? DANGER : "#9A5B00", fontSize: "0.88rem" }}>{s.prenom} {s.nom} — Contrat se termine dans {jours} jour{jours > 1 ? "s" : ""}</Typography>
                        <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.76rem" }}>Département: {s.departements || "—"}{(s.tuteur || s.encadrant) ? ` • Tuteur: ${s.tuteur || s.encadrant}` : ""}</Typography>
                      </Box>
                      <Button size="small" variant="outlined" onClick={(e) => handleRelance(e, s)} sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, flexShrink: 0, bgcolor: WHITE, borderColor: urgent ? DANGER : WARNING, color: urgent ? DANGER : WARNING, "&:hover": { bgcolor: urgent ? "#F8D7D5" : "#FCE9BE", borderColor: urgent ? DANGER : WARNING } }}>Relancer</Button>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ ...CARD_SX, p: 3, height: "100%" }}>
            <EnTeteSection titre="Logs Récents" iconeFond={BLUE_LIGHT} iconeCouleur={PRIMARY} />
            {activites.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}><Typography variant="body2" sx={{ color: TEXT_LIGHT }}>Aucune activité récente</Typography></Box>
            ) : (
              <Stack spacing={0} divider={<Divider sx={{ borderColor: "#F1F2F6" }} />}>
                {activites.map((a, index) => (
                  <Box key={a.id ?? index} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", py: 1.4 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", mt: 0.6, flexShrink: 0, bgcolor: getAvatarColor(a.id) }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: TEXT, fontSize: "0.84rem" }}>{a.action || a.description || "Activité"}</Typography>
                      <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.76rem" }}>{formatDate(a.date || a.created_at)}{(a.stagiaire_nom || a.stagiaire) ? ` • ${a.stagiaire_nom || a.stagiaire}` : ""}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Fab onClick={() => navigate("/stagiaires")} sx={{ position: "fixed", bottom: 32, right: 32, bgcolor: SECONDARY, color: WHITE, boxShadow: "0 8px 20px rgba(227,30,36,.3)", "&:hover": { bgcolor: "#c4171d" } }}><AddIcon /></Fab>
    </Box>
  );
}

export default Dashboard;