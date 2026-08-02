import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, Avatar, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, List, ListItem, ListItemAvatar,
  ListItemText, TextField, IconButton, Tooltip, InputAdornment,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import EngineeringIcon from "@mui/icons-material/Engineering";
import VerifiedIcon from "@mui/icons-material/Verified";
import BuildIcon from "@mui/icons-material/Build";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import PersonIcon from "@mui/icons-material/Person";
import { authHeaders } from "../auth";

const API_URL = "http://127.0.0.1:8001";

const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SUCCESS = "#2E7D32";
const WARNING = "#EF6C00";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT = "#1F2937";
const TEXT_LIGHT = "#6B7280";
const GREEN_LIGHT = "#E8F5E9";
const ORANGE_LIGHT = "#FFF3E0";
const BLUE_LIGHT = "#E8F0FE";

// Icônes par défaut associées aux noms de départements connus
const ICON_MAP = {
  "Bureau d'Étude": EngineeringIcon,
  "Qualité": VerifiedIcon,
  "Maintenance": BuildIcon,
  "Achats": ShoppingCartIcon,
  "Ressources Humaines": GroupsIcon,
  "Finance": AccountBalanceIcon,
  "Production": PrecisionManufacturingIcon,
};

const COULEUR_MAP = {
  "Bureau d'Étude": "#1565c0",
  "Qualité": SUCCESS,
  "Maintenance": WARNING,
  "Achats": "#6A1B9A",
  "Ressources Humaines": SECONDARY,
  "Finance": "#00695C",
  "Production": PRIMARY,
};

function getIcon(nom) {
  return ICON_MAP[nom] || EngineeringIcon;
}

function getCouleur(nom) {
  return COULEUR_MAP[nom] || PRIMARY;
}

// Descriptions par défaut suggérées à la création (pré-remplissage pratique,
// mais reste modifiable — et rien n'est envoyé tant que l'utilisateur n'a pas
// rempli/validé le champ Description lui-même).
const DESCRIPTIONS_SUGGEREES = {
  "Bureau d'Étude": "Ingénierie, conception produit, calculs scientifiques, développement électronique embarqué",
  "Qualité": "Contrôle qualité, processus, normes ISO, audits",
  "Maintenance": "Maintenance industrielle, gestion des équipements",
  "Achats": "Supply chain, approvisionnement, logistique",
  "Ressources Humaines": "Gestion RH, recrutement, formation",
  "Finance": "Comptabilité, gestion financière, reporting",
  "Production": "Méthodes, amélioration continue, Lean Manufacturing",
};

// Conservé pour compatibilité : Encadrants.jsx importe { DEPARTEMENTS } depuis ce fichier
export const DEPARTEMENTS = [
  { nom: "Bureau d'Étude", desc: "Ingénierie, conception produit, calculs scientifiques, développement électronique embarqué", icon: EngineeringIcon, couleur: "#1565c0" },
  { nom: "Qualité", desc: "Contrôle qualité, processus, normes ISO, audits", icon: VerifiedIcon, couleur: SUCCESS },
  { nom: "Maintenance", desc: "Maintenance industrielle, gestion des équipements", icon: BuildIcon, couleur: WARNING },
  { nom: "Achats", desc: "Supply chain, approvisionnement, logistique", icon: ShoppingCartIcon, couleur: "#6A1B9A" },
  { nom: "Ressources Humaines", desc: "Gestion RH, recrutement, formation", icon: GroupsIcon, couleur: SECONDARY },
  { nom: "Finance", desc: "Comptabilité, gestion financière, reporting", icon: AccountBalanceIcon, couleur: "#00695C" },
  { nom: "Production", desc: "Méthodes, amélioration continue, Lean Manufacturing", icon: PrecisionManufacturingIcon, couleur: PRIMARY },
];

export default function Departements() {
  const [stagiaires, setStagiaires] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Dialogs
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [idEnCours, setIdEnCours] = useState(null);
  const [deptDetail, setDeptDetail] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);

  // Form
  const [form, setForm] = useState({ nom: "", description: "" });
  const [errors, setErrors] = useState({});

  // ─── Fetch ───
  const chargerDonnees = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/stagiaires`).then((r) => r.json()),
      fetch(`${API_URL}/departements`).then((r) => r.json()),
    ])
      .then(([stagData, deptData]) => {
        setStagiaires(stagData);
        setDepartements(deptData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  // ─── Helpers ───
  const getStagiairesDe = (nomDept) =>
    stagiaires.filter((s) => s.departements === nomDept);

  const getNbActifs = (nomDept) =>
    stagiaires.filter((s) => s.departements === nomDept && s.statut === "en_cours").length;

  const ouvrirDetail = (dept) => {
    setDeptDetail(dept);
    setDetailOpen(true);
  };

  const getInitials = (prenom, nom) =>
    `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
    // Pré-remplit la description suggérée quand on tape un nom connu,
    // seulement si la description est encore vide (on n'écrase jamais
    // ce que l'utilisateur a déjà tapé).
    if (name === "nom" && !form.description && DESCRIPTIONS_SUGGEREES[value]) {
      setForm((prev) => ({ ...prev, description: DESCRIPTIONS_SUGGEREES[value] }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.nom?.trim()) newErrors.nom = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── CRUD ───
  const ouvrirAjout = () => {
    setModeEdition(false);
    setIdEnCours(null);
    setForm({ nom: "", description: "" });
    setErrors({});
    setAddOpen(true);
  };

  const ouvrirModification = (dept, e) => {
    e.stopPropagation();
    setModeEdition(true);
    setIdEnCours(dept.id);
    setForm({ nom: dept.nom || "", description: dept.description || "" });
    setErrors({});
    setAddOpen(true);
  };

  const handleSubmitAdd = () => {
    if (!validateForm()) return;

    const url = modeEdition
      ? `${API_URL}/departements/${idEnCours}`
      : `${API_URL}/departements`;
    const method = modeEdition ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        nom: form.nom.trim(),
        description: form.description?.trim() || null,
      }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text);
        }
        return r.json();
      })
      .then(() => {
        chargerDonnees();
        setAddOpen(false);
      })
      .catch((err) => {
        console.error("❌ Erreur:", err);
        alert("Erreur: " + err.message);
      });
  };

  const ouvrirDelete = (dept, e) => {
    e.stopPropagation();
    setDeptToDelete(dept);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deptToDelete) return;

    fetch(`${API_URL}/departements/${deptToDelete.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text);
        }
        return r.json();
      })
      .then(() => {
        chargerDonnees();
        setDeleteOpen(false);
        setDeptToDelete(null);
      })
      .catch((err) => {
        console.error("❌ Erreur:", err);
        alert("Erreur suppression: " + err.message);
      });
  };

  // ─── Filter ───
  const filteredDepartements = departements.filter((d) =>
    d.nom.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Render ───
  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
            Départements
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT, fontSize: 14 }}>
            {departements.length} département{departements.length > 1 ? "s" : ""} · Répartition des stagiaires par département d'accueil
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={ouvrirAjout}
          sx={{
            bgcolor: PRIMARY,
            "&:hover": { bgcolor: "#16224a" },
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          Nouveau Département
        </Button>
      </Box>


      {/* Cartes départements */}
      {filteredDepartements.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            border: "1px solid",
            borderColor: BORDER,
            bgcolor: WHITE,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Aucun département trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cliquez sur "Nouveau Département" pour en ajouter un.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredDepartements.map((dept) => {
            const Icon = getIcon(dept.nom);
            const couleur = getCouleur(dept.nom);
            const total = getStagiairesDe(dept.nom).length;
            const actifs = getNbActifs(dept.nom);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dept.id}>
                <Paper
                  elevation={0}
                  onClick={() => ouvrirDetail(dept)}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: BORDER,
                    bgcolor: WHITE,
                    cursor: "pointer",
                    height: "100%",
                    position: "relative",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                      borderColor: couleur,
                    },
                  }}
                >
                  {/* Boutons modifier / supprimer */}
                  <Box sx={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 0.5 }}>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={(e) => ouvrirModification(dept, e)}
                        sx={{
                          color: PRIMARY,
                          opacity: 0,
                          transition: "opacity 0.2s",
                          "&:hover": { bgcolor: BLUE_LIGHT },
                        }}
                        className="action-btn"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={(e) => ouvrirDelete(dept, e)}
                        sx={{
                          color: SECONDARY,
                          opacity: 0,
                          transition: "opacity 0.2s",
                          "&:hover": { bgcolor: "#ffebee" },
                        }}
                        className="action-btn"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${couleur}1A`, color: couleur, width: 48, height: 48 }}>
                      <Icon />
                    </Avatar>
                    <Box sx={{ flex: 1, pr: 6 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: TEXT }}>
                        {dept.nom}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      color: TEXT_LIGHT,
                      fontSize: "0.8rem",
                      mb: 2,
                      lineHeight: 1.5,
                      minHeight: 40,
                    }}
                  >
                    {dept.description || "Département d'accueil des stagiaires"}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      size="small"
                      label={`${total} stagiaire${total > 1 ? "s" : ""} au total`}
                      sx={{ bgcolor: "#f5f5f5", color: TEXT_LIGHT, fontWeight: 600 }}
                    />
                    {actifs > 0 && (
                      <Chip
                        size="small"
                        label={`${actifs} en cours`}
                        sx={{ bgcolor: GREEN_LIGHT, color: SUCCESS, fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* CSS pour afficher les boutons au hover */}
      <style>{`
        .action-btn { opacity: 0 !important; }
        .MuiPaper-root:hover .action-btn { opacity: 1 !important; }
      `}</style>

      {/* ─── DIALOG DÉTAIL ─── */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: "hidden" } } }}
      >
        {deptDetail && (
          <>
            <DialogTitle
              sx={{
                bgcolor: getCouleur(deptDetail.nom),
                color: "white",
                py: 2.5,
                px: 3,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 36, height: 36 }}>
                {(() => {
                  const Icon = getIcon(deptDetail.nom);
                  return <Icon sx={{ color: "white", fontSize: 20 }} />;
                })()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {deptDetail.nom}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  {getStagiairesDe(deptDetail.nom).length} stagiaire(s) au total
                </Typography>
              </Box>
              <IconButton
                onClick={() => setDetailOpen(false)}
                sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              {deptDetail.description && (
                <Box sx={{ p: 3, pb: 0 }}>
                  <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                    {deptDetail.description}
                  </Typography>
                </Box>
              )}
              {getStagiairesDe(deptDetail.nom).length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography sx={{ color: TEXT_LIGHT }}>
                    Aucun stagiaire dans ce département pour le moment.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {getStagiairesDe(deptDetail.nom).map((s) => (
                    <ListItem
                      key={s.id}
                      sx={{ borderBottom: "1px solid #f1f5f9", py: 1.5, px: 3 }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: `${getCouleur(deptDetail.nom)}1A`,
                            color: getCouleur(deptDetail.nom),
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            {s.prenom} {s.nom}
                          </Typography>
                        }
                        secondary={s.specialisation || "Stagiaire"}
                      />
                      <Chip
                        size="small"
                        label={
                          s.statut === "en_cours"
                            ? "En cours"
                            : s.statut === "termine"
                            ? "Terminé"
                            : "En attente"
                        }
                        sx={{
                          bgcolor:
                            s.statut === "en_cours"
                              ? GREEN_LIGHT
                              : s.statut === "termine"
                              ? "#f5f5f5"
                              : ORANGE_LIGHT,
                          color:
                            s.statut === "en_cours"
                              ? SUCCESS
                              : s.statut === "termine"
                              ? TEXT_LIGHT
                              : WARNING,
                          fontWeight: 600,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
              <Button
                onClick={() => setDetailOpen(false)}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  borderColor: BORDER,
                  color: TEXT,
                }}
              >
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ─── DIALOG AJOUTER / MODIFIER ─── */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: "hidden" } } }}
      >
        <DialogTitle
          sx={{
            bgcolor: PRIMARY,
            color: "white",
            py: 2.5,
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 36, height: 36 }}>
            <AddIcon sx={{ fontSize: 20, color: "white" }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {modeEdition ? "Modifier le Département" : "Nouveau Département"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {modeEdition ? "Mettez à jour les informations" : "Ajoutez un nouveau département d'accueil"}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setAddOpen(false)}
            sx={{ ml: "auto", color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: PRIMARY,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                "&::before": {
                  content: '""',
                  width: 4,
                  height: 20,
                  bgcolor: SECONDARY,
                  borderRadius: 1,
                  display: "block",
                },
              }}
            >
              Informations du Département
            </Typography>
            <TextField
              fullWidth
              label="Nom du département *"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              error={errors.nom}
              helperText={errors.nom ? "Champ obligatoire" : ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={2}
              placeholder="Description du rôle et des missions du département..."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setAddOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              borderColor: BORDER,
              color: TEXT,
              "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT },
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitAdd}
            sx={{
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: "#16224a" },
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
            }}
          >
            {modeEdition ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── DIALOG SUPPRIMER ─── */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: `${SECONDARY}1A`, color: SECONDARY, width: 40, height: 40 }}>
              <DeleteIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, color: TEXT }}>
              Confirmer la suppression
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: TEXT, fontSize: "0.95rem" }}>
            Êtes-vous sûr de vouloir supprimer le département{" "}
            <strong>{deptToDelete?.nom}</strong> ?
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 1 }}>
            Cette action est irréversible. Les stagiaires associés ne seront pas supprimés, mais
            perdront leur lien avec ce département.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              borderColor: BORDER,
              color: TEXT,
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}