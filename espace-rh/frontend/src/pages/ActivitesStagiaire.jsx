import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  CircularProgress,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Select,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { authHeaders } from "../auth";
function CarteStat({ icon, label, valeur, couleur }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid #E5E7EB",
        bgcolor: "#FFFFFF",
        flex: 1,
        minWidth: 150,
        transition: "all 0.25s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: `${couleur}20`,
            color: couleur,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h3" sx={{ color: "#1D2B5B", fontWeight: 800, fontSize: "2rem" }}>
        {valeur}
      </Typography>
    </Paper>
  );
}

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

const LIBELLES_PRIORITE = {
  haute: "Haute",
  moyenne: "Moyenne",
  basse: "Basse",
};

const STYLES_PRIORITE = {
  haute: { bg: "#FDECEA", color: "#C62828" },
  moyenne: { bg: "#FFF4E5", color: "#B45309" },
  basse: { bg: "#E8F5E9", color: "#2E7D32" },
};

const STYLES_STATUT = {
  a_faire: { bg: "#F1F5F9", color: "#475569" },
  en_cours: { bg: "#E0EAFF", color: "#1D4ED8" },
  termine: { bg: "#E8F5E9", color: "#2E7D32" },
};

const JOURS_SEMAINE = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

function formaterDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function memeJour(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function debutDeSemaine(date) {
  const d = new Date(date);
  const jour = d.getDay();
  const decalage = jour === 0 ? -6 : 1 - jour;
  d.setDate(d.getDate() + decalage);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formaterRelatif(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  const maintenant = new Date();
  const diffMs = maintenant - d;
  const diffHeures = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHeures < 1) return "À l'instant";
  if (diffHeures < 24) return `Il y a ${diffHeures} heure${diffHeures > 1 ? "s" : ""}`;
  if (diffHeures < 48) return `Hier, ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  return formaterDate(dateStr);
}

export default function ActivitesStagiaire() {
  const { profil, erreurProfil } = useOutletContext();

  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decalageSemaine, setDecalageSemaine] = useState(0);
  const [filtreStatut, setFiltreStatut] = useState("tous");

  const [modalOuvert, setModalOuvert] = useState(false);
  const [action, setAction] = useState("");
  const [priorite, setPriorite] = useState("moyenne");
  const [echeance, setEcheance] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurAjout, setErreurAjout] = useState("");

  function rechargerActivites() {
    fetch(`${API_URL}/moi/activites`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setActivites(data))
      .catch(() => {});
  }

  useEffect(() => {
    fetch(`${API_URL}/moi/activites`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setActivites(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger vos activités.");
        setLoading(false);
      });
  }, []);

  function gererAjout() {
    if (!action.trim()) {
      setErreurAjout("Décrivez l'activité.");
      return;
    }

    if (echeance) {
      const aujourdHui = new Date().toISOString().split("T")[0];
      if (echeance < aujourdHui) {
        setErreurAjout("L'échéance ne peut pas être antérieure à aujourd'hui.");
        return;
      }
    }

    setEnvoiEnCours(true);
    setErreurAjout("");

    fetch(`${API_URL}/moi/activites`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        action: action.trim(),
        priorite,
        echeance: echeance || null,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Échec de l'ajout de l'activité.");
        }
        return res.json();
      })
      .then(() => {
        setModalOuvert(false);
        setAction("");
        setPriorite("moyenne");
        setEcheance("");
        rechargerActivites();
      })
      .catch((err) => {
        setErreurAjout(err.message || "Erreur lors de l'ajout.");
      })
      .finally(() => setEnvoiEnCours(false));
  }

  function gererChangementStatut(activiteId, nouveauStatut) {
    const progression = nouveauStatut === "termine" ? 100 : nouveauStatut === "en_cours" ? 50 : 0;

    fetch(`${API_URL}/moi/activites/${activiteId}`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ statut: nouveauStatut, progression }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(() => rechargerActivites())
      .catch(() => {});
  }

  function gererSuppression(activiteId) {
    fetch(`${API_URL}/moi/activites/${activiteId}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
      .then(() => rechargerActivites())
      .catch(() => {});
  }

  const joursSemaine = useMemo(() => {
    const aujourdHui = new Date();
    const debut = debutDeSemaine(aujourdHui);
    debut.setDate(debut.getDate() + decalageSemaine * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const jour = new Date(debut);
      jour.setDate(debut.getDate() + i);
      return jour;
    });
  }, [decalageSemaine]);

  const libelleSemaine = useMemo(() => {
    const premier = joursSemaine[0];
    const dernier = joursSemaine[6];
    const memePeriode = premier.getMonth() === dernier.getMonth();
    const moisAnnee = premier.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return memePeriode ? moisAnnee.charAt(0).toUpperCase() + moisAnnee.slice(1) : moisAnnee;
  }, [joursSemaine]);

  const historiqueComplet = useMemo(() => {
    return [...activites]
      .filter((act) => act.derniere_modification || act.date_action)
      .sort((a, b) => new Date(b.derniere_modification || b.date_action) - new Date(a.derniere_modification || a.date_action));
  }, [activites]);

  const chronologie = useMemo(() => historiqueComplet.slice(0, 6), [historiqueComplet]);

  const [historiqueOuvert, setHistoriqueOuvert] = useState(false);

  const activitesFiltrees = useMemo(() => {
    if (filtreStatut === "tous") return activites;
    return activites.filter((act) => (act.statut || "a_faire") === filtreStatut);
  }, [activites, filtreStatut]);

  const apercuHebdomadaire = useMemo(() => {
    const compteurs = joursSemaine.map((jour) => {
      return activites.filter((act) => act.echeance && memeJour(new Date(act.echeance), jour)).length;
    });
    const maxValeur = Math.max(1, ...compteurs);
    return { compteurs, maxValeur };
  }, [activites, joursSemaine]);

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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, fontSize: "1.75rem" }}>
                Tableau de suivi
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 0.5 }}>
                Gérez vos missions et suivez votre progression en temps réel.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => setModalOuvert(true)}
              sx={{ bgcolor: PRIMARY, textTransform: "none", borderRadius: 2, "&:hover": { bgcolor: PRIMARY } }}
            >
              + Ajouter une activité
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <CarteStat icon={<AssignmentIcon fontSize="small" />} label="Total activites" valeur={activites.length} couleur={PRIMARY} />
            <CarteStat icon={<CheckCircleIcon fontSize="small" />} label="Terminees" valeur={activites.filter((a) => a.statut === "termine").length} couleur="#2E7D32" />
            <CarteStat icon={<HourglassEmptyIcon fontSize="small" />} label="En cours" valeur={activites.filter((a) => a.statut === "en_cours").length} couleur="#1565C0" />
          </Box>

          {(error || erreurProfil) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || erreurProfil}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Colonne principale */}
            <Box sx={{ flex: "1 1 560px", minWidth: 300, display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Calendrier hebdomadaire */}
              <Paper sx={{ border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="overline" sx={{ color: TEXT_LIGHT, fontWeight: 700, letterSpacing: 0.5 }}>
                    Calendrier hebdomadaire
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton size="small" onClick={() => setDecalageSemaine((s) => s - 1)}>
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" fontWeight={600} sx={{ color: "#1F2937", minWidth: 160, textAlign: "center" }}>
                      {libelleSemaine}
                    </Typography>
                    <IconButton size="small" onClick={() => setDecalageSemaine((s) => s + 1)}>
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 1 }}>
                  {joursSemaine.map((jour, idx) => {
                    const estWeekend = idx >= 5;
                    const estAujourdHui = memeJour(jour, new Date());
                    const tachesDuJour = activites.filter((act) => {
                      if (!act.echeance) return false;
                      return memeJour(new Date(act.echeance), jour);
                    });

                    return (
                      <Box
                        key={idx}
                        sx={{
                          border: estAujourdHui ? `1.5px solid ${PRIMARY}` : `1px solid ${BORDER}`,
                          borderRadius: 1.5,
                          p: 1,
                          minHeight: 96,
                          bgcolor: estWeekend ? "#FAFAFA" : "#FFF",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: estWeekend ? "#D97066" : TEXT_LIGHT, fontWeight: 700 }}>
                          {JOURS_SEMAINE[idx]}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: "#1F2937", mb: 0.5 }}>
                          {jour.getDate()}
                        </Typography>
                        {tachesDuJour.slice(0, 2).map((t) => (
                          <Chip
                            key={t.id}
                            label={t.action}
                            size="small"
                            sx={{
                              display: "block",
                              maxWidth: "100%",
                              mb: 0.5,
                              fontSize: "0.65rem",
                              height: 20,
                              bgcolor: (STYLES_PRIORITE[t.priorite] || STYLES_PRIORITE.moyenne).bg,
                              color: (STYLES_PRIORITE[t.priorite] || STYLES_PRIORITE.moyenne).color,
                              "& .MuiChip-label": {
                                px: 0.75,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              },
                            }}
                          />
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              </Paper>

              {/* Liste des tâches */}
              <Paper sx={{ border: `1px solid ${BORDER}`, borderRadius: 4, overflow: "hidden", bgcolor: WHITE }}>
                <Box sx={{ p: 2.5, borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1F2937" }}>
                    Liste des tâches
                  </Typography>
                  <Select
                    size="small"
                    value={filtreStatut}
                    onChange={(e) => setFiltreStatut(e.target.value)}
                    sx={{ minWidth: 160, fontSize: "0.875rem" }}
                  >
                    <MenuItem value="tous">Tous les statuts</MenuItem>
                    <MenuItem value="a_faire">À faire</MenuItem>
                    <MenuItem value="en_cours">En cours</MenuItem>
                    <MenuItem value="termine">Terminé</MenuItem>
                  </Select>
                </Box>

                {activitesFiltrees.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: 2.5,
                      py: 1.5,
                      borderBottom: `1px solid ${BORDER}`,
                      bgcolor: "#FAFAFA",
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography variant="caption" sx={{ flex: "1 1 220px", minWidth: 180, color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Activité
                    </Typography>
                    <Typography variant="caption" sx={{ width: 88, color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Priorité
                    </Typography>
                    <Typography variant="caption" sx={{ flex: "1 1 130px", minWidth: 110, color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Progression
                    </Typography>
                    <Typography variant="caption" sx={{ width: 130, color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Statut
                    </Typography>
                    <Box sx={{ width: 32 }} />
                  </Box>
                )}

                {activitesFiltrees.length === 0 ? (
                  <Box sx={{ p: 5, textAlign: "center" }}>
                    <AssignmentIcon sx={{ fontSize: 40, color: TEXT_LIGHT, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                      {activites.length === 0
                        ? "Aucune activité pour le moment. Ajoutez votre première tâche."
                        : "Aucune tâche ne correspond à ce filtre."}
                    </Typography>
                  </Box>
                ) : (
                  activitesFiltrees.map((act) => {
                    const statutStyle = STYLES_STATUT[act.statut] || STYLES_STATUT.a_faire;
                    const prioriteStyle = STYLES_PRIORITE[act.priorite] || STYLES_PRIORITE.moyenne;

                    return (
                      <Box
                        key={act.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2.5,
                          borderBottom: `1px solid ${BORDER}`,
                          flexWrap: "wrap",
                          "&:last-of-type": { borderBottom: "none" },
                        }}
                      >
                        <Box sx={{ flex: "1 1 220px", minWidth: 180 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ color: "#1F2937" }}>
                            {act.action}
                          </Typography>
                          <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                            Échéance : {formaterDate(act.echeance)}
                          </Typography>
                        </Box>

                        <Chip
                          label={LIBELLES_PRIORITE[act.priorite] || act.priorite}
                          size="small"
                          sx={{ bgcolor: prioriteStyle.bg, color: prioriteStyle.color, fontWeight: 600 }}
                        />

                        <Box sx={{ flex: "1 1 130px", display: "flex", alignItems: "center", gap: 1, minWidth: 110 }}>
                          <LinearProgress
                            variant="determinate"
                            value={act.progression || 0}
                            sx={{
                              flexGrow: 1,
                              height: 6,
                              borderRadius: 5,
                              bgcolor: "#EEF0F4",
                              "& .MuiLinearProgress-bar": { bgcolor: SECONDARY, borderRadius: 5 },
                            }}
                          />
                          <Typography variant="caption" sx={{ color: TEXT_LIGHT, minWidth: 32 }}>
                            {act.progression || 0}%
                          </Typography>
                        </Box>

                        <Select
                          size="small"
                          value={act.statut || "a_faire"}
                          onChange={(e) => gererChangementStatut(act.id, e.target.value)}
                          sx={{
                            minWidth: 130,
                            bgcolor: statutStyle.bg,
                            color: statutStyle.color,
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                          }}
                        >
                          <MenuItem value="a_faire">À faire</MenuItem>
                          <MenuItem value="en_cours">En cours</MenuItem>
                          <MenuItem value="termine">Terminé</MenuItem>
                        </Select>

                        <IconButton size="small" onClick={() => gererSuppression(act.id)} sx={{ color: TEXT_LIGHT }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })
                )}
              </Paper>
            </Box>

            {/* Colonne de droite : Chronologie + Aperçu hebdomadaire */}
            <Box sx={{ flex: "0 1 300px", minWidth: 260, display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper
                sx={{
                  bgcolor: PRIMARY,
                  color: "#FFF",
                  borderRadius: 4,
                  p: 2.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <HistoryIcon fontSize="small" sx={{ color: SECONDARY }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Chronologie
                  </Typography>
                </Box>

                {chronologie.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Aucune activité récente.
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {chronologie.map((act) => {
                      const estTermine = act.statut === "termine";
                      const dateAffichee = act.derniere_modification || act.date_action;

                      return (
                        <Box key={act.id} sx={{ display: "flex", gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: estTermine ? "#4ADE80" : SECONDARY,
                              mt: 0.7,
                              flexShrink: 0,
                            }}
                          />
                          <Box>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                              {formaterRelatif(dateAffichee)}
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {act.action}
                            </Typography>
                            {estTermine && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                                <CheckCircleIcon sx={{ fontSize: 14, color: "#4ADE80" }} />
                                <Typography variant="caption" sx={{ color: "#4ADE80", fontWeight: 700 }}>
                                  SUCCÈS
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                <Button
                  fullWidth
                  onClick={() => setHistoriqueOuvert(true)}
                  sx={{
                    mt: 2.5,
                    textTransform: "none",
                    color: "#FFF",
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
                  }}
                >
                  Voir tout l'historique
                </Button>
              </Paper>

              <Paper sx={{ border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 2.5 }}>
                <Typography variant="overline" sx={{ color: TEXT_LIGHT, fontWeight: 700, letterSpacing: 0.5, mb: 2, display: "block" }}>
                  Aperçu hebdomadaire
                </Typography>
                <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 1, height: 100 }}>
                  {apercuHebdomadaire.compteurs.map((valeur, idx) => {
                    const hauteur = valeur === 0 ? 4 : Math.max(10, (valeur / apercuHebdomadaire.maxValeur) * 90);
                    const estAujourdHui = memeJour(joursSemaine[idx], new Date());

                    return (
                      <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 0.5 }}>
                        <Box
                          sx={{
                            width: "100%",
                            maxWidth: 24,
                            height: hauteur,
                            borderRadius: 1,
                            bgcolor: estAujourdHui ? PRIMARY : "#D9DEE8",
                            transition: "height 0.2s ease",
                          }}
                        />
                        <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.65rem" }}>
                          {JOURS_SEMAINE[idx][0]}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Box>
          </Box>
      </Box>

      <Dialog open={modalOuvert} onClose={() => setModalOuvert(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Ajouter une activité</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {erreurAjout && <Alert severity="error">{erreurAjout}</Alert>}
          <TextField
            label="Description de l'activité"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            select
            label="Priorité"
            value={priorite}
            onChange={(e) => setPriorite(e.target.value)}
            fullWidth
          >
            <MenuItem value="haute">Haute</MenuItem>
            <MenuItem value="moyenne">Moyenne</MenuItem>
            <MenuItem value="basse">Basse</MenuItem>
          </TextField>
          <TextField
            label="Échéance"
            type="date"
            value={echeance}
            onChange={(e) => setEcheance(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: new Date().toISOString().split("T")[0] } }}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOuvert(false)} sx={{ textTransform: "none", color: TEXT_LIGHT }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={gererAjout}
            disabled={envoiEnCours}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#141F45" }, textTransform: "none", fontWeight: 600 }}
          >
            {envoiEnCours ? "Ajout..." : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={historiqueOuvert} onClose={() => setHistoriqueOuvert(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Historique complet</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "60vh" }}>
          {historiqueComplet.length === 0 ? (
            <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
              Aucune activité récente.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {historiqueComplet.map((act) => {
                const estTermine = act.statut === "termine";
                const dateAffichee = act.derniere_modification || act.date_action;

                return (
                  <Box key={act.id} sx={{ display: "flex", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: estTermine ? "#4ADE80" : SECONDARY,
                        mt: 0.7,
                        flexShrink: 0,
                      }}
                    />
                    <Box>
                      <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                        {formaterRelatif(dateAffichee)}
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {act.action}
                      </Typography>
                      {estTermine && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                          <CheckCircleIcon sx={{ fontSize: 14, color: "#4ADE80" }} />
                          <Typography variant="caption" sx={{ color: "#4ADE80", fontWeight: 700 }}>
                            SUCCÈS
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setHistoriqueOuvert(false)} sx={{ textTransform: "none" }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
