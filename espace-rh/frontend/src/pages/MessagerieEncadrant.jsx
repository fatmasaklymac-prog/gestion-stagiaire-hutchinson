import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
  Badge,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

function formatHeure(dateIso) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatJour(dateIso) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function initiales(prenom, nom) {
  return `${(prenom || "").charAt(0)}${(nom || "").charAt(0)}`.toUpperCase();
}

function formaterTaille(octets) {
  if (!octets) return "";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

function formaterDateSeparateur(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const aujourdHui = new Date();
  const hier = new Date();
  hier.setDate(aujourdHui.getDate() - 1);

  if (date.toDateString() === aujourdHui.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === hier.toDateString()) return "Hier";

  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function MessagerieEncadrant() {
  useOutletContext();

  const [conversations, setConversations] = useState([]);
  const [chargementConversations, setChargementConversations] = useState(true);
  const [erreurConversations, setErreurConversations] = useState("");

  const [stagiaireSelectionne, setStagiaireSelectionne] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chargementMessages, setChargementMessages] = useState(false);

  const [recherche, setRecherche] = useState("");
  const [nouveauMessage, setNouveauMessage] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  function chargerConversations() {
    setChargementConversations(true);
    fetch(`${API_URL}/encadrant/messages`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setConversations(data);
        setErreurConversations("");
      })
      .catch(() => setErreurConversations("Impossible de charger les conversations."))
      .finally(() => setChargementConversations(false));
  }

  useEffect(() => {
    chargerConversations();
  }, []);

  function ouvrirConversation(stagiaire) {
    setStagiaireSelectionne(stagiaire);
    setChargementMessages(true);
    fetch(`${API_URL}/encadrant/messages/${stagiaire.stagiaire_id}`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setMessages(data))
      .catch(() => setMessages([]))
      .finally(() => setChargementMessages(false));
  }

  function envoyerMessage() {
    if (!nouveauMessage.trim() || !stagiaireSelectionne) return;

    setEnvoiEnCours(true);
    fetch(`${API_URL}/encadrant/messages`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        stagiaire_id: stagiaireSelectionne.stagiaire_id,
        contenu: nouveauMessage.trim(),
        type_message: "message",
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((message) => {
        setMessages((prev) => [...prev, message]);
        setNouveauMessage("");
        chargerConversations();
      })
      .catch(() => {})
      .finally(() => setEnvoiEnCours(false));
  }

  function envoyerPieceJointe(fichier) {
    if (!fichier || !stagiaireSelectionne) return;
    setEnvoiEnCours(true);
    const formData = new FormData();
    formData.append("stagiaire_id", stagiaireSelectionne.stagiaire_id);
    formData.append("contenu", nouveauMessage.trim());
    formData.append("fichier", fichier);

    fetch(`${API_URL}/encadrant/messages/piece-jointe`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: formData,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((message) => {
        setMessages((prev) => [...prev, message]);
        setNouveauMessage("");
        chargerConversations();
      })
      .catch(() => {})
      .finally(() => setEnvoiEnCours(false));
  }

  function handleFichierChange(e) {
    const fichier = e.target.files[0];
    if (fichier) {
      envoyerPieceJointe(fichier);
    }
    e.target.value = "";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyerMessage();
    }
  }

  const conversationsFiltrees = conversations.filter((c) =>
    `${c.prenom} ${c.nom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Colonne conversations */}
      <Box
        sx={{
          width: 320,
          flexShrink: 0,
          borderRight: `1px solid ${BORDER}`,
          bgcolor: WHITE,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${BORDER}` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, mb: 1.5 }}>
            Conversations
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher un stagiaire..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: TEXT_LIGHT }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: BACKGROUND } }}
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {chargementConversations ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} sx={{ color: PRIMARY }} />
            </Box>
          ) : erreurConversations ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {erreurConversations}
            </Alert>
          ) : conversationsFiltrees.length === 0 ? (
            <Typography variant="body2" sx={{ color: TEXT_LIGHT, p: 2.5 }}>
              Aucune conversation pour le moment.
            </Typography>
          ) : (
            conversationsFiltrees.map((c) => {
              const estSelectionne = stagiaireSelectionne?.stagiaire_id === c.stagiaire_id;
              return (
                <Box
                  key={c.stagiaire_id}
                  onClick={() => ouvrirConversation(c)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2.5,
                    py: 1.5,
                    cursor: "pointer",
                    bgcolor: estSelectionne ? BACKGROUND : "transparent",
                    borderLeft: estSelectionne ? `3px solid ${SECONDARY}` : "3px solid transparent",
                    "&:hover": { bgcolor: BACKGROUND },
                  }}
                >
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!c.non_lu}
                    overlap="circular"
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <Avatar sx={{ bgcolor: PRIMARY, width: 40, height: 40, fontSize: "0.85rem" }}>
                      {initiales(c.prenom, c.nom)}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
                        {c.prenom} {c.nom}
                      </Typography>
                      <Typography variant="caption" sx={{ color: TEXT_LIGHT, flexShrink: 0, ml: 1 }}>
                        {formatJour(c.date_dernier_message)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{ color: TEXT_LIGHT, display: "block" }}
                    >
                      {c.dernier_message || "Aucun message"}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* Zone de chat */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: BACKGROUND }}>
        {!stagiaireSelectionne ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: TEXT_LIGHT,
            }}
          >
            <Typography variant="body1">
              Sélectionnez une conversation pour commencer à discuter.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 3,
                py: 2,
                bgcolor: WHITE,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <Avatar sx={{ bgcolor: PRIMARY, width: 36, height: 36, fontSize: "0.8rem" }}>
                {initiales(stagiaireSelectionne.prenom, stagiaireSelectionne.nom)}
              </Avatar>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: PRIMARY }}>
                {stagiaireSelectionne.prenom} {stagiaireSelectionne.nom}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {chargementMessages ? (
                <Box sx={{ display: "flex", justifyContent: "center", pt: 3 }}>
                  <CircularProgress size={24} sx={{ color: PRIMARY }} />
                </Box>
              ) : messages.length === 0 ? (
                <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", pt: 3 }}>
                  Aucun message échangé pour le moment.
                </Typography>
              ) : (
                messages.map((m, index) => {
                  const estEncadrant = m.expediteur === "encadrant";
                  const messagePrecedent = messages[index - 1];
                  const changementDeJour =
                    !messagePrecedent ||
                    new Date(m.date_envoi).toDateString() !==
                      new Date(messagePrecedent.date_envoi).toDateString();
                  return [
                    changementDeJour && (
                      <Box
                        key={`separateur-${m.id}`}
                        sx={{ display: "flex", justifyContent: "center", my: 1.5 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: BACKGROUND,
                            color: TEXT_LIGHT,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 5,
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {formaterDateSeparateur(m.date_envoi)}
                        </Typography>
                      </Box>
                    ),
                    <Box
                      key={m.id}
                      sx={{
                        alignSelf: estEncadrant ? "flex-end" : "flex-start",
                        maxWidth: "65%",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: estEncadrant ? PRIMARY : WHITE,
                          color: estEncadrant ? "#FFF" : "#1F2937",
                          border: estEncadrant ? "none" : `1px solid ${BORDER}`,
                          borderRadius: 2,
                          px: 2,
                          py: 1.25,
                        }}
                      >
                        {m.piece_jointe_url ? (
                          <Box
                            component="a"
                            href={`${API_URL}${m.piece_jointe_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.25,
                              textDecoration: "none",
                              color: "inherit",
                              bgcolor: estEncadrant ? "rgba(255,255,255,0.12)" : BACKGROUND,
                              borderRadius: 2,
                              p: 1,
                            }}
                          >
                            <InsertDriveFileIcon sx={{ color: estEncadrant ? "#FFF" : SECONDARY }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 180 }}>
                                {m.piece_jointe_nom}
                              </Typography>
                              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {formaterTaille(m.piece_jointe_taille)}
                              </Typography>
                            </Box>
                            <DownloadIcon fontSize="small" sx={{ ml: "auto", opacity: 0.8 }} />
                          </Box>
                        ) : null}
                        {m.contenu && (!m.piece_jointe_url || m.contenu !== m.piece_jointe_nom) && (
                          <Typography variant="body2" sx={{ mt: m.piece_jointe_url ? 1 : 0 }}>
                            {m.contenu}
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: TEXT_LIGHT,
                          display: "block",
                          textAlign: estEncadrant ? "right" : "left",
                          mt: 0.5,
                        }}
                      >
                        {formatHeure(m.date_envoi)}
                      </Typography>
                    </Box>,
                  ];
                })
              )}
            </Box>

            <Divider sx={{ borderColor: BORDER }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, bgcolor: WHITE }}>
              <input
                type="file"
                id="input-piece-jointe"
                style={{ display: "none" }}
                onChange={handleFichierChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <IconButton
                component="label"
                htmlFor="input-piece-jointe"
                disabled={envoiEnCours}
                sx={{ color: TEXT_LIGHT }}
              >
                <AttachFileIcon />
              </IconButton>
              <TextField
                fullWidth
                size="small"
                placeholder={`Écrire un message à ${stagiaireSelectionne.prenom}...`}
                value={nouveauMessage}
                onChange={(e) => setNouveauMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                multiline
                maxRows={4}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: BACKGROUND } }}
              />
              <IconButton
                onClick={envoyerMessage}
                disabled={envoiEnCours || !nouveauMessage.trim()}
                sx={{
                  bgcolor: PRIMARY,
                  color: "#FFF",
                  width: 40,
                  height: 40,
                  "&:hover": { bgcolor: "#161f42" },
                  "&.Mui-disabled": { bgcolor: BORDER, color: TEXT_LIGHT },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default MessagerieEncadrant;
