import { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton,
  Avatar, Grid, Tooltip, List, ListItem, ListItemText, ListItemAvatar, MenuItem, Collapse, FormControl, InputLabel, Select, InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import { DEPARTEMENTS } from "./Departements";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";

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

function Encadrants() {
  const [encadrants, setEncadrants] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [encadrantDetail, setEncadrantDetail] = useState(null);
  const [modeEdition, setModeEdition] = useState(false);
  const [idEnCours, setIdEnCours] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [encadrantToDelete, setEncadrantToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    departement: "",
  });
  const [activeFilters, setActiveFilters] = useState({
    departement: "",
  });

  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "", departement: "",
  });

  const chargerDonnees = () => {
    fetch(`${API_URL}/encadrants`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setEncadrants);
    fetch(`${API_URL}/stagiaires`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setStagiaires);
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
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
    const empty = { departement: "" };
    setFilters(empty);
    setActiveFilters(empty);
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== "");

  const ouvrirAjout = () => {
    setModeEdition(false);
    setIdEnCours(null);
    setErrors({});
    setForm({ nom: "", prenom: "", email: "", telephone: "", departement: "" });
    setOpen(true);
  };

  const ouvrirModification = (encadrant) => {
    setModeEdition(true);
    setIdEnCours(encadrant.id);
    setErrors({});
    setForm({
      nom: encadrant.nom || "",
      prenom: encadrant.prenom || "",
      email: encadrant.email || "",
      telephone: encadrant.telephone || "",
      departement: encadrant.departement || "",
    });
    setOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.nom.trim()) newErrors.nom = true;
    if (!form.prenom.trim()) newErrors.prenom = true;
    if (form.email && !form.email.includes("@")) newErrors.email = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const url = modeEdition ? `${API_URL}/encadrants/${idEnCours}` : `${API_URL}/encadrants`;
    const method = modeEdition ? "PUT" : "POST";

    const dataToSend = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email?.trim() || null,
      telephone: form.telephone?.trim() || null,
      departement: form.departement?.trim() || null,
    };

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(dataToSend),
    })
      .then(async (r) => {
        if (!r.ok) {
          const errorData = await r.json().catch(() => ({}));
          throw new Error(JSON.stringify(errorData));
        }
        return r.json();
      })
      .then(() => {
        chargerDonnees();
        setOpen(false);
      })
      .catch((err) => alert("Erreur lors de l'enregistrement: " + err.message));
  };

  const handleDelete = (encadrant, e) => {
    e.stopPropagation();
    setEncadrantToDelete(encadrant);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!encadrantToDelete) return;
    fetch(`${API_URL}/encadrants/${encadrantToDelete.id}`, { method: "DELETE", headers: authHeaders() })
      .then(() => {
        chargerDonnees();
        setDeleteOpen(false);
        setEncadrantToDelete(null);
      });
  };

  const ouvrirDetail = (encadrant, e) => {
    if (e) e.stopPropagation();
    setEncadrantDetail(encadrant);
    setDetailOpen(true);
  };

  const getStagiairesDe = (encadrantId) =>
    stagiaires.filter((s) => s.encadrant_id === encadrantId);

  const getNbActifs = (encadrantId) =>
    stagiaires.filter((s) => s.encadrant_id === encadrantId && s.statut === "en_cours").length;

  const getInitials = (prenom, nom) => `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();

  const getAvatarColor = (id) => {
    const colors = [PRIMARY, SECONDARY, "#64748B", "#1565c0", SUCCESS, WARNING];
    return colors[id % colors.length];
  };

  const getChargeChip = (nb) => {
    if (nb === 0) return { label: "0 stagiaire", sx: { bgcolor: "#f5f5f5", color: TEXT_LIGHT } };
    if (nb <= 2) return { label: `${nb} stagiaire${nb > 1 ? "s" : ""}`, sx: { bgcolor: GREEN_LIGHT, color: SUCCESS } };
    return { label: `${nb} stagiaires`, sx: { bgcolor: ORANGE_LIGHT, color: WARNING } };
  };

  // ─── FILTRES ───
  const filteredEncadrants = encadrants.filter((enc) => {
    const searchLower = search.toLowerCase();
    const matchSearch = `${enc.prenom} ${enc.nom} ${enc.email}`.toLowerCase().includes(searchLower);
    const matchDept = !activeFilters.departement || enc.departement === activeFilters.departement;
    return matchSearch && matchDept;
  });

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
            Encadrants
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT, fontSize: 14 }}>
            {filteredEncadrants.length} encadrant{filteredEncadrants.length > 1 ? "s" : ""} affiché{filteredEncadrants.length > 1 ? "s" : ""}
            {hasActiveFilters && ` (sur ${encadrants.length})`}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={ouvrirAjout}
          sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16224a" }, borderRadius: 3, textTransform: "none", fontWeight: 600, px: 3, py: 1 }}>
          Nouvel Encadrant
        </Button>
      </Box>

      {/* Barre de recherche + filtres */}
      <Paper elevation={0} sx={{ p: 2, mb: filtersOpen ? 0 : 3, borderRadius: filtersOpen ? "16px 16px 0 0" : 4, border: "1px solid", borderColor: BORDER, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", bgcolor: WHITE }}>
        <TextField
          placeholder="Rechercher par nom, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
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
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Département</InputLabel>
                <Select
                  name="departement"
                  value={filters.departement}
                  onChange={handleFilterChange}
                  label="Département"
                >
                  <MenuItem value=""><em>Tous</em></MenuItem>
                  {DEPARTEMENTS.map((d) => (
                    <MenuItem key={d.nom} value={d.nom}>{d.nom}</MenuItem>
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
        </Box>
      )}

      {/* Tableau */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: BORDER, overflow: "hidden", bgcolor: WHITE }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              {["Encadrant", "Contact", "Département", "Charge actuelle"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: PRIMARY, borderBottom: "none", py: 1.5 }}>
                  {h}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 700, color: PRIMARY, borderBottom: "none", py: 1.5 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEncadrants.map((enc) => {
              const nbActifs = getNbActifs(enc.id);
              const chargeProps = getChargeChip(nbActifs);
              return (
                <TableRow key={enc.id} hover onClick={(e) => ouvrirDetail(enc, e)}
                  sx={{ cursor: "pointer", transition: "all 0.2s ease", "&:hover": { bgcolor: "#F8FAFC" }, "&:last-child td": { borderBottom: "none" } }}>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: getAvatarColor(enc.id), width: 44, height: 44, fontSize: 15, fontWeight: 700 }}>
                        {getInitials(enc.prenom, enc.nom)}
                      </Avatar>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}>
                        {enc.prenom} {enc.nom}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: TEXT, fontSize: "0.85rem" }}>
                        <PhoneIcon sx={{ fontSize: 14, color: TEXT_LIGHT }} />{enc.telephone || "—"}
                      </Typography>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, color: TEXT, fontSize: "0.85rem" }}>
                        <EmailIcon sx={{ fontSize: 14, color: TEXT_LIGHT }} />{enc.email || "—"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    {enc.departement ? (
                      <Chip label={enc.departement} size="small" sx={{ bgcolor: BLUE_LIGHT, color: "#1565c0", fontWeight: 600, borderRadius: 1.5, fontSize: "0.75rem" }} />
                    ) : "—"}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    <Chip size="small" {...chargeProps} sx={{ ...chargeProps.sx, fontWeight: 600, borderRadius: 2 }} />
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    <Tooltip title="Voir les stagiaires">
                      <IconButton size="small" onClick={(e) => ouvrirDetail(enc, e)} sx={{ color: PRIMARY }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); ouvrirModification(enc); }} sx={{ color: PRIMARY }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" onClick={(e) => handleDelete(enc, e)} sx={{ color: SECONDARY }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Formulaire */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: "hidden" } } }}>
        <DialogTitle sx={{ bgcolor: PRIMARY, color: "white", py: 2.5, px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {modeEdition ? "Modifier l'Encadrant" : "Nouvel Encadrant"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Prénom *" name="prenom" value={form.prenom} onChange={handleChange} fullWidth
                error={errors.prenom} helperText={errors.prenom ? "Champ obligatoire" : ""} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Nom *" name="nom" value={form.nom} onChange={handleChange} fullWidth
                error={errors.nom} helperText={errors.nom ? "Champ obligatoire" : ""} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth
                error={errors.email} helperText={errors.email ? "Email invalide" : ""} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Téléphone" name="telephone" value={form.telephone} onChange={handleChange} fullWidth placeholder="+212 6 00 00 00 00" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField select label="Département" name="departement" value={form.departement} onChange={handleChange} fullWidth>
                <MenuItem value=""><em>Sélectionner</em></MenuItem>
                {DEPARTEMENTS.map((d) => (
                  <MenuItem key={d.nom} value={d.nom}>{d.nom}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3, pt: 1, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined"
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600, px: 3, borderColor: BORDER, color: TEXT }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSubmit}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16224a" }, borderRadius: 3, textTransform: "none", fontWeight: 600, px: 4 }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Détail */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: "hidden" } } }}>
        {encadrantDetail && (
          <>
            <DialogTitle sx={{ bgcolor: PRIMARY, color: "white", py: 2.5, px: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 36, height: 36 }}>
                {getInitials(encadrantDetail.prenom, encadrantDetail.nom)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {encadrantDetail.prenom} {encadrantDetail.nom}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  {getStagiairesDe(encadrantDetail.id).length} stagiaire(s) au total
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              {getStagiairesDe(encadrantDetail.id).length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography sx={{ color: TEXT_LIGHT }}>Aucun stagiaire encadré pour le moment.</Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {getStagiairesDe(encadrantDetail.id).map((s) => (
                    <ListItem key={s.id} sx={{ borderBottom: "1px solid #f1f5f9", py: 1.5, px: 3 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: BLUE_LIGHT, color: "#1565c0" }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.prenom} {s.nom}</Typography>}
                        secondary={s.specialisation || "Stagiaire"}
                      />
                      <Chip
                        size="small"
                        label={s.statut === "en_cours" ? "En cours" : s.statut === "termine" ? "Terminé" : "En attente"}
                        sx={{
                          bgcolor: s.statut === "en_cours" ? GREEN_LIGHT : s.statut === "termine" ? "#f5f5f5" : ORANGE_LIGHT,
                          color: s.statut === "en_cours" ? SUCCESS : s.statut === "termine" ? TEXT_LIGHT : WARNING,
                          fontWeight: 600,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
              <Button onClick={() => setDetailOpen(false)} variant="outlined"
                sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600, px: 3, borderColor: BORDER, color: TEXT }}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: `${SECONDARY}1A`, color: SECONDARY, width: 40, height: 40 }}>
              <DeleteIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, color: TEXT }}>
              Confirmer la suppression
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: TEXT, fontSize: "0.95rem" }}>
            Êtes-vous sûr de vouloir supprimer l'encadrant{" "}
            <strong>{encadrantToDelete?.prenom} {encadrantToDelete?.nom}</strong> ?
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 1 }}>
            Cette action est irréversible. Les stagiaires associés seront désassociés de cet encadrant.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              borderColor: BORDER,
              color: TEXT,
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Encadrants;