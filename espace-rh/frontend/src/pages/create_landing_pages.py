accueil_content = r'''import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Stack } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function Accueil() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <Box
        component="video"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/hutchinson-hero.mp4"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(10,15,30,0.7)",
          zIndex: 1,
        }}
      />

      <Box sx={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: { xs: 3, md: 6 }, py: 3 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
            HUTCHINSON
          </Typography>
          <Stack direction="row" spacing={4}>
            <Typography variant="body2" sx={{ cursor: "pointer", opacity: 0.85 }}>
              Solutions
            </Typography>
            <Typography variant="body2" sx={{ cursor: "pointer", opacity: 0.85 }}>
              Reseau
            </Typography>
            <Typography variant="body2" sx={{ cursor: "pointer", opacity: 0.85 }}>
              Aide
            </Typography>
          </Stack>
        </Stack>

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 3,
          }}
        >
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, mb: 2, maxWidth: 700, lineHeight: 1.15, fontSize: { xs: "2rem", md: "3rem" } }}
          >
            Hutchinson Management System
          </Typography>
          <Typography
            sx={{ color: "#E31E24", fontStyle: "italic", fontWeight: 600, mb: 2 }}
          >
            "Innover ensemble pour la mobilite de demain"
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.75)", maxWidth: 560, mb: 4 }}>
            La plateforme centralisee pour la gestion, le suivi et l'excellence des talents
            au sein du groupe Hutchinson. Un outil au service de la performance industrielle
            et de l'innovation humaine.
          </Typography>
          <Button
            onClick={() => navigate("/selection-profil")}
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: "#E31E24",
              color: "#fff",
              fontWeight: 700,
              textTransform: "none",
              px: 4,
              py: 1.4,
              borderRadius: 2,
              fontSize: "1rem",
              "&:hover": { bgcolor: "#b8161b" },
            }}
          >
            Commencer
          </Button>
        </Box>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: { xs: 3, md: 6 }, py: 3, flexWrap: "wrap", rowGap: 1 }}
        >
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            (c) 2026 Hutchinson - Talent Portal Enterprise. Tous droits reserves.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" sx={{ opacity: 0.7, cursor: "pointer" }}>
              Privacy Policy
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, cursor: "pointer" }}>
              Terms of Service
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, cursor: "pointer" }}>
              Contact Support
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
'''

selection_profil_content = r'''import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Stack, Paper } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

const PROFILS = [
  {
    key: "stagiaire",
    label: "Stagiaire",
    icon: SchoolIcon,
    description:
      "Deposer une candidature, suivre votre stage, consulter vos documents et communiquer avec votre encadrant.",
    cta: "Acceder a l'espace Stagiaire",
    path: "/login",
  },
  {
    key: "encadrant",
    label: "Encadrant",
    icon: GroupsIcon,
    description:
      "Suivre les stagiaires, programmer des reunions, realiser les evaluations et consulter les documents.",
    cta: "Acceder a l'espace Encadrant",
    path: "/encadrant/login",
  },
  {
    key: "rh",
    label: "Ressources Humaines",
    icon: AssignmentIndIcon,
    description:
      "Gerer les candidatures, les affectations, les encadrants, les evaluations et les statistiques.",
    cta: "Acceder a l'espace RH",
    path: "/login-rh",
  },
];

export default function SelectionProfil() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f7f8fa" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: { xs: 3, md: 6 }, py: 2.5, borderBottom: "1px solid #e5e7eb", bgcolor: "#fff" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#1D2B5B" }}>
          Talent Portal
        </Typography>
      </Stack>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 3, py: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#1D2B5B", mb: 1, textAlign: "center" }}>
          Bienvenue
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 5, textAlign: "center", maxWidth: 520 }}>
          Veuillez selectionner votre profil pour acceder a votre espace de travail
          personnalise et commencer a gerer vos activites.
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ width: "100%", maxWidth: 1000 }}>
          {PROFILS.map((profil) => {
            const Icon = profil.icon;
            return (
              <Paper
                key={profil.key}
                elevation={0}
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#1D2B5B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <Icon sx={{ color: "#fff", fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1D2B5B", mb: 1 }}>
                  {profil.label}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, flexGrow: 1 }}>
                  {profil.description}
                </Typography>
                <Button
                  onClick={() => navigate(profil.path)}
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                  sx={{
                    bgcolor: "#1D2B5B",
                    color: "#fff",
                    fontWeight: 700,
                    textTransform: "none",
                    py: 1.1,
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#0f1730" },
                  }}
                >
                  {profil.cta}
                </Button>
              </Paper>
            );
          })}
        </Stack>

        <Typography
          variant="body2"
          onClick={() => navigate("/accueil")}
          sx={{ color: "text.secondary", mt: 5, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        >
          Retour a l'accueil
        </Typography>
      </Box>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: { xs: 3, md: 6 }, py: 2.5, borderTop: "1px solid #e5e7eb", bgcolor: "#fff", flexWrap: "wrap", rowGap: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#1D2B5B" }}>
          Talent Portal
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          (c) 2026 Talent Portal Enterprise. Tous droits reserves.
        </Typography>
      </Stack>
    </Box>
  );
}
'''

with open("Accueil.jsx", "w", encoding="utf-8") as f:
    f.write(accueil_content)
print("Accueil.jsx cree.")

with open("SelectionProfil.jsx", "w", encoding="utf-8") as f:
    f.write(selection_profil_content)
print("SelectionProfil.jsx cree.")
