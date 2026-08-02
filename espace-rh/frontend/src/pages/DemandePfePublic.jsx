import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
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
  Link as MuiLink,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const API_URL = "http://127.0.0.1:8001";

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

const CHAMPS_INITIAUX = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  cin: "",
  etablissements: "",
  niveau_etudes: "",
  specialisation: "",
  annee_pfe: new Date().getFullYear(),
  reference_projet: "",
  sujet_libre: "",
  date_debut: "",
  date_fin: "",
  message: "",
};

function ZoneDepotFichier({ label, obligatoire, fichier, onFichierChange, erreur }) {
  const [survole, setSurvole] = useState(false);
  const inputRef = useRef(null);
  
  const gererFichiers = (fichiers) => {
    if (fichiers && fichiers.length > 0) onFichierChange(fichiers[0]);
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
        onDragOver={(e) => { e.preventDefault(); setSurvole(true); }}
        onDragLeave={() => setSurvole(false)}
        onDrop={(e) => { e.preventDefault(); setSurvole(false); gererFichiers(e.dataTransfer.files); }}
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
              onClick={(e) => { e.stopPropagation(); onFichierChange(null); }}
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

function DemandePfePublic() {
  const [searchParams] = useSearchParams();
  
  const [champs, setChamps] = useState(CHAMPS_INITIAUX);
  const [cv, setCv] = useState(null);
  const [lettreMotivation, setLettreMotivation] = useState(null);
  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurGenerale, setErreurGenerale] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [demandeCreee, setDemandeCreee] = useState(null);
  const [sujetTrouve, setSujetTrouve] = useState(null);

  // === 1. AUTO-REMPLISSAGE DE LA RÉFÉRENCE DEPUIS L'URL ===
  useEffect(() => {
    const refFromUrl = searchParams.get("ref");
    if (refFromUrl) {
      setChamps((prev) => ({ ...prev, reference_projet: refFromUrl }));
    }
  }, [searchParams]);

  // === 2. RÉCUPÉRATION DES DÉTAILS DU SUJET (ET DES DATES) ===
  useEffect(() => {
    const ref = champs.reference_projet?.trim();
    if (ref) {
      fetch(`${API_URL}/sujets-pfe/ref/${ref}`)
        .then((r) => {
          if (r.ok) return r.json();
          throw new Error();
        })
        .then((data) => {
          setSujetTrouve(data);
          // ✅ CORRECTION : On force toujours une chaîne de caractères, jamais null
          setChamps((prev) => ({
            ...prev,
            date_debut: data.date_debut ? String(data.date_debut) : "",
            date_fin: data.date_fin ? String(data.date_fin) : "",
          }));
        })
        .catch(() => {
          setSujetTrouve(null);
        });
    } else {
      setSujetTrouve(null);
      // Si la référence est effacée, on réinitialise aussi les dates
      setChamps((prev) => ({ ...prev, date_debut: "", date_fin: "" }));
    }
  }, [champs.reference_projet]);

  const anneesDisponibles = [new Date().getFullYear(), new Date().getFullYear() + 1];

  const handleChange = (champ) => (event) => {
    setChamps((prec) => ({ ...prec, [champ]: event.target.value }));
    if (erreurs[champ]) setErreurs((prec) => ({ ...prec, [champ]: undefined }));
  };

  // ✅ FONCTION POUR CALCULER LA DURÉE EN JOURS ENTRE DEUX DATES
  const calculerDureeDays = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Durée en jours
  };

  // ✅ FONCTION POUR CALCULER LA DURÉE EN MOIS (approximativement)
  const calculerDureeMois = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  };

  // ✅ NOUVELLE VALIDATION POUR LES DATES
  const validerFormulaire = () => {
    const nouvellesErreurs = {};
    const obligatoires = [
      "prenom", "nom", "email", "etablissements", "niveau_etudes",
      "specialisation", "annee_pfe", "date_debut", "date_fin",
    ];
    obligatoires.forEach((champ) => {
      if (!champs[champ] || String(champs[champ]).trim() === "") {
        nouvellesErreurs[champ] = "Champ obligatoire";
      }
    });

    if (!champs.reference_projet?.trim() && !champs.sujet_libre?.trim()) {
      nouvellesErreurs.reference_projet = "Indiquez une référence du PFE Book OU proposez un sujet libre";
    }

    if (champs.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(champs.email)) {
      nouvellesErreurs.email = "Adresse email invalide";
    }

    // ✅ VALIDATION : La date de fin doit être après la date de début
    if (champs.date_debut && champs.date_fin && new Date(champs.date_fin) < new Date(champs.date_debut)) {
      nouvellesErreurs.date_fin = "La date de fin doit être après la date de début";
    }

// ✅ VALIDATION : DURÉE POUR LES SUJETS AVEC RÉFÉRENCE PFE
if (champs.reference_projet?.trim() && sujetTrouve) {
  const dureeCandidat = calculerDureeMois(champs.date_debut, champs.date_fin);
  
  // Cas 1: Sujet avec dates imposées
  if (sujetTrouve.date_debut && sujetTrouve.date_fin) {
    const dureeSujet = calculerDureeMois(sujetTrouve.date_debut, sujetTrouve.date_fin);
    if (dureeCandidat < dureeSujet) {
      nouvellesErreurs.date_fin = 
        `La durée du stage ne peut pas être moins que ${dureeSujet} mois`;
    }
  }
  // Cas 2: Sujet avec durée min/max numérique (NOUVEAU!)
  else if (sujetTrouve.duree_min && sujetTrouve.duree_max) {
    if (dureeCandidat < sujetTrouve.duree_min) {
      nouvellesErreurs.date_fin = 
        `La durée minimum est ${sujetTrouve.duree_min} mois`;
    }
    if (dureeCandidat > sujetTrouve.duree_max) {
      nouvellesErreurs.date_fin = 
        `La durée maximum est ${sujetTrouve.duree_max} mois`;
    }
  }
  // Cas 3: Sujet sans durée définie
  else {
    if (dureeCandidat < 1 || dureeCandidat > 12) {
      nouvellesErreurs.date_fin = "La durée doit être entre 1 et 12 mois";
    }
  }
}
else if (champs.sujet_libre?.trim()) {
  // Validation sujet libre 1-12 mois
  const dureeMois = calculerDureeMois(champs.date_debut, champs.date_fin);
  if (dureeMois < 1) {
    nouvellesErreurs.date_fin = "La durée doit être au minimum 1 mois";
  } else if (dureeMois > 12) {
    nouvellesErreurs.date_fin = "La durée ne peut pas dépasser 12 mois";
  }
}

    if (!cv) nouvellesErreurs.cv = "Le CV est obligatoire";

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
      const cvUrl = await uploaderFichier(cv);
      const lettreUrl = lettreMotivation ? await uploaderFichier(lettreMotivation) : null;

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
          type_stage: "PFE (Projet Fin d'Études)",
          departements: "PFE",
          date_debut: champs.date_debut,
          date_fin: champs.date_fin,
          cv_url: cvUrl,
          lettre_motivation_url: lettreUrl,
          annee_pfe: parseInt(champs.annee_pfe, 10),
          reference_projet: champs.reference_projet?.trim() || null,
          sujet_libre: champs.sujet_libre?.trim() || null,
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
            Candidature PFE envoyée !
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_LIGHT, mb: numeroDossier ? 3 : 0 }}>
            Merci {champs.prenom}, votre candidature pour un PFE {champs.annee_pfe} a bien été transmise.
            {champs.reference_projet && (
              <> Vous avez postulé au sujet <strong>{champs.reference_projet}</strong>.</>
            )}
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

  // ✅ CORRECTION : "dates imposées" seulement si les DEUX dates sont fixées par le sujet
  const datesImposees = !!(sujetTrouve && sujetTrouve.date_debut && sujetTrouve.date_fin);

  // ✅ AJOUT : cas d'un sujet avec durée min/max numérique (sans dates fixes)
  const dureeMinMax = !!(sujetTrouve && !datesImposees && sujetTrouve.duree_min && sujetTrouve.duree_max);

  // ✅ AFFICHAGE D'INFORMATIONS UTILES SUR LES DURÉES
  const dureeMoisActuelle = calculerDureeMois(champs.date_debut, champs.date_fin);
  const dureeSujetPfe = datesImposees ? calculerDureeMois(sujetTrouve.date_debut, sujetTrouve.date_fin) : 0;

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
            Candidature PFE
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
            Projet de Fin d'Études — Consultez nos sujets disponibles dans le{" "}
            <MuiLink
              component={RouterLink}
              to="/pfe/book"
              sx={{ color: SECONDARY, fontWeight: 700, textDecoration: "none" }}
            >
              PFE Book
            </MuiLink>{" "}
            avant de postuler.
          </Typography>
        </Box>

        {erreurGenerale && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {erreurGenerale}
          </Alert>
        )}

        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon fontSize="small" /> Informations Personnelles
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Prénom" value={champs.prenom || ""} onChange={handleChange("prenom")} error={!!erreurs.prenom} helperText={erreurs.prenom} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Nom" value={champs.nom || ""} onChange={handleChange("nom")} error={!!erreurs.nom} helperText={erreurs.nom} />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              fullWidth label="Email" type="email" value={champs.email || ""} onChange={handleChange("email")}
              error={!!erreurs.email} helperText={erreurs.email}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3.5 }}>
            <TextField
              fullWidth label="Téléphone" value={champs.telephone || ""} onChange={handleChange("telephone")}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3.5 }}>
            <TextField
              fullWidth label="CIN" value={champs.cin || ""} onChange={handleChange("cin")}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } }}
            />
          </Grid>
        </Grid>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolIcon fontSize="small" /> Formation Académique
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField fullWidth label="Université / École" value={champs.etablissements || ""} onChange={handleChange("etablissements")} error={!!erreurs.etablissements} helperText={erreurs.etablissements} />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField select fullWidth label="Niveau d'études" value={champs.niveau_etudes || ""} onChange={handleChange("niveau_etudes")} error={!!erreurs.niveau_etudes} helperText={erreurs.niveau_etudes}>
              <MenuItem value=""><em>Sélectionnez votre niveau</em></MenuItem>
              {NIVEAUX.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Filière / Spécialité" value={champs.specialisation || ""} onChange={handleChange("specialisation")} error={!!erreurs.specialisation} helperText={erreurs.specialisation} />
          </Grid>
        </Grid>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <MenuBookIcon fontSize="small" /> Projet PFE
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select fullWidth label="Année du PFE" value={champs.annee_pfe || ""}
              onChange={handleChange("annee_pfe")} error={!!erreurs.annee_pfe} helperText={erreurs.annee_pfe}
            >
              {anneesDisponibles.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </TextField>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Référence du sujet (ex: PFE-2026-01)"
              placeholder="Laisser vide si sujet libre"
              value={champs.reference_projet || ""}
              onChange={handleChange("reference_projet")}
              helperText={erreurs.reference_projet || "Retrouvez les références dans le PFE Book"}
              error={!!erreurs.reference_projet}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth multiline rows={2}
              label="Sujet libre proposé (si aucun sujet du PFE Book ne vous convient)"
              placeholder="Décrivez brièvement le sujet que vous souhaitez proposer..."
              value={champs.sujet_libre || ""}
              onChange={handleChange("sujet_libre")}
            />
          </Grid>
          
          {/* ✅ INFORMATION AJOUTÉE : Afficher la durée imposée par le sujet PFE */}
          {datesImposees && (
            <Grid size={12}>
              <Alert severity="info">
                ℹ️ Ce sujet impose une période de stage d'environ <strong>{dureeSujetPfe} mois</strong>. 
                Votre candidature ne peut pas être pour une durée inférieure.
              </Alert>
            </Grid>
          )}

          {/* ✅ AJOUT : Afficher la durée min/max quand le sujet n'a pas de dates fixes */}
          {dureeMinMax && (
            <Grid size={12}>
              <Alert severity="info">
                ℹ️ Ce sujet impose une durée de stage comprise entre{" "}
                <strong>{sujetTrouve.duree_min} et {sujetTrouve.duree_max} mois</strong>.
              </Alert>
            </Grid>
          )}

          {/* ✅ CORRECTION : Ajout de "|| """ pour garantir que value n'est jamais null */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Date de début prévue" type="date"
              value={champs.date_debut || ""} 
              onChange={handleChange("date_debut")}
              error={!!erreurs.date_debut} 
              helperText={erreurs.date_debut || (datesImposees ? "Période imposée par le sujet" : "")}
              disabled={datesImposees}
              slotProps={{ 
                inputLabel: { shrink: true }, 
                input: { startAdornment: <InputAdornment position="start"><EventIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } 
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Date de fin prévue" type="date"
              value={champs.date_fin || ""}
              onChange={handleChange("date_fin")}
              error={!!erreurs.date_fin} 
              helperText={erreurs.date_fin || (datesImposees ? "Période imposée par le sujet" : "")}
              disabled={datesImposees}
              slotProps={{ 
                inputLabel: { shrink: true }, 
                input: { startAdornment: <InputAdornment position="start"><EventIcon fontSize="small" sx={{ color: TEXT_LIGHT }} /></InputAdornment> } 
              }}
            />
          </Grid>

          {/* ✅ AJOUT : Afficher la durée calculée */}
          {champs.date_debut && champs.date_fin && (
            <Grid size={12}>
              <Box sx={{ p: 2, bgcolor: "#F0F9FF", borderRadius: 2, border: `1px solid #BFDBFE` }}>
                <Typography variant="body2" sx={{ color: "#1E40AF", fontWeight: 600 }}>
                  📅 Durée du stage : <strong>{dureeMoisActuelle} mois</strong>
                  {/* Cas 1 : sujet avec dates fixes imposées */}
                  {datesImposees && dureeMoisActuelle >= dureeSujetPfe && " ✓ (Conforme au sujet)"}
                  {datesImposees && dureeMoisActuelle < dureeSujetPfe && " ✗ (Inférieur à la durée du sujet)"}
                  {/* Cas 2 : sujet avec durée min/max numérique */}
                  {dureeMinMax && dureeMoisActuelle >= sujetTrouve.duree_min && dureeMoisActuelle <= sujetTrouve.duree_max && " ✓ (Valide)"}
                  {dureeMinMax && dureeMoisActuelle < sujetTrouve.duree_min && ` ✗ (Minimum ${sujetTrouve.duree_min} mois requis)`}
                  {dureeMinMax && dureeMoisActuelle > sujetTrouve.duree_max && ` ✗ (Maximum ${sujetTrouve.duree_max} mois)`}
                  {/* Cas 3 : sujet libre ou sans contrainte de durée -> 1 à 12 mois */}
                  {!datesImposees && !dureeMinMax && dureeMoisActuelle >= 1 && dureeMoisActuelle <= 12 && " ✓ (Valide)"}
                  {!datesImposees && !dureeMinMax && dureeMoisActuelle < 1 && " ✗ (Minimum 1 mois requis)"}
                  {!datesImposees && !dureeMinMax && dureeMoisActuelle > 12 && " ✗ (Maximum 12 mois)"}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        <Divider sx={{ mb: 3 }} />

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
              placeholder="Parlez-nous de vos motivations, de votre projet professionnel..."
              value={champs.message || ""} onChange={handleChange("message")}
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
          {envoiEnCours ? "Envoi en cours..." : "Envoyer ma candidature PFE"}
        </Button>
      </Paper>
    </Box>
  );
}

export default DemandePfePublic;