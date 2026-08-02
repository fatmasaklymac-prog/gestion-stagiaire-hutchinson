import { useState } from "react";
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress,
  Chip, Divider, Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const API_URL = "http://127.0.0.1:8001";

const PRIMARY = "#1D2B5B";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";
const SUCCESS = "#2E7D32";
const WARNING = "#EF6C00";
const GREEN_LIGHT = "#E8F5E9";
const ORANGE_LIGHT = "#FFF3E0";
const RED_LIGHT = "#FDECEC";
const DANGER = "#C62828";

const STATUT_INFO = {
  en_attente: { label: "En attente", bg: ORANGE_LIGHT, color: WARNING },
  en_etude: { label: "En cours d'étude", bg: "#E8F0FE", color: "#1565c0" },
  entretien_programme: { label: "Entretien programmé", bg: "#f3e5f5", color: "#7b1fa2" },
  acceptee: { label: "Acceptée", bg: GREEN_LIGHT, color: SUCCESS },
  refusee: { label: "Refusée", bg: RED_LIGHT, color: DANGER },
};

function SuiviCandidature() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState(null);
  const [erreur, setErreur] = useState("");

  const rechercher = async () => {
    setErreur("");
    setDemande(null);
    if (!id || !email) {
      setErreur("Merci de renseigner le numéro de dossier et l'email utilisés lors de la candidature.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/demandes-stage/suivi?id=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`);
      if (!r.ok) {
        const errJson = await r.json().catch(() => ({}));
        throw new Error(errJson.detail || "Candidature introuvable");
      }
      const data = await r.json();
      setDemande(data);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statutInfo = demande ? (STATUT_INFO[demande.statut] || { label: demande.statut, bg: "#f5f5f5", color: TEXT_LIGHT }) : null;

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 5 }, display: "flex", justifyContent: "center" }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid", borderColor: BORDER, maxWidth: 560, width: "100%", bgcolor: WHITE }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, mb: 1 }}>
          Suivre ma candidature
        </Typography>
        <Typography sx={{ color: TEXT_LIGHT, mb: 3 }}>
          Renseignez votre numéro de dossier et l'email utilisé lors de votre candidature.
        </Typography>

        {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField label="Numéro de dossier" value={id} onChange={(e) => setId(e.target.value)} fullWidth type="number" />
          </Grid>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth type="email" />
          </Grid>
        </Grid>

        <Button variant="contained" onClick={rechercher} disabled={loading} fullWidth
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
          sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16224a" }, borderRadius: 3, textTransform: "none", fontWeight: 600, mt: 3, py: 1.2 }}>
          {loading ? "Recherche..." : "Rechercher ma candidature"}
        </Button>

        {demande && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY }}>
                {demande.prenom} {demande.nom}
              </Typography>
              <Chip label={statutInfo.label} sx={{ bgcolor: statutInfo.bg, color: statutInfo.color, fontWeight: 600 }} />
            </Box>
            <Typography variant="body2" sx={{ color: TEXT_LIGHT, mb: 0.5 }}>
              Dossier n°{demande.id} — {demande.type_stage}
            </Typography>
            <Typography variant="body2" sx={{ color: TEXT_LIGHT, mb: 0.5 }}>
              {demande.etablissements} — {demande.niveau_etudes}
            </Typography>
            <Typography variant="body2" sx={{ color: TEXT_LIGHT, mb: 2 }}>
              Département souhaité : {demande.departements}
            </Typography>

            {demande.date_entretien && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Entretien programmé le {demande.date_entretien} {demande.heure_entretien ? `à ${demande.heure_entretien}` : ""} {demande.lieu_entretien ? `— ${demande.lieu_entretien}` : ""}
              </Alert>
            )}

            {demande.message_candidat && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {demande.message_candidat}
              </Alert>
            )}

            {demande.statut === "acceptee" && (
              <Alert severity="success">
                Félicitations, votre candidature a été acceptée ! Vous serez contacté(e) pour la suite.
              </Alert>
            )}
            {demande.statut === "refusee" && (
              <Alert severity="warning">
                Votre candidature n'a pas été retenue cette fois-ci. Merci pour votre intérêt.
              </Alert>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default SuiviCandidature;
