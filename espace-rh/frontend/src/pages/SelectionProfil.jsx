import { useNavigate } from "react-router-dom";
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
