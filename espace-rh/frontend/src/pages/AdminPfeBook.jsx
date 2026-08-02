import { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, TextField, MenuItem, Button, Table,
  TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EventIcon from "@mui/icons-material/Event";

const API_URL = "http://127.0.0.1:8001";
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const BACKGROUND = "#F5F7FB";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

const STATUTS = [
  { valeur: "actif", libelle: "Actif", couleur: "#15803D", fond: "#DCFCE7" },
  { valeur: "pourvu", libelle: "Pourvu", couleur: "#B45309", fond: "#FEF3C7" },
  { valeur: "inactif", libelle: "Inactif", couleur: "#6B7280", fond: "#F3F4F6" },
];

function StatutChip({ statut }) {
  const info = STATUTS.find((s) => s.valeur === statut) || STATUTS[2];
  return <Chip label={info.libelle} size="small" sx={{ bgcolor: info.fond, color: info.couleur, fontWeight: 700 }} />;
}

const SUJET_INITIAL = {
  reference: "", 
  annee: new Date().getFullYear(), 
  titre: "", 
  description: "",
  profil_requis: "", 
  competences_requises: "", 
  environnement_technique: "",
  nombre_stagiaires: 1, 
  duree_stage: "6 mois", 
  date_debut: "", 
  date_fin: "", 
  responsable_stage: "", 
  email_contact: "", 
  departement: "", 
  statut: "actif"
};

function AdminPfeBook() {
  const [sujets, setSujets] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  
  const [modalOuvert, setModalOuvert] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [sujetEnCours, setSujetEnCours] = useState(SUJET_INITIAL);
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);

  useEffect(() => { 
    chargerSujets(); 
  }, []);

  const chargerSujets = async () => {
    setChargement(true);
    try {
      const res = await fetch(`${API_URL}/sujets-pfe`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      console.log("Sujets chargés:", data);
      setSujets(data);
    } catch (err) { 
      console.error("Erreur chargement:", err);
      setErreur("Impossible de charger les sujets."); 
    } finally { 
      setChargement(false); 
    }
  };

  const handleChange = (champ) => (e) => {
    const valeur = e.target.value;
    console.log(`Changement ${champ}:`, valeur);
    setSujetEnCours(prev => ({ ...prev, [champ]: valeur }));
  };

  const ouvrirAjout = () => {
    console.log("Ouverture modal ajout");
    setModeEdition(false);
    setSujetEnCours({ 
      ...SUJET_INITIAL, 
      annee: new Date().getFullYear(),
      nombre_stagiaires: 1 
    });
    setModalOuvert(true);
  };

  const ouvrirEdition = (sujet) => {
    console.log("Ouverture édition sujet:", sujet);
    setModeEdition(true);
    setSujetEnCours({ 
      ...sujet,
      nombre_stagiaires: sujet.nombre_stagiaires || 1,
      date_debut: sujet.date_debut || "",
      date_fin: sujet.date_fin || ""
    });
    setModalOuvert(true);
  };

  const sauvegarder = async () => {
    console.log("Sauvegarde sujet:", sujetEnCours);
    setSauvegardeEnCours(true);
    setErreur("");
    try {
      const url = modeEdition ? `${API_URL}/sujets-pfe/${sujetEnCours.id}` : `${API_URL}/sujets-pfe`;
      const method = modeEdition ? "PUT" : "POST";
      
      const bodyToSend = {
        ...sujetEnCours,
        nombre_stagiaires: parseInt(sujetEnCours.nombre_stagiaires) || 1,
        annee: parseInt(sujetEnCours.annee)
      };
      
      console.log("Envoi au backend:", bodyToSend);
      
      const res = await fetch(url, {
        method, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyToSend)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Erreur backend:", errData);
        throw new Error(errData.detail || "Erreur lors de la sauvegarde");
      }
      
      console.log("Sauvegarde réussie");
      setModalOuvert(false);
      chargerSujets();
    } catch (err) { 
      console.error("Erreur sauvegarde:", err);
      setErreur(err.message); 
    } finally { 
      setSauvegardeEnCours(false); 
    }
  };

  const supprimer = async (id, ref) => {
    if (!window.confirm(`Supprimer définitivement le sujet ${ref} ?`)) return;
    try {
      const res = await fetch(`${API_URL}/sujets-pfe/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      chargerSujets();
    } catch { 
      setErreur("Impossible de supprimer ce sujet."); 
    }
  };

  const sujetsFiltres = sujets.filter(s => 
    s.titre.toLowerCase().includes(recherche.toLowerCase()) ||
    s.reference.toLowerCase().includes(recherche.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "Non définie";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR");
    } catch {
      return "Non définie";
    }
  };

  const formatPeriod = (sujet) => {
    if (sujet.date_debut && sujet.date_fin) {
      return `${formatDate(sujet.date_debut)} - ${formatDate(sujet.date_fin)}`;
    }
    return "Non définie";
  };

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, display: "flex", alignItems: "center", gap: 1 }}>
            <MenuBookIcon /> Gestion du PFE Book
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>Gérez les sujets de stage pour les candidats.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={ouvrirAjout} sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#141F42" }, textTransform: "none", fontWeight: 700 }}>
          Ajouter un sujet
        </Button>
      </Box>

      {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${BORDER}`, mb: 2, display: "flex", gap: 1.5 }}>
        <TextField 
          size="small" 
          placeholder="Rechercher par titre ou référence..." 
          value={recherche} 
          onChange={(e) => setRecherche(e.target.value)} 
          sx={{ flexGrow: 1 }} 
          slotProps={{ 
            input: { 
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: TEXT_LIGHT }} />
                </InputAdornment>
              ) 
            } 
          }} 
        />
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        {chargement ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : sujetsFiltres.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ color: TEXT_LIGHT }}>Aucun sujet trouvé.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Référence</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Titre</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Année</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Postes</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Période</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700, color: PRIMARY }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sujetsFiltres.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Chip label={s.reference} size="small" sx={{ bgcolor: "#EEF0F6", color: PRIMARY, fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.titre}
                  </TableCell>
                  <TableCell>{s.annee}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 700, 
                      color: (s.nombre_stagiaires || 0) > 0 ? "#15803D" : SECONDARY 
                    }}>
                      {s.nombre_stagiaires || 0} poste(s)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <EventIcon fontSize="small" sx={{ color: TEXT_LIGHT }} />
                      <Typography variant="body2">
                        {formatPeriod(s)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatutChip statut={s.statut} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => ouvrirEdition(s)} sx={{ color: PRIMARY }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => supprimer(s.id, s.reference)} sx={{ color: SECONDARY }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* MODAL AJOUT / ÉDITION */}
      <Dialog open={modalOuvert} onClose={() => setModalOuvert(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: PRIMARY }}>
          {modeEdition ? "Modifier le sujet" : "Nouveau sujet PFE"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                fullWidth 
                label="Référence (ex: PFE-2026-01)" 
                value={sujetEnCours.reference || ""} 
                onChange={handleChange("reference")} 
                required 
                disabled={modeEdition} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                select 
                fullWidth 
                label="Année" 
                value={sujetEnCours.annee || ""} 
                onChange={handleChange("annee")}
              >
                {[new Date().getFullYear()-1, new Date().getFullYear(), new Date().getFullYear()+1].map(a => (
                  <MenuItem key={a} value={a}>{a}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                select 
                fullWidth 
                label="Statut" 
                value={sujetEnCours.statut || ""} 
                onChange={handleChange("statut")}
              >
                {STATUTS.map(s => (
                  <MenuItem key={s.valeur} value={s.valeur}>{s.libelle}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField 
                fullWidth 
                label="Titre du projet" 
                value={sujetEnCours.titre || ""} 
                onChange={handleChange("titre")} 
                required 
                multiline 
                rows={2} 
              />
            </Grid>
            <Grid size={12}>
              <TextField 
                fullWidth 
                label="Description détaillée" 
                value={sujetEnCours.description || ""} 
                onChange={handleChange("description")} 
                required 
                multiline 
                rows={3} 
              />
            </Grid>
            
            {/* CHAMPS POUR LES DATES DE PÉRIODE */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth 
                label="Date de début" 
                type="date" 
                value={sujetEnCours.date_debut || ""} 
                onChange={handleChange("date_debut")}
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Période de stage imposée"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth 
                label="Date de fin" 
                type="date" 
                value={sujetEnCours.date_fin || ""} 
                onChange={handleChange("date_fin")}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth 
                label="Profil requis" 
                value={sujetEnCours.profil_requis || ""} 
                onChange={handleChange("profil_requis")} 
                placeholder="ex: Ingénieur Mécanique" 
              />
            </Grid>
            {/* Durée texte */}
<Grid size={{ xs: 12, sm: 4 }}>
  <TextField 
    fullWidth 
    label="Durée" 
    value={sujetEnCours.duree_stage || ""} 
    onChange={handleChange("duree_stage")} 
    placeholder="ex: 6 mois" 
    helperText="Affichage pour le candidat"
  />
</Grid>

{/* ✅ AJOUT: Durée min en mois (pour validation) */}
<Grid size={{ xs: 12, sm: 4 }}>
  <TextField 
    fullWidth 
    label="Durée min (mois)" 
    type="number" 
    value={sujetEnCours.duree_min || ""} 
    onChange={handleChange("duree_min")} 
    inputProps={{ min: 1, max: 12 }}
    helperText="Minimum en mois"
  />
</Grid>

{/* ✅ AJOUT: Durée max en mois (pour validation) */}
<Grid size={{ xs: 12, sm: 4 }}>
  <TextField 
    fullWidth 
    label="Durée max (mois)" 
    type="number" 
    value={sujetEnCours.duree_max || ""} 
    onChange={handleChange("duree_max")} 
    inputProps={{ min: 1, max: 12 }}
    helperText="Maximum en mois"
  />
</Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth 
                label="Nombre de postes" 
                type="number" 
                value={sujetEnCours.nombre_stagiaires || 1} 
                onChange={handleChange("nombre_stagiaires")} 
                inputProps={{ min: 1, max: 10 }}
                helperText="Nombre de stagiaires acceptés"
              />
            </Grid>
            <Grid size={12}>
              <TextField 
                fullWidth 
                label="Compétences requises (séparées par des virgules)" 
                value={sujetEnCours.competences_requises || ""} 
                onChange={handleChange("competences_requises")} 
                placeholder="ex: Python, OpenCV" 
              />
            </Grid>
            <Grid size={12}>
              <TextField 
                fullWidth 
                label="Environnement technique" 
                value={sujetEnCours.environnement_technique || ""} 
                onChange={handleChange("environnement_technique")} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth 
                label="Responsable du stage" 
                value={sujetEnCours.responsable_stage || ""} 
                onChange={handleChange("responsable_stage")} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth 
                label="Email contact" 
                type="email" 
                value={sujetEnCours.email_contact || ""} 
                onChange={handleChange("email_contact")} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOuvert(false)} sx={{ textTransform: "none" }}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={sauvegarder} 
            disabled={sauvegardeEnCours || !sujetEnCours.titre || !sujetEnCours.reference} 
            sx={{ 
              bgcolor: PRIMARY, 
              "&:hover": { bgcolor: "#141F42" }, 
              textTransform: "none", 
              fontWeight: 700 
            }}
          >
            {sauvegardeEnCours ? <CircularProgress size={20} color="inherit" /> : (modeEdition ? "Mettre à jour" : "Créer le sujet")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPfeBook;