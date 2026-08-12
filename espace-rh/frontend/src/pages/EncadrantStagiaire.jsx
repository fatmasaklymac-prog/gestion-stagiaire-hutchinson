import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Avatar,
  Alert,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Badge,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import DownloadIcon from "@mui/icons-material/Download";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EventIcon from "@mui/icons-material/Event";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import RoomIcon from "@mui/icons-material/Room";
import StarIcon from "@mui/icons-material/Star";
import GroupsIcon from "@mui/icons-material/Groups";
import { authHeaders } from "../auth";
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
const VERT = "#2E7D32";

function formaterDateRelative(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  const diffJours = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
  if (diffJours < 1) return "Aujourd'hui";
  if (diffJours === 1) return "Il y a 1 jour";
  if (diffJours < 30) return `Il y a ${diffJours} jours`;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function formaterDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formaterMoisAnnee(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  const libelle = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return libelle.charAt(0).toUpperCase() + libelle.slice(1);
}

function iconePourEvaluation(titre) {
  const t = (titre || "").toLowerCase();
  if (t.includes("rapport")) return AssignmentIcon;
  if (t.includes("intégration") || t.includes("integration") || t.includes("bilan")) return FactCheckIcon;
  if (t.includes("skill") || t.includes("soft")) return RoomIcon;
  return StarIcon;
}

function couleurNote(note) {
  if (!note) return TEXT_LIGHT;
  if (note.startsWith("A")) return "#2E7D32";
  if (note.startsWith("B")) return "#1D4ED8";
  if (note.startsWith("C")) return "#B45309";
  return "#C62828";
}

export default function EncadrantStagiaire() {
  const { profil, erreurProfil } = useOutletContext();

  const [encadrant, setEncadrant] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreurEncadrant, setErreurEncadrant] = useState("");
  const [error, setError] = useState("");
  const [tousLesCommentaires, setTousLesCommentaires] = useState(false);
  const [messages, setMessages] = useState([]);
  const [modalMessageOuvert, setModalMessageOuvert] = useState(false);
  const [typeMessageEnvoi, setTypeMessageEnvoi] = useState("message");
  const [contenuMessage, setContenuMessage] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurMessage, setErreurMessage] = useState("");
  const [chatOuvert, setChatOuvert] = useState(false);
  const [messageChat, setMessageChat] = useState("");
  const [envoiChatEnCours, setEnvoiChatEnCours] = useState(false);
  const [erreurChat, setErreurChat] = useState("");
  const [messagesNonLus, setMessagesNonLus] = useState(0);
  const [envoiFichierEnCours, setEnvoiFichierEnCours] = useState(false);
  const refInputFichier = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/moi/encadrant`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (res.status === 404) {
          setErreurEncadrant("Aucun encadrant ne vous est assigné pour le moment.");
          return null;
        }
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        if (data) setEncadrant(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les informations de votre encadrant.");
        setLoading(false);
      });

    fetch(`${API_URL}/moi/encadrant/commentaires`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCommentaires(data))
      .catch(() => {});

    fetch(`${API_URL}/moi/encadrant/evaluations`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEvaluations(data))
      .catch(() => {});

    fetch(`${API_URL}/moi/messages`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMessages(data))
      .catch(() => {});

    chargerMessagesNonLus();
    const intervalle = setInterval(chargerMessagesNonLus, 15000);
    return () => clearInterval(intervalle);
  }, []);

  function chargerMessagesNonLus() {
    fetch(`${API_URL}/moi/messages/non-lus`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : { non_lus: 0 }))
      .then((data) => setMessagesNonLus(data.non_lus || 0))
      .catch(() => {});
  }

  function rechargerMessages() {
    fetch(`${API_URL}/moi/messages`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMessages(data))
      .catch(() => {});
  }

  function ouvrirChat() {
    setChatOuvert(true);
    if (messagesNonLus > 0) {
      fetch(`${API_URL}/moi/messages/marquer-lus`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      })
        .then(() => setMessagesNonLus(0))
        .catch(() => {});
    }
  }

  function envoyerFichierChat(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setEnvoiFichierEnCours(true);
    setErreurChat("");

    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("contenu", messageChat.trim());

    fetch(`${API_URL}/moi/messages/piece-jointe`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Échec de l'envoi du fichier.");
        }
        return res.json();
      })
      .then(() => {
        setMessageChat("");
        rechargerMessages();
      })
      .catch((err) => {
        setErreurChat(err.message || "Erreur lors de l'envoi du fichier.");
      })
      .finally(() => {
        setEnvoiFichierEnCours(false);
        e.target.value = "";
      });
  }

  function ouvrirModalMessage(type) {
    setTypeMessageEnvoi(type);
    setContenuMessage("");
    setErreurMessage("");
    setModalMessageOuvert(true);
  }

  function envoyerMessage() {
    if (!contenuMessage.trim()) {
      setErreurMessage("Écrivez un message avant d'envoyer.");
      return;
    }

    setEnvoiEnCours(true);
    setErreurMessage("");

    fetch(`${API_URL}/moi/messages`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        contenu: contenuMessage.trim(),
        type_message: typeMessageEnvoi,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Échec de l'envoi du message.");
        }
        return res.json();
      })
      .then(() => {
        setModalMessageOuvert(false);
        setContenuMessage("");
        rechargerMessages();
      })
      .catch((err) => {
        setErreurMessage(err.message || "Erreur lors de l'envoi.");
      })
      .finally(() => setEnvoiEnCours(false));
  }

  function envoyerMessageChat() {
    if (!messageChat.trim()) return;

    setEnvoiChatEnCours(true);
    setErreurChat("");

    fetch(`${API_URL}/moi/messages`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        contenu: messageChat.trim(),
        type_message: "message",
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Échec de l'envoi du message.");
        }
        return res.json();
      })
      .then(() => {
        setMessageChat("");
        rechargerMessages();
      })
      .catch((err) => {
        setErreurChat(err.message || "Erreur lors de l'envoi.");
      })
      .finally(() => setEnvoiChatEnCours(false));
  }

  if (loading) {
    return (
      <>
<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress sx={{ color: PRIMARY }} />
        </Box>
      </>
    );
  }

  return (
    <>
<Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: "56px", md: "120px" } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, fontSize: "1.75rem" }}>
                Mon encadrant
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 0.5 }}>
                Consultez les informations et coordonnees de votre encadrant.
              </Typography>
            </Box>
            {!erreurEncadrant && encadrant && (
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SendIcon fontSize="small" />}
                  onClick={() => ouvrirModalMessage("message")}
                  sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#141F45" }, textTransform: "none", fontWeight: 600 }}
                >
                  Envoyer un message
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<EventIcon fontSize="small" />}
                  onClick={() => ouvrirModalMessage("demande_rdv")}
                  sx={{ bgcolor: SECONDARY, "&:hover": { bgcolor: "#B71C1C" }, textTransform: "none", fontWeight: 600 }}
                >
                  Planifier un rendez-vous
                </Button>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />
          {(error || erreurProfil) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || erreurProfil}
            </Alert>
          )}

          {erreurEncadrant ? (
            <Paper sx={{ border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 5, textAlign: "center" }}>
              <PersonOffIcon sx={{ fontSize: 40, color: TEXT_LIGHT, mb: 1 }} />
              <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                {erreurEncadrant}
              </Typography>
            </Paper>
          ) : (
            <>
              <Box sx={{ display: "flex", gap: 3, alignItems: "stretch", flexWrap: "wrap", mb: 3 }}>
                {/* Fiche encadrant */}
                <Paper sx={{ flex: "2 1 420px", minWidth: 300, border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 3 }}>
                  <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
                    <Avatar
                      src={encadrant?.photo_url ? `${API_URL}${encadrant.photo_url}` : undefined}
                      sx={{ width: 96, height: 96, bgcolor: PRIMARY, fontSize: "2rem" }}
                    >
                      {encadrant?.prenom?.[0]}
                      {encadrant?.nom?.[0]}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: VERT }} />
                        <Typography variant="caption" sx={{ color: VERT, fontWeight: 700 }}>
                          Disponible actuellement
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: "#1F2937" }}>
                        {encadrant?.prenom} {encadrant?.nom}
                      </Typography>
                      {encadrant?.fonction && (
                        <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                          {encadrant.fonction}
                        </Typography>
                      )}
                      {encadrant?.departement && (
                        <Chip
                          label={encadrant.departement.toUpperCase()}
                          size="small"
                          sx={{ mt: 1, bgcolor: "#FDECEA", color: SECONDARY, fontWeight: 700, fontSize: "0.7rem" }}
                        />
                      )}

                    </Box>
                  </Box>

                  <Divider sx={{ my: 2.5 }} />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <BusinessIcon fontSize="small" sx={{ color: TEXT_LIGHT, mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block" }}>
                          Bureau
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ color: "#1F2937" }}>
                          {encadrant?.bureau || "—"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <ScheduleIcon fontSize="small" sx={{ color: SECONDARY, mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: SECONDARY, fontWeight: 700, display: "block" }}>
                          Disponibilite
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#1F2937", whiteSpace: "pre-line" }}>
                          {encadrant?.horaires_disponibilite || "Non renseigne"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2.5 }} />

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 3, bgcolor: "#F5F6FA" }}>
                      <Box sx={{ width: 38, height: 38, borderRadius: "50%", bgcolor: `${PRIMARY}18`, color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <GroupsIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block" }}>
                          Stagiaires encadres
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: "#1F2937" }}>
                          {encadrant?.nb_stagiaires_encadres ?? "—"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 3, bgcolor: "#F5F6FA" }}>
                      <Box sx={{ width: 38, height: 38, borderRadius: "50%", bgcolor: `${SECONDARY}18`, color: SECONDARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <EventIcon fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block" }}>
                          Prochain rendez-vous
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {encadrant?.prochain_rendez_vous
                            ? `${new Date(encadrant.prochain_rendez_vous.date).toLocaleDateString("fr-FR")} - ${encadrant.prochain_rendez_vous.heure}`
                            : "Aucun planifie"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Coordonnées */}
                <Paper sx={{ flex: "1 1 260px", minWidth: 240, border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#1F2937", mb: 1.5 }}>
                    Coordonnées
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                    <EmailIcon fontSize="small" sx={{ color: TEXT_LIGHT, mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block" }}>
                        Email professionnel
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ color: "#1F2937", wordBreak: "break-word" }}>
                        {encadrant?.email || "—"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                    <PhoneIcon fontSize="small" sx={{ color: TEXT_LIGHT, mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block" }}>
                        Ligne directe
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ color: "#1F2937" }}>
                        {encadrant?.telephone || "—"}
                      </Typography>
                    </Box>
                  </Box>

                </Paper>
              </Box>

              <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: "wrap" }}>
                {/* Commentaires récents */}
                <Paper sx={{ flex: "1 1 380px", minWidth: 300, border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1F2937" }}>
                      Commentaires récents
                    </Typography>
                    {commentaires.length > 2 && (
                      <Typography
                        variant="body2"
                        onClick={() => setTousLesCommentaires((v) => !v)}
                        sx={{ color: SECONDARY, fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                      >
                        {tousLesCommentaires ? "Voir moins" : "Voir tout"}
                      </Typography>
                    )}
                  </Box>

                  {commentaires.length === 0 ? (
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                      Aucun commentaire pour le moment.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      {(tousLesCommentaires ? commentaires : commentaires.slice(0, 2)).map((c) => (
                        <Box key={c.id}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: "#1F2937" }}>
                              {c.titre}
                            </Typography>
                            <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                              {formaterDateRelative(c.date_commentaire)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 0.75 }}>
                            <FormatQuoteIcon sx={{ fontSize: 16, color: TEXT_LIGHT, transform: "scaleX(-1)" }} />
                            <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontStyle: "italic" }}>
                              {c.contenu}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>

                {/* Historique des évaluations */}
                <Paper sx={{ flex: "1 1 320px", minWidth: 280, border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 2.5 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1F2937", mb: 2 }}>
                    Historique des évaluations
                  </Typography>

                  {evaluations.length === 0 ? (
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                      Aucune évaluation pour le moment.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {evaluations.map((e) => {
                        const IconeEval = iconePourEvaluation(e.titre);
                        return (
                          <Box
                            key={e.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              pb: 2,
                              borderBottom: `1px solid ${BORDER}`,
                              "&:last-of-type": { borderBottom: "none", pb: 0 },
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                bgcolor: "#FDECEA",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <IconeEval sx={{ fontSize: 20, color: SECONDARY }} />
                            </Box>

                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={700} sx={{ color: "#1F2937" }}>
                                {e.titre}
                              </Typography>
                              <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                                {formaterMoisAnnee(e.date_evaluation)}
                              </Typography>
                            </Box>

                            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                              {e.note && (
                                <Typography variant="body2" sx={{ color: couleurNote(e.note), fontWeight: 700 }}>
                                  {e.note}
                                </Typography>
                              )}
                              <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block" }}>
                                Grade
                              </Typography>
                            </Box>

                            <IconButton
                              size="small"
                              disabled={!e.fichier_url}
                              onClick={() => {
                                if (e.fichier_url) {
                                  window.open(`${API_URL}${e.fichier_url}`, "_blank");
                                }
                              }}
                              sx={{ flexShrink: 0 }}
                            >
                              <DownloadIcon fontSize="small" sx={{ color: e.fichier_url ? TEXT_LIGHT : "#D1D5DB" }} />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Paper>
              </Box>

              <Paper
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 4,
                  bgcolor: PRIMARY,
                  color: "#FFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <LightbulbIcon sx={{ color: SECONDARY, mt: 0.3 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      Besoin d'un conseil spécifique ?
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                      Avant votre prochain échange avec {encadrant?.prenom || "votre encadrant"}, pensez à préparer vos questions et à faire le point sur vos avancées récentes.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => navigate("/stagiaire/documents")}
                  sx={{ bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" }, textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  Consulter les ressources
                </Button>
              </Paper>
            </>
          )}
      </Box>

      <Dialog open={modalMessageOuvert} onClose={() => setModalMessageOuvert(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {typeMessageEnvoi === "demande_rdv" ? "Demander un rendez-vous" : "Envoyer un message"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {erreurMessage && <Alert severity="error">{erreurMessage}</Alert>}
          <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
            À {encadrant?.prenom} {encadrant?.nom}
          </Typography>
          <TextField
            label="Votre message"
            value={contenuMessage}
            onChange={(e) => setContenuMessage(e.target.value)}
            multiline
            minRows={4}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalMessageOuvert(false)} sx={{ textTransform: "none", color: TEXT_LIGHT }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={envoyerMessage}
            disabled={envoiEnCours}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#141F45" }, textTransform: "none", fontWeight: 600 }}
          >
            {envoiEnCours ? "Envoi..." : "Envoyer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}>
        <Badge
          badgeContent={messagesNonLus}
          color="error"
          overlap="circular"
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <IconButton
            onClick={ouvrirChat}
            sx={{
              width: 64,
              height: 64,
              bgcolor: PRIMARY,
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              "&:hover": { bgcolor: "#141F45" },
              animation: messagesNonLus > 0 ? "pulseEncadrant 1.4s ease-in-out infinite" : "none",
              "@keyframes pulseEncadrant": {
                "0%, 100%": { transform: "scale(1)", boxShadow: "0 4px 14px rgba(0,0,0,0.25)" },
                "50%": { transform: "scale(1.1)", boxShadow: "0 4px 22px rgba(178,34,52,0.6)" },
              },
            }}
          >
            <Avatar
              src={encadrant?.photo_url ? `${API_URL}${encadrant.photo_url}` : undefined}
              sx={{ width: 56, height: 56, bgcolor: "transparent" }}
            >
              {encadrant?.prenom?.[0]}
              {encadrant?.nom?.[0]}
            </Avatar>
          </IconButton>
        </Badge>
      </Box>

      <Dialog open={chatOuvert} onClose={() => setChatOuvert(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={encadrant?.photo_url ? `${API_URL}${encadrant.photo_url}` : undefined}
            sx={{ width: 36, height: 36, bgcolor: PRIMARY }}
          >
            {encadrant?.prenom?.[0]}
            {encadrant?.nom?.[0]}
          </Avatar>
          {encadrant?.prenom} {encadrant?.nom}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
          {erreurChat && <Alert severity="error">{erreurChat}</Alert>}

          {messages.length === 0 ? (
            <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
              Aucun message pour le moment. Écrivez ci-dessous pour contacter votre encadrant.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 400, overflowY: "auto", py: 1 }}>
              {messages.map((m) => {
                const estStagiaire = m.expediteur === "stagiaire";
                return (
                  <Box
                    key={m.id}
                    sx={{
                      alignSelf: estStagiaire ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                      bgcolor: estStagiaire ? PRIMARY : "#F1F5F9",
                      color: estStagiaire ? "#FFF" : "#1F2937",
                      borderRadius: 2,
                      px: 2,
                      py: 1.25,
                    }}
                  >
                    {m.type_message === "demande_rdv" && (
                      <Chip
                        label="Demande de RDV"
                        size="small"
                        sx={{
                          mb: 0.5,
                          height: 18,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: estStagiaire ? "rgba(255,255,255,0.2)" : "#FDECEA",
                          color: estStagiaire ? "#FFF" : SECONDARY,
                        }}
                      />
                    )}
                    {m.piece_jointe_url ? (
                      <Box
                        onClick={() => window.open(`${API_URL}${m.piece_jointe_url}`, "_blank")}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          cursor: "pointer",
                          bgcolor: estStagiaire ? "rgba(255,255,255,0.15)" : "#FFF",
                          border: estStagiaire ? "1px solid rgba(255,255,255,0.3)" : `1px solid ${BORDER}`,
                          borderRadius: 1.5,
                          px: 1.25,
                          py: 0.75,
                        }}
                      >
                        <DownloadIcon fontSize="small" sx={{ color: estStagiaire ? "#FFF" : TEXT_LIGHT }} />
                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                          {m.piece_jointe_nom || m.contenu}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2">{m.contenu}</Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mt: 0.3, color: estStagiaire ? "rgba(255,255,255,0.7)" : TEXT_LIGHT }}
                    >
                      {formaterDateRelative(m.date_envoi)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <input
            type="file"
            ref={refInputFichier}
            onChange={envoyerFichierChat}
            style={{ display: "none" }}
          />
          <IconButton
            onClick={() => refInputFichier.current?.click()}
            disabled={envoiFichierEnCours}
            sx={{ color: TEXT_LIGHT }}
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>
          <TextField
            placeholder="Écrire un message..."
            value={messageChat}
            onChange={(e) => setMessageChat(e.target.value)}
            fullWidth
            size="small"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                envoyerMessageChat();
              }
            }}
          />
          <IconButton
            onClick={envoyerMessageChat}
            disabled={envoiChatEnCours}
            sx={{ bgcolor: PRIMARY, color: "#FFF", "&:hover": { bgcolor: "#141F45" } }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
