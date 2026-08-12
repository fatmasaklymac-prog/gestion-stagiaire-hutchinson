import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip, TextField,
  Grid, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Collapse, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WarningIcon from "@mui/icons-material/Warning";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
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
const TEXT = "#1F2937";
const TEXT_LIGHT = "#6B7280";
const GREEN_LIGHT = "#E8F5E9";
const RED_LIGHT = "#FDECEC";
const ORANGE_LIGHT = "#FFF3E0";
const BLUE_LIGHT = "#E8F0FE";

const STATUTS_PRESENCE = [
  { value: "present", label: "Présent" },
  { value: "absent", label: "Absent" },
  { value: "non_pointe", label: "Non pointé" },
];

function Presences() {
  const [stagiaires, setStagiaires] = useState([]);
  const [presences, setPresences] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [horaires, setHoraires] = useState({});

  const [filters, setFilters] = useState({
    departement: "",
    statut_presence: "",
  });
  const [activeFilters, setActiveFilters] = useState({
    departement: "",
    statut_presence: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/stagiaires`, { headers: { ...authHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        const actifs = data.filter(
          (s) => s.statut === "en_cours" || s.statut === "en_attente"
        );
        setStagiaires(actifs);
      });

    chargerPresences();
  }, [date]);

  const chargerPresences = () => {
    fetch(`${API_URL}/presences`, { headers: { ...authHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        const filtrees = data.filter((p) => p.date === date);
        setPresences(filtrees);
      });
  };

  const estDansPeriode = (stagiaire, dateStr) => {
    if (!stagiaire.date_debut || !stagiaire.date_fin) return true;
    const d = new Date(dateStr);
    const debut = new Date(stagiaire.date_debut);
    const fin = new Date(stagiaire.date_fin);
    return d >= debut && d <= fin;
  };

  const getPresenceStagiaire = (stagiaireId) => {
    return presences.find((p) => p.stagiaire_id === stagiaireId);
  };

  const marquerPresence = (stagiaireId, statut) => {
    const stagiaire = stagiaires.find((s) => s.id === stagiaireId);
    if (!stagiaire) return;

    if (!estDansPeriode(stagiaire, date)) {
      setWarningMsg(
        `${stagiaire.prenom} ${stagiaire.nom} n'est pas en période de stage (${stagiaire.date_debut} → ${stagiaire.date_fin}). Impossible de marquer la présence.`
      );
      setWarningOpen(true);
      return;
    }

    const existante = presences.find((p) => p.stagiaire_id === stagiaireId);

    const h = horaires[stagiaireId] || {};
    const donnees = {
      stagiaire_id: stagiaireId,
      date: date,
      present: statut === "present",
      heure_arrivee: statut === "present" ? (h.arrivee || null) : null,
      heure_depart: statut === "present" ? (h.depart || null) : null,
    };

    if (existante) {
      fetch(`${API_URL}/presences/${existante.id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      })
        .then(() => chargerPresences())
        .catch((err) => console.error(err));
    } else {
      fetch(`${API_URL}/presences`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      })
        .then(() => chargerPresences())
        .catch((err) => console.error(err));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    const empty = { departement: "", statut_presence: "" };
    setFilters(empty);
    setActiveFilters(empty);
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== "");

  const getAvatarColor = (id) => {
    const colors = [PRIMARY, SECONDARY, "#64748B", SUCCESS, "#1565c0", WARNING];
    return colors[(id || 0) % colors.length];
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();
  };

  // ─── FILTRES ───
  const stagiairesFiltres = stagiaires.filter((s) => {
    const matchDept = !activeFilters.departement || s.departements === activeFilters.departement;
    const presence = getPresenceStagiaire(s.id);
    const estPresent = presence?.present === true;
    const estAbsent = presence?.present === false;
    const estNonPointe = !presence;

    let matchStatut = true;
    if (activeFilters.statut_presence === "present") matchStatut = estPresent;
    else if (activeFilters.statut_presence === "absent") matchStatut = estAbsent;
    else if (activeFilters.statut_presence === "non_pointe") matchStatut = estNonPointe;

    return matchDept && matchStatut;
  });

  const statsJour = {
    presents: presences.filter((p) => p.present === true).length,
    absents: presences.filter((p) => p.present === false).length,
    nonPointes: stagiaires.length - presences.length,
    horsPeriode: stagiaires.filter((s) => !estDansPeriode(s, date)).length,
  };

  const carteStat = (titre, valeur, couleur, couleurFond) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: BORDER,
        textAlign: "center",
        bgcolor: WHITE,
        transition: "all 0.25s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Typography
        variant="h3"
        sx={{ fontWeight: 800, color: couleur, lineHeight: 1, mb: 1, fontSize: "2rem" }}
      >
        {valeur}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: TEXT_LIGHT,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontSize: "0.75rem",
        }}
      >
        {titre}
      </Typography>
    </Paper>
  );

  // Extraire les départements uniques des stagiaires
  const departementsUniques = [...new Set(stagiaires.map((s) => s.departements).filter(Boolean))];

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
            Pointage des Présences
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT, fontSize: 14 }}>
            {stagiairesFiltres.length} stagiaire{stagiairesFiltres.length > 1 ? "s" : ""} affiché
            {stagiairesFiltres.length > 1 ? "s" : ""} ·{" "}
            {new Date(date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={filtersOpen || hasActiveFilters ? "contained" : "outlined"}
            startIcon={<FilterListIcon />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              ...(filtersOpen || hasActiveFilters
                ? { bgcolor: PRIMARY, color: "white", "&:hover": { bgcolor: "#16224a" } }
                : { borderColor: BORDER, color: TEXT, "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT } }
              ),
            }}
          >
            Filtres {hasActiveFilters && "●"}
          </Button>
          <TextField
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <CalendarTodayIcon sx={{ color: TEXT_LIGHT, mr: 1, fontSize: 18 }} />
                ),
              },
            }}
            sx={{
              minWidth: 180,
              "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: WHITE },
            }}
          />
        </Box>
      </Box>

      {/* Panneau de filtres */}
      <Collapse in={filtersOpen}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            border: "1px solid",
            borderColor: BORDER,
            bgcolor: WHITE,
          }}
        >
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Département</InputLabel>
                <Select
                  name="departement"
                  value={filters.departement}
                  onChange={handleFilterChange}
                  label="Département"
                >
                  <MenuItem value=""><em>Tous</em></MenuItem>
                  {departementsUniques.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Statut de présence</InputLabel>
                <Select
                  name="statut_presence"
                  value={filters.statut_presence}
                  onChange={handleFilterChange}
                  label="Statut de présence"
                >
                  <MenuItem value=""><em>Tous</em></MenuItem>
                  {STATUTS_PRESENCE.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button
              onClick={resetFilters}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                borderColor: BORDER,
                color: TEXT,
                "&:hover": { borderColor: SECONDARY, color: SECONDARY, bgcolor: "#ffebee" },
              }}
            >
              Réinitialiser
            </Button>
            <Button
              onClick={applyFilters}
              variant="contained"
              size="small"
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: "#16224a" },
              }}
            >
              Appliquer
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Badges de filtres actifs */}
      {hasActiveFilters && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {activeFilters.departement && (
            <Chip
              label={`Département: ${activeFilters.departement}`}
              size="small"
              onDelete={() => { setActiveFilters((p) => ({ ...p, departement: "" })); setFilters((p) => ({ ...p, departement: "" })); }}
              sx={{ bgcolor: BLUE_LIGHT, color: PRIMARY, fontWeight: 600 }}
            />
          )}
          {activeFilters.statut_presence && (
            <Chip
              label={`Présence: ${STATUTS_PRESENCE.find(s => s.value === activeFilters.statut_presence)?.label}`}
              size="small"
              onDelete={() => { setActiveFilters((p) => ({ ...p, statut_presence: "" })); setFilters((p) => ({ ...p, statut_presence: "" })); }}
              sx={{ bgcolor: ORANGE_LIGHT, color: WARNING, fontWeight: 600 }}
            />
          )}
        </Box>
      )}

      {/* Statistiques */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          {carteStat("Présents", statsJour.presents, SUCCESS, GREEN_LIGHT)}
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {carteStat("Absents", statsJour.absents, DANGER, RED_LIGHT)}
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {carteStat("Non pointés", statsJour.nonPointes, WARNING, ORANGE_LIGHT)}
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          {carteStat("Hors période", statsJour.horsPeriode, TEXT_LIGHT, "#f5f5f5")}
        </Grid>
      </Grid>

      {/* Tableau */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 4, border: "1px solid", borderColor: BORDER, overflow: "hidden", bgcolor: WHITE }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              {["Stagiaire", "Département", "Période de stage", "Statut", "Action"].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontWeight: 700,
                    color: PRIMARY,
                    borderBottom: "none",
                    py: 1.5,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {stagiairesFiltres.map((s) => {
              const presence = getPresenceStagiaire(s.id);
              const estPresent = presence?.present === true;
              const estAbsent = presence?.present === false;
              const dansPeriode = estDansPeriode(s, date);
              const estFini = new Date(date) > new Date(s.date_fin);
              const estPasCommence = new Date(date) < new Date(s.date_debut);

              return (
                <TableRow
                  key={s.id}
                  hover
                  sx={{
                    transition: "all 0.2s ease",
                    opacity: dansPeriode ? 1 : 0.6,
                    bgcolor: dansPeriode ? "inherit" : "#fafafa",
                    "&:hover": { bgcolor: dansPeriode ? "#F8FAFC" : "#f5f5f5" },
                    "&:last-child td": { borderBottom: "none" },
                  }}
                >
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: getAvatarColor(s.id),
                          width: 44,
                          height: 44,
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(s.prenom, s.nom)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}>
                          {s.prenom} {s.nom}
                        </Typography>
                        <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>
                          {s.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    {s.departements ? (
                      <Chip
                        label={s.departements}
                        size="small"
                        sx={{
                          bgcolor: BLUE_LIGHT,
                          color: "#1565c0",
                          fontWeight: 600,
                          borderRadius: 1.5,
                          fontSize: "0.75rem",
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.85rem" }}>
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    <Typography variant="body2" sx={{ color: TEXT, fontSize: "0.85rem" }}>
                      {s.date_debut ? new Date(s.date_debut).toLocaleDateString("fr-FR") : "—"} →{" "}
                      {s.date_fin ? new Date(s.date_fin).toLocaleDateString("fr-FR") : "—"}
                    </Typography>
                    {!dansPeriode && (
                      <Chip
                        icon={<WarningIcon fontSize="small" />}
                        label={estFini ? "Stage terminé" : estPasCommence ? "Stage pas commencé" : "Hors période"}
                        size="small"
                        sx={{
                          mt: 0.5,
                          bgcolor: "#f5f5f5",
                          color: TEXT_LIGHT,
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />
                    )}
                  </TableCell>

                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    {!dansPeriode ? (
                      <Chip
                        label="Hors période"
                        size="small"
                        sx={{
                          bgcolor: "#f5f5f5",
                          color: TEXT_LIGHT,
                          fontWeight: 600,
                          borderRadius: 1.5,
                          fontSize: "0.75rem",
                        }}
                      />
                    ) : presence ? (
                      <Chip
                        icon={
                          estPresent ? (
                            <CheckCircleIcon fontSize="small" />
                          ) : (
                            <CancelIcon fontSize="small" />
                          )
                        }
                        label={estPresent ? "Présent" : "Absent"}
                        size="small"
                        sx={{
                          bgcolor: estPresent ? GREEN_LIGHT : RED_LIGHT,
                          color: estPresent ? SUCCESS : DANGER,
                          fontWeight: 600,
                          borderRadius: 1.5,
                          fontSize: "0.75rem",
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<QuestionMarkIcon fontSize="small" />}
                        label="Non pointé"
                        size="small"
                        sx={{
                          bgcolor: ORANGE_LIGHT,
                          color: WARNING,
                          fontWeight: 600,
                          borderRadius: 1.5,
                          fontSize: "0.75rem",
                        }}
                      />
                    )}
                  </TableCell>

                  <TableCell align="center" sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    {dansPeriode ? (
                      presence ? (
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block", fontSize: "0.7rem" }}>
                              Arrivée
                            </Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: TEXT }}>
                              {presence.heure_arrivee || "—"}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block", fontSize: "0.7rem" }}>
                              Départ
                            </Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: TEXT }}>
                              {presence.heure_depart || "—"}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.85rem" }}>
                          En attente de pointage
                        </Typography>
                      )
                    ) : (
                      <Tooltip title={estFini ? "Stage déjà terminé" : "Stage pas encore commencé"}>
                        <Chip
                          label="Bloqué"
                          size="small"
                          sx={{
                            bgcolor: "#f5f5f5",
                            color: TEXT_LIGHT,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            cursor: "not-allowed",
                          }}
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Warning */}
      <Dialog
        open={warningOpen}
        onClose={() => setWarningOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle
          sx={{
            bgcolor: WARNING,
            color: "white",
            py: 2.5,
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <WarningIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Action impossible
          </Typography>
          <IconButton
            onClick={() => setWarningOpen(false)}
            sx={{ ml: "auto", color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Typography sx={{ color: TEXT, fontSize: "0.95rem" }}>{warningMsg}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setWarningOpen(false)}
            variant="contained"
            sx={{
              bgcolor: WARNING,
              "&:hover": { bgcolor: "#e65100" },
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Compris
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Presences;