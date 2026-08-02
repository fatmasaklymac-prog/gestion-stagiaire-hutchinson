import { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton,
  MenuItem, Avatar, Grid, Divider, InputAdornment, Tooltip, Collapse, Alert
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";

const STATUTS = [
  { value: "en_attente", label: "En attente" },
  { value: "en_etude", label: "En étude" },
  { value: "entretien_programme", label: "Entretien programmé" },
  { value: "acceptee", label: "Acceptée" },
  { value: "refusee", label: "Refusée" },
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
const RED_LIGHT = "#FDECEC";
const PURPLE_LIGHT = "#F3E5F5";

function getChipProps(statut) {
  switch (statut) {
    case "en_attente":
      return { label: "En attente", sx: { bgcolor: ORANGE_LIGHT, color: WARNING, fontWeight: 600, borderRadius: 2 } };
    case "en_etude":
      return { label: "En étude", sx: { bgcolor: BLUE_LIGHT, color: "#1565c0", fontWeight: 600, borderRadius: 2 } };
    case "entretien_programme":
      return { label: "Entretien programmé", sx: { bgcolor: PURPLE_LIGHT, color: "#7b1fa2", fontWeight: 600, borderRadius: 2 } };
    case "acceptee":
      return { label: "Acceptée", sx: { bgcolor: GREEN_LIGHT, color: SUCCESS, fontWeight: 600, borderRadius: 2 } };
    case "refusee":
      return { label: "Refusée", sx: { bgcolor: RED_LIGHT, color: SECONDARY, fontWeight: 600, borderRadius: 2 } };
    default:
      return { label: statut, sx: { bgcolor: "#f5f5f5", color: TEXT_LIGHT, fontWeight: 600, borderRadius: 2 } };
  }
}

function DemandesStage() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ statut: "" });
  const [activeFilters, setActiveFilters] = useState({ statut: "" });

  const [open, setOpen] = useState(false);
  const [demandeCourante, setDemandeCourante] = useState(null);
  const [form, setForm] = useState({
    statut: "en_attente",
    commentaire_rh: "",
    message_candidat: "",
    date_entretien: "",
    heure_entretien: "",
    lieu_entretien: "",
  });
  const [erreur, setErreur] = useState("");

  const chargerDemandes = () => {
    setLoading(true);
    fetch(`${API_URL}/demandes-stage`, { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error("Erreur lors du chargement");
        return r.json();
      })
      .then((data) => {
        setDemandes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    chargerDemandes();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setFilters({ statut: "" });
    setActiveFilters({ statut: "" });
  };

  const hasActiveFilters = activeFilters.statut !== "";

  const ouvrirDetail = (demande) => {
    setDemandeCourante(demande);
    setErreur("");
    setForm({
      statut: demande.statut || "en_attente",
      commentaire_rh: demande.commentaire_rh || "",
      message_candidat: demande.message_candidat || "",
      date_entretien: demande.date_entretien || "",
      heure_entretien: demande.heure_entretien || "",
      lieu_entretien: demande.lieu_entretien || "",
    });
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!demandeCourante) return;
    fetch(`${API_URL}/demandes-stage/${demandeCourante.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(form),
    })
      .then(async (r) => {
        if (!r.ok) {
          const txt = await r.text();
          throw new Error(txt);
        }
        return r.json();
      })
      .then(() => {
        chargerDemandes();
        setOpen(false);
      })
      .catch((err) => {
        console.error("Erreur:", err);
        alert("Erreur lors de la mise à jour : " + err.message);
      });
  };

  const handleConvertir = (demande, e) => {
    if (e) e.stopPropagation();
    if (demande.stagiaire_id_cree) return;
    if (!window.confirm(`Convertir la candidature de ${demande.prenom} ${demande.nom} en stagiaire ?`)) return;
    fetch(`${API_URL}/demandes-stage/${demande.id}/convertir`, {
      method: "POST",
      headers: authHeaders(),
    })
      .then(async (r) => {
        const txt = await r.text();
        if (!r.ok) {
          let detail;
          try { detail = JSON.parse(txt).detail; } catch { detail = txt; }
          throw new Error(detail);
        }
        return JSON.parse(txt);
      })
      .then(() => {
        chargerDemandes();
      })
      .catch((err) => {
        alert("Impossible de convertir : " + err.message);
      });
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer définitivement cette demande de stage ?")) return;
    fetch(`${API_URL}/demandes-stage/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then(() => chargerDemandes());
  };

  const getInitials = (prenom, nom) => `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();

  const getAvatarColor = (id) => {
    const colors = [PRIMARY, SECONDARY, "#64748B", "#77767B", "#1565c0", SUCCESS];
    return colors[id % colors.length];
  };

  const filteredDemandes = demandes.filter((d) => {
    const searchLower = search.toLowerCase();
    const matchSearch = `${d.prenom} ${d.nom} ${d.email} ${d.etablissements}`.toLowerCase().includes(searchLower);
    const matchStatut = !activeFilters.statut || d.statut === activeFilters.statut;
    return matchSearch && matchStatut;
  });

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
            Demandes de Stage
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT, fontSize: 14 }}>
            {filteredDemandes.length} candidature{filteredDemandes.length > 1 ? "s" : ""} affichée{filteredDemandes.length > 1 ? "s" : ""}
            {hasActiveFilters && ` (filtrées sur ${demandes.length})`}
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: filtersOpen ? 0 : 3, borderRadius: filtersOpen ? "16px 16px 0 0" : 4, border: "1px solid", borderColor: BORDER, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", bgcolor: WHITE }}>
        <TextField placeholder="Rechercher par nom, email, établissement..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ flex: 1, minWidth: 250 }}
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
            borderRadius: 3, textTransform: "none", fontWeight: 600,
            ...(filtersOpen || hasActiveFilters
              ? { bgcolor: PRIMARY, color: "white", "&:hover": { bgcolor: "#16224a" } }
              : { borderColor: BORDER, color: TEXT, "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT } }),
          }}
        >
          Filtres {hasActiveFilters && "●"}
        </Button>
      </Paper>

      <Collapse in={filtersOpen}>
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: "0 0 16px 16px", border: "1px solid", borderColor: BORDER, borderTop: "none", bgcolor: WHITE }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField select fullWidth size="small" label="Statut" name="statut" value={filters.statut} onChange={handleFilterChange} slotProps={{ inputLabel: { shrink: true } }}>
                <MenuItem value=""><em>Tous</em></MenuItem>
                {STATUTS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button onClick={resetFilters} variant="outlined" size="small"
              sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600, borderColor: BORDER, color: TEXT, "&:hover": { borderColor: SECONDARY, color: SECONDARY, bgcolor: RED_LIGHT } }}>
              Réinitialiser
            </Button>
            <Button onClick={applyFilters} variant="contained" size="small"
              sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600, bgcolor: PRIMARY, "&:hover": { bgcolor: "#16224a" } }}>
              Appliquer
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {hasActiveFilters && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={`Statut: ${STATUTS.find((s) => s.value === activeFilters.statut)?.label}`}
            size="small"
            onDelete={() => { setActiveFilters({ statut: "" }); setFilters({ statut: "" }); }}
            sx={{ bgcolor: BLUE_LIGHT, color: PRIMARY, fontWeight: 600 }}
          />
        </Box>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: BORDER, overflow: "hidden", bgcolor: WHITE }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              {["Candidat", "Contact", "Établissement / Niveau", "Type de stage", "Département souhaité", "Dates souhaitées", "Statut"].map((h) => (
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
            {filteredDemandes.map((d) => (
              <TableRow key={d.id} hover onClick={() => ouvrirDetail(d)}
                sx={{ cursor: "pointer", transition: "all 0.2s ease", "&:hover": { bgcolor: "#F8FAFC" }, "&:last-child td": { borderBottom: "none" } }}>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: getAvatarColor(d.id), width: 44, height: 44, fontSize: 15, fontWeight: 700 }}>
                      {getInitials(d.prenom, d.nom)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}>{d.prenom} {d.nom}</Typography>
                      <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>Dossier n°{d.id}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: TEXT, fontSize: "0.85rem" }}>
                    <EmailIcon sx={{ fontSize: 14, color: TEXT_LIGHT }} />{d.email || "—"}
                  </Typography>
                  <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, color: TEXT, fontSize: "0.85rem" }}>
                    <PhoneIcon sx={{ fontSize: 14, color: TEXT_LIGHT }} />{d.telephone || "—"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Typography variant="body2" fontWeight={500} sx={{ color: TEXT, fontSize: "0.85rem" }}>{d.etablissements}</Typography>
                  <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontStyle: "italic", fontSize: "0.75rem" }}>{d.niveau_etudes}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Chip label={d.type_stage} size="small" sx={{ bgcolor: PURPLE_LIGHT, color: "#7b1fa2", fontWeight: 600, borderRadius: 1.5, fontSize: "0.75rem" }} />
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Chip label={d.departements} size="small" sx={{ bgcolor: BLUE_LIGHT, color: "#1565c0", fontWeight: 600, borderRadius: 1.5, fontSize: "0.75rem" }} />
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Typography variant="body2" sx={{ color: TEXT, fontSize: "0.85rem" }}>{d.date_debut} → {d.date_fin}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Chip size="small" {...getChipProps(d.statut)} />
                  {d.stagiaire_id_cree && (
                    <Chip size="small" icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} label="Converti" sx={{ ml: 0.5, bgcolor: GREEN_LIGHT, color: SUCCESS, fontWeight: 600 }} />
                  )}
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                  <Tooltip title="Voir / Traiter">
                    <IconButton size="small" onClick={() => ouvrirDetail(d)} sx={{ color: PRIMARY }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={d.stagiaire_id_cree ? "Déjà converti" : "Convertir en stagiaire"}>
                    <span>
                      <IconButton size="small" disabled={Boolean(d.stagiaire_id_cree)} onClick={(e) => handleConvertir(d, e)} sx={{ color: SUCCESS }}>
                        <SwapHorizIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" onClick={(e) => handleDelete(d.id, e)} sx={{ color: SECONDARY }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md"
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: "hidden" } } }}>
        <DialogTitle sx={{ bgcolor: PRIMARY, color: "white", py: 2.5, px: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 36, height: 36 }}>
            <VisibilityIcon sx={{ fontSize: 20, color: "white" }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {demandeCourante ? `${demandeCourante.prenom} ${demandeCourante.nom}` : ""}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Traiter la candidature — dossier n°{demandeCourante?.id}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 3 }}>
          {demandeCourante && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2 }}>
                  Récapitulatif de la candidature
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>Email</Typography>
                    <Typography variant="body2" sx={{ color: TEXT }}>{demandeCourante.email}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>Téléphone</Typography>
                    <Typography variant="body2" sx={{ color: TEXT }}>{demandeCourante.telephone || "—"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>Établissement / Niveau</Typography>
                    <Typography variant="body2" sx={{ color: TEXT }}>{demandeCourante.etablissements} — {demandeCourante.niveau_etudes}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>Spécialisation</Typography>
                    <Typography variant="body2" sx={{ color: TEXT }}>{demandeCourante.specialisation || "—"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>Type de stage souhaité</Typography>
                    <Typography variant="body2" sx={{ color: TEXT }}>{demandeCourante.type_stage} — {demandeCourante.departements}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>Dates souhaitées</Typography>
                    <Typography variant="body2" sx={{ color: TEXT }}>{demandeCourante.date_debut} → {demandeCourante.date_fin}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>CV</Typography>
                    {demandeCourante.cv_url ? (
                      <a href={demandeCourante.cv_url?.startsWith("http") ? demandeCourante.cv_url : `${API_URL}${demandeCourante.cv_url}`} target="_blank" rel="noreferrer" style={{ color: PRIMARY, fontWeight: 600, fontSize: "0.85rem" }}>
                        Télécharger le CV
                      </a>
                    ) : <Typography variant="body2" sx={{ color: TEXT }}>—</Typography>}
                  </Grid>
                  {demandeCourante.lettre_motivation_url && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>Lettre de motivation</Typography>
                      <a href={`${API_URL}${demandeCourante.lettre_motivation_url}`} target="_blank" rel="noreferrer" style={{ color: PRIMARY, fontWeight: 600, fontSize: "0.85rem" }}>
                        Télécharger la lettre
                      </a>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2 }}>
                  Traitement RH
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField select fullWidth label="Statut" name="statut" value={form.statut} onChange={handleChange}>
                      {STATUTS.map((s) => (
                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} />
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField label="Date d'entretien" name="date_entretien" type="date" value={form.date_entretien} onChange={handleChange} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField label="Heure" name="heure_entretien" type="time" value={form.heure_entretien} onChange={handleChange} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField label="Lieu / lien" name="lieu_entretien" value={form.lieu_entretien} onChange={handleChange} fullWidth />
                  </Grid>
                  <Grid size={12}>
                    <TextField label="Commentaire RH (interne, non visible par le candidat)" name="commentaire_rh" value={form.commentaire_rh} onChange={handleChange} fullWidth multiline minRows={2} />
                  </Grid>
                  <Grid size={12}>
                    <TextField label="Message visible par le candidat" name="message_candidat" value={form.message_candidat} onChange={handleChange} fullWidth multiline minRows={2} />
                  </Grid>
                </Grid>
              </Box>

              {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}
            </>
          )}
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

export default DemandesStage;
