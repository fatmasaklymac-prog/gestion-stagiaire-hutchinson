import { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Tooltip, Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT = "#1F2937";
const TEXT_LIGHT = "#6B7280";
const BLUE_LIGHT = "#E8F0FE";

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [open, setOpen] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [idEnCours, setIdEnCours] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    titre: "", date: "", heure: "", salle: "", description: "",
  });

  const chargerDonnees = () => {
    fetch(`${API_URL}/sessions`)
      .then((r) => r.json())
      .then(setSessions)
      .catch((err) => console.error("Erreur sessions:", err));
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const ouvrirAjout = () => {
    setModeEdition(false);
    setIdEnCours(null);
    setErrors({});
    setForm({ titre: "", date: "", heure: "", salle: "", description: "" });
    setOpen(true);
  };

  const ouvrirModification = (session) => {
    setModeEdition(true);
    setIdEnCours(session.id);
    setErrors({});
    setForm({
      titre: session.titre || "",
      date: session.date || "",
      heure: session.heure || "",
      salle: session.salle || "",
      description: session.description || "",
    });
    setOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.titre.trim()) newErrors.titre = true;
    if (!form.date.trim()) newErrors.date = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const url = modeEdition ? `${API_URL}/sessions/${idEnCours}` : `${API_URL}/sessions`;
    const method = modeEdition ? "PUT" : "POST";

    const dataToSend = {
      titre: form.titre.trim(),
      date_session: form.date.trim(),
      heure: form.heure?.trim() || null,
      salle: form.salle?.trim() || null,
      description: form.description?.trim() || null,
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

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer cette session ?")) return;
    fetch(`${API_URL}/sessions/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => chargerDonnees());
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const sessionsTriees = [...sessions].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
            Sessions de formation
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT, fontSize: 14 }}>
            {sessionsTriees.length} session{sessionsTriees.length > 1 ? "s" : ""} au total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={ouvrirAjout}
          sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16224a" }, borderRadius: 3, textTransform: "none", fontWeight: 600, px: 3, py: 1 }}>
          Nouvelle Session
        </Button>
      </Box>

      {/* Tableau */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: BORDER, overflow: "hidden", bgcolor: WHITE }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              {["Session", "Date", "Heure", "Salle"].map((h) => (
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
            {sessionsTriees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", py: 6, borderBottom: "none" }}>
                  <Typography sx={{ color: TEXT_LIGHT }}>Aucune session programmée pour le moment.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sessionsTriees.map((s) => (
                <TableRow key={s.id} hover sx={{ transition: "all 0.2s ease", "&:hover": { bgcolor: "#F8FAFC" }, "&:last-child td": { borderBottom: "none" } }}>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}>{s.titre}</Typography>
                    {s.description && (
                      <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.8rem", mt: 0.3 }}>{s.description}</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2, color: TEXT, fontSize: "0.85rem" }}>
                    {formatDate(s.date)}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: TEXT_LIGHT }}>
                      <AccessTimeFilledIcon sx={{ fontSize: 15 }} />
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{s.heure || "—"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: TEXT_LIGHT }}>
                      <LocationOnIcon sx={{ fontSize: 15 }} />
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{s.salle || "—"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); ouvrirModification(s); }} sx={{ color: PRIMARY }}>
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Formulaire */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: "hidden" } } }}>
        <DialogTitle sx={{ bgcolor: PRIMARY, color: "white", py: 2.5, px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {modeEdition ? "Modifier la Session" : "Nouvelle Session"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Titre *" name="titre" value={form.titre} onChange={handleChange} fullWidth
                error={errors.titre} helperText={errors.titre ? "Champ obligatoire" : ""} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Date *" name="date" type="date" value={form.date} onChange={handleChange} fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={errors.date} helperText={errors.date ? "Champ obligatoire" : ""} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Heure" name="heure" type="time" value={form.heure} onChange={handleChange} fullWidth
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Salle" name="salle" value={form.salle} onChange={handleChange} fullWidth placeholder="Salle A4, Distanciel..." />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={3} />
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
    </Box>
  );
}

export default Sessions;