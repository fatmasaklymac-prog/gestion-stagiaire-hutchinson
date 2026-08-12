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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AddIcon from "@mui/icons-material/Add";
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

function regrouperParStagiaire(evaluations) {
  const groupes = new Map();
  evaluations.forEach((evaluation) => {
    const cle = evaluation.stagiaire_id;
    if (!groupes.has(cle)) {
      groupes.set(cle, {
        stagiaire_id: evaluation.stagiaire_id,
        stagiaire_prenom: evaluation.stagiaire_prenom,
        stagiaire_nom: evaluation.stagiaire_nom,
        stagiaire_photo_url: evaluation.stagiaire_photo_url,
        evaluations: [],
      });
    }
    groupes.get(cle).evaluations.push(evaluation);
  });

  return Array.from(groupes.values())
    .map((groupe) => ({
      ...groupe,
      evaluations: groupe.evaluations.sort(
        (a, b) => new Date(b.date_evaluation) - new Date(a.date_evaluation)
      ),
    }))
    .sort(
      (a, b) => new Date(b.evaluations[0].date_evaluation) - new Date(a.evaluations[0].date_evaluation)
    );
}

function LigneStagiaireGroupe({ groupe, onClick }) {
  const nb = groupe.evaluations.length;
  const derniere = groupe.evaluations[0];

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
        src={groupe.stagiaire_photo_url ? `${API_URL}${groupe.stagiaire_photo_url}` : undefined}
        sx={{ width: 44, height: 44, bgcolor: SECONDARY }}
      >
        {groupe.stagiaire_prenom?.charAt(0)}
      </Avatar>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body1" fontWeight={700} sx={{ color: PRIMARY }}>
          {groupe.stagiaire_prenom} {groupe.stagiaire_nom}
        </Typography>
        <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
          Dernière : {derniere.titre} · {formatDate(derniere.date_evaluation)}
        </Typography>
      </Box>
      <Chip
        label={`${nb} évaluation${nb > 1 ? "s" : ""}`}
        size="small"
        sx={{ bgcolor: "#EEF1F6", color: PRIMARY, fontWeight: 700 }}
      />
      <Chip
        label={derniere.statut === "soumise" ? "Soumise" : "Brouillon"}
        size="small"
        sx={{
          bgcolor: derniere.statut === "soumise" ? "#E8F5E9" : "#FFF3E0",
          color: derniere.statut === "soumise" ? SUCCESS : WARNING,
          fontWeight: 700,
        }}
      />
    </Box>
  );
}

function DialogDetailStagiaire({ groupe, onClose, onNouvelleEvaluation, onEditerEvaluation }) {
  if (!groupe) return null;

  return (
    <Dialog open={Boolean(groupe)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={groupe.stagiaire_photo_url ? `${API_URL}${groupe.stagiaire_photo_url}` : undefined}
            sx={{ width: 40, height: 40, bgcolor: SECONDARY }}
          >
            {groupe.stagiaire_prenom?.charAt(0)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.05rem" }}>
              {groupe.stagiaire_prenom} {groupe.stagiaire_nom}
            </Typography>
            <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
              {groupe.evaluations.length} évaluation{groupe.evaluations.length > 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
          {groupe.evaluations.map((evaluation) => (
            <Box
              key={evaluation.id}
              onClick={() => onEditerEvaluation(evaluation.stagiaire_id, evaluation.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.75,
                borderRadius: 2,
                border: `1px solid ${BORDER}`,
                cursor: "pointer",
                transition: "all 0.15s ease",
                "&:hover": { borderColor: PRIMARY, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
                  {evaluation.titre}
                </Typography>
                <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                  {formatDate(evaluation.date_evaluation)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {evaluation.note && (
                  <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
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
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={onClose} sx={{ color: TEXT_LIGHT, textTransform: "none", fontWeight: 700 }}>
          Fermer
        </Button>
        <Button
          variant="contained"
          startIcon={<RateReviewIcon />}
          onClick={() => onNouvelleEvaluation(groupe.stagiaire_id)}
          sx={{ bgcolor: SECONDARY, "&:hover": { bgcolor: "#B8181D" }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
        >
          Nouvelle évaluation
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EvaluationsListe() {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onglet, setOnglet] = useState(0);
  const [groupeSelectionne, setGroupeSelectionne] = useState(null);
  const [ancreMenuAjout, setAncreMenuAjout] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/moi/evaluations`, { headers: authHeaders() }).then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      }),
      fetch(`${API_URL}/moi/mes-stagiaires`, { headers: authHeaders() }).then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      }),
    ])
      .then(([evaluationsData, stagiairesData]) => {
        setEvaluations(evaluationsData);
        setStagiaires(stagiairesData);
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
  const groupesAffiches = regrouperParStagiaire(listeAffichee);

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100%", p: { xs: 2, md: 4 }, pt: { xs: "56px", md: "120px" } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
            Évaluations
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT }}>
            Consultez et gérez les évaluations de vos stagiaires.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={(e) => setAncreMenuAjout(e.currentTarget)}
          sx={{ bgcolor: SECONDARY, "&:hover": { bgcolor: "#B8181D" }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
        >
          Ajouter évaluation
        </Button>
        <Menu
          anchorEl={ancreMenuAjout}
          open={Boolean(ancreMenuAjout)}
          onClose={() => setAncreMenuAjout(null)}
          slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 260, maxHeight: 360 } } }}
        >
          {stagiaires.length === 0 ? (
            <MenuItem disabled>Aucun stagiaire assigné</MenuItem>
          ) : (
            stagiaires.map((s) => (
              <MenuItem
                key={s.id}
                onClick={() => {
                  setAncreMenuAjout(null);
                  navigate(`/encadrant/evaluations/${s.id}`);
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={s.photo_url ? `${API_URL}${s.photo_url}` : undefined}
                    sx={{ width: 32, height: 32, bgcolor: SECONDARY }}
                  >
                    {s.prenom?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={`${s.prenom} ${s.nom}`} />
              </MenuItem>
            ))
          )}
        </Menu>
      </Box>

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
        {groupesAffiches.length === 0 ? (
          <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", py: 4 }}>
            {onglet === 0 ? "Aucune évaluation en cours." : "Aucune évaluation archivée."}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {groupesAffiches.map((groupe) => (
              <LigneStagiaireGroupe
                key={groupe.stagiaire_id}
                groupe={groupe}
                onClick={() => setGroupeSelectionne(groupe)}
              />
            ))}
          </Box>
        )}
      </Paper>

      <DialogDetailStagiaire
        groupe={groupeSelectionne}
        onClose={() => setGroupeSelectionne(null)}
        onNouvelleEvaluation={(stagiaireId) => navigate(`/encadrant/evaluations/${stagiaireId}`)}
        onEditerEvaluation={(stagiaireId, evaluationId) => navigate(`/encadrant/evaluations/${stagiaireId}/${evaluationId}`)}
      />
    </Box>
  );
}

export default EvaluationsListe;
