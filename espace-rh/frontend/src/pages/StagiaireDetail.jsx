import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Chip, Grid, Avatar, Button, Divider,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BusinessIcon from "@mui/icons-material/Business";

const API_URL = "http://127.0.0.1:8001";

function StagiaireDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stagiaire, setStagiaire] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [presences, setPresences] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/stagiaires`)
      .then((r) => r.json())
      .then((data) => {
        const s = data.find((st) => st.id === parseInt(id));
        setStagiaire(s);
      });

    fetch(`${API_URL}/presences`)
      .then((r) => r.json())
      .then((data) => setPresences(data.filter((p) => p.stagiaire_id === parseInt(id))));

    fetch(`${API_URL}/documents`)
      .then((r) => r.json())
      .then((data) => setDocuments(data.filter((d) => d.stagiaire_id === parseInt(id))));
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getAvatarColor = (id) => {
    const colors = ["#1D2B5B", "#E31E24", "#64748B", "#2e7d32", "#1565c0", "#ef6c00"];
    return colors[(id || 0) % colors.length];
  };

  const getChipProps = (statut) => {
    switch (statut) {
      case "en_cours":
        return { label: "En cours", sx: { bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600, borderRadius: 2 } };
      case "termine":
        return { label: "Terminé", sx: { bgcolor: "#f5f5f5", color: "#616161", fontWeight: 600, borderRadius: 2 } };
      case "en_attente":
        return { label: "En attente", sx: { bgcolor: "#fff3e0", color: "#ef6c00", fontWeight: 600, borderRadius: 2 } };
      default:
        return { label: statut, sx: { bgcolor: "#f5f5f5", color: "#616161", fontWeight: 600, borderRadius: 2 } };
    }
  };

  if (!stagiaire) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  const initials = `${stagiaire.prenom[0]}${stagiaire.nom[0]}`.toUpperCase();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/stagiaires")}
          sx={{ color: "#1D2B5B", textTransform: "none" }}
        >
          Retour à la liste
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate("/stagiaires", { state: { editId: stagiaire.id } })}
          sx={{ bgcolor: "#1D2B5B", textTransform: "none", borderRadius: 2 }}
        >
          Modifier
        </Button>
      </Box>

      {/* Profil header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              fontSize: "1.8rem",
              fontWeight: 700,
              bgcolor: getAvatarColor(stagiaire.id),
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1D2B5B" }}>
              {stagiaire.prenom} {stagiaire.nom}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {stagiaire.specialisation || "Stagiaire"}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip size="small" {...getChipProps(stagiaire.statut)} />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EmailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body2" fontWeight={600}>{stagiaire.email || "—"}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                <Typography variant="body2" fontWeight={600}>{stagiaire.telephone || "—"}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Période</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stagiaire.date_debut ? new Date(stagiaire.date_debut).toLocaleDateString("fr-FR") : "—"} – {stagiaire.date_fin ? new Date(stagiaire.date_fin).toLocaleDateString("fr-FR") : "—"}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BusinessIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Département</Typography>
                <Typography variant="body2" fontWeight={600}>{stagiaire.departement || "—"}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            bgcolor: "#fafafa",
            borderBottom: "1px solid",
            borderColor: "divider",
            "& .MuiTabs-flexContainer": { px: 2, pt: 1 },
          }}
          textColor="primary"
          indicatorColor="#E31E24"
        >
          <Tab label="Informations" sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label={`Présences (${presences.length})`} sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label={`Documents (${documents.length})`} sx={{ textTransform: "none", fontWeight: 600 }} />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "#1D2B5B",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&::before": {
                      content: '""',
                      width: 4,
                      height: 20,
                      bgcolor: "#E31E24",
                      borderRadius: 1,
                      display: "block",
                    },
                  }}
                >
                  Informations Personnelles
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <InfoRow label="Prénom" value={stagiaire.prenom} />
                  <InfoRow label="Nom" value={stagiaire.nom} />
                  <InfoRow label="Email" value={stagiaire.email} />
                  <InfoRow label="Téléphone" value={stagiaire.telephone} />
                  <InfoRow label="CIN" value={stagiaire.cin} />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "#1D2B5B",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&::before": {
                      content: '""',
                      width: 4,
                      height: 20,
                      bgcolor: "#E31E24",
                      borderRadius: 1,
                      display: "block",
                    },
                  }}
                >
                  Cursus Académique
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <InfoRow label="Établissement" value={stagiaire.etablissements} />
                  <InfoRow label="Niveau d'études" value={stagiaire.niveau_etudes} />
                  <InfoRow label="Spécialisation" value={stagiaire.specialisation} />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "#1D2B5B",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&::before": {
                      content: '""',
                      width: 4,
                      height: 20,
                      bgcolor: "#E31E24",
                      borderRadius: 1,
                      display: "block",
                    },
                  }}
                >
                  Détails du Stage
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <InfoRow label="Date de début" value={stagiaire.date_debut} />
                  <InfoRow label="Date de fin" value={stagiaire.date_fin} />
                  <InfoRow label="Département" value={stagiaire.departement} />
                  <InfoRow label="Encadrant" value={stagiaire.encadrant} />
                  <InfoRow label="Statut" value={
                    <Chip size="small" {...getChipProps(stagiaire.statut)} />
                  } />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            {presences.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                Aucune présence enregistrée
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#fafafa" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#1D2B5B" }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1D2B5B" }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1D2B5B" }}>Remarque</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {presences.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{p.date}</TableCell>
                        <TableCell>
                          <Chip
                            label={p.statut}
                            size="small"
                            sx={{
                              bgcolor: p.statut === "present" ? "#e8f5e9" : p.statut === "absent" ? "#ffebee" : "#fff3e0",
                              color: p.statut === "present" ? "#2e7d32" : p.statut === "absent" ? "#c62828" : "#ef6c00",
                              fontWeight: 600,
                              borderRadius: 1,
                            }}
                          />
                        </TableCell>
                        <TableCell>{p.remarque || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            {documents.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                Aucun document
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#fafafa" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#1D2B5B" }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1D2B5B" }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1D2B5B" }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell>{d.nom}</TableCell>
                        <TableCell>{d.type}</TableCell>
                        <TableCell>{d.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export default StagiaireDetail;