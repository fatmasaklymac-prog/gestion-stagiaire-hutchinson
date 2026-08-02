import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Alert,
  TextField,
  InputAdornment,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Pagination,
  Snackbar,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import UpdateIcon from "@mui/icons-material/Update";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FilterListIcon from "@mui/icons-material/FilterList";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";
import VideocamIcon from "@mui/icons-material/Videocam";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

const PAR_PAGE = 4;

const STATUTS = {
  a_venir: { label: "À venir", bg: "#E0EAFF", color: "#1D4ED8", dot: "#1D4ED8" },
  en_cours: { label: "En cours", bg: "#FDECEA", color: "#C62828", dot: "#C62828" },
  terminee: { label: "Terminée", bg: "#E8F5E9", color: "#2E7D32", dot: "#2E7D32" },
  annulee: { label: "Annulée", bg: "#F1F5F9", color: "#6B7280", dot: "#9CA3AF" },
};

const AVATAR_COLORS = ["#1D4ED8", "#C2185B", "#7B1FA2", "#00838F", "#EF6C00", "#2E7D32"];

const JOURS_SEMAINE = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

function statutInfo(statut) {
  return STATUTS[statut] || STATUTS.a_venir;
}

function typeInfo(type) {
  if (type === "distanciel") {
    return { label: "Distanciel", icon: VideocamIcon };
  }
  return { label: "Présentiel", icon: PlaceIcon };
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

function formaterDateCourte(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  const libelle = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  return libelle.replace(".", "").replace(/^(\d+) (\w)/, (m, jour, lettre) => `${jour} ${lettre.toUpperCase()}`);
}

function debutSemaine(date) {
  const d = new Date(date);
  const jour = d.getDay();
  const diff = jour === 0 ? -6 : 1 - jour;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function finSemaine(date) {
  const debut = debutSemaine(date);
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 6);
  fin.setHours(23, 59, 59, 999);
  return fin;
}

function genererGrilleCalendrier(annee, mois) {
  const premierJour = new Date(annee, mois, 1);
  const joursDansMois = new Date(annee, mois + 1, 0).getDate();
  const joursMoisPrecedent = new Date(annee, mois, 0).getDate();
  let decalage = premierJour.getDay() - 1;
  if (decalage < 0) decalage = 6;

  const grille = [];
  for (let i = decalage - 1; i >= 0; i--) {
    grille.push({ jour: joursMoisPrecedent - i, courant: false, dateStr: null });
  }
  for (let j = 1; j <= joursDansMois; j++) {
    grille.push({ jour: j, courant: true, dateStr: toISODate(new Date(annee, mois, j)) });
  }
  let jourSuivant = 1;
  while (grille.length % 7 !== 0) {
    grille.push({ jour: jourSuivant, courant: false, dateStr: null });
    jourSuivant += 1;
  }
  return grille;
}

const FORMULAIRE_VIDE = {
  stagiaire_id: "",
  date_reunion: "",
  heure: "",
  type_reunion: "presentiel",
  lieu_ou_lien: "",
  objet: "",
  notes: "",
};

function ReunionsEncadrant() {
  const { erreurProfil } = useOutletContext() || {};

  const [reunions, setReunions] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rechercheTexte, setRechercheTexte] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [dateSelectionnee, setDateSelectionnee] = useState(null);
  const [page, setPage] = useState(1);

  const aujourdHui = new Date();
  const [moisAffiche, setMoisAffiche] = useState(new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1));

  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [reunionEnEditionId, setReunionEnEditionId] = useState(null);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [erreurFormulaire, setErreurFormulaire] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const [menuAncre, setMenuAncre] = useState(null);
  const [reunionMenuId, setReunionMenuId] = useState(null);

  const [dialogAnnulerOuvert, setDialogAnnulerOuvert] = useState(false);
  const [reunionAAnnuler, setReunionAAnnuler] = useState(null);

  const [filtreAncre, setFiltreAncre] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  function chargerReunions() {
    return fetch(`${API_URL}/encadrant/reunions`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setReunions(data);
        setError("");
      })
      .catch(() => setError("Impossible de charger les réunions."));
  }

  function chargerStagiaires() {
    return fetch(`${API_URL}/moi/mes-stagiaires`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setStagiaires(data))
      .catch(() => {});
  }

  useEffect(() => {
    Promise.all([chargerReunions(), chargerStagiaires()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nomStagiaire(s) {
    return `${s.prenom || ""} ${s.nom || ""}`.trim();
  }

  function initiales(prenom, nom) {
    return `${(prenom || "?").charAt(0)}${(nom || "").charAt(0)}`.toUpperCase();
  }

  function couleurAvatar(stagiaireId) {
    const idx = (stagiaireId || 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  }

  const aujourdHuiStr = toISODate(aujourdHui);
  const semaineDebut = debutSemaine(aujourdHui);
  const semaineFin = finSemaine(aujourdHui);

  const statAujourdHui = reunions.filter((r) => r.date_reunion === aujourdHuiStr && r.statut !== "annulee").length;
  const statCetteSemaine = reunions.filter((r) => {
    const d = new Date(`${r.date_reunion}T00:00:00`);
    return d >= semaineDebut && d <= semaineFin && r.statut !== "annulee";
  }).length;
  const statAVenir = reunions.filter((r) => r.statut === "a_venir").length;
  const statTerminees = reunions.filter((r) => r.statut === "terminee").length;

  const reunionsFiltrees = useMemo(() => {
    const recherche = rechercheTexte.trim().toLowerCase();
    return reunions
      .filter((r) => {
        if (filtreStatut !== "tous" && r.statut !== filtreStatut) return false;
        if (dateSelectionnee && r.date_reunion !== dateSelectionnee) return false;
        if (recherche) {
          const texte = `${r.stagiaire_prenom || ""} ${r.stagiaire_nom || ""} ${r.objet || ""}`.toLowerCase();
          if (!texte.includes(recherche)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const clefA = `${a.date_reunion}T${a.heure}`;
        const clefB = `${b.date_reunion}T${b.heure}`;
        return clefB.localeCompare(clefA);
      });
  }, [reunions, rechercheTexte, filtreStatut, dateSelectionnee]);

  const nbPages = Math.max(1, Math.ceil(reunionsFiltrees.length / PAR_PAGE));
  const pageCorrigee = Math.min(page, nbPages);
  const debutPage = (pageCorrigee - 1) * PAR_PAGE;
  const reunionsPage = reunionsFiltrees.slice(debutPage, debutPage + PAR_PAGE);

  useEffect(() => {
    setPage(1);
  }, [rechercheTexte, filtreStatut, dateSelectionnee]);

  const grilleCalendrier = useMemo(
    () => genererGrilleCalendrier(moisAffiche.getFullYear(), moisAffiche.getMonth()),
    [moisAffiche]
  );

  function statutsDuJour(dateStr) {
    const statuts = new Set(reunions.filter((r) => r.date_reunion === dateStr).map((r) => r.statut));
    return Array.from(statuts);
  }

  function changerMois(delta) {
    setMoisAffiche((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function ouvrirCreation() {
    setModeEdition(false);
    setReunionEnEditionId(null);
    setFormulaire({ ...FORMULAIRE_VIDE, date_reunion: toISODate(aujourdHui) });
    setErreurFormulaire("");
    setDialogOuvert(true);
  }

  function ouvrirEdition(reunion) {
    setModeEdition(true);
    setReunionEnEditionId(reunion.id);
    setFormulaire({
      stagiaire_id: reunion.stagiaire_id,
      date_reunion: reunion.date_reunion,
      heure: reunion.heure,
      type_reunion: reunion.type_reunion,
      lieu_ou_lien: reunion.lieu_ou_lien || "",
      objet: reunion.objet,
      notes: reunion.notes || "",
    });
    setErreurFormulaire("");
    setDialogOuvert(true);
    setMenuAncre(null);
  }

  function fermerDialog() {
    if (envoiEnCours) return;
    setDialogOuvert(false);
  }

  function soumettreFormulaire() {
    if (!formulaire.stagiaire_id || !formulaire.date_reunion || !formulaire.heure || !formulaire.objet.trim()) {
      setErreurFormulaire("Merci de renseigner le stagiaire, la date, l'heure et l'objet.");
      return;
    }
    setErreurFormulaire("");
    setEnvoiEnCours(true);

    const payload = modeEdition
      ? {
          date_reunion: formulaire.date_reunion,
          heure: formulaire.heure,
          type_reunion: formulaire.type_reunion,
          lieu_ou_lien: formulaire.lieu_ou_lien || null,
          objet: formulaire.objet,
          notes: formulaire.notes || null,
        }
      : {
          stagiaire_id: Number(formulaire.stagiaire_id),
          date_reunion: formulaire.date_reunion,
          heure: formulaire.heure,
          type_reunion: formulaire.type_reunion,
          lieu_ou_lien: formulaire.lieu_ou_lien || null,
          objet: formulaire.objet,
          notes: formulaire.notes || null,
        };

    const url = modeEdition
      ? `${API_URL}/encadrant/reunions/${reunionEnEditionId}`
      : `${API_URL}/encadrant/reunions`;
    const methode = modeEdition ? "PUT" : "POST";

    fetch(url, {
      method: methode,
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => {
        setDialogOuvert(false);
        chargerReunions();
        setSnackbar({
          open: true,
          message: modeEdition ? "Réunion modifiée avec succès." : "Réunion planifiée avec succès.",
          severity: "success",
        });
      })
      .catch(() => setErreurFormulaire("Une erreur est survenue. Merci de réessayer."))
      .finally(() => setEnvoiEnCours(false));
  }

  function demanderAnnulation(reunion) {
    setReunionAAnnuler(reunion);
    setDialogAnnulerOuvert(true);
    setMenuAncre(null);
  }

  function confirmerAnnulation() {
    if (!reunionAAnnuler) return;
    fetch(`${API_URL}/encadrant/reunions/${reunionAAnnuler.id}/annuler`, {
      method: "PUT",
      headers: { ...authHeaders() },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => {
        chargerReunions();
        setSnackbar({ open: true, message: "Réunion annulée.", severity: "success" });
      })
      .catch(() => setSnackbar({ open: true, message: "Impossible d'annuler cette réunion.", severity: "error" }))
      .finally(() => {
        setDialogAnnulerOuvert(false);
        setReunionAAnnuler(null);
      });
  }

  function envoyerRappel(reunion) {
    setMenuAncre(null);
    fetch(`${API_URL}/encadrant/reunions/${reunion.id}/rappel`, {
      method: "PUT",
      headers: { ...authHeaders() },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => {
        setSnackbar({
          open: true,
          message: "Rappel envoyé au stagiaire.",
          severity: "success",
        });
      })
      .catch(() =>
        setSnackbar({ open: true, message: "Impossible d'envoyer le rappel.", severity: "error" })
      );
  }

  function exporterPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(29, 43, 91);
    doc.text("Liste des réunions", 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [["Date", "Heure", "Stagiaire", "Type", "Objet", "Statut"]],
      body: reunionsFiltrees.map((r) => [
        formaterDateCourte(r.date_reunion),
        r.heure,
        `${r.stagiaire_prenom || ""} ${r.stagiaire_nom || ""}`.trim(),
        typeInfo(r.type_reunion).label,
        r.objet,
        statutInfo(r.statut).label,
      ]),
      headStyles: { fillColor: [29, 43, 91] },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 247, 251] },
    });

    doc.save(`reunions_${toISODate(new Date())}.pdf`);
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100%" }}>
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
          placeholder="Rechercher un stagiaire ou une réunion..."
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
            <NotificationsNoneIcon sx={{ color: PRIMARY }} />
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
              Réunions
            </Typography>
            <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
              Planifiez et suivez vos réunions avec les stagiaires.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={ouvrirCreation}
            sx={{
              bgcolor: SECONDARY,
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              "&:hover": { bgcolor: "#B71C1C" },
            }}
          >
            Nouvelle réunion
          </Button>
        </Box>

        {(error || erreurProfil) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || erreurProfil}
          </Alert>
        )}

        {/* Cartes stats */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          <CarteStat titre="Réunions aujourd'hui" valeur={statAujourdHui} icon={TodayIcon} bg="#E0EAFF" color="#1D4ED8" />
          <CarteStat titre="Cette semaine" valeur={statCetteSemaine} icon={DateRangeIcon} bg="#FDECEA" color="#C62828" />
          <CarteStat titre="À venir" valeur={statAVenir} icon={UpdateIcon} bg="#F1F5F9" color="#475569" />
          <CarteStat titre="Terminées" valeur={statTerminees} icon={CheckCircleIcon} bg="#E8F5E9" color="#2E7D32" />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "340px 1fr" }, gap: 3, alignItems: "flex-start" }}>
          {/* Calendrier */}
          <Box sx={{ bgcolor: WHITE, borderRadius: 3, border: `1px solid ${BORDER}`, p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: PRIMARY }}>
                Calendrier
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton size="small" onClick={() => changerMois(-1)}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 110, textAlign: "center" }}>
                  {(() => {
                    const libelle = moisAffiche.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
                    return libelle.charAt(0).toUpperCase() + libelle.slice(1);
                  })()}
                </Typography>
                <IconButton size="small" onClick={() => changerMois(1)}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 0.5 }}>
              {JOURS_SEMAINE.map((j) => (
                <Typography key={j} variant="caption" sx={{ textAlign: "center", color: TEXT_LIGHT, fontWeight: 700 }}>
                  {j}
                </Typography>
              ))}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
              {grilleCalendrier.map((cellule, idx) => {
                const estSelectionne = cellule.dateStr && cellule.dateStr === dateSelectionnee;
                const statuts = cellule.dateStr ? statutsDuJour(cellule.dateStr) : [];
                return (
                  <Box
                    key={idx}
                    onClick={() => {
                      if (!cellule.dateStr) return;
                      setDateSelectionnee((prev) => (prev === cellule.dateStr ? null : cellule.dateStr));
                    }}
                    sx={{
                      aspectRatio: "1",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      cursor: cellule.courant ? "pointer" : "default",
                      color: !cellule.courant ? "#C7CBD3" : estSelectionne ? WHITE : "#1F2937",
                      bgcolor: estSelectionne ? PRIMARY : "transparent",
                      fontWeight: estSelectionne ? 700 : 400,
                      fontSize: "0.8rem",
                      "&:hover": cellule.courant && !estSelectionne ? { bgcolor: BACKGROUND } : {},
                    }}
                  >
                    {cellule.jour}
                    <Box sx={{ display: "flex", gap: "2px", height: 5, mt: "1px" }}>
                      {statuts.slice(0, 3).map((s) => (
                        <Box
                          key={s}
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            bgcolor: estSelectionne ? WHITE : statutInfo(s).dot,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption" fontWeight={700} sx={{ color: TEXT_LIGHT, display: "block", mb: 1 }}>
              LÉGENDE
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {Object.entries(STATUTS).map(([cle, val]) => (
                <Box key={cle} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: val.dot }} />
                  <Typography variant="caption" sx={{ color: "#374151" }}>
                    {val.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {dateSelectionnee && (
              <Chip
                label={`Filtré : ${formaterDateCourte(dateSelectionnee)}`}
                onDelete={() => setDateSelectionnee(null)}
                size="small"
                sx={{ mt: 2, bgcolor: "#EEF0F5", color: PRIMARY, fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Liste des réunions */}
          <Box sx={{ bgcolor: WHITE, borderRadius: 3, border: `1px solid ${BORDER}` }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2.5, flexWrap: "wrap", gap: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: PRIMARY }}>
                Liste des réunions
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FilterListIcon fontSize="small" />}
                  onClick={(e) => setFiltreAncre(e.currentTarget)}
                  sx={{ borderColor: BORDER, color: PRIMARY, textTransform: "none", fontWeight: 600 }}
                >
                  {filtreStatut === "tous" ? "Filtrer" : statutInfo(filtreStatut).label}
                </Button>
                <Menu anchorEl={filtreAncre} open={Boolean(filtreAncre)} onClose={() => setFiltreAncre(null)}>
                  <MenuItem onClick={() => { setFiltreStatut("tous"); setFiltreAncre(null); }}>Tous les statuts</MenuItem>
                  {Object.entries(STATUTS).map(([cle, val]) => (
                    <MenuItem key={cle} onClick={() => { setFiltreStatut(cle); setFiltreAncre(null); }}>
                      {val.label}
                    </MenuItem>
                  ))}
                </Menu>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PictureAsPdfIcon fontSize="small" />}
                  onClick={exporterPDF}
                  disabled={reunionsFiltrees.length === 0}
                  sx={{ borderColor: BORDER, color: PRIMARY, textTransform: "none", fontWeight: 600 }}
                >
                  Exporter PDF
                </Button>
              </Box>
            </Box>

            <Divider />

            {reunionsFiltrees.length === 0 ? (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <EventBusyIcon sx={{ fontSize: 40, color: TEXT_LIGHT, mb: 1 }} />
                <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                  Aucune réunion ne correspond à votre recherche.
                </Typography>
              </Box>
            ) : (
              <>
                <Box>
                  {reunionsPage.map((r) => {
                    const st = statutInfo(r.statut);
                    const ti = typeInfo(r.type_reunion);
                    const IconType = ti.icon;
                    return (
                      <Box
                        key={r.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2.5,
                          borderBottom: `1px solid ${BORDER}`,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box sx={{ minWidth: 110 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: "#1F2937" }}>
                            {formaterDateCourte(r.date_reunion)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                            {r.heure}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 170, flex: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: couleurAvatar(r.stagiaire_id) }}>
                            {initiales(r.stagiaire_prenom, r.stagiaire_nom)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600} sx={{ color: "#1F2937" }}>
                            {`${r.stagiaire_prenom || ""} ${r.stagiaire_nom || ""}`.trim() || "Stagiaire"}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 110 }}>
                          <IconType fontSize="small" sx={{ color: TEXT_LIGHT }} />
                          <Typography variant="body2" sx={{ color: "#374151" }}>
                            {ti.label}
                          </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ color: "#374151", flex: 1.4, minWidth: 160 }} noWrap>
                          {r.objet}
                        </Typography>

                        <Chip
                          label={st.label}
                          size="small"
                          sx={{ bgcolor: st.bg, color: st.color, fontWeight: 700, fontSize: "0.7rem" }}
                        />

                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setMenuAncre(e.currentTarget);
                            setReunionMenuId(r.id);
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2.5, flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                    Affichage de {reunionsPage.length} sur {reunionsFiltrees.length} réunions
                  </Typography>
                  {nbPages > 1 && (
                    <Pagination
                      count={nbPages}
                      page={pageCorrigee}
                      onChange={(_, valeur) => setPage(valeur)}
                      size="small"
                      shape="rounded"
                    />
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Menu d'actions sur une réunion */}
      <Menu anchorEl={menuAncre} open={Boolean(menuAncre)} onClose={() => setMenuAncre(null)}>
        {(() => {
          const reunion = reunions.find((r) => r.id === reunionMenuId);
          if (!reunion) return null;
          const verrouillee = reunion.statut === "annulee" || reunion.statut === "terminee";
          const rappelActif = reunion.statut === "a_venir";
          return [
            <MenuItem
              key="rappel"
              disabled={!rappelActif}
              onClick={() => envoyerRappel(reunion)}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <NotificationsActiveIcon fontSize="small" sx={{ color: rappelActif ? "#EF6C00" : undefined }} />
              Envoyer un rappel
            </MenuItem>,
            <MenuItem key="modifier" disabled={verrouillee} onClick={() => ouvrirEdition(reunion)}>
              Modifier
            </MenuItem>,
            <MenuItem key="annuler" disabled={verrouillee} onClick={() => demanderAnnulation(reunion)} sx={{ color: SECONDARY }}>
              Annuler la réunion
            </MenuItem>,
          ];
        })()}
      </Menu>

      {/* Dialog création / modification */}
      <Dialog open={dialogOuvert} onClose={fermerDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, color: PRIMARY }}>
          {modeEdition ? "Modifier la réunion" : "Nouvelle réunion"}
          <IconButton size="small" onClick={fermerDialog}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          {erreurFormulaire && <Alert severity="error">{erreurFormulaire}</Alert>}

          <FormControl fullWidth size="small" disabled={modeEdition}>
            <InputLabel id="select-stagiaire-label">Stagiaire</InputLabel>
            <Select
              labelId="select-stagiaire-label"
              label="Stagiaire"
              value={formulaire.stagiaire_id}
              onChange={(e) => setFormulaire({ ...formulaire, stagiaire_id: e.target.value })}
            >
              {stagiaires.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {nomStagiaire(s)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formulaire.date_reunion}
              onChange={(e) => setFormulaire({ ...formulaire, date_reunion: e.target.value })}
            />
            <TextField
              label="Heure"
              type="time"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formulaire.heure}
              onChange={(e) => setFormulaire({ ...formulaire, heure: e.target.value })}
            />
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel id="select-type-label">Type de réunion</InputLabel>
            <Select
              labelId="select-type-label"
              label="Type de réunion"
              value={formulaire.type_reunion}
              onChange={(e) => setFormulaire({ ...formulaire, type_reunion: e.target.value })}
            >
              <MenuItem value="presentiel">Présentiel</MenuItem>
              <MenuItem value="distanciel">Distanciel</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={formulaire.type_reunion === "distanciel" ? "Lien de la réunion (Zoom, Teams...)" : "Lieu (salle, bureau...)"}
            size="small"
            fullWidth
            value={formulaire.lieu_ou_lien}
            onChange={(e) => setFormulaire({ ...formulaire, lieu_ou_lien: e.target.value })}
          />

          <TextField
            label="Objet de la réunion"
            size="small"
            fullWidth
            value={formulaire.objet}
            onChange={(e) => setFormulaire({ ...formulaire, objet: e.target.value })}
          />

          <TextField
            label="Notes (optionnel)"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={formulaire.notes}
            onChange={(e) => setFormulaire({ ...formulaire, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={fermerDialog} sx={{ textTransform: "none", color: TEXT_LIGHT }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={soumettreFormulaire}
            disabled={envoiEnCours}
            sx={{ bgcolor: PRIMARY, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#141F45" } }}
          >
            {envoiEnCours ? "Enregistrement..." : modeEdition ? "Enregistrer" : "Planifier la réunion"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmation annulation */}
      <Dialog open={dialogAnnulerOuvert} onClose={() => setDialogAnnulerOuvert(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: PRIMARY }}>Annuler cette réunion ?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
            {reunionAAnnuler ? `« ${reunionAAnnuler.objet} » du ${formaterDateCourte(reunionAAnnuler.date_reunion)} à ${reunionAAnnuler.heure} sera annulée. Le stagiaire en sera notifié.` : ""}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogAnnulerOuvert(false)} sx={{ textTransform: "none", color: TEXT_LIGHT }}>
            Retour
          </Button>
          <Button
            variant="contained"
            onClick={confirmerAnnulation}
            sx={{ bgcolor: SECONDARY, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#B71C1C" } }}
          >
            Oui, annuler
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function CarteStat({ titre, valeur, icon: Icon, bg, color }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 2,
        bgcolor: WHITE,
        borderRadius: 3,
        border: `1px solid ${BORDER}`,
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          bgcolor: bg,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontWeight: 700, display: "block", lineHeight: 1.2 }}>
          {titre.toUpperCase()}
        </Typography>
        <Typography variant="h6" fontWeight={800} sx={{ color: "#1F2937" }}>
          {valeur}
        </Typography>
      </Box>
    </Box>
  );
}

export default ReunionsEncadrant;
