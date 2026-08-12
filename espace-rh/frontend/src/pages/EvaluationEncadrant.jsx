import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Rating,
  Slider,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  InputAdornment,
  IconButton,
  Badge,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";
const BACKGROUND = "#F5F7FB";

const ETAPES = ["Critères de performance", "Synthèse qualitative", "Récapitulatif"];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatPeriode(debut, fin) {
  if (!debut || !fin) return "—";
  const d1 = new Date(debut);
  const d2 = new Date(fin);
  const options = { month: "long", year: "numeric" };
  return `${d1.toLocaleDateString("fr-FR", options)} - ${d2.toLocaleDateString("fr-FR", options)}`;
}

const LABELS_CRITERES = {
  competences_techniques: { label: "Compétences techniques", description: "Maîtrise des outils et processus", type: "etoiles" },
  qualite_travail: { label: "Qualité du travail", description: "Précision, respect des normes et rigueur", type: "etoiles" },
  communication: { label: "Communication", description: "Intégration équipe et clarté des rapports", type: "etoiles" },
  autonomie: { label: "Autonomie", description: "Capacité à prendre des initiatives", type: "curseur" },
  ponctualite: { label: "Ponctualité", description: "Respect des horaires et délais", type: "curseur" },
};

function BarreDuHaut({ navigate }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, md: 4 },
        py: 2,
        bgcolor: WHITE,
        borderBottom: `1px solid ${BORDER}`,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: PRIMARY, fontSize: "1.05rem" }}>
          Management System
        </Typography>
        <Box sx={{ display: "flex", gap: 2.5 }}>
          <Typography
            sx={{
              color: SECONDARY,
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              borderBottom: `2px solid ${SECONDARY}`,
              pb: 0.5,
            }}
          >
            Évaluation en cours
          </Typography>
          <Typography
            sx={{ color: TEXT_LIGHT, fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}
            onClick={() => navigate("/encadrant/evaluations")}
          >
            Archives
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <TextField
          size="small"
          placeholder="Rechercher..."
          sx={{ width: 220, display: { xs: "none", sm: "block" }, "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: BACKGROUND } }}
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
        <IconButton>
          <Badge badgeContent={0} color="error">
            <NotificationsNoneIcon sx={{ color: PRIMARY }} />
          </Badge>
        </IconButton>
        <IconButton>
          <AccountCircleIcon sx={{ color: PRIMARY }} />
        </IconButton>
      </Box>
    </Box>
  );
}

function CarteApercuStagiaire({ stagiaire }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: PRIMARY, mb: 3 }}>
      <Typography variant="caption" sx={{ color: "#AEB6D6", fontWeight: 700, letterSpacing: 0.5 }}>
        APERÇU STAGIAIRE
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5, mb: 2 }}>
        <Avatar
          src={stagiaire.photo_url ? `${API_URL}${stagiaire.photo_url}` : undefined}
          sx={{ width: 56, height: 56, bgcolor: SECONDARY, border: `2px solid ${SECONDARY}` }}
        >
          {stagiaire.prenom?.charAt(0)}
        </Avatar>
        <Box>
          <Typography sx={{ color: WHITE, fontWeight: 700 }}>
            {stagiaire.prenom} {stagiaire.nom}
          </Typography>
          <Typography variant="body2" sx={{ color: "#AEB6D6" }}>
            {stagiaire.niveau_etudes || "—"} · {stagiaire.etablissement || "—"}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Box sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2, p: 1.5, flex: 1 }}>
          <Typography variant="caption" sx={{ color: "#AEB6D6" }}>Durée</Typography>
          <Typography sx={{ color: WHITE, fontWeight: 700 }}>
            {stagiaire.date_debut && stagiaire.date_fin
              ? `${Math.round((new Date(stagiaire.date_fin) - new Date(stagiaire.date_debut)) / (1000 * 60 * 60 * 24 * 30))} mois`
              : "—"}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2, p: 1.5, flex: 1 }}>
          <Typography variant="caption" sx={{ color: "#AEB6D6" }}>Statut</Typography>
          <Typography sx={{ color: WHITE, fontWeight: 700 }}>
            {stagiaire.statut === "en_cours" ? "En cours" : stagiaire.statut === "termine" ? "Terminé" : stagiaire.statut || "—"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function CarteCritere({ cle, valeur, onChange }) {
  const { label, description, type } = LABELS_CRITERES[cle];
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: type === "curseur" ? 0.5 : 0 }}>
        <Box>
          <Typography variant="body1" fontWeight={700} sx={{ color: PRIMARY }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
            {description}
          </Typography>
        </Box>
        {type === "etoiles" ? (
          <Rating value={valeur} onChange={(_, v) => onChange(v)} sx={{ color: SECONDARY, mt: 0.5 }} />
        ) : (
          <Typography variant="body1" fontWeight={700} sx={{ color: SECONDARY }}>
            {valeur}%
          </Typography>
        )}
      </Box>
      {type === "curseur" && (
        <Slider
          value={valeur}
          onChange={(_, v) => onChange(v)}
          sx={{ color: SECONDARY, "& .MuiSlider-thumb": { width: 18, height: 18 }, mt: 1 }}
        />
      )}
    </Paper>
  );
}

function EvaluationEncadrant() {
  const { stagiaireId, evaluationId } = useParams();
  const navigate = useNavigate();
  const modeEdition = Boolean(evaluationId);

  const [stagiaire, setStagiaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [error, setError] = useState("");
  const [succes, setSucces] = useState("");
  const [etapeActive, setEtapeActive] = useState(0);

  const [criteres, setCriteres] = useState({
    competences_techniques: 0,
    qualite_travail: 0,
    communication: 0,
    autonomie: 0,
    ponctualite: 0,
  });
  const [titre, setTitre] = useState("Évaluation de fin de stage");
  const [commentaireGlobal, setCommentaireGlobal] = useState("");
  const [recommandations, setRecommandations] = useState("");

  useEffect(() => {
    if (!stagiaireId) {
      const minuteur = setTimeout(() => {
        navigate("/encadrant/dashboard");
      }, 1800);
      return () => clearTimeout(minuteur);
    }

    fetch(`${API_URL}/moi/mes-stagiaires/${stagiaireId}`, { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        setStagiaire(data);

        if (modeEdition) {
          return fetch(`${API_URL}/moi/mes-stagiaires/${stagiaireId}/evaluations/${evaluationId}`, {
            headers: authHeaders(),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Evaluation introuvable");
              return res.json();
            })
            .then((evaluation) => {
              setTitre(evaluation.titre || "Évaluation de fin de stage");
              setCriteres(evaluation.criteres || {
                competences_techniques: 0,
                qualite_travail: 0,
                communication: 0,
                autonomie: 0,
                ponctualite: 0,
              });
              setCommentaireGlobal(evaluation.commentaire_global || "");
              setRecommandations(evaluation.recommandations || "");
            });
        }
      })
      .then(() => setLoading(false))
      .catch(() => {
        setError(modeEdition ? "Impossible de charger cette évaluation." : "Impossible de charger les informations du stagiaire.");
        setLoading(false);
      });
  }, [stagiaireId, evaluationId, modeEdition, navigate]);

  if (!stagiaireId) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">
          Sélectionnez un stagiaire depuis "Mes stagiaires" pour créer une évaluation. Redirection en cours...
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  if (error || !stagiaire) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error || "Stagiaire introuvable."}</Alert>
      </Box>
    );
  }

  const mettreAJourCritere = (cle, valeur) => {
    setCriteres((precedent) => ({ ...precedent, [cle]: valeur }));
  };

  const enregistrerEvaluation = async (statut) => {
    setEnregistrement(true);
    setError("");
    setSucces("");
    try {
      const url = modeEdition
        ? `${API_URL}/moi/mes-stagiaires/${stagiaireId}/evaluations/${evaluationId}`
        : `${API_URL}/moi/mes-stagiaires/${stagiaireId}/evaluations`;
      const methode = modeEdition ? "PUT" : "POST";

      const reponse = await fetch(url, {
        method: methode,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          titre,
          date_evaluation: new Date().toISOString().slice(0, 10),
          criteres,
          commentaire_global: commentaireGlobal || null,
          recommandations: recommandations || null,
          statut,
        }),
      });
      if (!reponse.ok) throw new Error("Erreur lors de l'enregistrement");
      setSucces(statut === "soumise" ? "Évaluation enregistrée avec succès." : "Brouillon enregistré.");
      if (statut === "soumise") {
        setTimeout(() => navigate("/encadrant/evaluations"), 1200);
      }
    } catch {
      setError("Impossible d'enregistrer l'évaluation.");
    } finally {
      setEnregistrement(false);
    }
  };

  const etapeSuivante = () => setEtapeActive((e) => Math.min(e + 1, ETAPES.length - 1));
  const etapePrecedente = () => setEtapeActive((e) => Math.max(e - 1, 0));

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100%" }}>
      <BarreDuHaut navigate={navigate} />

      <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: "56px", md: "120px" }, maxWidth: 820, mx: "auto" }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link underline="hover" sx={{ color: TEXT_LIGHT, cursor: "pointer" }} onClick={() => navigate("/encadrant/evaluations")}>
            Évaluations
          </Link>
          <Typography sx={{ color: SECONDARY, fontWeight: 700 }}>Fiche Stagiaire</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, fontSize: "1.75rem" }}>
              {modeEdition ? "Modifier l'évaluation" : "Évaluation de fin de stage"}
            </Typography>
            <Typography sx={{ color: TEXT_LIGHT, mt: 0.5 }}>
              Stagiaire : <b style={{ color: PRIMARY }}>{stagiaire.prenom} {stagiaire.nom}</b> · Période : {formatPeriode(stagiaire.date_debut, stagiaire.date_fin)}
            </Typography>
          </Box>
          <Chip
            icon={<EventIcon sx={{ color: `${PRIMARY} !important` }} />}
            label={`Date : ${formatDate(new Date().toISOString())}`}
            sx={{ bgcolor: WHITE, border: `1px solid ${BORDER}`, fontWeight: 700, color: PRIMARY, px: 1 }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {succes && <Alert severity="success" sx={{ mb: 3 }}>{succes}</Alert>}

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE, mb: 3 }}>
          <Stepper activeStep={etapeActive} alternativeLabel>
            {ETAPES.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {etapeActive === 0 && (
          <Box>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE, mb: 2 }}>
              <Typography variant="body1" fontWeight={700} sx={{ color: PRIMARY, mb: 1 }}>
                Titre de l'évaluation
              </Typography>
              <TextField
                fullWidth
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex: Évaluation de fin de stage"
              />
            </Paper>
            {Object.keys(LABELS_CRITERES).map((cle) => (
              <CarteCritere key={cle} cle={cle} valeur={criteres[cle]} onChange={(v) => mettreAJourCritere(cle, v)} />
            ))}
          </Box>
        )}

        {etapeActive === 1 && (
          <Box>
            <CarteApercuStagiaire stagiaire={stagiaire} />
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE }}>
              <Typography variant="body1" fontWeight={700} sx={{ color: PRIMARY, mb: 1 }}>
                Commentaire Global
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Résumez le parcours et l'implication générale..."
                value={commentaireGlobal}
                onChange={(e) => setCommentaireGlobal(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Typography variant="body1" fontWeight={700} sx={{ color: PRIMARY, mb: 1 }}>
                Recommandations
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Conseils pour l'évolution future ou embauche..."
                value={recommandations}
                onChange={(e) => setRecommandations(e.target.value)}
              />
            </Paper>
          </Box>
        )}

        {etapeActive === 2 && (
          <Box>
            <CarteApercuStagiaire stagiaire={stagiaire} />
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, fontSize: "1.05rem" }}>
                Récapitulatif des critères
              </Typography>
              {Object.keys(LABELS_CRITERES).map((cle) => (
                <Box key={cle} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1 }}>
                  <Typography sx={{ color: TEXT_LIGHT }}>{LABELS_CRITERES[cle].label}</Typography>
                  <Typography sx={{ fontWeight: 700, color: SECONDARY }}>
                    {LABELS_CRITERES[cle].type === "etoiles" ? `${criteres[cle]} / 5` : `${criteres[cle]}%`}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" fontWeight={700} sx={{ color: PRIMARY, mb: 0.5 }}>
                Commentaire global
              </Typography>
              <Typography sx={{ color: TEXT_LIGHT, mb: 2 }}>
                {commentaireGlobal || "—"}
              </Typography>
              <Typography variant="body1" fontWeight={700} sx={{ color: PRIMARY, mb: 0.5 }}>
                Recommandations
              </Typography>
              <Typography sx={{ color: TEXT_LIGHT }}>
                {recommandations || "—"}
              </Typography>
            </Paper>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={enregistrement}
                onClick={() => enregistrerEvaluation("soumise")}
                sx={{ bgcolor: SECONDARY, "&:hover": { bgcolor: "#B8181D" }, borderRadius: 2, textTransform: "none", fontWeight: 700, py: 1.3, flex: 1 }}
              >
                {modeEdition ? "Valider et soumettre" : "Enregistrer l'évaluation"}
              </Button>
              <Button
                variant="outlined"
                disabled={enregistrement}
                onClick={() => enregistrerEvaluation("brouillon")}
                sx={{ borderColor: BORDER, color: PRIMARY, borderRadius: 2, textTransform: "none", fontWeight: 700, py: 1.3, flex: 1 }}
              >
                Enregistrer en brouillon
              </Button>
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            disabled={etapeActive === 0}
            onClick={etapePrecedente}
            sx={{ color: PRIMARY, textTransform: "none", fontWeight: 700 }}
          >
            Précédent
          </Button>
          {etapeActive < ETAPES.length - 1 && (
            <Button
              endIcon={etapeActive === ETAPES.length - 2 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
              onClick={etapeSuivante}
              variant="contained"
              sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#141F45" }, textTransform: "none", fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              {etapeActive === ETAPES.length - 2 ? "Voir le récapitulatif" : "Suivant"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default EvaluationEncadrant;
