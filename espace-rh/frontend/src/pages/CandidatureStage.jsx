import { useState } from "react";
import {
  Box, Paper, Typography, TextField, MenuItem, Button, Grid, Alert,
  CircularProgress, Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { Link } from "react-router-dom";

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

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

function CandidatureStage() {
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", telephone: "", cin: "",
    etablissements: "", niveau_etudes: "", specialisation: "",
    type_stage: "", departements: "", date_debut: "", date_fin: "",
  });
  const [cvFile, setCvFile] = useState(null);
  const [lettreFile, setLettreFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(null);
  const [erreurGlobale, setErreurGlobale] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const validateForm = () => {
    const required = [
      "prenom", "nom", "email", "etablissements", "niveau_etudes",
      "specialisation", "type_stage", "departements", "date_debut", "date_fin",
    ];
    const newErrors = {};
    required.forEach((f) => {
      if (!form[f] || String(form[f]).trim() === "") newErrors[f] = true;
    });
    if (form.email && !form.email.includes("@")) newErrors.email = true;
    if (!cvFile) newErrors.cv = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploaderFichier = async (fichier) => {
    const data = new FormData();
    data.append("fichier", fichier);
    const r = await fetch(`${API_URL}/demandes-stage/upload-document`, {
      method: "POST",
      body: data,
    });
    if (!r.ok) throw new Error("Échec de l'envoi du fichier");
    const json = await r.json();
    return json.url;
  };

  const handleSubmit = async () => {
    setErreurGlobale("");
    if (!validateForm()) return;
    setLoading(true);
    try {
      const cvUrl = await uploaderFichier(cvFile);
      const lettreUrl = lettreFile ? await uploaderFichier(lettreFile) : null;

      const r = await fetch(`${API_URL}/demandes-stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cv_url: cvUrl,
          lettre_motivation_url: lettreUrl,
        }),
      });
      if (!r.ok) {
        const errJson = await r.json().catch(() => ({}));
        throw new Error(errJson.detail || "Erreur lors de l'envoi de la candidature");
      }
      const demande = await r.json();
      setSucces(demande);
    } catch (err) {
      setErreurGlobale(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (succes) {
    return (
      <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: "1px solid", borderColor: BORDER, maxWidth: 480, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: PRIMARY, mb: 2 }}>
            Candidature envoyée !
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT, mb: 3 }}>
            Merci {succes.prenom}, votre candidature a bien été enregistrée (référence n°{succes.id}).
            Conservez votre email pour suivre son avancement.
          </Typography>
          <Button component={Link} to="/suivi-candidature" variant="contained"
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16224a" }, borderRadius: 3, textTransform: "none", fontWeight: 600 }}>
            Suivre ma candidature
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 5 }, display: "flex", justifyContent: "center" }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid", borderColor: BORDER, maxWidth: 720, width: "100%", bgcolor: WHITE }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, mb: 1 }}>
          Candidature à un stage
        </Typography>
        <Typography sx={{ color: TEXT_LIGHT, mb: 3 }}>
          Remplissez ce formulaire pour soumettre votre candidature.
        </Typography>

        {erreurGlobale && <Alert severity="error" sx={{ mb: 2 }}>{erreurGlobale}</Alert>}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Prénom *" name="prenom" value={form.prenom} onChange={handleChange} fullWidth error={errors.prenom} helperText={errors.prenom ? "Champ obligatoire" : ""} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Nom *" name="nom" value={form.nom} onChange={handleChange} fullWidth error={errors.nom} helperText={errors.nom ? "Champ obligatoire" : ""} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Email *" name="email" type="email" value={form.email} onChange={handleChange} fullWidth error={errors.email} helperText={errors.email ? "Email invalide" : ""} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Téléphone" name="telephone" value={form.telephone} onChange={handleChange} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="CIN" name="cin" value={form.cin} onChange={handleChange} fullWidth />
          </Grid>

          <Grid size={12}><Divider /></Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Établissement *" name="etablissements" value={form.etablissements} onChange={handleChange} fullWidth error={errors.etablissements} helperText={errors.etablissements ? "Champ obligatoire" : ""} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Niveau d'études *" name="niveau_etudes" value={form.niveau_etudes} onChange={handleChange} fullWidth error={errors.niveau_etudes} helperText={errors.niveau_etudes ? "Champ obligatoire" : ""}>
              <MenuItem value=""><em>Sélectionner</em></MenuItem>
              {NIVEAUX.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField label="Spécialisation *" name="specialisation" value={form.specialisation} onChange={handleChange} fullWidth error={errors.specialisation} helperText={errors.specialisation ? "Champ obligatoire" : ""} />
          </Grid>

          <Grid size={12}><Divider /></Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Type de stage *" name="type_stage" value={form.type_stage} onChange={handleChange} fullWidth error={errors.type_stage} helperText={errors.type_stage ? "Champ obligatoire" : ""}>
              <MenuItem value=""><em>Sélectionner</em></MenuItem>
              {TYPES_STAGE.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Département souhaité *" name="departements" value={form.departements} onChange={handleChange} fullWidth error={errors.departements} helperText={errors.departements ? "Champ obligatoire" : ""} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Date de début *" name="date_debut" type="date" value={form.date_debut} onChange={handleChange} fullWidth slotProps={{ inputLabel: { shrink: true } }} error={errors.date_debut} helperText={errors.date_debut ? "Champ obligatoire" : ""} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Date de fin *" name="date_fin" type="date" value={form.date_fin} onChange={handleChange} fullWidth slotProps={{ inputLabel: { shrink: true } }} error={errors.date_fin} helperText={errors.date_fin ? "Champ obligatoire" : ""} />
          </Grid>

          <Grid size={12}><Divider /></Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Button component="label" variant="outlined" fullWidth
              sx={{ borderRadius: 2, textTransform: "none", justifyContent: "flex-start", borderColor: errors.cv ? SECONDARY : BORDER, color: errors.cv ? SECONDARY : "inherit" }}>
              {cvFile ? cvFile.name : "CV (PDF/DOC) *"}
              <input type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => { setCvFile(e.target.files[0]); setErrors((p) => ({ ...p, cv: false })); }} />
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button component="label" variant="outlined" fullWidth sx={{ borderRadius: 2, textTransform: "none", justifyContent: "flex-start" }}>
              {lettreFile ? lettreFile.name : "Lettre de motivation (optionnel)"}
              <input type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => setLettreFile(e.target.files[0])} />
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#16224a" }, borderRadius: 3, textTransform: "none", fontWeight: 600, px: 4 }}>
            {loading ? "Envoi..." : "Envoyer ma candidature"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default CandidatureStage;
