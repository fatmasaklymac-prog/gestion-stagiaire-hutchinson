import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import EventIcon from "@mui/icons-material/Event";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SUCCESS = "#2E7D32";
const WARNING = "#EF6C00";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

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

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function genererJoursCalendrier(annee, mois) {
  const premierJour = new Date(annee, mois, 1);
  const dernierJour = new Date(annee, mois + 1, 0);
  const joursDansMois = dernierJour.getDate();

  let decalage = premierJour.getDay() - 1;
  if (decalage < 0) decalage = 6;

  const jours = [];
  for (let i = 0; i < decalage; i++) jours.push(null);
  for (let j = 1; j <= joursDansMois; j++) jours.push(j);
  return jours;
}

function CarteStat({ titre, valeur, Icone, couleurIcone, couleurFond, badge, badgeColor, badgeFond }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${BORDER}`,
        bgcolor: WHITE,
        flex: 1,
        minWidth: 220,
        transition: "all 0.25s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: couleurFond,
            color: couleurIcone,
          }}
        >
          <Icone sx={{ fontSize: 24 }} />
        </Box>
        {badge && (
          <Typography
            variant="caption"
            sx={{
              color: badgeColor || SUCCESS,
              fontWeight: 700,
              bgcolor: badgeFond || GREEN_LIGHT,
              px: 1.2,
              py: 0.4,
              borderRadius: 1.5,
              fontSize: "0.75rem",
            }}
          >
            {badge}
          </Typography>
        )}
      </Box>
      <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem", mb: 1 }}>
        {titre}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 700, color: PRIMARY, lineHeight: 1, fontSize: "2rem" }}>
        {valeur}
      </Typography>
    </Paper>
  );
}

function BarreProgressionStagiaire({ s }) {
  const progression = calculerProgression(s.date_debut, s.date_fin);
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
          {s.prenom} {s.nom} — {s.specialisation || s.type_stage || "—"}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
          {progression}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progression}
        sx={{
          height: 8, borderRadius: 4, bgcolor: "#EEF1F6",
          "& .MuiLinearProgress-bar": { bgcolor: PRIMARY, borderRadius: 4 },
        }}
      />
    </Box>
  );
}

function GraphiqueBarres({ stagiaires }) {
  if (stagiaires.length === 0) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, height: 180, mt: 3 }}>
      {stagiaires.map((s) => {
        const progression = calculerProgression(s.date_debut, s.date_fin);
        return (
          <Tooltip key={s.id} title={`${s.prenom} ${s.nom} — ${progression}%`}>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <Box
                sx={{
                  width: "100%", maxWidth: 48,
                  height: `${Math.max(4, progression)}%`,
                  bgcolor: PRIMARY, borderRadius: "6px 6px 0 0",
                  transition: "height 0.3s ease",
                }}
              />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function DashboardEncadrant() {
  const { profil } = useOutletContext();
  const navigate = useNavigate();
  const [stagiaires, setStagiaires] = useState([]);
  const [activites, setActivites] = useState([]);
  const [confirmationsEvenement, setConfirmationsEvenement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const aujourdHui = new Date();
  const EVENEMENT_CLE = "seminaire-jeunes-talents-2026";

  useEffect(() => {
    fetch(`${API_URL}/mes-stagiaires/confirmations-evenement/${EVENEMENT_CLE}`, {
      headers: authHeaders(),
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setConfirmationsEvenement(data))
      .catch(() => setConfirmationsEvenement([]));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/moi/mes-stagiaires`, { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then(async (data) => {
        setStagiaires(data);

        const toutesActivites = [];
        for (const s of data) {
          try {
            const res = await fetch(`${API_URL}/moi/mes-stagiaires/${s.id}/documents`, { headers: authHeaders() });
            if (res.ok) {
              const docs = await res.json();
              docs.forEach((doc) => {
                toutesActivites.push({
                  stagiaireId: s.id,
                  stagiaireNom: `${s.prenom} ${s.nom}`,
                  document: doc.nom,
                  date: doc.date_document,
                  statut: doc.statut,
                  valide: doc.valide,
                });
              });
            }
          } catch {
            // on ignore les erreurs individuelles pour ne pas bloquer tout le dashboard
          }
        }
        toutesActivites.sort((a, b) => new Date(b.date) - new Date(a.date));
        setActivites(toutesActivites.slice(0, 6));
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger vos stagiaires.");
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

  const total = stagiaires.length;
  const enCours = stagiaires.filter((s) => s.statut === "en_cours").length;
  const joursCalendrier = genererJoursCalendrier(aujourdHui.getFullYear(), aujourdHui.getMonth());
  const nomMois = aujourdHui.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100%" }}>
      <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: "56px", md: "120px" } }}>
        <Box sx={{ mb: 3, pb: 3, borderBottom: "1px solid", borderColor: BORDER }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
            Bonjour, {profil?.nom || "—"} !
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT }}>
            Voici l'état d'avancement de vos stagiaires aujourd'hui.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", mb: 4 }}>
          <CarteStat titre="Total Stagiaires" valeur={total} Icone={GroupsIcon} couleurIcone={PRIMARY} couleurFond="#E8EAF6" />
          <CarteStat titre="En cours" valeur={enCours} Icone={PlayCircleIcon} couleurIcone={SUCCESS} couleurFond="#E8F5E9" />
          <CarteStat titre="Évaluations en attente" valeur={0} Icone={AssignmentLateIcon} couleurIcone={WARNING} couleurFond="#FFF3E0" />
          <CarteStat titre="Réunions aujourd'hui" valeur={0} Icone={EventIcon} couleurIcone={PRIMARY} couleurFond="#E8EAF6" />
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mb: 3 }}>
          {/* Progression Globale */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE, flex: 2, minWidth: 320 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.1rem" }}>
                Progression Globale
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                Voir détails
              </Typography>
            </Box>

            {stagiaires.length === 0 ? (
              <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", py: 4 }}>
                Aucun stagiaire ne vous est assigné pour le moment.
              </Typography>
            ) : (
              <>
                {stagiaires.map((s) => (
                  <BarreProgressionStagiaire key={s.id} s={s} />
                ))}
                <GraphiqueBarres stagiaires={stagiaires} />
              </>
            )}
          </Paper>

          {/* Planning */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE, flex: 1, minWidth: 260 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, fontSize: "1.1rem" }}>
              Planning
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY, textTransform: "capitalize" }}>
                {nomMois}
              </Typography>
              <Box>
                <IconButton size="small" disabled>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" disabled>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 2 }}>
              {["L", "M", "M", "J", "V", "S", "D"].map((j, i) => (
                <Typography key={i} variant="caption" sx={{ textAlign: "center", color: TEXT_LIGHT, fontWeight: 700 }}>
                  {j}
                </Typography>
              ))}
              {joursCalendrier.map((jour, i) => {
                const estAujourdhui = jour === aujourdHui.getDate();
                return (
                  <Box
                    key={i}
                    sx={{
                      textAlign: "center", py: 0.6, borderRadius: "50%",
                      fontSize: "0.8rem",
                      color: estAujourdhui ? WHITE : jour ? PRIMARY : "transparent",
                      bgcolor: estAujourdhui ? SECONDARY : "transparent",
                      fontWeight: estAujourdhui ? 700 : 400,
                    }}
                  >
                    {jour || ""}
                  </Box>
                );
              })}
            </Box>

            <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Aujourd'hui
            </Typography>
            <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 1 }}>
              Aucune réunion planifiée pour le moment.
            </Typography>
          </Paper>
        </Box>

        {/* Confirmations seminaire */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.1rem" }}>
              Confirmations séminaire
            </Typography>
            <Chip
              label={`${confirmationsEvenement.filter((c) => c.confirme).length} / ${confirmationsEvenement.length} confirmes`}
              size="small"
              sx={{ bgcolor: "#E8F5E9", color: SUCCESS, fontWeight: 700 }}
            />
          </Box>
          {confirmationsEvenement.length === 0 ? (
            <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
              Aucun stagiaire assigne pour le moment.
            </Typography>
          ) : (
            confirmationsEvenement.map((c) => (
              <Box
                key={c.stagiaire_id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  borderBottom: `1px solid ${BORDER}`,
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <Typography variant="body2" sx={{ color: PRIMARY, fontWeight: 600 }}>
                  {c.nom}
                </Typography>
                <Chip
                  label={c.confirme ? "Confirme" : "En attente"}
                  size="small"
                  sx={{
                    bgcolor: c.confirme ? "#E8F5E9" : "#FFF3E0",
                    color: c.confirme ? SUCCESS : WARNING,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
              </Box>
            ))
          )}
        </Paper>

        {/* Activités Récentes */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, fontSize: "1.1rem" }}>
            Activités Récentes
          </Typography>

          {activites.length === 0 ? (
            <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", py: 4 }}>
              Aucune activité récente.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, border: "none" }}>Stagiaire</TableCell>
                  <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, border: "none" }}>Document</TableCell>
                  <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, border: "none" }}>Date de dépôt</TableCell>
                  <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, border: "none" }}>Statut</TableCell>
                  <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, border: "none" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activites.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ border: "none", color: PRIMARY, fontWeight: 600 }}>{a.stagiaireNom}</TableCell>
                    <TableCell sx={{ border: "none" }}>{a.document}</TableCell>
                    <TableCell sx={{ border: "none" }}>{formatDate(a.date)}</TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <Chip
                        label={a.statut}
                        size="small"
                        sx={{ bgcolor: a.valide ? "#E8F5E9" : "#FFF3E0", color: a.valide ? SUCCESS : WARNING, fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <Button
                        size="small"
                        onClick={() => navigate(`/encadrant/stagiaires/${a.stagiaireId}`)}
                        sx={{ color: PRIMARY, textTransform: "none", fontWeight: 700 }}
                      >
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default DashboardEncadrant;
