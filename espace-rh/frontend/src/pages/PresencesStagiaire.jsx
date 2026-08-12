import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InfoIcon from "@mui/icons-material/Info";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/Edit";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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

const JOURS_SEMAINE = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

function memeJour(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function formaterDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function grilleDuMois(anneeCourante, moisCourant) {
  const premierJourMois = new Date(anneeCourante, moisCourant, 1);
  const dernierJourMois = new Date(anneeCourante, moisCourant + 1, 0);

  const decalageDebut = (premierJourMois.getDay() + 6) % 7; // 0 = lundi
  const jours = [];

  for (let i = 0; i < decalageDebut; i++) {
    jours.push(null);
  }
  for (let jour = 1; jour <= dernierJourMois.getDate(); jour++) {
    jours.push(new Date(anneeCourante, moisCourant, jour));
  }
  while (jours.length % 7 !== 0) {
    jours.push(null);
  }

  const semaines = [];
  for (let i = 0; i < jours.length; i += 7) {
    semaines.push(jours.slice(i, i + 7));
  }
  return semaines;
}

export default function PresencesStagiaire() {
  const { profil, erreurProfil } = useOutletContext();

  const [presences, setPresences] = useState([]);
  const [stats, setStats] = useState({
    total_heures_mois: 0,
    taux_presence: 0,
    jours_absence_mois: 0,
    statut_actuel: null,
    derniere_arrivee: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decalageMois, setDecalageMois] = useState(0);
  const [pointageEnCours, setPointageEnCours] = useState(false);
  const [messagePointage, setMessagePointage] = useState("");
  const [erreurPointage, setErreurPointage] = useState("");
  const [presenceAModifier, setPresenceAModifier] = useState(null);
  const [heureArriveeModif, setHeureArriveeModif] = useState("");
  const [heureDepartModif, setHeureDepartModif] = useState("");
  const [envoiModifPresence, setEnvoiModifPresence] = useState(false);
  const [erreurModifPresence, setErreurModifPresence] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/moi/presences`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setPresences(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger vos présences.");
        setLoading(false);
      });

    fetch(`${API_URL}/moi/presences/stats`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  const dateReference = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + decalageMois);
    return d;
  }, [decalageMois]);

  const libelleMois = useMemo(() => {
    const libelle = dateReference.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return libelle.charAt(0).toUpperCase() + libelle.slice(1);
  }, [dateReference]);

  const semaines = useMemo(
    () => grilleDuMois(dateReference.getFullYear(), dateReference.getMonth()),
    [dateReference]
  );

  function presenceDuJour(jour) {
    if (!jour) return null;
    return presences.find((p) => p.date && memeJour(new Date(p.date), jour)) || null;
  }

  const presencesTriees = useMemo(
    () => [...presences].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [presences]
  );

  function ouvrirModifPresence(p) {
    setPresenceAModifier(p);
    setHeureArriveeModif(p.heure_arrivee || "");
    setHeureDepartModif(p.heure_depart || "");
    setErreurModifPresence("");
  }

  async function confirmerModifPresence() {
    if (!presenceAModifier) return;
    setEnvoiModifPresence(true);
    setErreurModifPresence("");
    try {
      const res = await fetch(`${API_URL}/moi/presences/${presenceAModifier.id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          heure_arrivee: heureArriveeModif || null,
          heure_depart: heureDepartModif || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Erreur lors de la modification.");
      }
      setPresences((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setPresenceAModifier(null);
    } catch (err) {
      setErreurModifPresence(err.message || "Erreur lors de la modification.");
    } finally {
      setEnvoiModifPresence(false);
    }
  }

  async function pointerPresence() {
    setPointageEnCours(true);
    setErreurPointage("");
    setMessagePointage("");
    try {
      const res = await fetch(`${API_URL}/moi/presences/pointer`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Erreur lors du pointage.");
      }
      setMessagePointage(
        data.message === "Arrivee enregistree"
          ? "Votre arrivée a été enregistrée."
          : "Votre départ a été enregistré."
      );
      const [presRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/moi/presences`, { headers: { ...authHeaders(), "Content-Type": "application/json" } }),
        fetch(`${API_URL}/moi/presences/stats`, { headers: { ...authHeaders(), "Content-Type": "application/json" } }),
      ]);
      if (presRes.ok) setPresences(await presRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      setErreurPointage(err.message || "Erreur lors du pointage.");
    } finally {
      setPointageEnCours(false);
    }
  }

  const presenceAujourdhui = presenceDuJour(new Date());
  const arriveeFaite = Boolean(presenceAujourdhui?.heure_arrivee);
  const departFait = Boolean(presenceAujourdhui?.heure_depart);
  const libellePointage = !arriveeFaite
    ? "Pointer mon arrivée"
    : !departFait
    ? "Pointer mon départ"
    : "Journée terminée";

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
                Mes présences
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 0.5 }}>
                Marquez votre présence en début et en fin de journée.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AccessTimeIcon />}
              disabled={departFait || pointageEnCours}
              onClick={pointerPresence}
              sx={{
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: PRIMARY },
                "&.Mui-disabled": { bgcolor: "rgba(29,43,91,0.3)", color: "rgba(255,255,255,0.7)" },
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
              }}
            >
              {pointageEnCours ? "Enregistrement..." : libellePointage}
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {(error || erreurProfil) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || erreurProfil}
            </Alert>
          )}

          {messagePointage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {messagePointage}
            </Alert>
          )}

          {erreurPointage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {erreurPointage}
            </Alert>
          )}

          {/* Cartes de stats */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
            <Paper sx={{ border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 3, transition: "all 0.25s ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: `${PRIMARY}20`, color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AccessTimeIcon fontSize="small" />
                </Box>
                <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontWeight: 600, textTransform: "uppercase" }}>
                  Total Heures (Mois)
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ color: PRIMARY, fontWeight: 800, fontSize: "2rem" }}>
                {stats.total_heures_mois} h
              </Typography>
            </Paper>

            <Paper sx={{ border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 3, transition: "all 0.25s ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: `${"#2E7D32"}20`, color: "#2E7D32", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUpIcon fontSize="small" />
                </Box>
                <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontWeight: 600, textTransform: "uppercase" }}>
                  Taux de Presence
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ color: "#2E7D32", fontWeight: 800, fontSize: "2rem" }}>
                {stats.taux_presence}%
              </Typography>
            </Paper>

            <Paper sx={{ border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 3, transition: "all 0.25s ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: `${"#EF6C00"}20`, color: "#EF6C00", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EventBusyIcon fontSize="small" />
                </Box>
                <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontWeight: 600, textTransform: "uppercase" }}>
                  Jours d'Absence
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ color: "#EF6C00", fontWeight: 800, fontSize: "2rem" }}>
                {stats.jours_absence_mois} jour{stats.jours_absence_mois > 1 ? "s" : ""}
              </Typography>
            </Paper>

            <Paper sx={{ border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 3, transition: "all 0.25s ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" } }}>
              <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontWeight: 600, textTransform: "uppercase" }}>
                Statut Actuel
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: stats.statut_actuel === "present" ? VERT : SECONDARY,
                  }}
                />
                <Typography variant="body2" fontWeight={700} sx={{ color: "#1F2937" }}>
                  {stats.statut_actuel === "present" ? "En poste" : "Absent"}
                </Typography>
              </Box>
              {stats.derniere_arrivee && (
                <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                  Arrivée à {stats.derniere_arrivee}
                </Typography>
              )}
            </Paper>
          </Box>

          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Calendrier mensuel */}
            <Paper sx={{ flex: "1 1 480px", minWidth: 300, border: `1px solid ${BORDER}`, borderRadius: 4, bgcolor: WHITE, p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton size="small" onClick={() => setDecalageMois((m) => m - 1)}>
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body1" fontWeight={700} sx={{ color: "#1F2937", minWidth: 150, textAlign: "center" }}>
                    {libelleMois}
                  </Typography>
                  <IconButton size="small" onClick={() => setDecalageMois((m) => m + 1)}>
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: VERT }} />
                    <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>Présent</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: SECONDARY }} />
                    <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>Absent</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#D1D5DB" }} />
                    <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>Weekend</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 0.5 }}>
                {JOURS_SEMAINE.map((j) => (
                  <Typography key={j} variant="caption" align="center" sx={{ color: TEXT_LIGHT, fontWeight: 700 }}>
                    {j}
                  </Typography>
                ))}
              </Box>

              {semaines.map((semaine, idxSemaine) => (
                <Box key={idxSemaine} sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 0.5 }}>
                  {semaine.map((jour, idxJour) => {
                    if (!jour) {
                      return <Box key={idxJour} sx={{ minHeight: 56 }} />;
                    }
                    const estWeekend = idxJour >= 5;
                    const p = presenceDuJour(jour);
                    const estAujourdHui = memeJour(jour, new Date());

                    return (
                      <Box
                        key={idxJour}
                        sx={{
                          minHeight: 56,
                          border: estAujourdHui ? `1.5px solid ${PRIMARY}` : `1px solid ${BORDER}`,
                          borderRadius: 1,
                          bgcolor: estWeekend ? "#FAFAFA" : "#FFF",
                          p: 0.75,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: estWeekend ? "#D1D5DB" : "#1F2937", fontWeight: 600 }}>
                          {jour.getDate()}
                        </Typography>
                        {p ? (
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              bgcolor: p.present ? VERT : SECONDARY,
                              mt: 0.5,
                            }}
                          />
                        ) : estWeekend ? (
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              bgcolor: "#D1D5DB",
                              mt: 0.5,
                            }}
                          />
                        ) : null}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Paper>

            {/* Tableau des pointages */}
            <Paper sx={{ flex: "1 1 380px", minWidth: 300, border: `1px solid ${BORDER}`, borderRadius: 4, overflow: "hidden", bgcolor: WHITE }}>
              <Box sx={{ p: 2.5, borderBottom: `1px solid ${BORDER}` }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1F2937" }}>
                  Tableau des pointages
                </Typography>
              </Box>

              {presencesTriees.length === 0 ? (
                <Box sx={{ p: 5, textAlign: "center" }}>
                  <EventBusyIcon sx={{ fontSize: 40, color: TEXT_LIGHT, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                    Aucune présence enregistrée pour le moment.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 460, overflowY: "auto" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 1.25,
                      borderBottom: `1px solid ${BORDER}`,
                      bgcolor: "#FAFAFA",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ flex: "1 1 110px", color: TEXT_LIGHT, fontWeight: 700 }}>
                      Date
                    </Typography>
                    <Typography variant="caption" sx={{ width: 60, color: TEXT_LIGHT, fontWeight: 700 }}>
                      Arrivée
                    </Typography>
                    <Typography variant="caption" sx={{ width: 60, color: TEXT_LIGHT, fontWeight: 700 }}>
                      Départ
                    </Typography>
                    <Typography variant="caption" sx={{ width: 76, color: TEXT_LIGHT, fontWeight: 700, textAlign: "right" }}>
                      Statut
                    </Typography>
                    <Typography variant="caption" sx={{ width: 40, color: TEXT_LIGHT, fontWeight: 700, textAlign: "right" }}>
                      
                    </Typography>
                  </Box>

                  {presencesTriees.map((p) => (
                    <Box
                      key={p.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        py: 1.5,
                        borderBottom: `1px solid ${BORDER}`,
                        "&:last-of-type": { borderBottom: "none" },
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ flex: "1 1 110px", color: "#1F2937" }}>
                        {formaterDate(p.date)}
                      </Typography>
                      <Typography variant="body2" sx={{ width: 60, color: TEXT_LIGHT }}>
                        {p.heure_arrivee || "--:--"}
                      </Typography>
                      <Typography variant="body2" sx={{ width: 60, color: TEXT_LIGHT }}>
                        {p.heure_depart || "--:--"}
                      </Typography>
                      <Box sx={{ width: 76, display: "flex", justifyContent: "flex-end" }}>
                        <Chip
                          label={p.present ? "PRÉSENT" : "ABSENT"}
                          size="small"
                          sx={{
                            bgcolor: p.present ? "#E8F5E9" : "#FDECEA",
                            color: p.present ? VERT : "#C62828",
                            fontWeight: 700,
                            fontSize: "0.65rem",
                          }}
                        />
                      </Box>
                      <Box sx={{ width: 40, display: "flex", justifyContent: "flex-end" }}>
                        <IconButton size="small" onClick={() => ouvrirModifPresence(p)}>
                          <EditIcon fontSize="small" sx={{ color: PRIMARY }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>

      </Box>

      <Dialog open={!!presenceAModifier} onClose={() => !envoiModifPresence && setPresenceAModifier(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>
          Modifier le pointage du {presenceAModifier ? formaterDate(presenceAModifier.date) : ""}
        </DialogTitle>
        <DialogContent>
          {erreurModifPresence && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erreurModifPresence}
            </Alert>
          )}
          <TextField
            label="Heure d'arrivée"
            type="time"
            fullWidth
            size="small"
            value={heureArriveeModif}
            onChange={(e) => setHeureArriveeModif(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Heure de départ"
            type="time"
            fullWidth
            size="small"
            value={heureDepartModif}
            onChange={(e) => setHeureDepartModif(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPresenceAModifier(null)} disabled={envoiModifPresence} sx={{ textTransform: "none", color: TEXT_LIGHT }}>
            Annuler
          </Button>
          <Button
            onClick={confirmerModifPresence}
            disabled={envoiModifPresence}
            variant="contained"
            sx={{ bgcolor: PRIMARY, textTransform: "none", "&:hover": { bgcolor: PRIMARY } }}
          >
            {envoiModifPresence ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
