

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authHeaders } from "../auth";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  InputAdornment,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import SchoolIcon from "@mui/icons-material/School";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import EventIcon from "@mui/icons-material/Event";
import LockIcon from "@mui/icons-material/Lock";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";

const API_URL = "http://127.0.0.1:8001";

const COLORS = {
  bleuFonce: "#1D2B5B",
  bleuFonce2: "#26397A",
  rouge: "#E31E24",
  rougeHover: "#c11a1f",
  grisTexte: "#6B7280",
  fondCarte: "#FFFFFF",
  fondPage: "#F5F7FB",
};

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

function genererMotDePasse() {
  const majuscules = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const minuscules = "abcdefghijkmnpqrstuvwxyz";
  const chiffres = "23456789";
  const speciaux = "!@#$%";
  const tousLesCaracteres = majuscules + minuscules + chiffres + speciaux;
  let mdp = "";
  mdp += majuscules[Math.floor(Math.random() * majuscules.length)];
  mdp += minuscules[Math.floor(Math.random() * minuscules.length)];
  mdp += chiffres[Math.floor(Math.random() * chiffres.length)];
  mdp += speciaux[Math.floor(Math.random() * speciaux.length)];
  for (let i = 0; i < 6; i++) {
    mdp += tousLesCaracteres[Math.floor(Math.random() * tousLesCaracteres.length)];
  }
  return mdp.split("").sort(() => Math.random() - 0.5).join("");
}

const CHAMPS_INITIAUX = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  cin: "",
  etablissements: "",
  niveau_etudes: "",
  specialisation: "",
  type_stage: "",
  departements: "",
  encadrant_id: "",
  dateDebut: "",
  dateFin: "",
};

export default function CreerCompteStagiaire({ onSuccess, onCancel }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("nouveau");
  const [stagiaires, setStagiaires] = useState([]);
  const [stagiaireSelectionne, setStagiaireSelectionne] = useState(null);
  const [champs, setChamps] = useState(CHAMPS_INITIAUX);
  const [motDePasse, setMotDePasse] = useState(genererMotDePasse());
  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severite: "success" });
  const [compteCree, setCompteCree] = useState(null);
  const [departements, setDepartements] = useState([]);
  const [encadrants, setEncadrants] = useState([]);
  const [chargementListes, setChargementListes] = useState(true);

  useEffect(() => {
    setChargementListes(true);
    Promise.all([
      fetch(`${API_URL}/departements`, { headers: { ...authHeaders() } }).then((r) => r.json()),
      fetch(`${API_URL}/encadrants`, { headers: { ...authHeaders() } }).then((r) => r.json()),
      fetch(`${API_URL}/stagiaires`, { headers: { ...authHeaders() } }).then((r) => r.json()),
    ])
      .then(([deptData, encData, stagData]) => {
        setDepartements(deptData);
        setEncadrants(encData);
        setStagiaires(stagData);
        setChargementListes(false);
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "Impossible de charger les listes depuis le serveur",
          severite: "error",
        });
        setChargementListes(false);
      });
  }, []);

  const handleChange = (champ) => (event) => {
    setChamps((precedent) => ({ ...precedent, [champ]: event.target.value }));
    if (erreurs[champ]) {
      setErreurs((precedent) => ({ ...precedent, [champ]: undefined }));
    }
  };

  const handleChangeMode = (_event, nouveauMode) => {
    if (!nouveauMode) return;
    setMode(nouveauMode);
    setStagiaireSelectionne(null);
    setChamps(CHAMPS_INITIAUX);
    setErreurs({});
  };

  const handleSelectionStagiaireExistant = (_event, stagiaire) => {
    setStagiaireSelectionne(stagiaire);
    setErreurs({});
    if (!stagiaire) {
      setChamps(CHAMPS_INITIAUX);
      return;
    }
    setChamps({
      nom: stagiaire.nom || "",
      prenom: stagiaire.prenom || "",
      email: stagiaire.email || "",
      telephone: stagiaire.telephone || "",
      cin: stagiaire.cin || "",
      etablissements: stagiaire.etablissements || "",
      niveau_etudes: stagiaire.niveau_etudes || "",
      specialisation: stagiaire.specialisation || "",
      type_stage: stagiaire.type_stage || "",
      departements: stagiaire.departements || "",
      encadrant_id: stagiaire.encadrant_id ?? "",
      dateDebut: stagiaire.date_debut || "",
      dateFin: stagiaire.date_fin || "",
    });
  };

  const validerFormulaire = () => {
    const nouvellesErreurs = {};
    if (mode === "existant") {
      if (!stagiaireSelectionne) {
        nouvellesErreurs.stagiaireSelectionne = "Sélectionnez un stagiaire";
      }
      if (!champs.email || champs.email.trim() === "") {
        nouvellesErreurs.email = "Cette personne n'a pas d'email — ajoutez-en un";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(champs.email)) {
        nouvellesErreurs.email = "Adresse email invalide";
      }
      setErreurs(nouvellesErreurs);
      return Object.keys(nouvellesErreurs).length === 0;
    }
    const champsObligatoires = ["nom", "prenom", "email", "etablissements", "dateDebut", "dateFin"];
    champsObligatoires.forEach((champ) => {
      if (!champs[champ] || String(champs[champ]).trim() === "") {
        nouvellesErreurs[champ] = "Ce champ est obligatoire";
      }
    });
    if (champs.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(champs.email)) {
      nouvellesErreurs.email = "Adresse email invalide";
    }
    if (champs.dateDebut && champs.dateFin && new Date(champs.dateFin) < new Date(champs.dateDebut)) {
      nouvellesErreurs.dateFin = "La date de fin doit être après la date de début";
    }
    setErreurs(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0;
  };

  const regenererMotDePasse = () => setMotDePasse(genererMotDePasse());

  const copierMotDePasse = async () => {
    try {
      await navigator.clipboard.writeText(motDePasse);
      setSnackbar({ open: true, message: "Mot de passe copié", severite: "success" });
    } catch {
      setSnackbar({ open: true, message: "Impossible de copier", severite: "error" });
    }
  };

  const handleAnnuler = () => {
    setChamps(CHAMPS_INITIAUX);
    setErreurs({});
    setMotDePasse(genererMotDePasse());
    setStagiaireSelectionne(null);
    if (onCancel) {
      onCancel();
    } else {
      navigate("/");
    }
  };

  // ✅ FONCTION MODIFIÉE : ajout de l'envoi automatique d'email via Resend
  const handleSoumettre = async () => {
    if (!validerFormulaire()) {
      setSnackbar({
        open: true,
        message: "Merci de corriger les champs en rouge",
        severite: "error",
      });
      return;
    }
    setEnvoiEnCours(true);
    try {
      // 1. En mode "nouveau" : créer d'abord la fiche stagiaire
      if (mode === "nouveau") {
        const reponseStagiaire = await fetch(`${API_URL}/stagiaires`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            prenom: champs.prenom.trim(),
            nom: champs.nom.trim(),
            email: champs.email.trim(),
            telephone: champs.telephone?.trim() || null,
            cin: champs.cin?.trim() || null,
            etablissements: champs.etablissements.trim(),
            niveau_etudes: champs.niveau_etudes || null,
            specialisation: champs.specialisation?.trim() || null,
            type_stage: champs.type_stage || null,
            departements: champs.departements || null,
            encadrant_id: champs.encadrant_id === "" ? null : Number(champs.encadrant_id),
            date_debut: champs.dateDebut,
            date_fin: champs.dateFin,
            statut: "en_attente",
            notifier_email: false,
          }),
        });
        if (!reponseStagiaire.ok) {
          const texte = await reponseStagiaire.text();
          throw new Error(`Fiche stagiaire (${reponseStagiaire.status}) : ${texte}`);
        }
        const stagiaireCree = await reponseStagiaire.json();
        var idStagiairePourCompte = stagiaireCree.id;
      } else if (mode === "existant") {
        var idStagiairePourCompte = stagiaireSelectionne?.id ?? null;
      }

      // 2. Créer le compte utilisateur (dans les deux modes)
      const reponseUtilisateur = await fetch(`${API_URL}/utilisateurs`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: `${champs.prenom.trim()} ${champs.nom.trim()}`,
          email: champs.email.trim(),
          mot_de_passe_hash: motDePasse,
          role: "stagiaire",
          stagiaire_id: idStagiairePourCompte,
        }),
      });
      if (!reponseUtilisateur.ok) {
        const texte = await reponseUtilisateur.text();
        throw new Error(`Compte utilisateur (${reponseUtilisateur.status}) : ${texte}`);
      }

      // 3. 🚀 ENVOI AUTOMATIQUE DE L'EMAIL VIA RESEND
      try {
        const reponseEmail = await fetch(`${API_URL}/envoyer-identifiants`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            email: champs.email.trim(),
            nom: `${champs.prenom.trim()} ${champs.nom.trim()}`,
            mot_de_passe: motDePasse,
          }),
        });

        let emailEnvoye = false;
        if (reponseEmail.ok) {
          console.log("✅ Email d'identifiants envoyé avec succès à", champs.email);
          emailEnvoye = true;
        } else {
          console.warn("⚠️ Compte créé, mais l'email n'a pas pu être envoyé");
        }

        setCompteCree({
          nom: `${champs.prenom.trim()} ${champs.nom.trim()}`,
          email: champs.email.trim(),
          motDePasse: motDePasse,
          emailEnvoye,
        });
      } catch (emailError) {
        console.warn("Erreur lors de l'envoi de l'email :", emailError);
        setCompteCree({
          nom: `${champs.prenom.trim()} ${champs.nom.trim()}`,
          email: champs.email.trim(),
          motDePasse: motDePasse,
          emailEnvoye: false,
        });
      }

      // Réinitialisation du formulaire (le dialogue reste ouvert par-dessus)
      setChamps(CHAMPS_INITIAUX);
      setMotDePasse(genererMotDePasse());
      setStagiaireSelectionne(null);
    } catch (erreur) {
      setSnackbar({
        open: true,
        message: `Erreur lors de la création : ${erreur.message}`,
        severite: "error",
      });
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const fermerDialogueSucces = () => {
    setCompteCree(null);
    if (onSuccess) {
      onSuccess();
    } else {
      navigate("/");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.fondPage,
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1200,
          borderRadius: "30px",
          overflow: "hidden",
          display: "flex",
          boxShadow: "0 20px 60px rgba(29, 43, 91, 0.15)",
          minHeight: 760,
        }}
      >
        {/* Colonne gauche décorative */}
        <Box
          sx={{
            width: "35%",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            background: `linear-gradient(160deg, ${COLORS.bleuFonce} 0%, ${COLORS.bleuFonce2} 100%)`,
            color: "#fff",
            p: 5,
            position: "relative",
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
              HUTCHINSON
            </Typography>
            <Chip
              label="ESPACE RH"
              sx={{
                mt: 2,
                backgroundColor: COLORS.rouge,
                color: "#fff",
                fontWeight: 600,
                letterSpacing: 1,
              }}
              size="small"
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Avatar sx={{ width: 120, height: 120, backgroundColor: "rgba(255,255,255,0.12)" }}>
              <HowToRegIcon sx={{ fontSize: 64, color: "#fff" }} />
            </Avatar>
            <Typography variant="body2" textAlign="center" sx={{ opacity: 0.85, px: 2 }}>
              Créez un accès sécurisé à la plateforme pour chaque nouveau stagiaire en quelques secondes.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Plateforme de gestion des stagiaires — Hutchinson
            </Typography>
          </Box>
        </Box>

        {/* Colonne droite : formulaire */}
        <Box
          sx={{
            width: { xs: "100%", md: "65%" },
            backgroundColor: COLORS.fondCarte,
            p: { xs: 3, sm: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ color: COLORS.bleuFonce }}>
            Créer un compte stagiaire
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.grisTexte, mb: 3 }}>
            {mode === "nouveau"
              ? "Complétez les informations ci-dessous pour créer un nouvel accès à la plateforme."
              : "Sélectionnez un stagiaire déjà présent dans la base pour lui créer un accès, sans dupliquer sa fiche."}
          </Typography>

          <ToggleButtonGroup value={mode} exclusive onChange={handleChangeMode} size="small" sx={{ mb: 3 }}>
            <ToggleButton
              value="nouveau"
              sx={{
                textTransform: "none",
                px: 2.5,
                "&.Mui-selected": { backgroundColor: COLORS.bleuFonce, color: "#fff" },
                "&.Mui-selected:hover": { backgroundColor: COLORS.bleuFonce2 },
              }}
            >
              Nouveau stagiaire
            </ToggleButton>
            <ToggleButton
              value="existant"
              sx={{
                textTransform: "none",
                px: 2.5,
                "&.Mui-selected": { backgroundColor: COLORS.bleuFonce, color: "#fff" },
                "&.Mui-selected:hover": { backgroundColor: COLORS.bleuFonce2 },
              }}
            >
              Stagiaire existant
            </ToggleButton>
          </ToggleButtonGroup>

          {mode === "existant" && (
            <Autocomplete
              options={stagiaires}
              value={stagiaireSelectionne}
              onChange={handleSelectionStagiaireExistant}
              loading={chargementListes}
              getOptionLabel={(s) => (s ? `${s.prenom} ${s.nom} — ${s.email || "sans email"}` : "")}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Rechercher un stagiaire"
                  placeholder="Nom, prénom..."
                  error={!!erreurs.stagiaireSelectionne}
                  helperText={erreurs.stagiaireSelectionne}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              sx={{ mb: 3 }}
            />
          )}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                disabled={mode === "existant"}
                label="Nom"
                value={champs.nom}
                onChange={handleChange("nom")}
                error={!!erreurs.nom}
                helperText={erreurs.nom}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                disabled={mode === "existant"}
                label="Prénom"
                value={champs.prenom}
                onChange={handleChange("prenom")}
                error={!!erreurs.prenom}
                helperText={erreurs.prenom}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                value={champs.email}
                onChange={handleChange("email")}
                error={!!erreurs.email}
                helperText={erreurs.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                disabled={mode === "existant"}
                label="CIN"
                value={champs.cin}
                onChange={handleChange("cin")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                disabled={mode === "existant"}
                label="Établissement / École"
                value={champs.etablissements}
                onChange={handleChange("etablissements")}
                error={!!erreurs.etablissements}
                helperText={erreurs.etablissements}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                disabled={mode === "existant"}
                label="Niveau d'études"
                value={champs.niveau_etudes}
                onChange={handleChange("niveau_etudes")}
              >
                <MenuItem value="">
                  <em>Sélectionner</em>
                </MenuItem>
                {NIVEAUX.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Département"
                value={champs.departements}
                onChange={handleChange("departements")}
                disabled={chargementListes || mode === "existant"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ApartmentIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">
                  <em>{chargementListes ? "Chargement..." : "Sélectionner"}</em>
                </MenuItem>
                {departements.map((d) => (
                  <MenuItem key={d.id} value={d.nom}>
                    {d.nom}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Encadrant"
                value={champs.encadrant_id}
                onChange={handleChange("encadrant_id")}
                disabled={chargementListes || mode === "existant"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SupervisorAccountIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">
                  <em>{chargementListes ? "Chargement..." : "Aucun"}</em>
                </MenuItem>
                {encadrants.map((enc) => (
                  <MenuItem key={enc.id} value={enc.id}>
                    {enc.prenom} {enc.nom}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                disabled={mode === "existant"}
                label="Type de stage"
                value={champs.type_stage}
                onChange={handleChange("type_stage")}
              >
                <MenuItem value="">
                  <em>Sélectionner</em>
                </MenuItem>
                {TYPES_STAGE.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                disabled={mode === "existant"}
                label="Téléphone"
                value={champs.telephone}
                onChange={handleChange("telephone")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                disabled={mode === "existant"}
                type="date"
                label="Date début"
                value={champs.dateDebut}
                onChange={handleChange("dateDebut")}
                error={!!erreurs.dateDebut}
                helperText={erreurs.dateDebut}
                slotProps={{ inputLabel: { shrink: true } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                disabled={mode === "existant"}
                type="date"
                label="Date fin"
                value={champs.dateFin}
                onChange={handleChange("dateFin")}
                error={!!erreurs.dateFin}
                helperText={erreurs.dateFin}
                slotProps={{ inputLabel: { shrink: true } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Mot de passe généré automatiquement"
                value={motDePasse}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" sx={{ color: COLORS.grisTexte }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        onClick={copierMotDePasse}
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        sx={{ color: COLORS.bleuFonce, textTransform: "none", mr: 0.5 }}
                      >
                        Copier
                      </Button>
                      <Button
                        size="small"
                        onClick={regenererMotDePasse}
                        startIcon={<RefreshIcon fontSize="small" />}
                        sx={{ color: COLORS.rouge, textTransform: "none" }}
                      >
                        Régénérer
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiInputBase-input": { fontFamily: "monospace", letterSpacing: 1 } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleAnnuler}
              disabled={envoiEnCours}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
                color: COLORS.grisTexte,
                borderColor: "#D0D4DD",
              }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSoumettre}
              disabled={envoiEnCours}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                px: 4,
                backgroundColor: COLORS.rouge,
                "&:hover": { backgroundColor: COLORS.rougeHover },
              }}
              startIcon={envoiEnCours ? <CircularProgress size={18} color="inherit" /> : <HowToRegIcon />}
            >
              {envoiEnCours ? "Création..." : "Créer le compte"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={Boolean(compteCree)} onClose={fermerDialogueSucces} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: COLORS.bleuFonce, fontWeight: 700 }}>
          <HowToRegIcon sx={{ color: "#2E7D32" }} />
          Compte créé avec succès
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Le compte de <strong>{compteCree?.nom}</strong> a été créé.
          </DialogContentText>
          <Box sx={{ bgcolor: "#F8FAFC", borderRadius: 2, p: 2, mb: 2 }}>
            <Typography variant="caption" sx={{ color: COLORS.grisTexte, display: "block" }}>Email</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>{compteCree?.email}</Typography>
            <Typography variant="caption" sx={{ color: COLORS.grisTexte, display: "block" }}>Mot de passe</Typography>
            <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, color: COLORS.rouge }}>
              {compteCree?.motDePasse}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {compteCree?.emailEnvoye ? (
              <>
                <MarkEmailReadIcon sx={{ color: "#2E7D32", fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: "#2E7D32" }}>
                  Email d'identifiants envoyé avec succès
                </Typography>
              </>
            ) : (
              <>
                <MarkEmailUnreadIcon sx={{ color: "#EF6C00", fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: "#EF6C00" }}>
                  Email non envoyé — pensez à transmettre ces identifiants manuellement
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            variant="contained"
            onClick={fermerDialogueSucces}
            sx={{ textTransform: "none", borderRadius: "10px", backgroundColor: COLORS.bleuFonce, "&:hover": { backgroundColor: COLORS.bleuFonce2 } }}
          >
            Retour au tableau de bord
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((precedent) => ({ ...precedent, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severite} variant="filled" sx={{ borderRadius: "10px" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}