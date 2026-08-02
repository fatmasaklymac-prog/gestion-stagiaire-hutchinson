import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PublicIcon from "@mui/icons-material/Public";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const PRIMARY = "#1D2B5B";
const PRIMARY_DARK = "#141F42";
const SECONDARY = "#E31E24";
const SECONDARY_HOVER = "#c11a1f";
const BACKGROUND = "#F5F7FB";
const TEXT_LIGHT = "#6B7280";

const ATOUTS = [
  { icone: <LightbulbIcon />, titre: "Depuis 1853", texte: "Plus de 170 ans d'expertise dans la transformation des élastomères et des matériaux, au service de la mobilité de demain." },
  { icone: <PublicIcon />, titre: "Groupe mondial", texte: "Près de 40 000 collaborateurs répartis sur une centaine de sites industriels, dans une vingtaine de pays." },
  { icone: <TrendingUpIcon />, titre: "Multi-marchés", texte: "Leader mondial des systèmes antivibratoires, du management des fluides et des solutions d'étanchéité pour l'automobile, l'aéronautique, la défense et l'industrie." },
  { icone: <FavoriteIcon />, titre: "Groupe TotalEnergies", texte: "Filiale de la branche Chimie de TotalEnergies, Hutchinson s'appuie sur la solidité d'un grand groupe international." },
];

const TYPES_STAGE = [
  { image: "/images/stage-initiation.jpg", titre: "Initiation", texte: "Découvrez le monde de l'entreprise et les bases de l'industrie." },
  { image: "/images/stage-ouvrier.jpg", titre: "Ouvrier", texte: "Immersion totale au cœur de la production pour comprendre nos process." },
  { image: "/images/stage-pfa.jpg", titre: "PFA", texte: "Projet de fin d'année : mettez en pratique vos connaissances sur des sujets concrets." },
  { image: "/images/stage-pfe.jpg", titre: "PFE", texte: "Projet de fin d'études : le tremplin idéal vers votre premier emploi chez Hutchinson." },
];

const FAQ = [
  { q: "Quand dois-je soumettre ma candidature ?", r: "Pour les stages PFE, nous recommandons de postuler dès le mois d'octobre pour le semestre suivant. Pour les autres stages, 2 à 3 mois avant la date de début souhaitée est idéal." },
  { q: "Quels sont les critères de sélection ?", r: "Nous évaluons la cohérence entre votre formation, votre projet professionnel et le poste visé, ainsi que votre motivation. Un entretien est organisé pour les candidatures présélectionnées." },
  { q: "Les stages sont-ils rémunérés ?", r: "Oui, tous nos stages conventionnés donnent lieu à une gratification, conformément à la réglementation en vigueur." },
  { q: "Puis-je être embauché après mon stage ?", r: "De nombreux stagiaires poursuivent leur parcours chez Hutchinson en alternance, VIE ou CDI selon les opportunités disponibles au sein du groupe." },
];

function CarteAtout({ icone, titre, texte }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        border: "1px solid #E5E7EB",
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: "0 8px 24px -8px rgba(29,43,91,0.18)", transform: "translateY(-2px)" },
      }}
    >
      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: "#FDEBEC", color: SECONDARY, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
        {icone}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.75 }}>
        {titre}
      </Typography>
      <Typography variant="body2" sx={{ color: TEXT_LIGHT, lineHeight: 1.6 }}>
        {texte}
      </Typography>
    </Paper>
  );
}

function CarteTypeStage({ image, titre, texte }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        component="img"
        src={image}
        alt={titre}
        sx={{ width: "100%", height: 160, objectFit: "cover", display: "block", bgcolor: "#EEF0F6" }}
      />
      <Box sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5 }}>
          {titre}
        </Typography>
        <Typography variant="body2" sx={{ color: TEXT_LIGHT, mb: 2, flexGrow: 1 }}>
          {texte}
        </Typography>
      </Box>
    </Paper>
  );
}

function Accueil() {
  const [expanded, setExpanded] = useState(0);

  return (
    <Box sx={{ bgcolor: "white" }}>
      {/* En-tête */}
      <Box sx={{ borderBottom: "1px solid #E5E7EB", py: 2 }}>
        <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: PRIMARY }}>
            Hutchinson Recrutement
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              component={RouterLink}
              to="/suivi-candidature"
              sx={{ color: TEXT_LIGHT, textTransform: "none", fontWeight: 600, fontSize: "0.9rem" }}
            >
              Suivre ma candidature
            </Button>
            <Button
              component={RouterLink}
              to="/demande-stage"
              variant="outlined"
              sx={{
                borderColor: PRIMARY,
                color: PRIMARY,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                "&:hover": { borderColor: PRIMARY_DARK, bgcolor: "rgba(29,43,91,0.04)" },
              }}
            >
              Stage classique
            </Button>
            <Button
              component={RouterLink}
              to="/pfe/postuler"
              variant="contained"
              sx={{
                bgcolor: SECONDARY,
                "&:hover": { bgcolor: SECONDARY_HOVER },
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              PFE 2026
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          color: "white",
          py: { xs: 8, md: 12 },
          backgroundImage: `linear-gradient(rgba(29,43,91,0.88), rgba(20,31,66,0.92)), url(/images/hero-usine.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-block",
              bgcolor: SECONDARY,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: 1,
              mb: 3,
            }}
          >
            STAGE 2026 / 2027
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "2.75rem" } }}>
            Rejoignez l'excellence industrielle
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.75)", mb: 4, maxWidth: 640, mx: "auto" }}>
            Depuis 1853, Hutchinson conçoit des solutions pour la mobilité de demain : systèmes antivibratoires,
            management des fluides et solutions d'étanchéité pour l'automobile, l'aéronautique et la défense.
            Développez vos talents aux côtés de nos experts.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={RouterLink}
              to="/demande-stage"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: SECONDARY, "&:hover": { bgcolor: SECONDARY_HOVER }, textTransform: "none", fontWeight: 700, px: 3, py: 1.2, borderRadius: 2 }}
            >
              Stage classique
            </Button>
            <Button
              component={RouterLink}
              to="/pfe/postuler"
              variant="outlined"
              sx={{ borderColor: "rgba(255,255,255,0.4)", color: "white", textTransform: "none", fontWeight: 700, px: 3, py: 1.2, borderRadius: 2, "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.08)" } }}
            >
              Candidater pour un PFE
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 3, sm: 5 }, mt: 6, flexWrap: "wrap" }}>
            {[
              ["1853", "Année de création"],
              ["~40 000", "Collaborateurs"],
              ["~25", "Pays"],
              ["100+", "Sites industriels"],
            ].map(([chiffre, label]) => (
              <Box key={label} sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{chiffre}</Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Pourquoi Hutchinson */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, textAlign: "center", mb: 5 }}>
          Pourquoi choisir Hutchinson ?
        </Typography>
        <Grid container spacing={3}>
          {ATOUTS.map((a) => (
            <Grid key={a.titre} size={{ xs: 12, sm: 6, md: 3 }}>
              <CarteAtout {...a} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Types de stages */}
      <Box id="types-de-stages" sx={{ bgcolor: BACKGROUND, py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, mb: 0.5 }}>
                Nos types de stages
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                Quelles que soient vos ambitions et votre parcours académique, nous avons une opportunité pour vous.
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={3}>
            {TYPES_STAGE.map((t) => (
              <Grid key={t.titre} size={{ xs: 12, sm: 6, md: 3 }}>
                <CarteTypeStage {...t} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, textAlign: "center", mb: 1 }}>
          Questions fréquentes
        </Typography>
        <Typography variant="body2" sx={{ color: TEXT_LIGHT, textAlign: "center", mb: 4 }}>
          Tout ce que vous devez savoir pour bien préparer votre candidature.
        </Typography>
        {FAQ.map((item, index) => (
          <Accordion
            key={item.q}
            expanded={expanded === index}
            onChange={() => setExpanded(expanded === index ? -1 : index)}
            elevation={0}
            sx={{ border: "1px solid #E5E7EB", borderRadius: 2, mb: 1.5, "&:before": { display: "none" }, overflow: "hidden" }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: PRIMARY }} />}>
              <Typography sx={{ fontWeight: 700, color: PRIMARY }}>{item.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>{item.r}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>

      {/* CTA final */}
      <Box sx={{ bgcolor: PRIMARY_DARK, color: "white", py: { xs: 6, md: 8 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
            Prêt à démarrer votre aventure ?
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}>
            Choisissez le parcours qui correspond à votre projet académique.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={RouterLink}
              to="/demande-stage"
              variant="outlined"
              sx={{
                borderColor: "rgba(255,255,255,0.4)",
                color: "white",
                textTransform: "none",
                fontWeight: 700,
                px: 4,
                py: 1.2,
                borderRadius: 2,
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              Stage classique
            </Button>
            <Button
              component={RouterLink}
              to="/pfe/postuler"
              variant="contained"
              sx={{
                bgcolor: SECONDARY,
                "&:hover": { bgcolor: SECONDARY_HOVER },
                textTransform: "none",
                fontWeight: 700,
                px: 4,
                py: 1.2,
                borderRadius: 2,
              }}
            >
              Candidater pour un PFE
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Pied de page */}
      <Box sx={{ bgcolor: "#F5F7FB", py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="caption" sx={{ color: TEXT_LIGHT, display: "block", textAlign: "center" }}>
            © {new Date().getFullYear()} Hutchinson. Tous droits réservés.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Accueil;