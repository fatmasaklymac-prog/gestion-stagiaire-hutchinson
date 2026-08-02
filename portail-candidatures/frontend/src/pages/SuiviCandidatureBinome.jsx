import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Link as MuiLink,
  InputAdornment,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MailIcon from "@mui/icons-material/Mail";
import LogoutIcon from "@mui/icons-material/Logout";
import ForumIcon from "@mui/icons-material/Forum";
import TimelineIcon from "@mui/icons-material/Timeline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import TagIcon from "@mui/icons-material/Tag";

const API_URL = process.env.REACT_APP_API_URL;

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SECONDARY_HOVER = "#c11a1f";
const BACKGROUND = "#F5F7FB";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

// ==================== Étape de la timeline ====================
function EtapeTimeline({ icone, titre, date, texte, statutEtape, dernier, enfant }) {
  // statutEtape : "franchie" | "actuelle" | "attente" | "refusee"
  const couleurs = {
    franchie: { cercle: PRIMARY, bordure: PRIMARY, icone: "white", titreCouleur: PRIMARY },
    actuelle: { cercle: "white", bordure: SECONDARY, icone: SECONDARY, titreCouleur: SECONDARY },
    attente: { cercle: "white", bordure: "#D1D5DB", icone: "#9CA3AF", titreCouleur: "#9CA3AF" },
    refusee: { cercle: "#FEE2E2", bordure: "#B91C1C", icone: "#B91C1C", titreCouleur: "#B91C1C" },
  };
  const c = couleurs[statutEtape];

  return (
    <Box sx={{ display: "flex", gap: 2, opacity: statutEtape === "attente" ? 0.55 : 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: "50%", border: `2px solid ${c.bordure}`,
            bgcolor: c.cercle, display: "flex", alignItems: "center", justifyContent: "center",
            color: c.icone, flexShrink: 0,
            boxShadow: statutEtape === "actuelle" ? `0 0 0 4px rgba(227,30,36,0.1)` : "none",
          }}
        >
          {icone}
        </Box>
        {!dernier && <Box sx={{ width: "2px", flexGrow: 1, minHeight: 40, bgcolor: BORDER, my: 0.5 }} />}
      </Box>
      <Box sx={{ pb: 4, flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: c.titreCouleur }}>
            {titre}
          </Typography>
          {statutEtape === "actuelle" && (
            <Chip label="Étape actuelle" size="small" sx={{ bgcolor: "#FDEBEC", color: SECONDARY, fontWeight: 700, height: 20, fontSize: "0.65rem" }} />
          )}
        </Box>
        {date && <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>{date}</Typography>}
        <Typography variant="body2" sx={{ color: "#374151", mt: 0.75 }}>{texte}</Typography>
        {enfant}
      </Box>
    </Box>
  );
}

function SuiviCandidature() {
  const [numeroDossier, setNumeroDossier] = useState("");
  const [email, setEmail] = useState("");
  const [recherche, setRecherche] = useState(false);
  const [demande, setDemande] = useState(null);
  const [erreur, setErreur] = useState("");

  const extraireId = (valeur) => {
    // Accepte aussi bien "3" que "#REF-2026-HUT-003" copié depuis l'écran de confirmation :
    // on récupère le dernier groupe de chiffres et on retire les zéros de tête.
    const correspondance = valeur.trim().match(/(\d+)\s*$/);
    if (!correspondance) return null;
    return parseInt(correspondance[1], 10);
  };

  const rechercherDossier = async (e) => {
    e.preventDefault();
    setErreur("");

    const idExtrait = extraireId(numeroDossier);
    if (idExtrait === null || Number.isNaN(idExtrait)) {
      setErreur("Numéro de dossier invalide. Vérifie le format (ex: 3 ou #REF-2026-HUT-003).");
      return;
    }

    setRecherche(true);
    try {
      const reponse = await fetch(`${API_URL}/demandes-stage/id/${idExtrait}?email=${encodeURIComponent(email.trim())}`);
      if (!reponse.ok) {
        throw new Error("Aucune candidature ne correspond à ce numéro de dossier et cet email.");
      }
      const data = await reponse.json();
      setDemande(data);
    } catch (err) {
      setErreur(err.message);
      setDemande(null);
    } finally {
      setRecherche(false);
    }
  };

  const reinitialiser = () => {
    setDemande(null);
    setNumeroDossier("");
    setEmail("");
    setErreur("");
  };

  // ---- Construction des étapes de la timeline à partir du statut ----
  const construireEtapes = (d) => {
    const ordre = ["en_attente", "en_etude", "entretien_programme", "acceptee"];
    const indexActuel = d.statut === "refusee" ? -1 : ordre.indexOf(d.statut);

    const etapeEntretien = (
      <EtapeTimeline
        key="entretien"
        icone={<EventAvailableIcon fontSize="small" />}
        titre="Entretien"
        date={d.date_entretien ? formatDate(d.date_entretien) : null}
        texte={d.date_entretien ? "Un entretien a été programmé pour votre candidature." : "Un entretien pourra être programmé à cette étape."}
        statutEtape={indexActuel > 2 ? "franchie" : indexActuel === 2 ? "actuelle" : "attente"}
        enfant={
          d.statut === "entretien_programme" && d.date_entretien ? (
            <Box sx={{ mt: 1.5, p: 2, bgcolor: "rgba(227,30,36,0.05)", borderRadius: 2, border: "1px solid rgba(227,30,36,0.15)" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY }}>Confirmation d'entretien RH</Typography>
              <Typography variant="body2" sx={{ color: "#374151", mt: 0.5 }}>
                Entretien prévu le {formatDate(d.date_entretien)}{d.heure_entretien ? ` à ${d.heure_entretien}` : ""}{d.lieu_entretien ? ` — ${d.lieu_entretien}` : ""}.
              </Typography>
            </Box>
          ) : null
        }
      />
    );

    if (d.statut === "refusee") {
      return [
        <EtapeTimeline key="recue" icone={<DoneAllIcon fontSize="small" />} titre="Candidature reçue" date={formatDate(d.date_creation)} texte="Votre dossier complet a bien été reçu." statutEtape="franchie" />,
        <EtapeTimeline key="etude" icone={<AnalyticsIcon fontSize="small" />} titre="En étude" texte="Votre dossier a été évalué par nos équipes." statutEtape="franchie" />,
        <EtapeTimeline
          key="verdict"
          icone={<CancelIcon fontSize="small" />}
          titre="Verdict"
          texte="Voir le détail ci-dessus."
          statutEtape="refusee"
          dernier
        />,
      ];
    }

    return [
      <EtapeTimeline key="recue" icone={<DoneAllIcon fontSize="small" />} titre="Candidature reçue" date={formatDate(d.date_creation)} texte="Nous avons bien reçu votre dossier complet. Il est en cours de traitement." statutEtape={indexActuel > 0 ? "franchie" : indexActuel === 0 ? "actuelle" : "attente"} />,
      <EtapeTimeline key="etude" icone={<AnalyticsIcon fontSize="small" />} titre="En étude" texte="Votre dossier est transmis aux équipes opérationnelles pour évaluation." statutEtape={indexActuel > 1 ? "franchie" : indexActuel === 1 ? "actuelle" : "attente"} />,
      etapeEntretien,
      <EtapeTimeline
        key="verdict"
        icone={<VerifiedIcon fontSize="small" />}
        titre="Verdict"
        texte={
          d.statut === "acceptee"
            ? "Votre candidature a été acceptée — voir le message ci-dessus."
            : "La décision finale vous sera communiquée après la fin des entretiens de sélection."
        }
        statutEtape={indexActuel === 3 ? "actuelle" : "attente"}
        dernier
      />,
    ];
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "white", display: "flex", flexDirection: "column" }}>
      {/* En-tête */}
      <Box sx={{ borderBottom: `1px solid ${BORDER}`, py: 2 }}>
        <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: PRIMARY }}>
            Hutchinson Recrutement
          </Typography>
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <MuiLink component={RouterLink} to="/accueil" underline="none" sx={{ color: TEXT_LIGHT, fontWeight: 600, fontSize: "0.9rem" }}>
              Accueil
            </MuiLink>
            <MuiLink component={RouterLink} to="/demande-stage" underline="none" sx={{ color: TEXT_LIGHT, fontWeight: 600, fontSize: "0.9rem" }}>
              Postuler
            </MuiLink>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
        {!demande ? (
          // ---------- Écran de recherche : panneau visuel + formulaire ----------
          <Grid container spacing={0} sx={{ maxWidth: 1000, mx: "auto", mt: { xs: 1, md: 4 }, borderRadius: 4, overflow: "hidden", boxShadow: "0 8px 32px -8px rgba(29,43,91,0.15)" }}>
            {/* Panneau gauche : présentation du processus */}
            <Grid
              size={{ xs: 12, md: 5 }}
              sx={{
                bgcolor: PRIMARY,
                color: "white",
                p: { xs: 4, md: 5 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box sx={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)" }} />
              <Box sx={{ position: "absolute", bottom: -80, left: -40, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.03)" }} />

              <Box sx={{ position: "relative" }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: SECONDARY, display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                  <TimelineIcon />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Suivez votre candidature en temps réel
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", mb: 4 }}>
                  Entrez votre numéro de dossier et votre email pour consulter l'avancement de votre candidature à tout moment.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {[
                    { icone: <DoneAllIcon fontSize="small" />, titre: "Candidature reçue", texte: "Votre dossier est enregistré" },
                    { icone: <AnalyticsIcon fontSize="small" />, titre: "En étude", texte: "Évaluation par nos équipes" },
                    { icone: <EventAvailableIcon fontSize="small" />, titre: "Entretien", texte: "Rencontre avec le recruteur" },
                    { icone: <VerifiedIcon fontSize="small" />, titre: "Verdict", texte: "Décision finale communiquée" },
                  ].map((etape, i, arr) => (
                    <Box key={etape.titre} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {etape.icone}
                        </Box>
                        {i < arr.length - 1 && <Box sx={{ width: "1px", height: 20, bgcolor: "rgba(255,255,255,0.15)", my: 0.5 }} />}
                      </Box>
                      <Box sx={{ pt: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{etape.titre}</Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>{etape.texte}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Panneau droit : formulaire */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ bgcolor: "white", p: { xs: 4, md: 5 }, display: "flex", alignItems: "center" }}>
              <Box component="form" onSubmit={rechercherDossier} sx={{ width: "100%" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY, mb: 0.5 }}>
                  Accéder à mon dossier
                </Typography>
                <Typography variant="body2" sx={{ color: TEXT_LIGHT, mb: 3 }}>
                  Renseignez les deux informations ci-dessous.
                </Typography>

                {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Numéro de dossier"
                      placeholder="Ex: #REF-2026-HUT-003 ou 3"
                      value={numeroDossier}
                      onChange={(e) => setNumeroDossier(e.target.value)}
                      required
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><TagIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email utilisé lors de la candidature"
                      placeholder="email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={recherche}
                  sx={{ mt: 3, bgcolor: SECONDARY, "&:hover": { bgcolor: SECONDARY_HOVER }, borderRadius: 2, textTransform: "none", fontWeight: 700, py: 1.3 }}
                >
                  {recherche ? <CircularProgress size={20} color="inherit" /> : "Voir mon dossier"}
                </Button>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2.5, p: 1.5, bgcolor: BACKGROUND, borderRadius: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: TEXT_LIGHT, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                    Le numéro de dossier vous a été communiqué à la fin de votre candidature.
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ textAlign: "center", color: TEXT_LIGHT, mt: 3 }}>
                  Pas encore candidat ?{" "}
                  <MuiLink component={RouterLink} to="/demande-stage" sx={{ color: SECONDARY, fontWeight: 700 }}>
                    Postuler à un stage
                  </MuiLink>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ) : (
          // ---------- Résultat : infos + timeline ----------
          <Grid container spacing={3}>
            {demande.statut === "acceptee" && (
              <Grid size={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    bgcolor: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    display: "flex",
                    alignItems: "center",
                    gap: 2.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "#15803D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <VerifiedIcon sx={{ color: "white", fontSize: 30 }} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 240 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#15803D" }}>
                      Félicitations {demande.prenom} ! Votre candidature est acceptée 🎉
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#166534", mt: 0.5 }}>
                      {demande.message_candidat
                        ? demande.message_candidat
                        : `Bienvenue chez Hutchinson ! L'équipe RH va vous recontacter par email à ${demande.email} pour organiser la suite (date de démarrage, documents à fournir...).`}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}

            {demande.statut === "refusee" && (
              <Grid size={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    bgcolor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    display: "flex",
                    alignItems: "center",
                    gap: 2.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "#B91C1C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CancelIcon sx={{ color: "white", fontSize: 30 }} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 240 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#B91C1C" }}>
                      Candidature non retenue
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#7F1D1D", mt: 0.5 }}>
                      {demande.message_candidat || "Nous vous remercions pour l'intérêt porté à Hutchinson. Votre profil n'a pas été retenu pour ce poste cette fois-ci, n'hésitez pas à postuler à nouveau pour de futures opportunités."}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}

            <Grid size={{ xs: 12, lg: 5 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: "0 4px 20px -2px rgba(29,43,91,0.06)", mb: 2.5 }}>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: PRIMARY }}>Suivi de Candidature</Typography>
                  <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 0.5 }}>
                    {demande.prenom} {demande.nom}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: BACKGROUND, borderRadius: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: PRIMARY }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: TEXT_LIGHT, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
                        Identifiant de dossier
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY }}>
                        #REF-{new Date(demande.date_creation || Date.now()).getFullYear()}-HUT-{String(demande.id).padStart(3, "0")}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <MailIcon sx={{ color: PRIMARY }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: TEXT_LIGHT, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
                        Email vérifié
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY }}>{demande.email}</Typography>
                    </Box>
                  </Box>
                  <Button
                    onClick={reinitialiser}
                    startIcon={<LogoutIcon fontSize="small" />}
                    sx={{ alignSelf: "flex-start", textTransform: "none", color: SECONDARY, fontWeight: 700, px: 0 }}
                  >
                    Quitter la session
                  </Button>
                </Box>
              </Paper>

              {demande.message_candidat && demande.statut !== "acceptee" && demande.statut !== "refusee" && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: PRIMARY, color: "white" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <ForumIcon fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Commentaires RH</Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.95 }}>
                      "{demande.message_candidat}"
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.7, fontWeight: 700 }}>
                      — Équipe Recrutement, Hutchinson
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: "0 4px 20px -2px rgba(29,43,91,0.06)" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: PRIMARY, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                  <TimelineIcon /> Progression de votre dossier
                </Typography>
                {construireEtapes(demande)}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Pied de page */}
      <Box sx={{ bgcolor: BACKGROUND, py: 3, borderTop: `1px solid ${BORDER}` }}>
        <Container maxWidth="lg">
          <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block", textAlign: "center" }}>
            © {new Date().getFullYear()} Hutchinson. Tous droits réservés.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default SuiviCandidature;