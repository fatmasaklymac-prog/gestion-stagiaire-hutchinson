import { useState, useEffect } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box, Paper, Typography, Grid, TextField, MenuItem, Button, Chip, Divider,
  Link as MuiLink, Alert, CircularProgress, IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const API_URL = "http://127.0.0.1:8001";
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const BACKGROUND = "#F5F7FB";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

const STATUTS = [
  { valeur: "en_attente", libelle: "En attente", couleur: "#B45309", fond: "#FEF3C7" },
  { valeur: "en_etude", libelle: "En étude", couleur: "#1D4ED8", fond: "#DBEAFE" },
  { valeur: "entretien_programme", libelle: "Entretien", couleur: "#6D28D9", fond: "#EDE9FE" },
  { valeur: "acceptee", libelle: "Acceptée", couleur: "#15803D", fond: "#DCFCE7" },
  { valeur: "refusee", libelle: "Refusée", couleur: "#B91C1C", fond: "#FEE2E2" },
];

const ETAPES_TIMELINE = ["en_attente", "en_etude", "entretien_programme", "acceptee"];

function infosStatut(valeur) { return STATUTS.find((s) => s.valeur === valeur) || STATUTS[0]; }

function StatutChip({ statut }) {
  const info = infosStatut(statut);
  return <Chip label={info.libelle} sx={{ bgcolor: info.fond, color: info.couleur, fontWeight: 700, borderRadius: "999px" }} />;
}

function formatDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); } 
  catch { return iso; }
}

function Bloc({ titre, children }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${BORDER}`, mb: 2.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2 }}>{titre}</Typography>
      {children}
    </Paper>
  );
}

function Champ({ label, valeur }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block", textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.25 }}>{valeur || "—"}</Typography>
    </Grid>
  );
}

function Timeline({ demande }) {
  const indexActuel = demande.statut === "refusee" ? -1 : ETAPES_TIMELINE.indexOf(demande.statut);
  const etapes = [
    { cle: "en_attente", titre: "Candidature reçue", date: demande.date_creation, texte: "Le dossier a été soumis via le portail public." },
    { cle: "en_etude", titre: "En étude", texte: "Le dossier est en cours d'évaluation par l'équipe RH." },
    { cle: "entretien_programme", titre: "Entretien", texte: demande.date_entretien ? `Prévu le ${formatDate(demande.date_entretien)}${demande.heure_entretien ? " à " + demande.heure_entretien : ""}${demande.lieu_entretien ? " — " + demande.lieu_entretien : ""}` : "Entretien à programmer." },
    { cle: "acceptee", titre: "Décision", texte: demande.statut === "refusee" ? "Candidature refusée." : demande.statut === "acceptee" ? "Candidature acceptée." : "Décision à venir." },
  ];

  return (
    <Box>
      {etapes.map((etape, i) => {
        const franchie = demande.statut === "refusee" ? i < 3 : i <= indexActuel;
        const estActuelle = demande.statut !== "refusee" && i === indexActuel;
        const estRefusEtape = demande.statut === "refusee" && i === 3;
        return (
          <Box key={etape.cle} sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {estRefusEtape ? <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}><Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#B91C1C" }} /></Box> : franchie ? <CheckCircleIcon sx={{ color: "#15803D", fontSize: 28 }} /> : <RadioButtonUncheckedIcon sx={{ color: "#D1D5DB", fontSize: 28 }} />}
              {i < etapes.length - 1 && <Box sx={{ width: "2px", flexGrow: 1, minHeight: 32, bgcolor: franchie ? "#15803D" : "#E5E7EB", my: 0.5 }} />}
            </Box>
            <Box sx={{ pb: 3 }}>
              <Typography component="div" variant="body2" sx={{ fontWeight: 700, color: estActuelle ? SECONDARY : "#1F2937", display: "flex", alignItems: "center", gap: 1 }}>
                {estRefusEtape ? "Refusée" : etape.titre}
                {estActuelle && <Chip label="Étape actuelle" size="small" sx={{ bgcolor: "#FDEBEC", color: SECONDARY, fontWeight: 700, height: 20, fontSize: "0.65rem" }} />}
              </Typography>
              {etape.date && <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>{formatDate(etape.date)}</Typography>}
              <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 0.5 }}>{estRefusEtape ? (demande.message_candidat || "Le dossier n'a pas été retenu.") : etape.texte}</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ✅ HELPER FUNCTION : Calculer la durée en mois
function calculerDureeMois(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return 0;
  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

// ✅ HELPER FUNCTION : Déterminer si c'est un stage PFE
function estStagePfe(demande, sujetsPfe) {
  if (!demande) return false;
  const isPfeType = (demande.type_stage || "").includes("PFE") || demande.departements === "PFE";
  const hasReference = demande.reference_projet && sujetsPfe.some(s => s.reference === demande.reference_projet);
  return isPfeType || hasReference;
}

function DetailDemande() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [erreurValidation, setErreurValidation] = useState("");
  const [statut, setStatut] = useState("");
  const [commentaireRh, setCommentaireRh] = useState("");
  const [messageCandidat, setMessageCandidat] = useState("");
  const [dateEntretien, setDateEntretien] = useState("");
  const [heureEntretien, setHeureEntretien] = useState("");
  const [lieuEntretien, setLieuEntretien] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [succes, setSucces] = useState("");
  const [sujetsPfe, setSujetsPfe] = useState([]);
  const [dateDebut, setDateDebut] = useState(""); // ✅ AJOUT : État pour date_debut
  const [dateFin, setDateFin] = useState(""); // ✅ AJOUT : État pour date_fin

  useEffect(() => {
    setChargement(true);
    Promise.all([
      fetch(`${API_URL}/demandes-stage/${id}`).then(r => r.json()),
      fetch(`${API_URL}/sujets-pfe`).then(r => r.ok ? r.json() : [])
    ])
    .then(([demandeData, pfeData]) => {
      setDemande(demandeData);
      setSujetsPfe(pfeData);
      setStatut(demandeData.statut || "");
      setCommentaireRh(demandeData.commentaire_rh || "");
      setMessageCandidat(demandeData.message_candidat || "");
      setDateEntretien(demandeData.date_entretien || "");
      setHeureEntretien(demandeData.heure_entretien || "");
      setLieuEntretien(demandeData.lieu_entretien || "");
      setDateDebut(demandeData.date_debut || ""); // ✅ AJOUT
      setDateFin(demandeData.date_fin || ""); // ✅ AJOUT
    })
    .catch(() => setErreur("Impossible de charger cette candidature."))
    .finally(() => setChargement(false));
  }, [id]);

  // ✅ FONCTION POUR RÉCUPÉRER LE VRAI DÉPARTEMENT
  const getVraiDepartement = () => {
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

  // ✅ FONCTION POUR ENREGISTRER AVEC VALIDATION
  const enregistrer = async () => {
    setErreurValidation("");
    setErreur("");

    // ✅ VALIDATION : Pour les stages classiques, la durée doit être entre 1 et 12 mois
    if (!estStagePfe(demande, sujetsPfe)) {
      if (dateDebut && dateFin) {
        const dureeMois = calculerDureeMois(dateDebut, dateFin);
        
        if (dureeMois < 1) {
          setErreurValidation("Pour les stages classiques, la durée minimale est 1 mois.");
          return;
        }
        if (dureeMois > 12) {
          setErreurValidation("Pour les stages classiques, la durée maximale est 12 mois.");
          return;
        }
      }
    }

    setEnregistrement(true);
    try {
      const reponse = await fetch(`${API_URL}/demandes-stage/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statut, commentaire_rh: commentaireRh, message_candidat: messageCandidat,
          date_entretien: dateEntretien || null, heure_entretien: heureEntretien || null, 
          lieu_entretien: lieuEntretien || null,
          date_debut: dateDebut || null, // ✅ AJOUT
          date_fin: dateFin || null, // ✅ AJOUT
        }),
      });
      if (!reponse.ok) throw new Error(await reponse.text());
      const { demande: demandeMaj } = await reponse.json();
      setDemande(demandeMaj);
      setSucces("Candidature mise à jour avec succès.");
    } catch { setErreur("Impossible de mettre à jour cette candidature."); } 
    finally { setEnregistrement(false); }
  };

  const supprimer = async () => {
    if (!window.confirm("Supprimer définitivement cette candidature ?")) return;
    try {
      const reponse = await fetch(`${API_URL}/demandes-stage/${id}`, { method: "DELETE" });
      if (!reponse.ok) throw new Error();
      navigate("/demandes-stage");
    } catch { setErreur("Impossible de supprimer cette candidature."); }
  };

  const convertir = async () => {
    try {
      const reponse = await fetch(`${API_URL}/demandes-stage/${id}/convertir`, { method: "POST" });
      if (!reponse.ok) throw new Error(await reponse.text());
      const { demande: demandeMaj } = await reponse.json();
      setDemande(demandeMaj); setStatut(demandeMaj.statut || "");
      setSucces("Candidature convertie en fiche stagiaire.");
    } catch { setErreur("Échec de la conversion en stagiaire."); }
  };

  if (chargement) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
  if (!demande) return <Box><Alert severity="error">{erreur || "Candidature introuvable."}</Alert><Button component={RouterLink} to="/demandes-stage" sx={{ mt: 2, textTransform: "none" }} startIcon={<ArrowBackIcon />}>Retour</Button></Box>;

  const dejaConvertie = !!demande.stagiaire_id_cree;
  const vraiDepartement = getVraiDepartement();
  const isPfe = estStagePfe(demande, sujetsPfe);
  const dureeMoisActuelle = calculerDureeMois(dateDebut, dateFin);

  return (
    <Box sx={{ bgcolor: BACKGROUND }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton size="small" component={RouterLink} to="/demandes-stage"><ArrowBackIcon fontSize="small" /></IconButton>
        <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
          <MuiLink component={RouterLink} to="/demandes-stage" underline="hover" sx={{ color: TEXT_LIGHT }}>Demandes de stage</MuiLink>{" / "}<Box component="span" sx={{ color: PRIMARY, fontWeight: 600 }}>{demande.prenom} {demande.nom}</Box>
        </Typography>
      </Box>

      {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}
      {erreurValidation && <Alert severity="error" sx={{ mb: 2 }}>{erreurValidation}</Alert>}
      {succes && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSucces("")}>{succes}</Alert>}

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${BORDER}`, mb: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: PRIMARY, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2rem" }}>{demande.prenom[0]}{demande.nom[0]}</Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY }}>{demande.prenom} {demande.nom}</Typography>
            <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>Candidature {demande.type_stage} — {vraiDepartement}</Typography>
          </Box>
        </Box>
        <StatutChip statut={demande.statut} />
      </Paper>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Bloc titre="Informations Personnelles">
            <Grid container spacing={2}>
              <Champ label="Email" valeur={demande.email} />
              <Champ label="Téléphone" valeur={demande.telephone} />
              <Champ label="CIN" valeur={demande.cin} />
              <Champ label="Candidature reçue le" valeur={formatDate(demande.date_creation)} />
            </Grid>
          </Bloc>
          
          <Bloc titre="Informations Académiques">
            <Grid container spacing={2}>
              <Champ label="Établissement" valeur={demande.etablissements} />
              <Champ label="Niveau d'études" valeur={demande.niveau_etudes} />
              <Champ label="Spécialité" valeur={demande.specialisation} />
            </Grid>
          </Bloc>

          <Bloc titre="Projet de Stage">
            <Grid container spacing={2}>
              <Champ label="Type de stage" valeur={demande.type_stage} />
              <Champ label="Département visé" valeur={vraiDepartement} />
              <Champ label="Date de début souhaitée" valeur={demande.date_debut} />
              <Champ label="Date de fin souhaitée" valeur={demande.date_fin} />
              {demande.reference_projet && (
                <Grid size={12}>
                  <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block", textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
                    Référence du sujet
                  </Typography>
                  <Chip label={demande.reference_projet} sx={{ mt: 0.5, bgcolor: "#FDEBEC", color: SECONDARY, fontWeight: 700, fontSize: "0.875rem" }} />
                </Grid>
              )}
              {demande.sujet_libre && (
                <Grid size={12}>
                  <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block", textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
                    Sujet libre proposé
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: "#FAFAFA", borderRadius: 2, border: `1px solid ${BORDER}`, mt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1F2937" }}>
                      {demande.sujet_libre}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Bloc>

          <Bloc titre="Documents">
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button variant="outlined" startIcon={<DescriptionIcon />} href={demande.cv_url?.startsWith("http") ? demande.cv_url : `${API_URL}${demande.cv_url}`} target="_blank" rel="noopener" sx={{ textTransform: "none", borderColor: BORDER, color: PRIMARY, fontWeight: 600 }}>CV</Button>
              {demande.lettre_motivation_url && <Button variant="outlined" startIcon={<DescriptionIcon />} href={`${API_URL}${demande.lettre_motivation_url}`} target="_blank" rel="noopener" sx={{ textTransform: "none", borderColor: BORDER, color: PRIMARY, fontWeight: 600 }}>Lettre de motivation</Button>}
            </Box>
          </Bloc>
          
          <Bloc titre="Traitement RH">
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField select fullWidth label="Statut" value={statut} onChange={(e) => setStatut(e.target.value)}>
                  {STATUTS.map((s) => <MenuItem key={s.valeur} value={s.valeur}>{s.libelle}</MenuItem>)}
                </TextField>
              </Grid>

              {/* ✅ AJOUT : Champs éditables pour les dates de stage */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Date de début"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Date de fin"
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              {/* ✅ AFFICHAGE DE LA DURÉE CALCULÉE */}
              {dateDebut && dateFin && !isPfe && (
                <Grid size={12}>
                  <Box sx={{ p: 2, bgcolor: dureeMoisActuelle >= 1 && dureeMoisActuelle <= 12 ? "#F0FDF4" : "#FEF2F2", borderRadius: 2, border: `1px solid ${dureeMoisActuelle >= 1 && dureeMoisActuelle <= 12 ? "#BBFDB0" : "#FDACA5"}` }}>
                    <Typography variant="body2" sx={{ color: dureeMoisActuelle >= 1 && dureeMoisActuelle <= 12 ? "#166534" : "#B91C1C", fontWeight: 600 }}>
                      📅 Durée du stage : <strong>{dureeMoisActuelle} mois</strong>
                      {dureeMoisActuelle >= 1 && dureeMoisActuelle <= 12 ? " ✓ (Valide)" : " ✗ (Entre 1 et 12 mois requis)"}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {statut === "entretien_programme" && (
                <>
                  <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth type="date" label="Date entretien" value={dateEntretien} onChange={(e) => setDateEntretien(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth type="time" label="Heure" value={heureEntretien} onChange={(e) => setHeureEntretien(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Lieu / Lien visio" value={lieuEntretien} onChange={(e) => setLieuEntretien(e.target.value)} /></Grid>
                </>
              )}
              <Grid size={12}><TextField fullWidth multiline rows={2} label="Commentaire RH (notes internes)" placeholder="Notes internes, non visibles par le candidat..." value={commentaireRh} onChange={(e) => setCommentaireRh(e.target.value)} /></Grid>
              <Grid size={12}><TextField fullWidth multiline rows={2} label="Message pour le candidat" placeholder="Visible par le candidat sur la page de suivi..." value={messageCandidat} onChange={(e) => setMessageCandidat(e.target.value)} /></Grid>
            </Grid>
            <Divider sx={{ my: 2.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button color="error" startIcon={<DeleteIcon />} onClick={supprimer} sx={{ textTransform: "none" }}>Supprimer</Button>
                {statut === "acceptee" && !dejaConvertie && <Button startIcon={<PersonAddAlt1Icon />} onClick={convertir} sx={{ textTransform: "none", color: "#15803D", fontWeight: 700 }}>Convertir en stagiaire</Button>}
              </Box>
              <Button variant="contained" onClick={enregistrer} disabled={enregistrement} sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#141F42" }, textTransform: "none", fontWeight: 700, px: 3 }}>
                {enregistrement ? <CircularProgress size={20} color="inherit" /> : "Enregistrer"}
              </Button>
            </Box>
            {dejaConvertie && <Alert severity="success" sx={{ mt: 2 }}>Cette candidature a déjà été convertie en fiche stagiaire (id #{demande.stagiaire_id_cree}).</Alert>}
          </Bloc>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${BORDER}`, position: "sticky", top: 24 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 2, display: "flex", alignItems: "center", gap: 1 }}><EventAvailableIcon fontSize="small" /> Suivi de Candidature</Typography>
            <Timeline demande={demande} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DetailDemande;