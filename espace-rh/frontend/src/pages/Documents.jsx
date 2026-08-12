import { useState, useEffect, Fragment } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton,
  MenuItem, Avatar, Grid, Divider, Tooltip, InputAdornment,
  FormControl, InputLabel, Select, Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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
const BLUE_LIGHT = "#E8F0FE";
const GREEN_LIGHT = "#E8F5E9";
const ORANGE_LIGHT = "#FFF3E0";
const RED_LIGHT = "#FFEBEE";

const DOCUMENT_TYPES = [
  "Convention de stage",
  "CIN",
  "CV",
  "Attestation d'assurance",
  "Rapport de stage",
  "Attestation de fin de stage",
  "Autre",
];

// Types que le RH peut emettre et transmettre directement au stagiaire
const TYPES_DOCUMENTS_RH = [
  "Attestation de fin de stage",
  "Lettre d'affectation",
  "Badge photo",
  "Fiche sécurité",
  "Certificat",
];

const STATUTS = [
  { value: "en_attente", label: "En attente", color: WARNING, bg: ORANGE_LIGHT },
  { value: "valide", label: "Validé", color: SUCCESS, bg: GREEN_LIGHT },
  { value: "refuse", label: "Refusé", color: SECONDARY, bg: RED_LIGHT },
  { value: "manquant", label: "Manquant", color: TEXT_LIGHT, bg: "#f5f5f5" },
];

function getStatusConfig(value) {
  return STATUTS.find((s) => s.value === value) || STATUTS[0];
}

export default function Documents() {
  const [stagiaires, setStagiaires] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [fichierSelectionne, setFichierSelectionne] = useState(null);
  const [modeEdition, setModeEdition] = useState(false);
  const [idEnCours, setIdEnCours] = useState(null);
  const [errors, setErrors] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedStagiaire, setExpandedStagiaire] = useState(null);

  const [filters, setFilters] = useState({
    stagiaire_id: "",
    type_document: "",
    statut: "",
  });
  const [activeFilters, setActiveFilters] = useState({
    stagiaire_id: "",
    type_document: "",
    statut: "",
  });

  const [form, setForm] = useState({
    stagiaire_id: "",
    type_document: "",
    statut: "en_attente",
    date_document: "",
    fichier_url: "",
  });

  // ─── Fetch ───
  const chargerDonnees = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/stagiaires`).then((r) => r.json()),
      fetch(`${API_URL}/documents`, { headers: authHeaders() }).then((r) => r.json()),
    ])
      .then(([stagData, docData]) => {
        setStagiaires(stagData);
        setDocuments(docData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  // ─── Helpers ───
  const getStagiaireName = (id) => {
    const s = stagiaires.find((st) => st.id === id);
    return s ? `${s.prenom} ${s.nom}` : `Stagiaire #${id}`;
  };

  const getStagiaireInitials = (id) => {
    const s = stagiaires.find((st) => st.id === id);
    return s ? `${s.prenom?.[0] || ""}${s.nom?.[0] || ""}`.toUpperCase() : "?";
  };

  const getAvatarColor = (id) => {
    const colors = [PRIMARY, SECONDARY, "#64748B", "#77767B", "#1565c0", SUCCESS];
    return colors[id % colors.length];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    const empty = { stagiaire_id: "", type_document: "", statut: "" };
    setFilters(empty);
    setActiveFilters(empty);
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== "");

  const validateForm = () => {
    const newErrors = {};
    if (!form.stagiaire_id) newErrors.stagiaire_id = true;
    if (!form.type_document) newErrors.type_document = true;
    if (!modeEdition && !fichierSelectionne) newErrors.fichier = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Dialogs ───
  const ouvrirAjout = () => {
    setModeEdition(false);
    setIdEnCours(null);
    setErrors({});
    setFichierSelectionne(null);
    setForm({
      stagiaire_id: "",
      type_document: TYPES_DOCUMENTS_RH[0],
      statut: "valide",
      date_document: new Date().toISOString().split("T")[0],
      fichier_url: "",
    });
    setOpen(true);
  };

  const ouvrirModification = (doc) => {
    setModeEdition(true);
    setIdEnCours(doc.id);
    setErrors({});
    setFichierSelectionne(null);
    setForm({
      stagiaire_id: doc.stagiaire_id,
      type_document: doc.type_document,
      statut: doc.statut || "en_attente",
      date_document: doc.date_document || "",
      fichier_url: doc.fichier_url || "",
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    let fetchPromise;

    if (modeEdition) {
      // RH : seule la modification du statut est autorisee via cette route
      fetchPromise = fetch(`${API_URL}/documents/${idEnCours}/statut`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ statut: form.statut }),
      });
    } else {
      // RH : creation avec upload reel du fichier
      const formData = new FormData();
      formData.append("stagiaire_id", form.stagiaire_id);
      formData.append("type_document", form.type_document);
      if (form.date_document) formData.append("date_document", form.date_document);
      formData.append("fichier", fichierSelectionne);

      fetchPromise = fetch(`${API_URL}/documents/upload-rh`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: formData,
      });
    }

    fetchPromise
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text);
        }
        return r.json();
      })
      .then(() => {
        chargerDonnees();
        setOpen(false);
      })
      .catch((err) => {
        console.error("❌ Erreur:", err);
        alert("Erreur: " + err.message);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    fetch(`${API_URL}/documents/${id}`, { method: "DELETE", headers: authHeaders() })
      .then(() => chargerDonnees())
      .catch((err) => alert("Erreur suppression: " + err.message));
  };

  const handleExport = () => {
    fetch(`${API_URL}/rh/documents/export`, { headers: authHeaders() })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text);
        }
        return r.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `documents_stagiaires_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("❌ Erreur export:", err);
        alert("Erreur lors de l'export: " + err.message);
      });
  };

  const handleStatutChange = (docId, nouveauStatut) => {
    fetch(`${API_URL}/documents/${docId}/statut`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ statut: nouveauStatut }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text);
        }
        return r.json();
      })
      .then(() => chargerDonnees())
      .catch((err) => alert("Erreur: " + err.message));
  };

  // ─── Filter ───
  const filteredDocuments = documents.filter((d) => {
    const searchLower = search.toLowerCase();
    const stagName = getStagiaireName(d.stagiaire_id).toLowerCase();
    const matchSearch = stagName.includes(searchLower) || d.type_document.toLowerCase().includes(searchLower);
    const matchStagiaire = !activeFilters.stagiaire_id || d.stagiaire_id === Number(activeFilters.stagiaire_id);
    const matchType = !activeFilters.type_document || d.type_document === activeFilters.type_document;
    const matchStatut = !activeFilters.statut || d.statut === activeFilters.statut;
    return matchSearch && matchStagiaire && matchType && matchStatut;
  });

  // ─── Regroupement par stagiaire (une seule ligne par stagiaire) ───
  const documentsParStagiaire = {};
  filteredDocuments.forEach((doc) => {
    if (!documentsParStagiaire[doc.stagiaire_id]) {
      documentsParStagiaire[doc.stagiaire_id] = [];
    }
    documentsParStagiaire[doc.stagiaire_id].push(doc);
  });
  const lignesStagiaires = Object.keys(documentsParStagiaire).map((id) => {
    const docs = documentsParStagiaire[id];
    const complet = docs.length > 0 && docs.every((d) => d.statut === "valide");
    return { stagiaire_id: Number(id), docs, complet };
  });

  const toggleExpand = (id) => {
    setExpandedStagiaire((prev) => (prev === id ? null : id));
  };

  // ─── Render ───
  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
            Documents des Stagiaires
          </Typography>
          <Typography sx={{ color: TEXT_LIGHT, fontSize: 14 }}>
            {filteredDocuments.length} document{filteredDocuments.length > 1 ? "s" : ""} affiché{filteredDocuments.length > 1 ? "s" : ""}
            {hasActiveFilters && ` (sur ${documents.length})`}
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
          Nouveau Document
        </Button>
      </Box>

      {/* Barre de recherche + filtres */}
      <Paper elevation={0} sx={{ p: 2, mb: filtersOpen ? 0 : 3, borderRadius: filtersOpen ? "16px 16px 0 0" : 4, border: "1px solid", borderColor: BORDER, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", bgcolor: WHITE }}>
        <TextField
          placeholder="Rechercher par stagiaire, type, statut..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: TEXT_LIGHT }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant={filtersOpen || hasActiveFilters ? "contained" : "outlined"}
          startIcon={<FilterListIcon />}
          onClick={() => setFiltersOpen(!filtersOpen)}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            ...(filtersOpen || hasActiveFilters
              ? { bgcolor: PRIMARY, color: "white", "&:hover": { bgcolor: "#16224a" } }
              : { borderColor: BORDER, color: TEXT, "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT } }
            ),
          }}
        >
          Filtres {hasActiveFilters && "●"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            borderColor: BORDER,
            color: TEXT,
            "&:hover": { borderColor: PRIMARY, color: PRIMARY, bgcolor: BLUE_LIGHT },
          }}
        >
          Exporter
        </Button>
      </Paper>

      {/* Panneau de filtres */}
      <Collapse in={filtersOpen}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: "0 0 16px 16px",
            border: "1px solid",
            borderColor: BORDER,
            borderTop: "none",
            bgcolor: WHITE,
          }}
        >
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Stagiaire</InputLabel>
                <Select
                  name="stagiaire_id"
                  value={filters.stagiaire_id}
                  onChange={handleFilterChange}
                  label="Stagiaire"
                >
                  <MenuItem value=""><em>Tous</em></MenuItem>
                  {stagiaires.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.prenom} {s.nom}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Type de document</InputLabel>
                <Select
                  name="type_document"
                  value={filters.type_document}
                  onChange={handleFilterChange}
                  label="Type de document"
                >
                  <MenuItem value=""><em>Tous</em></MenuItem>
                  {DOCUMENT_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Statut</InputLabel>
                <Select
                  name="statut"
                  value={filters.statut}
                  onChange={handleFilterChange}
                  label="Statut"
                >
                  <MenuItem value=""><em>Tous</em></MenuItem>
                  {STATUTS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button
              onClick={resetFilters}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                borderColor: BORDER,
                color: TEXT,
                "&:hover": { borderColor: SECONDARY, color: SECONDARY, bgcolor: "#ffebee" },
              }}
            >
              Réinitialiser
            </Button>
            <Button
              onClick={applyFilters}
              variant="contained"
              size="small"
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: "#16224a" },
              }}
            >
              Appliquer
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Badges de filtres actifs */}
      {hasActiveFilters && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {activeFilters.stagiaire_id && (
            <Chip
              label={`Stagiaire: ${getStagiaireName(Number(activeFilters.stagiaire_id))}`}
              size="small"
              onDelete={() => { setActiveFilters((p) => ({ ...p, stagiaire_id: "" })); setFilters((p) => ({ ...p, stagiaire_id: "" })); }}
              sx={{ bgcolor: BLUE_LIGHT, color: PRIMARY, fontWeight: 600 }}
            />
          )}
          {activeFilters.type_document && (
            <Chip
              label={`Type: ${activeFilters.type_document}`}
              size="small"
              onDelete={() => { setActiveFilters((p) => ({ ...p, type_document: "" })); setFilters((p) => ({ ...p, type_document: "" })); }}
              sx={{ bgcolor: "#f3e5f5", color: "#7b1fa2", fontWeight: 600 }}
            />
          )}
          {activeFilters.statut && (
            <Chip
              label={`Statut: ${STATUTS.find(s => s.value === activeFilters.statut)?.label}`}
              size="small"
              onDelete={() => { setActiveFilters((p) => ({ ...p, statut: "" })); setFilters((p) => ({ ...p, statut: "" })); }}
              sx={{ bgcolor: ORANGE_LIGHT, color: WARNING, fontWeight: 600 }}
            />
          )}
        </Box>
      )}

      {/* Tableau */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: BORDER,
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          overflowY: "hidden",
          bgcolor: WHITE,
        }}
      >
        <Table sx={{ tableLayout: "fixed", width: "100%" }}>
          <colgroup>
            <col style={{ width: "30%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "8%" }} />
          </colgroup>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
              {["Stagiaire", "Nombre de documents", "Statut global"].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontWeight: 700,
                    color: PRIMARY,
                    borderBottom: "none",
                    py: 1.5,
                  }}
                >
                  {h}
                </TableCell>
              ))}
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  color: PRIMARY,
                  borderBottom: "none",
                  py: 1.5,
                }}
              >
                Détails
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lignesStagiaires.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: TEXT_LIGHT, mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    Aucun document trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              lignesStagiaires.map(({ stagiaire_id, docs, complet }) => {
                const isOpen = expandedStagiaire === stagiaire_id;
                return (
                  <Fragment key={stagiaire_id}>
                    <TableRow
                      hover
                      onClick={() => toggleExpand(stagiaire_id)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": { bgcolor: "#F8FAFC" },
                        "& td": { borderBottom: isOpen ? "none" : "1px solid #f1f5f9" },
                      }}
                    >
                      <TableCell sx={{ py: 1.3, px: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(stagiaire_id),
                              width: 36,
                              height: 36,
                              fontSize: 13,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {getStagiaireInitials(stagiaire_id)}
                          </Avatar>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT, whiteSpace: "nowrap" }}>
                            {getStagiaireName(stagiaire_id)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.3, px: 1.5 }}>
                        <Typography variant="body2" sx={{ color: TEXT, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                          {docs.length} document{docs.length > 1 ? "s" : ""}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.3, px: 1.5 }}>
                        <Chip
                          label={complet ? "Complet" : "Incomplet"}
                          size="small"
                          sx={{
                            bgcolor: complet ? GREEN_LIGHT : ORANGE_LIGHT,
                            color: complet ? SUCCESS : WARNING,
                            fontWeight: 600,
                            borderRadius: 2,
                            fontSize: "0.75rem",
                            height: 24,
                            px: 0.5,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.3, px: 1 }}>
                        <IconButton size="small" sx={{ color: PRIMARY }}>
                          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} sx={{ p: 0, borderBottom: isOpen ? "1px solid #f1f5f9" : "none" }}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ bgcolor: "#FAFBFD", px: 3, py: 2 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  {["Type de document", "Origine", "Date", "Statut", "Lien fichier", "Actions"].map((h) => (
                                    <TableCell
                                      key={h}
                                      sx={{
                                        fontWeight: 700,
                                        color: TEXT_LIGHT,
                                        borderBottom: "1px solid #e5e7eb",
                                        py: 0.8,
                                        px: 1,
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {h}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {docs.map((doc) => {
                                  const status = getStatusConfig(doc.statut);
                                  return (
                                    <TableRow key={doc.id}>
                                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 0.8, px: 1 }}>
                                        <Typography variant="body2" fontWeight={500} sx={{ color: TEXT, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                                          {doc.type_document}
                                        </Typography>
                                      </TableCell>
                                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 0.8, px: 1 }}>
                                        {(() => {
                                          const origineConfig = {
                                            stagiaire: { label: "Déposé", bg: BLUE_LIGHT, color: PRIMARY },
                                            rh: { label: "Émis RH", bg: GREEN_LIGHT, color: SUCCESS },
                                            encadrant: { label: "Encadrant", bg: "#F3E8FF", color: "#7C3AED" },
                                          };
                                          const conf = origineConfig[doc.origine] || origineConfig.stagiaire;
                                          return (
                                            <Chip
                                              label={conf.label}
                                              size="small"
                                              sx={{
                                                bgcolor: conf.bg,
                                                color: conf.color,
                                                fontWeight: 600,
                                                fontSize: "0.75rem",
                                                height: 22,
                                                borderRadius: 2,
                                                px: 0.4,
                                              }}
                                            />
                                          );
                                        })()}
                                      </TableCell>
                                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 0.8, px: 1 }}>
                                        <Typography variant="body2" sx={{ color: TEXT, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                                          {doc.date_document
                                            ? new Date(doc.date_document).toLocaleDateString("fr-FR", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              })
                                            : "—"}
                                        </Typography>
                                      </TableCell>
                                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 0.8, px: 1 }} onClick={(e) => e.stopPropagation()}>
                                        <Select
                                          value={doc.statut || "en_attente"}
                                          onChange={(e) => handleStatutChange(doc.id, e.target.value)}
                                          size="small"
                                          disabled={doc.statut === "valide" || doc.statut === "refuse"}
                                          sx={{
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: status.color,
                                            bgcolor: status.bg,
                                            borderRadius: 2,
                                            minWidth: 100,
                                            "& .MuiSelect-select": { py: 0.5 },
                                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                          }}
                                        >
                                          {STATUTS.filter((s) => s.value !== "refuse").map((s) => (
                                            <MenuItem key={s.value} value={s.value}>
                                              {s.label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </TableCell>
                                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 0.8, px: 1 }}>
                                        {doc.fichier_url ? (
                                          <Button
                                            size="small"
                                            startIcon={<LinkIcon sx={{ fontSize: 14 }} />}
                                            href={doc.fichier_url?.startsWith("http") ? doc.fichier_url : `${API_URL}${doc.fichier_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                              textTransform: "none",
                                              fontWeight: 600,
                                              color: PRIMARY,
                                              fontSize: "0.7rem",
                                              minWidth: 0,
                                              px: 1,
                                              "&:hover": { bgcolor: BLUE_LIGHT },
                                            }}
                                          >
                                            Voir
                                          </Button>
                                        ) : (
                                          <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.85rem" }}>
                                            —
                                          </Typography>
                                        )}
                                      </TableCell>
                                      <TableCell onClick={(e) => e.stopPropagation()} sx={{ py: 0.8, px: 1 }}>
                                        {(doc.statut === "valide" || doc.statut === "refuse") ? (
                                          <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontSize: "0.85rem" }}>
                                            —
                                          </Typography>
                                        ) : (
                                          <Tooltip title="Supprimer">
                                            <IconButton
                                              size="small"
                                              onClick={() => handleDelete(doc.id)}
                                              sx={{ color: SECONDARY }}
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ─── DIALOG ─── */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
            <DescriptionIcon sx={{ fontSize: 20, color: "white" }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {modeEdition ? "Modifier le Document" : "Nouveau Document"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Gérez les documents administratifs des stagiaires
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ ml: "auto", color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 3 }}>
          <Box sx={{ mb: 3 }}>
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
              Informations du Document
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth error={errors.stagiaire_id} disabled={modeEdition}>
                  <InputLabel>Stagiaire *</InputLabel>
                  <Select
                    name="stagiaire_id"
                    value={form.stagiaire_id}
                    onChange={handleChange}
                    label="Stagiaire *"
                  >
                    <MenuItem value=""><em>Sélectionner un stagiaire</em></MenuItem>
                    {stagiaires.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.prenom} {s.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={errors.type_document} disabled={modeEdition}>
                  <InputLabel>Type de document *</InputLabel>
                  <Select
                    name="type_document"
                    value={form.type_document}
                    onChange={handleChange}
                    label="Type de document *"
                  >
                    <MenuItem value=""><em>Sélectionner</em></MenuItem>
                    {(modeEdition ? DOCUMENT_TYPES : TYPES_DOCUMENTS_RH).map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {modeEdition && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    name="statut"
                    value={form.statut}
                    onChange={handleChange}
                    label="Statut"
                  >
                    {STATUTS.filter((s) => s.value !== "refuse").map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  name="date_document"
                  label="Date du document"
                  value={form.date_document}
                  onChange={handleChange}
                  disabled={modeEdition}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {modeEdition ? (
                  <TextField
                    fullWidth
                    name="fichier_url"
                    label="Lien du fichier"
                    value={form.fichier_url}
                    disabled
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon sx={{ color: TEXT_LIGHT }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                ) : (
                  <Button
                    fullWidth
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      height: 56,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      justifyContent: "flex-start",
                      borderColor: errors.fichier ? SECONDARY : BORDER,
                      color: fichierSelectionne ? TEXT : TEXT_LIGHT,
                      "&:hover": { borderColor: PRIMARY, bgcolor: BLUE_LIGHT },
                    }}
                  >
                    {fichierSelectionne ? fichierSelectionne.name : "Choisir un fichier *"}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        setFichierSelectionne(e.target.files?.[0] || null);
                        if (errors.fichier) setErrors((prev) => ({ ...prev, fichier: false }));
                      }}
                    />
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setOpen(false)}
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
            onClick={handleSubmit}
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
    </Box>
  );
}