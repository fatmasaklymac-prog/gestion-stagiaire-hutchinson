import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import LockIcon from "@mui/icons-material/Lock";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import MailOutlineIcon from "@mui/icons-material/Mail";
import EventIcon from "@mui/icons-material/Event";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SUCCESS = "#2E7D32";
const WARNING = "#EF6C00";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";
const BACKGROUND = "#F5F7FB";

const TYPES_DOCUMENTS = [
  { valeur: "convention", label: "Convention de stage" },
  { valeur: "attestation", label: "Attestation" },
  { valeur: "rapport_intermediaire", label: "Rapport intermédiaire" },
  { valeur: "rapport_final", label: "Rapport final" },
  { valeur: "lettre_affectation", label: "Lettre d'affectation" },
  { valeur: "badge_photo", label: "Badge / Photo" },
  { valeur: "fiche_securite", label: "Fiche sécurité" },
  { valeur: "certificat", label: "Certificat" },
];

function joursEntre(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function calculerProgression(dateDebut, dateFin) {
  const total = joursEntre(dateDebut, dateFin);
  const ecoule = joursEntre(dateDebut, new Date());
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((ecoule / total) * 100)));
}

function formatDateLongue(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDateHeure(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}, ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatDateInput(iso) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function calculerDureeMois(debut, fin) {
  if (!debut || !fin) return "—";
  const mois = Math.round(joursEntre(debut, fin) / 30);
  return `${mois} mois`;
}

function JaugeCirculaire({ valeur, taille = 88 }) {
  const rayon = (taille - 10) / 2;
  const circonference = 2 * Math.PI * rayon;
  const decalage = circonference - (valeur / 100) * circonference;
  return (
    <Box sx={{ position: "relative", width: taille, height: taille }}>
      <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`}>
        <circle cx={taille / 2} cy={taille / 2} r={rayon} fill="none" stroke="#EEF1F6" strokeWidth="8" />
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          fill="none"
          stroke={SECONDARY}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circonference}
          strokeDashoffset={decalage}
          transform={`rotate(-90 ${taille / 2} ${taille / 2})`}
        />
      </svg>
      <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontWeight: 800, color: PRIMARY, fontSize: "1.1rem" }}>{valeur}%</Typography>
      </Box>
    </Box>
  );
}

function DocumentRow({ doc }) {
  const Icone = doc.icon === "pdf" ? PictureAsPdfIcon : DescriptionIcon;
  const disponible = Boolean(doc.fichier_url);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, borderRadius: 3, border: `1px solid ${BORDER}` }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#EEF1F6", color: PRIMARY, flexShrink: 0 }}>
        <Icone sx={{ fontSize: 20 }} />
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }} noWrap>
          {doc.nom}
        </Typography>
        <Typography variant="caption" sx={{ color: disponible ? TEXT_LIGHT : WARNING }}>
          {disponible ? formatDateLongue(doc.date_document) : "Indisponible"}
        </Typography>
      </Box>
      {disponible ? (
        <IconButton size="small" component="a" href={`${API_URL}${doc.fichier_url}`} target="_blank" rel="noreferrer" sx={{ color: PRIMARY }}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      ) : (
        <LockIcon fontSize="small" sx={{ color: TEXT_LIGHT }} />
      )}
    </Box>
  );
}

function StagiaireDetailEncadrant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stagiaire, setStagiaire] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [presenceStats, setPresenceStats] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [succesGlobal, setSuccesGlobal] = useState("");

  const [nouveauCommentaire, setNouveauCommentaire] = useState("");
  const [envoiCommentaire, setEnvoiCommentaire] = useState(false);

  // --- Ajouter un document ---

  // --- Modifier les dates ---
  const [dialogDatesOuvert, setDialogDatesOuvert] = useState(false);
  const [dateDebutForm, setDateDebutForm] = useState("");
  const [dateFinForm, setDateFinForm] = useState("");
  const [envoiDates, setEnvoiDates] = useState(false);
  const [erreurDates, setErreurDates] = useState("");


  // --- Signaler un incident ---
  const [dialogIncidentOuvert, setDialogIncidentOuvert] = useState(false);
  const [titreIncident, setTitreIncident] = useState("");
  const [contenuIncident, setContenuIncident] = useState("");
  const [envoiIncident, setEnvoiIncident] = useState(false);
  const [erreurIncident, setErreurIncident] = useState("");

  const [dialogMessageOuvert, setDialogMessageOuvert] = useState(false);
  const [contenuMessage, setContenuMessage] = useState("");
  const [envoiMessage, setEnvoiMessage] = useState(false);
  const [erreurMessage, setErreurMessage] = useState("");

  const [dialogReunionOuvert, setDialogReunionOuvert] = useState(false);
  const [dateReunionForm, setDateReunionForm] = useState("");
  const [heureReunionForm, setHeureReunionForm] = useState("");
  const [typeReunionForm, setTypeReunionForm] = useState("presentiel");
  const [lieuReunionForm, setLieuReunionForm] = useState("");
  const [objetReunionForm, setObjetReunionForm] = useState("");
  const [notesReunionForm, setNotesReunionForm] = useState("");
  const [envoiReunion, setEnvoiReunion] = useState(false);
  const [erreurReunion, setErreurReunion] = useState("");

  function chargerTout() {
    setLoading(true);
    setError("");
    return Promise.all([
      fetch(`${API_URL}/moi/mes-stagiaires/${id}`, { headers: authHeaders() }).then((res) => {
        if (!res.ok) throw new Error("Erreur stagiaire");
        return res.json();
      }),
      fetch(`${API_URL}/moi/mes-stagiaires/${id}/documents`, { headers: authHeaders() }).then((res) => {
        if (!res.ok) throw new Error("Erreur documents");
        return res.json();
      }),
      fetch(`${API_URL}/moi/mes-stagiaires/${id}/presences/stats`, { headers: authHeaders() }).then((res) => {
        if (!res.ok) throw new Error("Erreur presences");
        return res.json();
      }),
      fetch(`${API_URL}/moi/mes-stagiaires/${id}/commentaires`, { headers: authHeaders() }).then((res) => {
        if (!res.ok) throw new Error("Erreur commentaires");
        return res.json();
      }),
    ])
      .then(([dataStagiaire, dataDocuments, dataPresences, dataCommentaires]) => {
        setStagiaire(dataStagiaire);
        setDocuments(dataDocuments);
        setPresenceStats(dataPresences);
        setCommentaires(dataCommentaires);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les informations de ce stagiaire.");
        setLoading(false);
      });
  }

  useEffect(() => {
    chargerTout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function envoyerCommentaire() {
    if (!nouveauCommentaire.trim()) return;
    setEnvoiCommentaire(true);
    fetch(`${API_URL}/moi/mes-stagiaires/${id}/commentaires`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ titre: "Note", contenu: nouveauCommentaire.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur envoi commentaire");
        return res.json();
      })
      .then((cree) => {
        setCommentaires((precedent) => [cree, ...precedent]);
        setNouveauCommentaire("");
      })
      .catch(() => setError("Impossible d'envoyer le commentaire."))
      .finally(() => setEnvoiCommentaire(false));
  }

  function ouvrirDialogDates() {
    setDateDebutForm(formatDateInput(stagiaire.date_debut));
    setDateFinForm(formatDateInput(stagiaire.date_fin));
    setErreurDates("");
    setDialogDatesOuvert(true);
  }

  function enregistrerDates() {
    if (!dateDebutForm || !dateFinForm) {
      setErreurDates("Renseigne les deux dates.");
      return;
    }
    if (dateFinForm <= dateDebutForm) {
      setErreurDates("La date de fin doit être après la date de début.");
      return;
    }
    setEnvoiDates(true);
    setErreurDates("");
    fetch(`${API_URL}/moi/mes-stagiaires/${id}/dates`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ date_debut: dateDebutForm, date_fin: dateFinForm }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Erreur lors de la mise à jour");
        }
        return res.json();
      })
      .then((maj) => {
        setStagiaire((precedent) => ({ ...precedent, date_debut: maj.date_debut, date_fin: maj.date_fin }));
        setDialogDatesOuvert(false);
        setSuccesGlobal("Dates du stage mises à jour.");
      })
      .catch((err) => setErreurDates(err.message || "Impossible de mettre à jour les dates."))
      .finally(() => setEnvoiDates(false));
  }

  function ouvrirDialogMessage() {
    setContenuMessage("");
    setErreurMessage("");
    setDialogMessageOuvert(true);
  }

  function envoyerMessageEncadrant() {
    if (!contenuMessage.trim()) {
      setErreurMessage("Écrivez un message avant d'envoyer.");
      return;
    }
    setEnvoiMessage(true);
    setErreurMessage("");
    fetch(`${API_URL}/encadrant/messages`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ stagiaire_id: Number(id), contenu: contenuMessage.trim(), type_message: "message" }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Erreur lors de l'envoi");
        }
        return res.json();
      })
      .then(() => {
        setDialogMessageOuvert(false);
        setSuccesGlobal("Message envoyé.");
      })
      .catch((err) => setErreurMessage(err.message || "Impossible d'envoyer le message."))
      .finally(() => setEnvoiMessage(false));
  }

  function ouvrirDialogReunion() {
    setDateReunionForm("");
    setHeureReunionForm("");
    setTypeReunionForm("presentiel");
    setLieuReunionForm("");
    setObjetReunionForm("");
    setNotesReunionForm("");
    setErreurReunion("");
    setDialogReunionOuvert(true);
  }

  function envoyerReunion() {
    if (!dateReunionForm || !heureReunionForm || !objetReunionForm.trim()) {
      setErreurReunion("Renseigne la date, l'heure et l'objet de la réunion.");
      return;
    }
    setEnvoiReunion(true);
    setErreurReunion("");
    fetch(`${API_URL}/encadrant/reunions`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        stagiaire_id: Number(id),
        date_reunion: dateReunionForm,
        heure: heureReunionForm,
        type_reunion: typeReunionForm,
        lieu_ou_lien: lieuReunionForm.trim() || null,
        objet: objetReunionForm.trim(),
        notes: notesReunionForm.trim() || null,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Erreur lors de la planification");
        }
        return res.json();
      })
      .then(() => {
        setDialogReunionOuvert(false);
        setSuccesGlobal("Réunion planifiée avec succès.");
      })
      .catch((err) => setErreurReunion(err.message || "Impossible de planifier la réunion."))
      .finally(() => setEnvoiReunion(false));
  }

  function ouvrirDialogIncident() {
    setTitreIncident("");
    setContenuIncident("");
    setErreurIncident("");
    setDialogIncidentOuvert(true);
  }

  function envoyerIncident() {
    if (!titreIncident.trim() || !contenuIncident.trim()) {
      setErreurIncident("Renseigne un titre et une description.");
      return;
    }
    setEnvoiIncident(true);
    setErreurIncident("");
    fetch(`${API_URL}/moi/mes-stagiaires/${id}/incidents`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ titre: titreIncident.trim(), contenu: contenuIncident.trim() }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Erreur lors de l'envoi");
        }
        return res.json();
      })
      .then(() => {
        setDialogIncidentOuvert(false);
        setSuccesGlobal("Incident signalé avec succès.");
      })
      .catch((err) => setErreurIncident(err.message || "Impossible de signaler l'incident."))
      .finally(() => setEnvoiIncident(false));
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  if (error && !stagiaire) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!stagiaire) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Alert severity="error">Stagiaire introuvable.</Alert>
      </Box>
    );
  }

  const progression = calculerProgression(stagiaire.date_debut, stagiaire.date_fin);
  const tauxPresence = presenceStats?.taux_presence ?? 0;

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100%" }}>
      {/* Barre du haut */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 2, md: 4 }, py: 2, bgcolor: WHITE, borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => navigate("/encadrant/stagiaires")}>
          <ArrowBackIcon sx={{ color: PRIMARY, fontSize: 20 }} />
          <Typography sx={{ color: PRIMARY, fontWeight: 700, fontSize: "0.9rem" }}>Retour à la liste</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton size="small"><NotificationsNoneIcon sx={{ color: PRIMARY }} /></IconButton>
          <IconButton size="small"><AccountCircleIcon sx={{ color: PRIMARY }} /></IconButton>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: "56px", md: "120px" } }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* En-tête profil */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={stagiaire.photo_url ? `${API_URL}${stagiaire.photo_url}` : undefined}
              sx={{ width: 64, height: 64, bgcolor: SECONDARY }}
            >
              {stagiaire.prenom?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY }}>
                {stagiaire.prenom} {stagiaire.nom}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <Chip
                  label={stagiaire.statut === "en_cours" ? "En cours" : stagiaire.statut === "termine" ? "Terminé" : stagiaire.statut || "—"}
                  size="small"
                  sx={{ bgcolor: stagiaire.statut === "en_cours" ? "#E8F5E9" : "#F0F1F4", color: stagiaire.statut === "en_cours" ? SUCCESS : TEXT_LIGHT, fontWeight: 700 }}
                />
                <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                  Stagiaire {stagiaire.specialisation || "—"}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<MailOutlineIcon />}
              onClick={ouvrirDialogMessage}
              sx={{ borderColor: BORDER, color: PRIMARY, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              Message
            </Button>
            <Button
              variant="contained"
              startIcon={<EventIcon />}
              onClick={ouvrirDialogReunion}
              sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16234A" }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              Réunion
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3 }}>
          {/* Colonne principale */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, flex: 2, minWidth: 320 }}>
            {/* Informations générales */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.05rem" }}>
                  Informations générales
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                <Box sx={{ flex: "1 1 220px" }}>
                  <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.68rem" }}>
                    Université / École
                  </Typography>
                  <Typography sx={{ color: PRIMARY, fontWeight: 700, mb: 2 }}>
                    {stagiaire.etablissement || "—"}{stagiaire.specialisation ? ` - ${stagiaire.specialisation}` : ""}
                  </Typography>
                  <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.68rem" }}>
                    Contact
                  </Typography>
                  <Typography sx={{ color: PRIMARY, fontWeight: 700 }}>{stagiaire.email || "—"}</Typography>
                  <Typography sx={{ color: TEXT_LIGHT }}>{stagiaire.telephone || "—"}</Typography>
                </Box>
                <Box sx={{ flex: "1 1 220px" }}>
                  <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.68rem" }}>
                    Période de stage
                  </Typography>
                  <Typography sx={{ color: PRIMARY, fontWeight: 700, mb: 2 }}>
                    {formatDateLongue(stagiaire.date_debut)} — {formatDateLongue(stagiaire.date_fin)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                    Durée : {calculerDureeMois(stagiaire.date_debut, stagiaire.date_fin)}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.68rem" }}>
                      Département
                    </Typography>
                    <Typography sx={{ color: PRIMARY, fontWeight: 700 }}>{stagiaire.departement || "—"}</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Suivi de progression */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, mb: 2.5, fontSize: "1.05rem" }}>
                Suivi de progression
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <JaugeCirculaire valeur={tauxPresence} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: PRIMARY }}>Taux de présence</Typography>
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT, maxWidth: 220 }}>
                      {presenceStats?.total_enregistrements > 0
                        ? `${presenceStats.jours_presents} jour(s) présent(s) ce mois-ci.`
                        : "Aucune donnée de présence enregistrée ce mois-ci."}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, color: PRIMARY }}>Avancement du stage</Typography>
                    <Typography sx={{ fontWeight: 700, color: SECONDARY }}>{progression}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progression}
                    sx={{ height: 10, borderRadius: 5, bgcolor: "#EEF1F6", "& .MuiLinearProgress-bar": { bgcolor: PRIMARY, borderRadius: 5 } }}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Commentaires & Notes */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, fontSize: "1.05rem" }}>
                Commentaires & Notes
              </Typography>

              <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={1}
                  placeholder="Ajouter une note sur ce stagiaire..."
                  value={nouveauCommentaire}
                  onChange={(e) => setNouveauCommentaire(e.target.value)}
                />
                <Button
                  variant="contained"
                  disabled={envoiCommentaire || !nouveauCommentaire.trim()}
                  onClick={envoyerCommentaire}
                  sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16234A" }, borderRadius: 2, textTransform: "none", fontWeight: 700, minWidth: 44, px: 2 }}
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Box>

              {commentaires.length === 0 ? (
                <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", py: 3 }}>
                  Aucun commentaire pour le moment.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {commentaires.map((c) => (
                    <Box key={c.id} sx={{ display: "flex", gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: PRIMARY, fontSize: "0.8rem" }}>M</Avatar>
                      <Box sx={{ flexGrow: 1, bgcolor: BACKGROUND, borderRadius: 2, p: 1.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY }}>Moi</Typography>
                          <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>{formatDateHeure(c.date_commentaire)}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>{c.contenu}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>

          {/* Colonne latérale */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 280 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, fontSize: "1.05rem" }}>
                Documents
              </Typography>
              {documents.length === 0 ? (
                <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", py: 3 }}>
                  Aucun document pour ce stagiaire.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
                  {documents.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} />
                  ))}
                </Box>
              )}
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: PRIMARY }}>
              <Typography sx={{ color: WHITE, fontWeight: 700, mb: 2 }}>Actions de gestion</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<RateReviewIcon />}
                  onClick={() => navigate(`/encadrant/evaluations/${stagiaire.id}`)}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)", color: WHITE, justifyContent: "flex-start", borderRadius: 2, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "rgba(255,255,255,0.18)" } }}
                >
                  Évaluer les compétences
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CalendarMonthIcon />}
                  onClick={ouvrirDialogDates}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)", color: WHITE, justifyContent: "flex-start", borderRadius: 2, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "rgba(255,255,255,0.18)" } }}
                >
                  Modifier les dates
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ReportProblemIcon />}
                  onClick={ouvrirDialogIncident}
                  sx={{ bgcolor: SECONDARY, color: WHITE, justifyContent: "flex-start", borderRadius: 2, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#B8181D" } }}
                >
                  Signaler un incident
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Dialog : Ajouter un document */}

      {/* Dialog : Modifier les dates */}
      <Dialog open={dialogDatesOuvert} onClose={() => !envoiDates && setDialogDatesOuvert(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: PRIMARY }}>Modifier les dates du stage</DialogTitle>
        <DialogContent>
          {erreurDates && <Alert severity="error" sx={{ mb: 2 }}>{erreurDates}</Alert>}
          <TextField
            fullWidth
            type="date"
            label="Date de début"
            value={dateDebutForm}
            onChange={(e) => setDateDebutForm(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            type="date"
            label="Date de fin"
            value={dateFinForm}
            onChange={(e) => setDateFinForm(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDialogDatesOuvert(false)} disabled={envoiDates} sx={{ color: TEXT_LIGHT, textTransform: "none", fontWeight: 700 }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={enregistrerDates}
            disabled={envoiDates}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16234A" }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            {envoiDates ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog : Signaler un incident */}
      <Dialog open={dialogIncidentOuvert} onClose={() => !envoiIncident && setDialogIncidentOuvert(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: SECONDARY }}>Signaler un incident</DialogTitle>
        <DialogContent>
          {erreurIncident && <Alert severity="error" sx={{ mb: 2 }}>{erreurIncident}</Alert>}
          <Alert severity="info" sx={{ mb: 2 }}>
            Ce signalement sera enregistré comme notification liée à ce stagiaire.
          </Alert>
          <TextField
            fullWidth
            label="Titre"
            value={titreIncident}
            onChange={(e) => setTitreIncident(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description de l'incident"
            value={contenuIncident}
            onChange={(e) => setContenuIncident(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDialogIncidentOuvert(false)} disabled={envoiIncident} sx={{ color: TEXT_LIGHT, textTransform: "none", fontWeight: 700 }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={envoyerIncident}
            disabled={envoiIncident}
            sx={{ bgcolor: SECONDARY, "&:hover": { bgcolor: "#B8181D" }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            {envoiIncident ? "Envoi..." : "Signaler"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogMessageOuvert} onClose={() => !envoiMessage && setDialogMessageOuvert(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: PRIMARY }}>Envoyer un message</DialogTitle>
        <DialogContent>
          {erreurMessage && <Alert severity="error" sx={{ mb: 2 }}>{erreurMessage}</Alert>}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Votre message"
            value={contenuMessage}
            onChange={(e) => setContenuMessage(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDialogMessageOuvert(false)} disabled={envoiMessage} sx={{ color: TEXT_LIGHT, textTransform: "none", fontWeight: 700 }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={envoyerMessageEncadrant}
            disabled={envoiMessage}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16234A" }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            {envoiMessage ? "Envoi..." : "Envoyer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogReunionOuvert} onClose={() => !envoiReunion && setDialogReunionOuvert(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: PRIMARY }}>
          Planifier une réunion
          <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontWeight: 400, mt: 0.5 }}>
            Programmez un point de suivi avec {stagiaire?.prenom || "le stagiaire"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {erreurReunion && <Alert severity="error" sx={{ mb: 2 }}>{erreurReunion}</Alert>}
          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5 }}>
                Date de la réunion
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={dateReunionForm}
                onChange={(e) => setDateReunionForm(e.target.value)}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5 }}>
                Heure
              </Typography>
              <TextField
                fullWidth
                type="time"
                value={heureReunionForm}
                onChange={(e) => setHeureReunionForm(e.target.value)}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5 }}>
                Type
              </Typography>
              <TextField
                select
                fullWidth
                value={typeReunionForm}
                onChange={(e) => setTypeReunionForm(e.target.value)}
              >
                <MenuItem value="presentiel">Présentiel</MenuItem>
                <MenuItem value="distanciel">Distanciel</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5 }}>
                Lieu ou lien de réunion
              </Typography>
              <TextField
                fullWidth
                placeholder="Salle 302 ou https://..."
                value={lieuReunionForm}
                onChange={(e) => setLieuReunionForm(e.target.value)}
              />
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5 }}>
              Objet de la réunion
            </Typography>
            <TextField
              fullWidth
              placeholder="ex: Point de suivi bimensuel"
              value={objetReunionForm}
              onChange={(e) => setObjetReunionForm(e.target.value)}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5 }}>
              Notes de préparation
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Points à aborder, documents requis..."
              value={notesReunionForm}
              onChange={(e) => setNotesReunionForm(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDialogReunionOuvert(false)} disabled={envoiReunion} sx={{ color: TEXT_LIGHT, textTransform: "none", fontWeight: 700 }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={envoyerReunion}
            disabled={envoiReunion}
            sx={{ bgcolor: SECONDARY, "&:hover": { bgcolor: "#B8181D" }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            {envoiReunion ? "Envoi..." : "Envoyer l'invitation"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(succesGlobal)}
        autoHideDuration={3500}
        onClose={() => setSuccesGlobal("")}
        message={succesGlobal}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

export default StagiaireDetailEncadrant;
