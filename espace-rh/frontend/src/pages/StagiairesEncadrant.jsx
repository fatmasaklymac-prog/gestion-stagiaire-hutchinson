import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  LinearProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Popover,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import AddIcon from "@mui/icons-material/Add";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RateReviewIcon from "@mui/icons-material/RateReview";
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

const PAR_PAGE = 8;

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

function formatDateCourte(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function estSortantBientot(dateFin) {
  if (!dateFin) return false;
  const j = joursEntre(new Date(), dateFin);
  return j >= 0 && j <= 15;
}

function CarteStatMini({ titre, valeur, sousTexte, couleurSousTexte, progressionBarre }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: WHITE, flex: 1, minWidth: 180 }}
    >
      <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.68rem" }}>
        {titre}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, fontSize: "1.75rem", lineHeight: 1 }}>
          {valeur}
        </Typography>
        {sousTexte && (
          <Typography variant="caption" sx={{ color: couleurSousTexte || TEXT_LIGHT, fontWeight: 700 }}>
            {sousTexte}
          </Typography>
        )}
      </Box>
      {progressionBarre !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progressionBarre}
          sx={{
            height: 5, borderRadius: 3, mt: 1.5, bgcolor: "#EEF1F6",
            "& .MuiLinearProgress-bar": { bgcolor: SECONDARY, borderRadius: 3 },
          }}
        />
      )}
    </Paper>
  );
}

function StagiairesEncadrant() {
  const navigate = useNavigate();
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [succesGlobal, setSuccesGlobal] = useState("");
  const [evaluationsAFaire, setEvaluationsAFaire] = useState(0);
  const [listeEvaluationsAFaire, setListeEvaluationsAFaire] = useState([]);
  const [rappelFerme, setRappelFerme] = useState(false);

  // --- Filtres avances ---
  const [ancreFiltres, setAncreFiltres] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreType, setFiltreType] = useState("tous");
  const [filtreSortant, setFiltreSortant] = useState(false);

  // --- Affecter un stagiaire ---
  const [dialogAffectationOuvert, setDialogAffectationOuvert] = useState(false);
  const [stagiairesDisponibles, setStagiairesDisponibles] = useState([]);
  const [chargementDisponibles, setChargementDisponibles] = useState(false);
  const [erreurAffectation, setErreurAffectation] = useState("");
  const [idEnCoursAffectation, setIdEnCoursAffectation] = useState(null);

  function chargerStagiaires() {
    setLoading(true);
    fetch(`${API_URL}/moi/mes-stagiaires`, { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        setStagiaires(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger vos stagiaires.");
        setLoading(false);
      });
  }

  useEffect(() => {
    chargerStagiaires();
    fetch(`${API_URL}/moi/evaluations-a-faire`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : { total: 0, stagiaires: [] }))
      .then((data) => {
        setEvaluationsAFaire(data.total || 0);
        setListeEvaluationsAFaire(data.stagiaires || []);
      })
      .catch(() => {
        setEvaluationsAFaire(0);
        setListeEvaluationsAFaire([]);
      });
  }, []);

  function ouvrirDialogAffectation() {
    setDialogAffectationOuvert(true);
    setErreurAffectation("");
    setChargementDisponibles(true);
    fetch(`${API_URL}/moi/stagiaires-disponibles`, { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => setStagiairesDisponibles(data))
      .catch(() => setErreurAffectation("Impossible de charger les stagiaires disponibles."))
      .finally(() => setChargementDisponibles(false));
  }

  function affecter(stagiaireId) {
    setIdEnCoursAffectation(stagiaireId);
    fetch(`${API_URL}/moi/mes-stagiaires/${stagiaireId}/affecter`, {
      method: "POST",
      headers: authHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Erreur lors de l'affectation");
        }
        return res.json();
      })
      .then(() => {
        setStagiairesDisponibles((precedent) => precedent.filter((s) => s.id !== stagiaireId));
        setSuccesGlobal("Stagiaire affecté avec succès.");
        chargerStagiaires();
      })
      .catch((err) => setErreurAffectation(err.message || "Impossible d'affecter ce stagiaire."))
      .finally(() => setIdEnCoursAffectation(null));
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  const typesDisponibles = Array.from(new Set(stagiaires.map((s) => s.type_stage).filter(Boolean)));

  const stagiairesFiltres = stagiaires.filter((s) => {
    const texte = `${s.prenom} ${s.nom} ${s.specialisation || ""} ${s.type_stage || ""} ${s.etablissement || ""}`.toLowerCase();
    if (!texte.includes(recherche.toLowerCase())) return false;
    if (filtreStatut !== "tous" && s.statut !== filtreStatut) return false;
    if (filtreType !== "tous" && s.type_stage !== filtreType) return false;
    if (filtreSortant && !estSortantBientot(s.date_fin)) return false;
    return true;
  });

  const nbFiltresActifs = (filtreStatut !== "tous" ? 1 : 0) + (filtreType !== "tous" ? 1 : 0) + (filtreSortant ? 1 : 0);

  function reinitialiserFiltres() {
    setFiltreStatut("tous");
    setFiltreType("tous");
    setFiltreSortant(false);
    setPage(1);
  }

  const total = stagiaires.length;
  const moyenneAvancement =
    total === 0
      ? 0
      : Math.round(
          stagiaires.reduce((acc, s) => acc + calculerProgression(s.date_debut, s.date_fin), 0) / total
        );
  const listeSortants = stagiaires.filter((s) => estSortantBientot(s.date_fin));
  const sortantsBientot = listeSortants.length;
  const prochaineSortie = listeSortants.length > 0
    ? listeSortants.reduce((plusProche, s) => (new Date(s.date_fin) < new Date(plusProche.date_fin) ? s : plusProche))
    : null;

  const nbPages = Math.max(1, Math.ceil(stagiairesFiltres.length / PAR_PAGE));
  const pageAffichee = Math.min(page, nbPages);
  const debut = (pageAffichee - 1) * PAR_PAGE;
  const stagiairesPage = stagiairesFiltres.slice(debut, debut + PAR_PAGE);

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100%" }}>
      {/* Barre du haut */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: { xs: 2, md: 3 }, bgcolor: WHITE, borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap", gap: 2 }}>
        <TextField
          size="small"
          placeholder="Rechercher un stagiaire..."
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value);
            setPage(1);
          }}
          sx={{ width: { xs: "100%", sm: 320 }, "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: BACKGROUND } }}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton size="small">
            <Badge variant="dot" color="error" invisible={evaluationsAFaire === 0}>
              <NotificationsNoneIcon sx={{ color: PRIMARY }} />
            </Badge>
          </IconButton>
          <IconButton size="small"><AccountCircleIcon sx={{ color: PRIMARY }} /></IconButton>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, fontSize: "1.75rem" }}>
              Mes Stagiaires
            </Typography>
            <Typography sx={{ color: TEXT_LIGHT, mt: 0.5 }}>
              Suivez l'évolution et les performances des talents sous votre supervision.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Badge color="error" badgeContent={nbFiltresActifs} invisible={nbFiltresActifs === 0}>
              <Button
                variant="outlined"
                startIcon={<TuneIcon />}
                onClick={(e) => setAncreFiltres(e.currentTarget)}
                sx={{ borderColor: BORDER, color: PRIMARY, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                Filtres avancés
              </Button>
            </Badge>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={ouvrirDialogAffectation}
              sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16234A" }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              Affecter un stagiaire
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", mb: 3 }}>
          <CarteStatMini titre="Total stagiaires" valeur={total} />
          <CarteStatMini titre="Moyenne avancement" valeur={`${moyenneAvancement}%`} progressionBarre={moyenneAvancement} />
          <CarteStatMini
            titre="Stagiaires sortants"
            valeur={sortantsBientot}
            sousTexte={prochaineSortie ? `Prévu le ${formatDateCourte(prochaineSortie.date_fin)}` : undefined}
            couleurSousTexte={WARNING}
          />
          <CarteStatMini
            titre="Évaluations à faire"
            valeur={evaluationsAFaire}
            sousTexte={evaluationsAFaire > 0 ? "Urgent" : undefined}
            couleurSousTexte={SECONDARY}
          />
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE, overflow: "hidden" }}>
          {stagiairesFiltres.length === 0 ? (
            <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", py: 6 }}>
              {stagiaires.length === 0 ? "Aucun stagiaire ne vous est assigné pour le moment." : "Aucun résultat pour cette recherche."}
            </Typography>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", border: "none" }}>Stagiaire</TableCell>
                    <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", border: "none" }}>Université / École</TableCell>
                    <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", border: "none" }}>Dpt / Type</TableCell>
                    <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", border: "none" }}>Période</TableCell>
                    <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", border: "none" }}>Avancement</TableCell>
                    <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", border: "none" }}>Statut</TableCell>
                    <TableCell sx={{ color: TEXT_LIGHT, fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", border: "none" }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stagiairesPage.map((s) => {
                    const progression = calculerProgression(s.date_debut, s.date_fin);
                    return (
                      <TableRow
                        key={s.id}
                        hover
                        onClick={() => navigate(`/encadrant/stagiaires/${s.id}`)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell sx={{ border: "none", borderTop: `1px solid ${BORDER}` }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              src={s.photo_url ? `${API_URL}${s.photo_url}` : undefined}
                              sx={{ width: 36, height: 36, bgcolor: SECONDARY, fontSize: "0.9rem" }}
                            >
                              {s.prenom?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY }}>
                                {s.prenom} {s.nom}
                              </Typography>
                              <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                                {s.email || "—"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ border: "none", borderTop: `1px solid ${BORDER}`, color: PRIMARY, fontWeight: 600 }}>
                          {s.etablissement || "—"}
                        </TableCell>
                        <TableCell sx={{ border: "none", borderTop: `1px solid ${BORDER}`, color: TEXT_LIGHT }}>
                          {s.specialisation || s.type_stage || "—"}
                        </TableCell>
                        <TableCell sx={{ border: "none", borderTop: `1px solid ${BORDER}`, color: TEXT_LIGHT }}>
                          {formatDateCourte(s.date_debut)} - {formatDateCourte(s.date_fin)}
                        </TableCell>
                        <TableCell sx={{ border: "none", borderTop: `1px solid ${BORDER}`, minWidth: 140 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progression}
                              sx={{
                                width: 70, height: 6, borderRadius: 3, bgcolor: "#EEF1F6",
                                "& .MuiLinearProgress-bar": { bgcolor: PRIMARY, borderRadius: 3 },
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "0.8rem" }}>
                              {progression}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ border: "none", borderTop: `1px solid ${BORDER}` }}>
                          <Chip
                            label={s.statut === "en_cours" ? "En poste" : s.statut === "termine" ? "Terminé" : s.statut || "—"}
                            size="small"
                            sx={{
                              bgcolor: s.statut === "en_cours" ? "#E8F5E9" : "#F0F1F4",
                              color: s.statut === "en_cours" ? SUCCESS : TEXT_LIGHT,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ border: "none", borderTop: `1px solid ${BORDER}` }} align="right" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="Voir la fiche">
                            <IconButton size="small" onClick={() => navigate(`/encadrant/stagiaires/${s.id}`)} sx={{ color: PRIMARY }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Évaluer">
                            <IconButton size="small" onClick={() => navigate(`/encadrant/evaluations/${s.id}`)} sx={{ color: SECONDARY }}>
                              <RateReviewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderTop: `1px solid ${BORDER}`, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                  Affichage de {debut + 1}-{Math.min(debut + PAR_PAGE, stagiairesFiltres.length)} sur {stagiairesFiltres.length} stagiaires
                </Typography>
                {nbPages > 1 && (
                  <Pagination
                    count={nbPages}
                    page={pageAffichee}
                    onChange={(_, valeur) => setPage(valeur)}
                    shape="rounded"
                    sx={{
                      "& .Mui-selected": { bgcolor: `${SECONDARY} !important`, color: WHITE },
                    }}
                  />
                )}
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* Rappel d'evaluation */}
      {!rappelFerme && listeEvaluationsAFaire.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 320,
            bgcolor: PRIMARY,
            borderRadius: 3,
            p: 2.5,
            boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
            zIndex: 1300,
            borderLeft: `4px solid ${SECONDARY}`,
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box sx={{ color: SECONDARY, mt: 0.3 }}>
              <ErrorOutlineIcon fontSize="small" />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ color: WHITE, fontWeight: 700, fontSize: "0.9rem" }}>
                Rappel d'évaluation
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", mt: 0.5, fontSize: "0.82rem" }}>
                L'évaluation finale de {listeEvaluationsAFaire[0].prenom} {listeEvaluationsAFaire[0].nom} doit être complétée avant le {formatDateCourte(listeEvaluationsAFaire[0].date_fin)}.
              </Typography>
              <Typography
                variant="body2"
                onClick={() => navigate(`/encadrant/evaluations/${listeEvaluationsAFaire[0].id}`)}
                sx={{ color: SECONDARY, fontWeight: 700, mt: 1, cursor: "pointer", fontSize: "0.82rem" }}
              >
                Compléter maintenant
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setRappelFerme(true)} sx={{ color: "rgba(255,255,255,0.6)", mt: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Popover : Filtres avances */}
      <Popover
        open={Boolean(ancreFiltres)}
        anchorEl={ancreFiltres}
        onClose={() => setAncreFiltres(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2.5, width: 280, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontWeight: 700, color: PRIMARY }}>Filtres avancés</Typography>

          <FormControl size="small" fullWidth>
            <InputLabel>Statut</InputLabel>
            <Select
              label="Statut"
              value={filtreStatut}
              onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}
            >
              <MenuItem value="tous">Tous</MenuItem>
              <MenuItem value="en_cours">En poste</MenuItem>
              <MenuItem value="termine">Terminé</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Type de stage</InputLabel>
            <Select
              label="Type de stage"
              value={filtreType}
              onChange={(e) => { setFiltreType(e.target.value); setPage(1); }}
            >
              <MenuItem value="tous">Tous</MenuItem>
              {typesDisponibles.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant={filtreSortant ? "contained" : "outlined"}
            onClick={() => { setFiltreSortant((v) => !v); setPage(1); }}
            sx={{
              borderColor: BORDER,
              bgcolor: filtreSortant ? SECONDARY : "transparent",
              color: filtreSortant ? WHITE : PRIMARY,
              "&:hover": { bgcolor: filtreSortant ? "#B8181D" : "rgba(0,0,0,0.04)" },
              borderRadius: 2, textTransform: "none", fontWeight: 700,
            }}
          >
            Sortant sous 15 jours
          </Button>

          <Divider />

          <Button onClick={reinitialiserFiltres} sx={{ color: TEXT_LIGHT, textTransform: "none", fontWeight: 700 }}>
            Réinitialiser
          </Button>
        </Box>
      </Popover>

      {/* Dialog : Affecter un stagiaire */}
      <Dialog open={dialogAffectationOuvert} onClose={() => setDialogAffectationOuvert(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: PRIMARY }}>Affecter un stagiaire</DialogTitle>
        <DialogContent>
          {erreurAffectation && <Alert severity="error" sx={{ mb: 2 }}>{erreurAffectation}</Alert>}

          {chargementDisponibles ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: PRIMARY }} />
            </Box>
          ) : stagiairesDisponibles.length === 0 ? (
            <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", py: 3 }}>
              Aucun stagiaire disponible pour le moment. Tous les stagiaires sont déjà affectés à un encadrant.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
              {stagiairesDisponibles.map((s) => (
                <Box
                  key={s.id}
                  sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, borderRadius: 3, border: `1px solid ${BORDER}` }}
                >
                  <Avatar src={s.photo_url ? `${API_URL}${s.photo_url}` : undefined} sx={{ bgcolor: SECONDARY }}>
                    {s.prenom?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: PRIMARY }}>
                      {s.prenom} {s.nom}
                    </Typography>
                    <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                      {s.specialisation || s.type_stage || "—"}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={idEnCoursAffectation === s.id}
                    onClick={() => affecter(s.id)}
                    sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16234A" }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                  >
                    {idEnCoursAffectation === s.id ? "..." : "Affecter"}
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDialogAffectationOuvert(false)} sx={{ color: TEXT_LIGHT, textTransform: "none", fontWeight: 700 }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(succesGlobal)}
        autoHideDuration={3500}
        onClose={() => setSuccesGlobal("")}
        message={succesGlobal}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

export default StagiairesEncadrant;
