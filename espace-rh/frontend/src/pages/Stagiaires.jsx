import { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton,
  MenuItem, Avatar, Grid, Divider, FormControlLabel, Checkbox,
  InputAdornment, Tooltip, Collapse
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";

const NIVEAUX = [
  "Bac +2 (BTS/DUT)",
  "Bac +3 (Licence)",
  "Bac +5 (Master/Ingénieur)",
  "Doctorat",
];

const TYPES_STAGE = [
  "PFE (Projet Fin d'Études)",
  "PFA (Projet de Fin d'Année)",
  "Stage d'été",
  "Stage d'initiation",
  "Stage de perfectionnement",
];

const STATUTS = [
  { value: "en_attente", label: "En attente" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
];

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SUCCESS = "#2E7D32";
const WARNING = "#EF6C00";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT = "#1F2937";
const TEXT_LIGHT = "#6B7280";
const BLUE_LIGHT = "#E8F0FE";
const GREEN_LIGHT = "#E8F5E9";
const ORANGE_LIGHT = "#FFF3E0";

function Stagiaires() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stagiaires, setStagiaires] = useState([]);
  const [encadrants, setEncadrants] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [open, setOpen] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [idEnCours, setIdEnCours] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtres
  const [filters, setFilters] = useState({
    departement: "",
    statut: "",
    niveau_etudes: "",
    type_stage: "",
  });
  const [activeFilters, setActiveFilters] = useState({
    departement: "",
    statut: "",
    niveau_etudes: "",
    type_stage: "",
  });

  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", telephone: "", cin: "",
    etablissements: "", niveau_etudes: "", specialisation: "", type_stage: "",
    date_debut: "", date_fin: "", departements: "", encadrant_id: "",
    statut: "en_attente", notifier_email: false,
  });

  const chargerStagiaires = () => {
    setLoading(true);
    fetch(`${API_URL}/stagiaires`)
      .then((r) => r.json())
      .then((data) => {
        setStagiaires(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const chargerEncadrants = () => {
    fetch(`${API_URL}/encadrants`)
      .then((r) => r.json())
      .then(setEncadrants)
      .catch(() => setEncadrants([]));
  };

  const chargerDepartements = () => {
    fetch(`${API_URL}/departements`)
      .then((r) => r.json())
      .then(setDepartements)
      .catch(() => setDepartements([]));
  };

  useEffect(() => {
    chargerStagiaires();
    chargerEncadrants();
    chargerDepartements();
  }, []);

  useEffect(() => {
    if (location.state?.editId && stagiaires.length > 0) {
      const stagiaire = stagiaires.find((s) => s.id === location.state.editId);
      if (stagiaire) {
        ouvrirModification(stagiaire);
      }
      window.history.replaceState({}, document.title);
    }
  }, [stagiaires, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
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
    const empty = { departement: "", statut: "", niveau_etudes: "", type_stage: "" };
    setFilters(empty);
    setActiveFilters(empty);
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== "");

  const ouvrirAjout = () => {
    setModeEdition(false);
    setIdEnCours(null);
    setErrors({});
    setForm({
      prenom: "", nom: "", email: "", telephone: "", cin: "",
      etablissements: "", niveau_etudes: "", specialisation: "", type_stage: "",
      date_debut: "", date_fin: "", departements: "", encadrant_id: "",
      statut: "en_attente", notifier_email: false,
    });
    setOpen(true);
  };

  const ouvrirModification = (stagiaire) => {
    setModeEdition(true);
    setIdEnCours(stagiaire.id);
    setErrors({});
    setForm({
      prenom: stagiaire.prenom || "",
      nom: stagiaire.nom || "",
      email: stagiaire.email || "",
      telephone: stagiaire.telephone || "",
      cin: stagiaire.cin || "",
      etablissements: stagiaire.etablissements || "",
      niveau_etudes: stagiaire.niveau_etudes || "",
      specialisation: stagiaire.specialisation || "",
      type_stage: stagiaire.type_stage || "",
      date_debut: stagiaire.date_debut || "",
      date_fin: stagiaire.date_fin || "",
      departements: stagiaire.departements || "",
      encadrant_id: stagiaire.encadrant_id ?? "",
      statut: stagiaire.statut || "en_attente",
      notifier_email: stagiaire.notifier_email || false,
    });
    setOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    const required = ['prenom', 'nom', 'email', 'etablissements', 'niveau_etudes', 'date_debut', 'date_fin'];

    required.forEach((field) => {
      const value = form[field];
      if (!value || String(value).trim() === '') {
        newErrors[field] = true;
      }
    });

    if (form.email && !form.email.includes('@')) {
      newErrors.email = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const url = modeEdition
      ? `${API_URL}/stagiaires/${idEnCours}`
      : `${API_URL}/stagiaires`;
    const method = modeEdition ? "PUT" : "POST";

    const dataToSend = {
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      email: form.email.trim(),
      telephone: form.telephone?.trim() || null,
      cin: form.cin?.trim() || null,
      etablissements: form.etablissements.trim(),
      niveau_etudes: form.niveau_etudes.trim(),
      specialisation: form.specialisation?.trim() || null,
      type_stage: form.type_stage || null,
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      departements: form.departements?.trim() || null,
      encadrant_id: form.encadrant_id === "" ? null : Number(form.encadrant_id),
      statut: form.statut,
      notifier_email: Boolean(form.notifier_email),
    };

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(dataToSend),
    })
      .then(async (r) => {
        const responseText = await r.text();
        if (!r.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { detail: responseText };
          }
          throw new Error(`Erreur ${r.status}: ${JSON.stringify(errorData)}`);
        }
        return JSON.parse(responseText);
      })
      .then(() => {
        chargerStagiaires();
        setOpen(false);
      })
      .catch((err) => {
        console.error("❌ Erreur:", err);
        alert("Erreur: " + err.message);
      });
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer ce stagiaire ?")) return;
    fetch(`${API_URL}/stagiaires/${id}`, { method: "DELETE" })
      .then(() => chargerStagiaires());
  };

  const handleEdit = (stagiaire, e) => {
    e.stopPropagation();
    ouvrirModification(stagiaire);
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();
  };

  const getAvatarColor = (id) => {
    const colors = [PRIMARY, SECONDARY, "#64748B", "#77767B", "#1565c0", SUCCESS];
    return colors[id % colors.length];
  };

  const getNomEncadrant = (encadrantId) => {
    if (!encadrantId) return "—";
    const enc = encadrants.find((e) => e.id === encadrantId);
    return enc ? `${enc.prenom} ${enc.nom}` : "—";
  };

  const getChipProps = (statut) => {
    switch (statut) {
      case "en_cours":
        return { label: "En cours", sx: { bgcolor: GREEN_LIGHT, color: SUCCESS, fontWeight: 600, borderRadius: 2 } };
      case "termine":
        return { label: "Terminé", sx: { bgcolor: "#f5f5f5", color: TEXT_LIGHT, fontWeight: 600, borderRadius: 2 } };
      case "en_attente":
        return { label: "En attente", sx: { bgcolor: ORANGE_LIGHT, color: WARNING, fontWeight: 600, borderRadius: 2 } };
      default:
        return { label: statut, sx: { bgcolor: "#f5f5f5", color: TEXT_LIGHT, fontWeight: 600, borderRadius: 2 } };
    }
  };

  // ─── FILTRES ───
  const filteredStagiaires = stagiaires.filter((s) => {
    const searchLower = search.toLowerCase();
    const matchSearch = `${s.prenom} ${s.nom} ${s.email} ${s.cin}`.toLowerCase().includes(searchLower);
    const matchDept = !activeFilters.departement || s.departements === activeFilters.departement;
    const matchStatut = !activeFilters.statut || s.statut === activeFilters.statut;
    const matchNiveau = !activeFilters.niveau_etudes || s.niveau_etudes === activeFilters.niveau_etudes;
    const matchTypeStage = !activeFilters.type_stage || s.type_stage === activeFilters.type_stage;
    return matchSearch && matchDept && matchStatut && matchNiveau && matchTypeStage;
  });

  const formatPeriode = (debut, fin) => {
    if (!debut || !fin) return "—";
    const d1 = new Date(debut);
    const d2 = new Date(fin);
    const mois = Math.round((d2 - d1) / (1000 * 60 * 60 * 24 * 30));
    return `${d1.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} – ${d2.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
Durée: ${mois} mois`;
  };

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
            Liste des Stagiaires
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT, fontSize: 14 }}>
            {filteredStagiaires.length} stagiaire{filteredStagiaires.length > 1 ? "s" : ""} affiché{filteredStagiaires.length > 1 ? "s" : ""}
            {hasActiveFilters && ` (filtrés sur ${stagiaires.length})`}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={ouvrirAjout}
          sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16224a" }, borderRadius: 3, textTransform: "none", fontWeight: 600, px: 3, py: 1 }}>
          Nouveau Stagiaire
        </Button>
      </Box>

      {/* Barre de recherche + filtres */}
      <Paper elevation={0} sx={{ p: 2, mb: filtersOpen ? 0 : 3, borderRadius: filtersOpen ? "16px 16px 0 0" : 4, border: "1px solid", borderColor: BORDER, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", bgcolor: WHITE }}>
        <TextField placeholder="Rechercher par nom, email, CIN..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ flex: 1, minWidth: 250 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: TEXT_LIGHT }} />
                </InputAdornment>
              ),
            },
          }}
        />
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
        <Button variant="outlined" startIcon={<DownloadIcon />}
          sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600, borderColor: BORDER, color: TEXT, "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT } }}>
          Exporter
        </Button>
      </Paper>

      {/* Panneau de filtres */}
      <Collapse in={filtersOpen}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: "0 0 16px 16px",
            border: "1px solid",
            borderColor: BORDER,
            borderTop: "none",
            bgcolor: WHITE,
          }}
        >
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Département"
                name="departement"
                value={filters.departement}
                onChange={handleFilterChange}
                slotProps={{ inputLabel: { shrink: true } }}
              >
                <MenuItem value=""><em>Tous</em></MenuItem>
                {departements.map((d) => (
                  <MenuItem key={d.id} value={d.nom}>{d.nom}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Statut"
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
                slotProps={{ inputLabel: { shrink: true } }}
              >
                <MenuItem value=""><em>Tous</em></MenuItem>
                {STATUTS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Niveau d'études"
                name="niveau_etudes"
                value={filters.niveau_etudes}
                onChange={handleFilterChange}
                slotProps={{ inputLabel: { shrink: true } }}
              >
                <MenuItem value=""><em>Tous</em></MenuItem>
                {NIVEAUX.map((n) => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Type de stage"
                name="type_stage"
                value={filters.type_stage}
                onChange={handleFilterChange}
                slotProps={{ inputLabel: { shrink: true } }}
              >
                <MenuItem value=""><em>Tous</em></MenuItem>
                {TYPES_STAGE.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
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
          {activeFilters.statut && (
            <Chip
              label={`Statut: ${STATUTS.find(s => s.value === activeFilters.statut)?.label}`}
              size="small"
              onDelete={() => { setActiveFilters((p) => ({ ...p, statut: "" })); setFilters((p) => ({ ...p, statut: "" })); }}
              sx={{ bgcolor: ORANGE_LIGHT, color: WARNING, fontWeight: 600 }}
            />
          )}
          {activeFilters.niveau_etudes && (
            <Chip
              label={`Niveau: ${activeFilters.niveau_etudes}`}
              size="small"
              onDelete={() => { setActiveFilters((p) => ({ ...p, niveau_etudes: "" })); setFilters((p) => ({ ...p, niveau_etudes: "" })); }}
              sx={{ bgcolor: GREEN_LIGHT, color: SUCCESS, fontWeight: 600 }}
            />
          )}
          {activeFilters.type_stage && (
            <Chip
              label={`Type: ${activeFilters.type_stage}`}
              size="small"
              onDelete={() => { setActiveFilters((p) => ({ ...p, type_stage: "" })); setFilters((p) => ({ ...p, type_stage: "" })); }}
              sx={{ bgcolor: "#f3e5f5", color: "#7b1fa2", fontWeight: 600 }}
            />
          )}
        </Box>
      )}

      {/* Tableau */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: BORDER, overflow: "hidden", bgcolor: WHITE }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              {["Stagiaire", "Contact", "CIN", "Université / Diplôme", "Type de stage", "Département", "Encadrant", "Période", "Statut"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: PRIMARY, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "none", py: 1.5 }}>
                  {h}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "none", py: 1.5 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStagiaires.map((s) => (
              <TableRow key={s.id} hover onClick={() => navigate(`/stagiaires/${s.id}`)}
                sx={{ cursor: "pointer", transition: "all 0.2s ease", "&:hover": { bgcolor: "#F8FAFC" }, "&:last-child td": { borderBottom: "none" } }}>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: getAvatarColor(s.id), width: 44, height: 44, fontSize: 15, fontWeight: 700 }}>
                      {getInitials(s.prenom, s.nom)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}>{s.prenom} {s.nom}</Typography>
                      <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>{s.specialisation || "Stagiaire"}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: TEXT, fontSize: "0.85rem" }}>
                      <PhoneIcon sx={{ fontSize: 14, color: TEXT_LIGHT }} />{s.telephone || "—"}
                    </Typography>
                    <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, color: TEXT, fontSize: "0.85rem" }}>
                      <EmailIcon sx={{ fontSize: 14, color: TEXT_LIGHT }} />{s.email || "—"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Typography variant="body2" fontWeight={500} sx={{ color: TEXT, fontSize: "0.85rem" }}>{s.cin || "—"}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Typography variant="body2" fontWeight={500} sx={{ color: TEXT, fontSize: "0.85rem" }}>{s.etablissements || "—"}</Typography>
                  <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontStyle: "italic", fontSize: "0.75rem" }}>{s.niveau_etudes || ""}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  {s.type_stage ? (
                    <Chip label={s.type_stage} size="small" sx={{ bgcolor: "#f3e5f5", color: "#7b1fa2", fontWeight: 600, borderRadius: 1.5, fontSize: "0.75rem" }} />
                  ) : "—"}
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  {s.departements ? (
                    <Chip label={s.departements} size="small" sx={{ bgcolor: BLUE_LIGHT, color: "#1565c0", fontWeight: 600, borderRadius: 1.5, fontSize: "0.75rem" }} />
                  ) : "—"}
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Typography variant="body2" sx={{ color: TEXT, fontSize: "0.85rem" }}>{getNomEncadrant(s.encadrant_id)}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.5, color: TEXT, fontSize: "0.85rem" }}>{formatPeriode(s.date_debut, s.date_fin)}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Chip size="small" {...getChipProps(s.statut)} />
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Tooltip title="Modifier">
                    <IconButton size="small" onClick={(e) => handleEdit(s, e)} sx={{ color: PRIMARY }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" onClick={(e) => handleDelete(s.id, e)} sx={{ color: SECONDARY }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md"
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: "hidden" } } }}>
        <DialogTitle sx={{ bgcolor: PRIMARY, color: "white", py: 2.5, px: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 36, height: 36 }}>
            <AddIcon sx={{ fontSize: 20, color: "white" }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{modeEdition ? "Modifier le Stagiaire" : "Fiche Stagiaire"}</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>Remplissez les informations essentielles du parcours</Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1, "&::before": { content: '""', width: 4, height: 20, bgcolor: SECONDARY, borderRadius: 1, display: "block" } }}>
              Informations Personnelles
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Prénom *" name="prenom" value={form.prenom} onChange={handleChange} fullWidth required error={errors.prenom} helperText={errors.prenom ? "Champ obligatoire" : ""} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Nom *" name="nom" value={form.nom} onChange={handleChange} fullWidth required error={errors.nom} helperText={errors.nom ? "Champ obligatoire" : ""} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Email Professionnel *" name="email" value={form.email} onChange={handleChange} fullWidth type="email" required error={errors.email} helperText={errors.email ? "Email invalide" : ""} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Téléphone" name="telephone" value={form.telephone} onChange={handleChange} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="CIN" name="cin" value={form.cin} onChange={handleChange} fullWidth />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1, "&::before": { content: '""', width: 4, height: 20, bgcolor: SECONDARY, borderRadius: 1, display: "block" } }}>
              Cursus Académique
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Établissement / École *" name="etablissements" value={form.etablissements} onChange={handleChange} fullWidth required error={errors.etablissements} helperText={errors.etablissements ? "Champ obligatoire" : ""} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Niveau d'études *" name="niveau_etudes" value={form.niveau_etudes} onChange={handleChange} fullWidth required error={errors.niveau_etudes} helperText={errors.niveau_etudes ? "Champ obligatoire" : ""}>
                  <MenuItem value=""><em>Sélectionner</em></MenuItem>
                  {NIVEAUX.map((n) => (
                    <MenuItem key={n} value={n}>{n}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Spécialisation" name="specialisation" value={form.specialisation} onChange={handleChange} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Type de stage" name="type_stage" value={form.type_stage} onChange={handleChange} fullWidth>
                  <MenuItem value=""><em>Sélectionner</em></MenuItem>
                  {TYPES_STAGE.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1, "&::before": { content: '""', width: 4, height: 20, bgcolor: SECONDARY, borderRadius: 1, display: "block" } }}>
              Détails du Stage
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Date de début *" name="date_debut" type="date" value={form.date_debut} onChange={handleChange} fullWidth slotProps={{ inputLabel: { shrink: true } }} required error={errors.date_debut} helperText={errors.date_debut ? "Champ obligatoire" : ""} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Date de fin *" name="date_fin" type="date" value={form.date_fin} onChange={handleChange} fullWidth slotProps={{ inputLabel: { shrink: true } }} required error={errors.date_fin} helperText={errors.date_fin ? "Champ obligatoire" : ""} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Département d'accueil" name="departements" value={form.departements} onChange={handleChange} fullWidth>
                  <MenuItem value=""><em>Sélectionner</em></MenuItem>
                  {departements.map((d) => (
                    <MenuItem key={d.id} value={d.nom}>{d.nom}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Maître de stage (Encadrant)" name="encadrant_id" value={form.encadrant_id} onChange={handleChange} fullWidth>
                  <MenuItem value=""><em>Aucun</em></MenuItem>
                  {encadrants.map((enc) => (
                    <MenuItem key={enc.id} value={enc.id}>{enc.prenom} {enc.nom}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Statut" name="statut" value={form.statut} onChange={handleChange} fullWidth>
                  {STATUTS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <FormControlLabel
              control={<Checkbox name="notifier_email" checked={form.notifier_email} onChange={handleChange} sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }} />}
              label={<Typography variant="body2" sx={{ color: TEXT_LIGHT }}>Notifier par email</Typography>}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 3, pt: 1, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined"
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600, px: 3, borderColor: BORDER, color: TEXT, "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT } }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSubmit}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16224a" }, borderRadius: 3, textTransform: "none", fontWeight: 600, px: 4 }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Stagiaires;