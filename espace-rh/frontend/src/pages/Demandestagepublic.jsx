import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Divider,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EventIcon from "@mui/icons-material/Event";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

const API_URL = "http://127.0.0.1:8001";

// Palette cohérente avec le reste de l'application (Stagiaires.jsx, Departements.jsx...)
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SECONDARY_HOVER = "#c11a1f";
const BACKGROUND = "#F5F7FB";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

const NIVEAUX = [
  "Bac +2 (BTS/DUT)",
  "Bac +3 (Licence)",
  "Bac +5 (Master/Ingénieur)",
];

const TYPES_STAGE = [
  "PFE (Projet Fin d'Études)",
  "PFA (Projet de Fin d'Année)",
  "Stage d'été",
  "Stage d'initiation",
  "Stage de perfectionnement",
];

const CHAMPS_INITIAUX = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  cin: "",
  etablissements: "",
  niveau_etudes: "",
  specialisation: "",
  type_stage: "",
  departements: "",
  date_debut: "",
  date_fin: "",
  message: "",
};

// Zone de dépôt de fichier (drag & drop + clic), utilisée pour le CV et la lettre
function ZoneDepotFichier({ label, obligatoire, fichier, onFichierChange, erreur }) {
  const [survole, setSurvole] = useState(false);
  const inputRef = useRef(null);

  const gererFichiers = (fichiers) => {
    if (fichiers && fichiers.length > 0) {
      onFichierChange(fichiers[0]);
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: "#374151" }}>
        {label} {obligatoire && <Box component="span" sx={{ color: SECONDARY }}>*</Box>}
        {!obligatoire && (
          <Typography component="span" variant="caption" sx={{ color: TEXT_LIGHT, ml: 0.5 }}>
            (Facultatif)
          </Typography>
        )}
      </Typography>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setSurvole(true);
        }}
        onDragLeave={() => setSurvole(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvole(false);
          gererFichiers(e.dataTransfer.files);
        }}
        sx={{
          border: "2px dashed",
          borderColor: erreur ? SECONDARY : survole ? SECONDARY : BORDER,
          borderRadius: 2,
          bgcolor: survole ? "rgba(227,30,36,0.05)" : "#FAFAFA",
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.15s ease",
          "&:hover": { borderColor: SECONDARY, bgcolor: "rgba(227,30,36,0.03)" },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.doc,.docx"
          onChange={(e) => gererFichiers(e.target.files)}
        />
        {fichier ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <DescriptionIcon sx={{ color: PRIMARY }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: PRIMARY }}>
              {fichier.name}
            </Typography>
            <Box
              component="span"
              onClick={(e) => {
                e.stopPropagation();
                onFichierChange(null);
              }}
              sx={{ display: "flex", color: TEXT_LIGHT, "&:hover": { color: SECONDARY } }}
            >
              <CloseIcon fontSize="small" />
            </Box>
          </Box>
        ) : (
          <>
            <UploadFileIcon sx={{ fontSize: 32, color: TEXT_LIGHT, mb: 0.5 }} />
            <Typography variant="body2" sx={{ color: "#374151", fontWeight: 500 }}>
              Glissez votre fichier ou cliquez ici
            </Typography>
            <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
              PDF, DOC, DOCX (Max 5 Mo)
            </Typography>
          </>
        )}
      </Box>
      {erreur && (
        <Typography variant="caption" sx={{ color: SECONDARY, mt: 0.5, display: "block" }}>
          {erreur}
        </Typography>
      )}
    </Box>
  );
}

function DemandeStagePublic() {
  const [champs, setChamps] = useState(CHAMPS_INITIAUX);
  const [cv, setCv] = useState(null);
  const [lettreMotivation, setLettreMotivation] = useState(null);
  const [departements, setDepartements] = useState([]);
  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurGenerale, setErreurGenerale] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [demandeCreee, setDemandeCreee] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/departements`)
      .then((r) => r.json())
      .then(setDepartements)
      .catch(() => setDepartements([]));
  }, []);

  const handleChange = (champ) => (event) => {
    setChamps((prec) => ({ ...prec, [champ]: event.target.value }));
    if (erreurs[champ]) {
      setErreurs((prec) => ({ ...prec, [champ]: undefined }));
    }
  };

  const validerFormulaire = () => {
    const nouvellesErreurs = {};
    const obligatoires = [
      "prenom", "nom", "email", "etablissements", "niveau_etudes",
      "specialisation", "type_stage", "departements", "date_debut", "date_fin",
    ];
    obligatoires.forEach((champ) => {
      if (!champs[champ] || champs[champ].trim() === "") {
        nouvellesErreurs[champ] = "Champ obligatoire";
      }
    });
    if (champs.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(champs.email)) {
      nouvellesErreurs.email = "Adresse email invalide";
    }
    if (
      champs.date_debut &&
      champs.date_fin &&
      new Date(champs.date_fin) < new Date(champs.date_debut)
    ) {
      nouvellesErreurs.date_fin = "La date de fin doit être après la date de début";
    }
    if (!cv) {
      nouvellesErreurs.cv = "Le CV est obligatoire";
    }
    setErreurs(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0;
  };

  const uploaderFichier = async (fichier) => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    const reponse = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
    if (!reponse.ok) {
      const texte = await reponse.text();
      throw new Error(`Échec de l'envoi de ${fichier.name} : ${texte}`);
    }
    const donnees = await reponse.json();
    return donnees.url;
  };

  const handleSoumettre = async (e) => {
    e.preventDefault();
    setErreurGenerale("");

    if (!validerFormulaire()) return;

    setEnvoiEnCours(true);
    try {
      // 1. Upload des fichiers d'abord (le CV est obligatoire, la lettre facultative)
      const cvUrl = await uploaderFichier(cv);
      const lettreUrl = lettreMotivation ? await uploaderFichier(lettreMotivation) : null;

      // 2. Création de la demande de stage avec les URLs des fichiers uploadés
      const reponse = await fetch(`${API_URL}/demandes-stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: champs.prenom.trim(),
          nom: champs.nom.trim(),
          email: champs.email.trim(),
          telephone: champs.telephone?.trim() || null,
          cin: champs.cin?.trim() || null,
          etablissements: champs.etablissements.trim(),
          niveau_etudes: champs.niveau_etudes,
          specialisation: champs.specialisation.trim(),
          type_stage: champs.type_stage,
          departements: champs.departements,
          date_debut: champs.date_debut,
          date_fin: champs.date_fin,
          cv_url: cvUrl,
          lettre_motivation_url: lettreUrl,
        }),
      });

      if (!reponse.ok) {
        const texte = await reponse.text();
        throw new Error(`Erreur ${reponse.status} : ${texte}`);
      }

      const nouvelleDemande = await reponse.json();
      setDemandeCreee(nouvelleDemande);
      setEnvoye(true);
    } catch (erreur) {
      setErreurGenerale(erreur.message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (envoye) {
    const numeroDossier = demandeCreee
      ? `#REF-${new Date(demandeCreee.date_creation || Date.now()).getFullYear()}-HUT-${String(demandeCreee.id).padStart(3, "0")}`
      : null;

    return (
      <Box sx={{ minHeight: "100vh", bgcolor: BACKGROUND, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Paper elevation={0} sx={{ maxWidth: 480, width: "100%", p: 5, borderRadius: 4, textAlign: "center", boxShadow: "0 4px 20px -2px rgba(29,43,91,0.08)" }}>
          <CheckCircleIcon sx={{ fontSize: 56, color: "#2E7D32", mb: 2 }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: PRIMARY, mb: 1 }}>
            Candidature envoyée !
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_LIGHT, mb: numeroDossier ? 3 : 0 }}>
            Merci {champs.prenom}, votre candidature a bien été transmise au service RH de Hutchinson.
            Vous recevrez une réponse par email à l'adresse {champs.email}.
          </Typography>

          {numeroDossier && (
            <Box sx={{ p: 2.5, bgcolor: "#FAFAFA", borderRadius: 2, border: `1px solid ${BORDER}` }}>
              <Typography variant="caption" sx={{ color: TEXT_LIGHT, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
                Votre numéro de dossier
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: PRIMARY }}>
                {numeroDossier}
              </Typography>
              <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block", mt: 0.5 }}>
                Notez-le : il vous permettra, avec votre email, de suivre l'avancement de votre candidature sur la page{" "}
                <Box component="a" href="/suivi-candidature" sx={{ color: SECONDARY, fontWeight: 700, textDecoration: "none" }}>
                  Suivi de candidature
                </Box>.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BACKGROUND, py: 5, px: 2 }}>
      <Paper
        elevation={0}
        component="form"
        onSubmit={handleSoumettre}
        sx={{
          maxWidth: 760,
          mx: "auto",
          borderRadius: 4,
          p: { xs: 3, sm: 5 },
          boxShadow: "0 4px 20px -2px rgba(29,43,91,0.08)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: PRIMARY, mb: 1 }}>
            Candidature au Stage
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
            Rejoignez l'excellence Hutchinson. Remplissez le formulaire ci-dessous pour soumettre votre dossier de candidature.
          </Typography>
        </Box>

        {erreurGenerale && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {erreurGenerale}
          </Alert>
        )}

        {/* Informations Personnelles */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon fontSize="small" /> Informations Personnelles
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Prénom" placeholder="Ex: Jean" value={champs.prenom} onChange={handleChange("prenom")} error={!!erreurs.prenom} helperText={erreurs.prenom} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Nom" placeholder="Ex: Dupont" value={champs.nom} onChange={handleChange("nom")} error={!!erreurs.nom} helperText={erreurs.nom} />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              fullWidth label="Email professionnel / académique" placeholder="email@exemple.com" type="email"
              value={champs.email} onChange={handleChange("email")} error={!!erreurs.email} helperText={erreurs.email}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3.5 }}>
            <TextField
              fullWidth label="Téléphone" placeholder="+216 ..." value={champs.telephone} onChange={handleChange("telephone")}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3.5 }}>
            <TextField
              fullWidth label="CIN" placeholder="A123456" value={champs.cin} onChange={handleChange("cin")}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Formation Académique */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolIcon fontSize="small" /> Formation Académique
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField fullWidth label="Université / École" placeholder="Nom de votre établissement" value={champs.etablissements} onChange={handleChange("etablissements")} error={!!erreurs.etablissements} helperText={erreurs.etablissements} />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField select fullWidth label="Niveau d'études" value={champs.niveau_etudes} onChange={handleChange("niveau_etudes")} error={!!erreurs.niveau_etudes} helperText={erreurs.niveau_etudes}>
              <MenuItem value=""><em>Sélectionnez votre niveau</em></MenuItem>
              {NIVEAUX.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Filière / Spécialité" placeholder="Ex: Génie Logiciel, Mécanique..." value={champs.specialisation} onChange={handleChange("specialisation")} error={!!erreurs.specialisation} helperText={erreurs.specialisation} />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Projet de Stage */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <ApartmentIcon fontSize="small" /> Projet de Stage
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select fullWidth label="Type de stage souhaité" value={champs.type_stage} onChange={handleChange("type_stage")} error={!!erreurs.type_stage} helperText={erreurs.type_stage}>
              <MenuItem value=""><em>Choisir le type</em></MenuItem>
              {TYPES_STAGE.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select fullWidth label="Département cible" value={champs.departements} onChange={handleChange("departements")} error={!!erreurs.departements} helperText={erreurs.departements}>
              <MenuItem value=""><em>Sélectionnez le département</em></MenuItem>
              {departements.map((d) => <MenuItem key={d.id} value={d.nom}>{d.nom}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Date de début prévue" type="date" value={champs.date_debut} onChange={handleChange("date_debut")}
              error={!!erreurs.date_debut} helperText={erreurs.date_debut}
              slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><EventIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Date de fin prévue" type="date" value={champs.date_fin} onChange={handleChange("date_fin")}
              error={!!erreurs.date_fin} helperText={erreurs.date_fin}
              slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><EventIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Documents de Candidature */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <DescriptionIcon fontSize="small" /> Documents de Candidature
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ZoneDepotFichier label="CV" obligatoire fichier={cv} onFichierChange={setCv} erreur={erreurs.cv} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ZoneDepotFichier label="Lettre de motivation" fichier={lettreMotivation} onFichierChange={setLettreMotivation} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth multiline rows={3} label="Message complémentaire"
              placeholder="Parlez-nous brièvement de vos motivations ou précisez vos disponibilités..."
              value={champs.message} onChange={handleChange("message")}
            />
          </Grid>
        </Grid>

        <Typography variant="caption" sx={{ display: "block", textAlign: "center", color: TEXT_LIGHT, mb: 2 }}>
          En cliquant sur envoyer, vous acceptez que vos données personnelles soient traitées dans le cadre
          de votre candidature par les services RH de Hutchinson.
        </Typography>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={envoiEnCours}
          endIcon={envoiEnCours ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
          sx={{
            bgcolor: SECONDARY,
            "&:hover": { bgcolor: SECONDARY_HOVER },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            py: 1.4,
            fontSize: "1rem",
          }}
        >
          {envoiEnCours ? "Envoi en cours..." : "Envoyer ma candidature"}
        </Button>
      </Paper>
    </Box>
  );
}

export default DemandeStagePublic;