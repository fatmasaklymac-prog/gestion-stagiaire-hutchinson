import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EngineeringIcon from "@mui/icons-material/Engineering";

const API_URL = "http://127.0.0.1:8001";
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const BACKGROUND = "#F5F7FB";
const BORDER = "#E5E7EB";
const TEXT_LIGHT = "#6B7280";

function PfeBook() {
  const [sujets, setSujets] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [anneeFiltre, setAnneeFiltre] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch(`${API_URL}/sujets-pfe`)
      .then((r) => r.json())
      .then((data) => {
        setSujets(data);
        setErreur("");
      })
      .catch(() => setErreur("Impossible de charger les sujets PFE."))
      .finally(() => setChargement(false));
  }, []);

  // Filtrer : Année correspondante ET statut actif uniquement
  const sujetsFiltres = sujets.filter(
    (s) => s.annee === parseInt(anneeFiltre) && s.statut === "actif"
  );

  const anneesDisponibles = [...new Set(sujets.map((s) => s.annee))].sort((a, b) => b - a);

  if (chargement) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        {/* En-tête Centré */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              color: PRIMARY, 
              mb: 2, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 1.5 
            }}
          >
            <MenuBookIcon sx={{ fontSize: 40, color: SECONDARY }} /> 
            PFE Book {anneeFiltre}
          </Typography>
          <Typography variant="body1" sx={{ color: TEXT_LIGHT, maxWidth: 700, mx: "auto", fontSize: "1.1rem" }}>
            Découvrez nos projets de fin d'études et rejoignez l'excellence industrielle chez Hutchinson.
            Choisissez un sujet qui correspond à votre profil et postulez directement.
          </Typography>
        </Box>

        {/* Filtres Alignés à Droite */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
          <TextField
            select
            size="small"
            label="Année"
            value={anneeFiltre}
            onChange={(e) => setAnneeFiltre(e.target.value)}
            sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
          >
            {anneesDisponibles.length > 0 ? (
              anneesDisponibles.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)
            ) : (
              <MenuItem value={anneeFiltre}>{anneeFiltre}</MenuItem>
            )}
          </TextField>
        </Box>

        {erreur && <Alert severity="error" sx={{ mb: 3 }}>{erreur}</Alert>}

        {sujetsFiltres.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, bgcolor: "white", borderRadius: 4, border: `1px solid ${BORDER}` }}>
            <Typography variant="h6" sx={{ color: TEXT_LIGHT }}>
              Aucun sujet disponible pour l'année {anneeFiltre} pour le moment.
            </Typography>
          </Box>
        ) : (
          // GRILLE AVEC ALIGNEMENT STRETCH
          <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
            {sujetsFiltres.map((sujet) => (
              // ✅ CORRECTION : Utilisation de 'size' au lieu de 'item xs=...' pour éviter l'erreur DOM
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={sujet.id} sx={{ display: "flex" }}>
                
                {/* CARTE PRINCIPALE : height 100% + flexDirection column */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    height: "100%", 
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 4,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": { 
                      boxShadow: "0 12px 28px -8px rgba(29,43,91,0.15)", 
                      transform: "translateY(-6px)",
                      borderColor: PRIMARY 
                    },
                  }}
                >
                  {/* HEADER DE LA CARTE */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2.5 }}>
                    <Chip 
                      label={sujet.reference} 
                      size="small" 
                      sx={{ 
                        bgcolor: "#FDEBEC", 
                        color: SECONDARY, 
                        fontWeight: 700,
                        borderRadius: "8px"
                      }} 
                    />
                    <Chip 
                      label={`${sujet.nombre_stagiaires} poste(s)`} 
                      size="small" 
                      variant="outlined"
                      sx={{ borderRadius: "8px", borderColor: BORDER }}
                    />
                  </Box>

                  {/* CONTENU FLEXIBLE */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, mb: 1.5, lineHeight: 1.3 }}>
                      {sujet.titre}
                    </Typography>

                    <Typography variant="body2" sx={{ color: "#374151", mb: 3, lineHeight: 1.6 }}>
                      {sujet.description}
                    </Typography>

                    <Divider sx={{ my: 2.5, opacity: 0.6 }} />

                    {/* DÉTAILS TECHNIQUES */}
                    <Box sx={{ mb: 2.5 }}>
                      {sujet.profil_requis && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <PersonIcon fontSize="small" sx={{ color: TEXT_LIGHT }} />
                          <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>{sujet.profil_requis}</Typography>
                        </Box>
                      )}
                      {sujet.responsable_stage && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <EngineeringIcon fontSize="small" sx={{ color: TEXT_LIGHT }} />
                          <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>Resp: {sujet.responsable_stage}</Typography>
                        </Box>
                      )}
                      {sujet.duree_stage && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CalendarTodayIcon fontSize="small" sx={{ color: TEXT_LIGHT }} />
                          <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>{sujet.duree_stage}</Typography>
                        </Box>
                      )}
                    </Box>

                    {/* COMPÉTENCES */}
                    {sujet.competences_requises && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontWeight: 600, display: "block", mb: 0.75 }}>
                          Environnement / Compétences :
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                          {sujet.competences_requises.split(/[,;]/).map((comp, i) => (
                            <Chip 
                              key={i} 
                              label={comp.trim()} 
                              size="small" 
                              sx={{ 
                                bgcolor: "#EEF0F6", 
                                color: PRIMARY, 
                                fontSize: "0.7rem",
                                borderRadius: "6px",
                                fontWeight: 500
                              }} 
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* BOUTON : mt auto le colle toujours en bas */}
                  <Button
                    component={RouterLink}
                    to={`/pfe/postuler?ref=${sujet.reference}`}
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    fullWidth
                    sx={{
                      mt: "auto", 
                      bgcolor: PRIMARY,
                      "&:hover": { bgcolor: "#141F42" },
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 3,
                      py: 1.4,
                      fontSize: "0.95rem"
                    }}
                  >
                    Postuler à ce sujet
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default PfeBook;