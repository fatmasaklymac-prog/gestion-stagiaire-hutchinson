import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
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

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function LigneEvaluation({ evaluation, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 3,
        border: `1px solid ${BORDER}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)", borderColor: PRIMARY },
      }}
    >
      <Avatar
        src={evaluation.stagiaire_photo_url ? `${API_URL}${evaluation.stagiaire_photo_url}` : undefined}
        sx={{ width: 44, height: 44, bgcolor: SECONDARY }}
      >
        {evaluation.stagiaire_prenom?.charAt(0)}
      </Avatar>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body1" fontWeight={700} sx={{ color: PRIMARY }}>
          {evaluation.stagiaire_prenom} {evaluation.stagiaire_nom}
        </Typography>
        <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
          {evaluation.titre} · {formatDate(evaluation.date_evaluation)}
        </Typography>
      </Box>
      {evaluation.note && (
        <Typography variant="body1" fontWeight={700} sx={{ color: PRIMARY }}>
          {evaluation.note}
        </Typography>
      )}
      <Chip
        label={evaluation.statut === "soumise" ? "Soumise" : "Brouillon"}
        size="small"
        sx={{
          bgcolor: evaluation.statut === "soumise" ? "#E8F5E9" : "#FFF3E0",
          color: evaluation.statut === "soumise" ? SUCCESS : WARNING,
          fontWeight: 700,
        }}
      />
    </Box>
  );
}

function EvaluationsListe() {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onglet, setOnglet] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/moi/evaluations`, { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        setEvaluations(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les évaluations.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  const brouillons = evaluations.filter((e) => e.statut === "brouillon");
  const soumises = evaluations.filter((e) => e.statut === "soumise");
  const listeAffichee = onglet === 0 ? brouillons : soumises;

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100%", p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
        Évaluations
      </Typography>
      <Typography sx={{ color: TEXT_LIGHT, mb: 3 }}>
        Consultez et gérez les évaluations de vos stagiaires.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Tabs
        value={onglet}
        onChange={(_, nouvelleValeur) => setOnglet(nouvelleValeur)}
        sx={{
          mb: 3,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 700, color: TEXT_LIGHT },
          "& .Mui-selected": { color: `${SECONDARY} !important` },
          "& .MuiTabs-indicator": { bgcolor: SECONDARY },
        }}
      >
        <Tab label={`Évaluation en cours (${brouillons.length})`} />
        <Tab label={`Archives (${soumises.length})`} />
      </Tabs>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE }}>
        {listeAffichee.length === 0 ? (
          <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", py: 4 }}>
            {onglet === 0 ? "Aucune évaluation en cours." : "Aucune évaluation archivée."}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {listeAffichee.map((evaluation) => (
              <LigneEvaluation
                key={evaluation.id}
                evaluation={evaluation}
                onClick={() => navigate(`/encadrant/evaluations/${evaluation.stagiaire_id}`)}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default EvaluationsListe;
