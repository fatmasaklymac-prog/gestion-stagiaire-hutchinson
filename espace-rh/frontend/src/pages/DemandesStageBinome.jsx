import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Paper, Typography, Grid, TextField, MenuItem, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Alert, CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";
const PRIMARY = "#1D2B5B";
const BACKGROUND = "#F5F7FB";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";
const TEXT = "#1B2033";

const STATUTS = [
  { valeur: "en_attente", libelle: "En attente", couleur: "#B45309", fond: "#FEF3C7" },
  { valeur: "en_etude", libelle: "En étude", couleur: "#1D4ED8", fond: "#DBEAFE" },
  { valeur: "entretien_programme", libelle: "Entretien", couleur: "#6D28D9", fond: "#EDE9FE" },
  { valeur: "acceptee", libelle: "Acceptée", couleur: "#15803D", fond: "#DCFCE7" },
  { valeur: "refusee", libelle: "Refusée", couleur: "#B91C1C", fond: "#FEE2E2" },
];

function infosStatut(valeur) {
  return STATUTS.find((s) => s.valeur === valeur) || STATUTS[0];
}

function StatutChip({ statut }) {
  const info = infosStatut(statut);
  return <Chip label={info.libelle} size="small" sx={{ bgcolor: info.fond, color: info.couleur, fontWeight: 700, borderRadius: "999px" }} />;
}

function formatDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); } 
  catch { return iso; }
}

function CarteStat({ label, valeur, couleur }) {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: "0 2px 10px -4px rgba(29,43,91,0.08)" }}>
      <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: couleur || PRIMARY, mt: 0.5 }}>{valeur}</Typography>
    </Paper>
  );
}

function DemandesStage() {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreDepartement, setFiltreDepartement] = useState("");
  const [filtreType, setFiltreType] = useState("");
  const [sujetsPfe, setSujetsPfe] = useState([]);

  useEffect(() => {
    setChargement(true);
    Promise.all([
      fetch(`${API_URL}/demandes-stage`, { headers: authHeaders() }).then(r => r.json()),
      fetch(`${API_URL}/sujets-pfe`).then(r => r.ok ? r.json() : [])
    ])
    .then(([demData, pfeData]) => {
      setDemandes(demData);
      setSujetsPfe(pfeData);
      setErreur("");
    })
    .catch(() => setErreur("Impossible de charger les demandes de stage."))
    .finally(() => setChargement(false));
  }, []);

  const getVraiDepartement = (demande) => {
    if (!demande) return "—";
    if (demande.departements && demande.departements !== "PFE") {
      return demande.departements;
    }
    if (demande.reference_projet && sujetsPfe.length > 0) {
      const sujet = sujetsPfe.find(s => s.reference === demande.reference_projet);
      if (sujet) {
        const dept = sujet.departement || sujet.departements || sujet.profil_requis;
        if (dept && dept !== "PFE" && dept !== "pfe") {
          return dept;
        }
      }
    }
    if (demande.type_stage && demande.type_stage.includes("PFE")) {
      return "PFE";
    }
    return "—";
  };

  const departementsDisponibles = useMemo(() => {
    const depts = new Set();
    demandes.forEach(d => {
      const dept = getVraiDepartement(d);
      if (dept && dept !== "—" && dept !== "PFE") depts.add(dept);
    });
    return [...depts];
  }, [demandes, sujetsPfe]);

  const demandesFiltrees = useMemo(() => {
    return demandes.filter((d) => {
      const texte = `${d.prenom} ${d.nom} ${d.email} ${d.etablissements}`.toLowerCase();
      const matchRecherche = texte.includes(recherche.toLowerCase());
      const matchStatut = !filtreStatut || d.statut === filtreStatut;
      const vraiDept = getVraiDepartement(d);
      const matchDepartement = !filtreDepartement || vraiDept === filtreDepartement;
      const estPfe = (d.type_stage || "").includes("PFE") || d.departements === "PFE" || (d.reference_projet && sujetsPfe.some(s => s.reference === d.reference_projet));
      const matchType = !filtreType || (filtreType === "pfe" && estPfe) || (filtreType === "classique" && !estPfe);
      return matchRecherche && matchStatut && matchDepartement && matchType;
    });
  }, [demandes, recherche, filtreStatut, filtreDepartement, filtreType, sujetsPfe]);

  const stats = useMemo(() => {
    const parStatut = (s) => demandes.filter((d) => d.statut === s).length;
    const nbPfe = demandes.filter((d) => {
      const estPfe = (d.type_stage || "").includes("PFE") || d.departements === "PFE";
      return estPfe || (d.reference_projet && sujetsPfe.some(s => s.reference === d.reference_projet));
    }).length;
    return {
      total: demandes.length, en_attente: parStatut("en_attente"), en_etude: parStatut("en_etude"),
      entretien_programme: parStatut("entretien_programme"), acceptee: parStatut("acceptee"),
      refusee: parStatut("refusee"), pfe: nbPfe,
    };
  }, [demandes, sujetsPfe]);

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100%" }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, mb: 0.5 }}>Demandes de Stage</Typography>
      <Typography variant="body2" sx={{ color: TEXT_LIGHT, mb: 3 }}>Candidatures reçues via le portail public de recrutement.</Typography>

      {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><CarteStat label="Total" valeur={stats.total} /></Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><CarteStat label="En attente" valeur={stats.en_attente} couleur="#B45309" /></Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><CarteStat label="En étude" valeur={stats.en_etude} couleur="#1D4ED8" /></Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><CarteStat label="Entretien" valeur={stats.entretien_programme} couleur="#6D28D9" /></Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><CarteStat label="Acceptées" valeur={stats.acceptee} couleur="#15803D" /></Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><CarteStat label="PFE" valeur={stats.pfe} couleur="#6D28D9" /></Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${BORDER}`, mb: 2, display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
        <TextField size="small" placeholder="Rechercher un candidat, une école..." value={recherche} onChange={(e) => setRecherche(e.target.value)} sx={{ minWidth: 260, flexGrow: 1 }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }} />
        <TextField select size="small" label="Statut" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} sx={{ minWidth: 170 }}>
          <MenuItem value="">Tous les statuts</MenuItem>
          {STATUTS.map((s) => <MenuItem key={s.valeur} value={s.valeur}>{s.libelle}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Département" value={filtreDepartement} onChange={(e) => setFiltreDepartement(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">Tous les départements</MenuItem>
          {departementsDisponibles.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Type" value={filtreType} onChange={(e) => setFiltreType(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">Tous les types</MenuItem>
          <MenuItem value="classique">Stage classique</MenuItem>
          <MenuItem value="pfe">PFE</MenuItem>
        </TextField>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        {chargement ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={28} /></Box>
        ) : demandesFiltrees.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}><Typography variant="body2" sx={{ color: TEXT_LIGHT }}>Aucune demande ne correspond aux filtres.</Typography></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Nom & Prénom</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Université</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Département</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {demandesFiltrees.map((d) => {
                const vraiDepartement = getVraiDepartement(d);
                return (
                  <TableRow key={d.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/demandes-stage/${d.id}`)}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY }}>{d.prenom} {d.nom}</Typography>
                      <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>{d.email}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">{d.etablissements}</Typography></TableCell>
                    <TableCell><Chip label={d.type_stage} size="small" sx={{ bgcolor: "#EEF0F6", color: PRIMARY, fontWeight: 600 }} /></TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: vraiDepartement === "—" ? TEXT_LIGHT : TEXT }}>
                        {vraiDepartement}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(d.date_creation)}</TableCell>
                    <TableCell><StatutChip statut={d.statut} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/demandes-stage/${d.id}`); }}>
                        <VisibilityIcon fontSize="small" sx={{ color: PRIMARY }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}

export default DemandesStage;