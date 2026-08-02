import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import LockResetIcon from "@mui/icons-material/LockReset";
import VerifiedIcon from "@mui/icons-material/Verified";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { authHeaders } from "../auth";
import TopBarStagiaire from "../components/TopBarStagiaire";

const API_URL = "http://127.0.0.1:8001";

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SUCCESS = "#2E7D32";
const DANGER = "#C62828";
const WARNING = "#EF6C00";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";
const BLUE = "#1565C0";
const BLUE_LIGHT = "#E8F0FE";
const RED_LIGHT = "#FDECEC";
const GREEN_LIGHT = "#E8F5E9";
const ORANGE_LIGHT = "#FFF3E0";

function formaterDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function calculerDureeStage(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return "—";
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const mois = Math.max(1, Math.round((fin - debut) / (1000 * 60 * 60 * 24 * 30)));
  return `${mois} mois (${debut.toLocaleDateString("fr-FR", { month: "short" })} - ${fin.toLocaleDateString("fr-FR", { month: "short" })})`;
}

function CarteInfo({ icon, titre, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${BORDER}`,
        bgcolor: WHITE,
        flex: 1,
        minWidth: 280,
        transition: "all 0.25s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="subtitle1" sx={{ color: "#1F2937", fontWeight: 800 }}>
          {titre}
        </Typography>
      </Box>
      {children}
    </Paper>
  );
}

function Champ({ label, valeur }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "#111827", fontWeight: 800 }}>
        {valeur || "—"}
      </Typography>
    </Box>
  );
}

function ProfilStagiaire() {
  const { profil, rechargerProfil, erreurProfil } = useOutletContext();
  const [error, setError] = useState("");

  // Modale édition profil
  const [modalEditOuvert, setModalEditOuvert] = useState(false);
  const [formNom, setFormNom] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelephone, setFormTelephone] = useState("");
  const [formLocalisation, setFormLocalisation] = useState("");
  const [envoiEditEnCours, setEnvoiEditEnCours] = useState(false);
  const [erreurEdit, setErreurEdit] = useState("");

  // Compétences
  const [nouvelleCompetence, setNouvelleCompetence] = useState("");
  const [erreurCompetence, setErreurCompetence] = useState("");
  const [ajoutCompetenceEnCours, setAjoutCompetenceEnCours] = useState(false);

  // Formations
  const [modalFormationOuvert, setModalFormationOuvert] = useState(false);
  const [formationEtablissement, setFormationEtablissement] = useState("");
  const [formationDiplome, setFormationDiplome] = useState("");
  const [formationDateDebut, setFormationDateDebut] = useState("");
  const [formationDateFin, setFormationDateFin] = useState("");
  const [ajoutFormationEnCours, setAjoutFormationEnCours] = useState(false);
  const [erreurFormation, setErreurFormation] = useState("");

  // Photo de profil
  const inputPhotoRef = useRef(null);
  const [envoiPhotoEnCours, setEnvoiPhotoEnCours] = useState(false);
  const [erreurPhoto, setErreurPhoto] = useState("");

  // Modale changement de mot de passe
  const [modalMdpOuvert, setModalMdpOuvert] = useState(false);
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmationMdp, setConfirmationMdp] = useState("");
  const [envoiMdpEnCours, setEnvoiMdpEnCours] = useState(false);
  const [erreurMdp, setErreurMdp] = useState("");
  const [succesMdp, setSuccesMdp] = useState("");



  function ouvrirModalEdit() {
    setFormNom(profil?.nom || "");
    setFormEmail(profil?.email || "");
    setFormTelephone(profil?.telephone || "");
    setFormLocalisation(profil?.localisation || "");
    setErreurEdit("");
    setModalEditOuvert(true);
  }

  function gererEnregistrementProfil() {
    setEnvoiEditEnCours(true);
    setErreurEdit("");

    fetch(`${API_URL}/moi`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: formNom,
        email: formEmail,
        telephone: formTelephone,
        localisation: formLocalisation,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Échec de la mise à jour du profil.");
        }
        return res.json();
      })
      .then(() => {
        setModalEditOuvert(false);
        return rechargerProfil();
      })
      .catch((err) => setErreurEdit(err.message || "Erreur lors de la mise à jour."))
      .finally(() => setEnvoiEditEnCours(false));
  }

  function gererAjoutCompetence() {
    const nom = nouvelleCompetence.trim();
    if (!nom) return;

    setAjoutCompetenceEnCours(true);
    setErreurCompetence("");

    fetch(`${API_URL}/moi/competences`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ nom }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Échec de l'ajout de la compétence.");
        }
        return res.json();
      })
      .then(() => {
        setNouvelleCompetence("");
        return rechargerProfil();
      })
      .catch((err) => setErreurCompetence(err.message || "Erreur lors de l'ajout."))
      .finally(() => setAjoutCompetenceEnCours(false));
  }

  function gererSuppressionCompetence(id) {
    fetch(`${API_URL}/moi/competences/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Échec de la suppression.");
        return rechargerProfil();
      })
      .catch(() => setErreurCompetence("Impossible de supprimer cette compétence."));
  }

  function ouvrirModalFormation() {
    setFormationEtablissement("");
    setFormationDiplome("");
    setFormationDateDebut("");
    setFormationDateFin("");
    setErreurFormation("");
    setModalFormationOuvert(true);
  }

  function gererAjoutFormation() {
    const etablissement = formationEtablissement.trim();
    if (!etablissement) {
      setErreurFormation("L'établissement est obligatoire.");
      return;
    }

    setAjoutFormationEnCours(true);
    setErreurFormation("");

    fetch(`${API_URL}/moi/formations`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        etablissement,
        diplome: formationDiplome || null,
        date_debut: formationDateDebut || null,
        date_fin: formationDateFin || null,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Échec de l'ajout de la formation.");
        }
        return res.json();
      })
      .then(() => {
        setModalFormationOuvert(false);
        return rechargerProfil();
      })
      .catch((err) => setErreurFormation(err.message || "Erreur lors de l'ajout."))
      .finally(() => setAjoutFormationEnCours(false));
  }

  function gererSuppressionFormation(id) {
    fetch(`${API_URL}/moi/formations/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Échec de la suppression.");
        return rechargerProfil();
      })
      .catch(() => setError("Impossible de supprimer cette formation."));
  }

  function ouvrirSelecteurPhoto() {
    setErreurPhoto("");
    inputPhotoRef.current?.click();
  }

  function gererChangementPhoto(e) {
    const fichier = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier plus tard
    if (!fichier) return;

    setErreurPhoto("");
    setEnvoiPhotoEnCours(true);

    const donnees = new FormData();
    donnees.append("fichier", fichier);

    fetch(`${API_URL}/moi/photo`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: donnees,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Échec de l'envoi de la photo.");
        }
        return res.json();
      })
      .then(() => rechargerProfil())
      .catch((err) => setErreurPhoto(err.message || "Erreur lors de l'envoi de la photo."))
      .finally(() => setEnvoiPhotoEnCours(false));
  }

  function gererChangementMotDePasse() {
    setErreurMdp("");
    setSuccesMdp("");

    if (nouveauMdp !== confirmationMdp) {
      setErreurMdp("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }
    if (nouveauMdp.length < 6) {
      setErreurMdp("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setEnvoiMdpEnCours(true);

    fetch(`${API_URL}/moi/mot-de-passe`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        ancien_mot_de_passe: ancienMdp,
        nouveau_mot_de_passe: nouveauMdp,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Échec du changement de mot de passe.");
        }
        return res.json();
      })
      .then(() => {
        setSuccesMdp("Mot de passe modifié avec succès.");
        setAncienMdp("");
        setNouveauMdp("");
        setConfirmationMdp("");
      })
      .catch((err) => setErreurMdp(err.message || "Erreur lors du changement de mot de passe."))
      .finally(() => setEnvoiMdpEnCours(false));
  }

  const stage = profil?.stage;
  const initiale = profil?.nom ? profil.nom.trim().charAt(0).toUpperCase() : "?";

  return (
    <>
      <TopBarStagiaire nom={profil?.nom} titre="Mon Profil" photoUrl={profil?.photo_url ? `${API_URL}${profil.photo_url}` : undefined} />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {(error || erreurProfil) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || erreurProfil}
          </Alert>
        )}

          {erreurPhoto && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErreurPhoto("")}>
              {erreurPhoto}
            </Alert>
          )}

          {/* Bandeau d'en-tête */}
          <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", mb: 3, border: `1px solid ${BORDER}` }}>
            <Box sx={{ bgcolor: PRIMARY, height: 90 }} />
            <Box sx={{ p: 3, pt: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, mt: -6 }}>
                <Box
                  onClick={ouvrirSelecteurPhoto}
                  sx={{
                    position: "relative",
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    cursor: envoiPhotoEnCours ? "default" : "pointer",
                    "&:hover .overlay-photo": { opacity: envoiPhotoEnCours ? 0 : 1 },
                  }}
                >
                  <Avatar
                    src={profil?.photo_url ? `${API_URL}${profil.photo_url}` : undefined}
                    sx={{ width: 96, height: 96, bgcolor: SECONDARY, fontSize: "2rem", border: "4px solid white" }}
                  >
                    {initiale}
                  </Avatar>
                  <Box
                    className="overlay-photo"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      bgcolor: "rgba(0,0,0,0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {envoiPhotoEnCours ? (
                      <CircularProgress size={22} sx={{ color: "white" }} />
                    ) : (
                      <PhotoCameraIcon sx={{ color: "white" }} />
                    )}
                  </Box>
                  <input
                    ref={inputPhotoRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    hidden
                    onChange={gererChangementPhoto}
                  />
                </Box>
                <Box sx={{ mb: 0.5 }}>
                  <Typography variant="h5" sx={{ color: "#1F2937", fontWeight: 700 }}>
                    {profil?.nom || "—"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                    Stagiaire{stage?.type_stage ? ` — ${stage.type_stage}` : ""}
                    {profil?.specialisation ? ` — ${profil.specialisation}` : ""}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={ouvrirModalEdit}
                sx={{ bgcolor: PRIMARY, textTransform: "none", borderRadius: 2, "&:hover": { bgcolor: PRIMARY } }}
              >
                Modifier le profil
              </Button>
            </Box>
          </Paper>

          {/* Trois cartes d'informations */}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
            <CarteInfo icon={<VerifiedIcon sx={{ color: PRIMARY }} />} titre="Informations personnelles">
              <Champ label="Nom complet" valeur={profil?.nom} />
              <Champ label="Email" valeur={profil?.email} />
              <Champ label="Téléphone" valeur={profil?.telephone} />
              <Champ label="Localisation" valeur={profil?.localisation} />
            </CarteInfo>

            <CarteInfo icon={<SchoolIcon sx={{ color: PRIMARY }} />} titre="Formation">
              {profil?.ecole || profil?.niveau_etudes || profil?.specialisation ? (
                <>
                  <Champ label="Établissement" valeur={profil?.ecole} />
                  <Champ label="Niveau d'études" valeur={profil?.niveau_etudes} />
                  <Champ label="Spécialisation" valeur={profil?.specialisation} />
                </>
              ) : null}

              {profil?.formations?.length > 0 ? (
                <Box sx={{ mt: 1 }}>
                  {profil.formations.map((f, i) => (
                    <Box key={f.id} sx={{ display: "flex", gap: 1.5 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 0.6 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            flexShrink: 0,
                            bgcolor: i === 0 ? SECONDARY : "#D1D5DB",
                          }}
                        />
                        {i < profil.formations.length - 1 && (
                          <Box sx={{ width: 2, flexGrow: 1, minHeight: 32, bgcolor: BORDER, my: 0.5 }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, pb: 2 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                            {formaterDate(f.date_debut)} - {formaterDate(f.date_fin)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: i === 0 ? PRIMARY : "#1F2937", fontWeight: 700 }}>
                            {f.etablissement}
                          </Typography>
                          {f.diplome && (
                            <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                              {f.diplome}
                            </Typography>
                          )}
                        </Box>
                        <IconButton size="small" onClick={() => gererSuppressionFormation(f.id)}>
                          <CloseIcon fontSize="small" sx={{ color: TEXT_LIGHT }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : !profil?.ecole && !profil?.niveau_etudes && !profil?.specialisation ? (
                <Typography variant="body2" sx={{ color: TEXT_LIGHT, mb: 1 }}>
                  Aucune information de formation renseignée.
                </Typography>
              ) : null}

              <Button
                fullWidth
                variant="outlined"
                onClick={ouvrirModalFormation}
                sx={{
                  mt: 1,
                  textTransform: "none",
                  borderStyle: "dashed",
                  borderColor: BORDER,
                  color: TEXT_LIGHT,
                  borderRadius: 2,
                }}
              >
                + Ajouter une formation
              </Button>
            </CarteInfo>

            <CarteInfo icon={<WorkIcon sx={{ color: PRIMARY }} />} titre="Stage actuel">
              <Champ label="Entreprise" valeur="Hutchinson SA" />
              <Champ label="Département" valeur={stage?.departement} />
              <Champ label="Durée" valeur={calculerDureeStage(stage?.date_debut, stage?.date_fin)} />
              <Champ
                label="Encadrant"
                valeur={stage?.encadrant ? `${stage.encadrant.prenom} ${stage.encadrant.nom}` : "Non assigné"}
              />
            </CarteInfo>
          </Box>

          {/* Compétences techniques */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, mb: 3, bgcolor: WHITE }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <BuildCircleIcon sx={{ color: PRIMARY }} />
              <Typography variant="subtitle1" sx={{ color: "#1F2937", fontWeight: 700 }}>
                Compétences techniques
              </Typography>
            </Box>

            {erreurCompetence && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErreurCompetence("")}>
                {erreurCompetence}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              {(profil?.competences || []).map((c) => (
                <Chip
                  key={c.id}
                  label={`● ${c.nom}`}
                  onDelete={() => gererSuppressionCompetence(c.id)}
                  sx={{
                    bgcolor: "#F1F5F9",
                    color: "#1F2937",
                    fontWeight: 700,
                    "& .MuiChip-label": { fontWeight: 700 },
                  }}
                />
              ))}

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Nouvelle compétence"
                  value={nouvelleCompetence}
                  onChange={(e) => setNouvelleCompetence(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      gererAjoutCompetence();
                    }
                  }}
                  sx={{ width: 180 }}
                />
                <Button
                  onClick={gererAjoutCompetence}
                  disabled={ajoutCompetenceEnCours || !nouvelleCompetence.trim()}
                  variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 2, borderStyle: "dashed", borderColor: BORDER, color: TEXT_LIGHT }}
                >
                  {ajoutCompetenceEnCours ? <CircularProgress size={18} /> : "+ Ajouter"}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Changer le mot de passe */}
          <Box sx={{ textAlign: "center" }}>
            <Button
              startIcon={<LockResetIcon />}
              onClick={() => {
                setErreurMdp("");
                setSuccesMdp("");
                setAncienMdp("");
                setNouveauMdp("");
                setConfirmationMdp("");
                setModalMdpOuvert(true);
              }}
              variant="outlined"
              variant="contained"
              sx={{
                bgcolor: SECONDARY,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                boxShadow: "0 8px 20px rgba(227,30,36,.25)",
                "&:hover": {
                  bgcolor: "#c4171d",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Changer le mot de passe
            </Button>
          </Box>
      </Box>

      {/* Modale : modifier le profil */}
      <Dialog open={modalEditOuvert} onClose={() => !envoiEditEnCours && setModalEditOuvert(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Modifier le profil
          <IconButton size="small" onClick={() => setModalEditOuvert(false)} disabled={envoiEditEnCours}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {erreurEdit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erreurEdit}
            </Alert>
          )}
          <TextField
            label="Nom complet"
            fullWidth
            size="small"
            value={formNom}
            onChange={(e) => setFormNom(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            size="small"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Téléphone"
            fullWidth
            size="small"
            value={formTelephone}
            onChange={(e) => setFormTelephone(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Localisation"
            fullWidth
            size="small"
            placeholder="ex: Paris, France"
            value={formLocalisation}
            onChange={(e) => setFormLocalisation(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalEditOuvert(false)} disabled={envoiEditEnCours} sx={{ textTransform: "none", color: TEXT_LIGHT }}>
            Annuler
          </Button>
          <Button
            onClick={gererEnregistrementProfil}
            disabled={envoiEditEnCours}
            variant="contained"
            sx={{ bgcolor: PRIMARY, textTransform: "none", "&:hover": { bgcolor: PRIMARY } }}
          >
            {envoiEditEnCours ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modale : ajouter une formation */}
      <Dialog open={modalFormationOuvert} onClose={() => !ajoutFormationEnCours && setModalFormationOuvert(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Ajouter une formation
          <IconButton size="small" onClick={() => setModalFormationOuvert(false)} disabled={ajoutFormationEnCours}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {erreurFormation && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erreurFormation}
            </Alert>
          )}
          <TextField
            label="Établissement"
            fullWidth
            size="small"
            value={formationEtablissement}
            onChange={(e) => setFormationEtablissement(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Diplôme (optionnel)"
            fullWidth
            size="small"
            value={formationDiplome}
            onChange={(e) => setFormationDiplome(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Date de début"
              type="date"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={formationDateDebut}
              onChange={(e) => setFormationDateDebut(e.target.value)}
            />
            <TextField
              label="Date de fin"
              type="date"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={formationDateFin}
              onChange={(e) => setFormationDateFin(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalFormationOuvert(false)} disabled={ajoutFormationEnCours} sx={{ textTransform: "none", color: TEXT_LIGHT }}>
            Annuler
          </Button>
          <Button
            onClick={gererAjoutFormation}
            disabled={ajoutFormationEnCours}
            variant="contained"
            sx={{ bgcolor: PRIMARY, textTransform: "none", "&:hover": { bgcolor: PRIMARY } }}
          >
            {ajoutFormationEnCours ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modale : changer le mot de passe */}
      <Dialog open={modalMdpOuvert} onClose={() => !envoiMdpEnCours && setModalMdpOuvert(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Changer le mot de passe
          <IconButton size="small" onClick={() => setModalMdpOuvert(false)} disabled={envoiMdpEnCours}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {erreurMdp && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erreurMdp}
            </Alert>
          )}
          {succesMdp && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {succesMdp}
            </Alert>
          )}
          <TextField
            label="Mot de passe actuel"
            type="password"
            fullWidth
            size="small"
            value={ancienMdp}
            onChange={(e) => setAncienMdp(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Nouveau mot de passe"
            type="password"
            fullWidth
            size="small"
            value={nouveauMdp}
            onChange={(e) => setNouveauMdp(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirmer le nouveau mot de passe"
            type="password"
            fullWidth
            size="small"
            value={confirmationMdp}
            onChange={(e) => setConfirmationMdp(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalMdpOuvert(false)} disabled={envoiMdpEnCours} sx={{ textTransform: "none", color: TEXT_LIGHT }}>
            Fermer
          </Button>
          <Button
            onClick={gererChangementMotDePasse}
            disabled={envoiMdpEnCours || !ancienMdp || !nouveauMdp || !confirmationMdp}
            variant="contained"
            sx={{ bgcolor: SECONDARY, textTransform: "none", "&:hover": { bgcolor: SECONDARY } }}
          >
            {envoiMdpEnCours ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Valider"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ProfilStagiaire;
