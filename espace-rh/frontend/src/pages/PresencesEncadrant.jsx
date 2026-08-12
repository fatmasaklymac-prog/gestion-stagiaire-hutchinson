import { useState, useEffect, useMemo } from "react";
import {
  Box, Paper, Typography, Avatar, Chip, TextField, InputAdornment,
  CircularProgress, Alert, Button, Table, TableHead, TableBody,
  TableRow, TableCell, Popover, MenuItem, Select, FormControl,
  InputLabel, Badge, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SUCCESS = "#2E7D32";
const DANGER = "#C62828";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

function PresencesEncadrant() {
  const [stagiaires, setStagiaires] = useState([]);
  const [presences, setPresences] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [recherche, setRecherche] = useState("");
  const [filtreStagiaire, setFiltreStagiaire] = useState("tous");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [ancreFiltres, setAncreFiltres] = useState(null);
  const [stagiaireDetail, setStagiaireDetail] = useState(null);

  useEffect(() => {
    setChargement(true);
    Promise.all([
      fetch(`${API_URL}/moi/mes-stagiaires`, { headers: { ...authHeaders() } }).then((r) => {
        if (!r.ok) throw new Error("Erreur lors du chargement des stagiaires");
        return r.json();
      }),
      fetch(`${API_URL}/moi/mes-stagiaires/presences`, { headers: { ...authHeaders() } }).then((r) => {
        if (!r.ok) throw new Error("Erreur lors du chargement des presences");
        return r.json();
      }),
    ])
      .then(([dataStagiaires, dataPresences]) => {
        setStagiaires(dataStagiaires);
        setPresences(dataPresences);
        setErreur(null);
      })
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  const stagiaireParId = useMemo(() => {
    const map = {};
    stagiaires.forEach((s) => { map[s.id] = s; });
    return map;
  }, [stagiaires]);

  const presencesFiltrees = useMemo(() => {
    return presences.filter((p) => {
      const stagiaire = stagiaireParId[p.stagiaire_id];
      if (!stagiaire) return false;

      if (filtreStagiaire !== "tous" && String(p.stagiaire_id) !== String(filtreStagiaire)) {
        return false;
      }

      if (filtreStatut === "present" && !p.present) return false;
      if (filtreStatut === "absent" && p.present) return false;

      if (recherche.trim()) {
        const texte = `${stagiaire.nom} ${stagiaire.prenom}`.toLowerCase();
        if (!texte.includes(recherche.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [presences, stagiaireParId, recherche, filtreStagiaire, filtreStatut]);

  const statsParStagiaire = useMemo(() => {
    const map = {};
    presencesFiltrees.forEach((p) => {
      if (!map[p.stagiaire_id]) {
        map[p.stagiaire_id] = { presences: 0, absences: 0, derniere: null };
      }
      const entree = map[p.stagiaire_id];
      if (p.present) entree.presences += 1;
      else entree.absences += 1;
      if (!entree.derniere || p.date > entree.derniere) entree.derniere = p.date;
    });
    return Object.entries(map).map(([id, stats]) => {
      const total = stats.presences + stats.absences;
      const taux = total > 0 ? Math.round((stats.presences / total) * 100) : 0;
      return {
        stagiaireId: id,
        stagiaire: stagiaireParId[id],
        ...stats,
        taux,
      };
    });
  }, [presencesFiltrees, stagiaireParId]);

  const nbFiltresActifs = (filtreStagiaire !== "tous" ? 1 : 0) + (filtreStatut !== "tous" ? 1 : 0);

  function reinitialiserFiltres() {
    setFiltreStagiaire("tous");
    setFiltreStatut("tous");
  }

  if (chargement) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: "56px", md: "120px" } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, fontSize: "1.75rem" }}>
            Présences
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT, mt: 0.5 }}>
            Consultez les présences de vos stagiaires.
          </Typography>
        </Box>
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
      </Box>

      <Divider sx={{ mb: 3 }} />

      {erreur && <Alert severity="error" sx={{ mb: 3 }}>{erreur}</Alert>}

      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: `1px solid ${BORDER}` }}>
        <TextField
          placeholder="Rechercher par nom de stagiaire..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: TEXT_LIGHT }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE, overflow: "hidden" }}>
        {statsParStagiaire.length === 0 ? (
          <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", py: 6 }}>
            Aucune présence trouvée
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Stagiaire</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Présences</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Absences</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Taux de présence</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Dernière présence</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statsParStagiaire.map((s) => (
                <TableRow key={s.stagiaireId} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar src={s.stagiaire?.photo_url || undefined} sx={{ width: 32, height: 32, bgcolor: PRIMARY }}>
                        {s.stagiaire?.nom?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">
                        {s.stagiaire?.nom} {s.stagiaire?.prenom}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={s.presences}
                      size="small"
                      sx={{ bgcolor: "#E8F5E9", color: SUCCESS, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<CancelIcon />}
                      label={s.absences}
                      size="small"
                      sx={{ bgcolor: "#FDECEA", color: DANGER, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 120 }}>
                      <LinearProgress
                        variant="determinate"
                        value={s.taux}
                        sx={{ width: 60, height: 6, borderRadius: 3, bgcolor: "#F1F1F1",
                          "& .MuiLinearProgress-bar": { bgcolor: s.taux >= 75 ? SUCCESS : s.taux >= 50 ? "#EF6C00" : DANGER } }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{s.taux}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{s.derniere || "—"}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => setStagiaireDetail(s)}>
                      Voir détail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

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
            <InputLabel>Stagiaire</InputLabel>
            <Select
              label="Stagiaire"
              value={filtreStagiaire}
              onChange={(e) => setFiltreStagiaire(e.target.value)}
            >
              <MenuItem value="tous">Tous</MenuItem>
              {stagiaires.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.nom} {s.prenom}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Statut</InputLabel>
            <Select
              label="Statut"
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
            >
              <MenuItem value="tous">Tous</MenuItem>
              <MenuItem value="present">Présent</MenuItem>
              <MenuItem value="absent">Absent</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          <Button onClick={reinitialiserFiltres} sx={{ color: TEXT_LIGHT, textTransform: "none", fontWeight: 700 }}>
            Réinitialiser
          </Button>
        </Box>
      </Popover>

      <Dialog open={!!stagiaireDetail} onClose={() => setStagiaireDetail(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          Détail des présences — {stagiaireDetail?.stagiaire?.nom} {stagiaireDetail?.stagiaire?.prenom}
        </DialogTitle>
        <DialogContent dividers>
          {stagiaireDetail && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Arrivée</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Départ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {presencesFiltrees
                  .filter((p) => String(p.stagiaire_id) === String(stagiaireDetail.stagiaireId))
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>
                        {p.present ? (
                          <Chip icon={<CheckCircleIcon />} label="Présent" size="small"
                            sx={{ bgcolor: "#E8F5E9", color: SUCCESS, fontWeight: 600 }} />
                        ) : (
                          <Chip icon={<CancelIcon />} label="Absent" size="small"
                            sx={{ bgcolor: "#FDECEA", color: DANGER, fontWeight: 600 }} />
                        )}
                      </TableCell>
                      <TableCell>{p.heure_arrivee || "—"}</TableCell>
                      <TableCell>{p.heure_depart || "—"}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStagiaireDetail(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PresencesEncadrant;
