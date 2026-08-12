import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Avatar,
  MenuItem,
  Select,
  InputBase,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FolderIcon from "@mui/icons-material/Folder";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SearchIcon from "@mui/icons-material/Search";
import { authHeaders } from "../auth";
const API_URL = "http://127.0.0.1:8001";

async function telechargerFichier(url, nomFichier) {
  try {
    const reponse = await fetch(url, { headers: { ...authHeaders() } });
    if (!reponse.ok) throw new Error("Échec du téléchargement");
    const blob = await reponse.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = urlBlob;
    lien.download = nomFichier || "document";
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    window.URL.revokeObjectURL(urlBlob);
  } catch (erreur) {
    console.error("Erreur de téléchargement :", erreur);
  }
}

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

const PAR_PAGE = 10;

const LIBELLES_TYPES = {
  convention: "Convention de stage",
  attestation: "Attestation de stage",
  rapport_intermediaire: "Rapport intermédiaire",
  rapport_final: "Rapport final",
  lettre_affectation: "Lettre d'affectation",
  badge_photo: "Badge / Photo",
  fiche_securite: "Fiche sécurité",
  certificat: "Certificat",
};

// Types que le stagiaire peut deposer lui-meme (hors documents delivres par la RH)
const TYPES_DEPOT_STAGIAIRE = {
  convention: LIBELLES_TYPES.convention,
  rapport_intermediaire: LIBELLES_TYPES.rapport_intermediaire,
  rapport_final: LIBELLES_TYPES.rapport_final,
  certificat: LIBELLES_TYPES.certificat,
};

const STYLES_STATUT = {
  Valide: { bg: "#E8F5E9", color: "#2E7D32" },
  "En attente": { bg: "#E3F2FD", color: "#1565C0" },
  Refuse: { bg: "#FDECEA", color: SECONDARY },
  Manquant: { bg: "#F1F1F1", color: TEXT_LIGHT },
};

function BadgeStatut({ statut }) {
  const style = STYLES_STATUT[statut] || STYLES_STATUT.Manquant;
  return (
    <Chip
      label={statut}
      size="small"
      sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600 }}
    />
  );
}

function IconeDocument({ icon }) {
  const style = { color: PRIMARY, fontSize: 22 };
  if (icon === "img") return <FolderIcon sx={{ ...style, color: "#2E7D32" }} />;
  return <InsertDriveFileIcon sx={style} />;
}

function CarteStat({ icon, label, valeur, couleur }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${BORDER}`,
        bgcolor: WHITE,
        flex: 1,
        minWidth: 150,
        transition: "all 0.25s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: `${couleur}20`,
            color: couleur,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" sx={{ color: TEXT_LIGHT, fontWeight: 600, textTransform: "uppercase" }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h3" sx={{ color: PRIMARY, fontWeight: 800, fontSize: "2rem" }}>
        {valeur}
      </Typography>
    </Paper>
  );
}

function formaterDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR");
}

function DocumentsStagiaire() {
  const { profil, erreurProfil } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ total: 0, valides: 0, en_attente: 0, refuses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreType, setFiltreType] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [typeDocument, setTypeDocument] = useState("");
  const [fichier, setFichier] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurUpload, setErreurUpload] = useState("");
  const [documentASupprimer, setDocumentASupprimer] = useState(null);
  const [documentAModifier, setDocumentAModifier] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  function confirmerSuppressionDocument() {
    if (!documentASupprimer) return;
    setSuppressionEnCours(true);
    fetch(`${API_URL}/documents/${documentASupprimer}`, {
      method: "DELETE",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Echec de la suppression.");
        return res.json();
      })
      .then(() => {
        rechargerDocuments();
        setDocumentASupprimer(null);
      })
      .catch((err) => setError(err.message || "Erreur lors de la suppression."))
      .finally(() => setSuppressionEnCours(false));
  }

  function ouvrirModification(doc) {
    setDocumentAModifier(doc);
    setTypeDocument(doc.type_document || "");
    setFichier(null);
    setErreurUpload("");
    setModalOuvert(true);
  }

  function rechargerDocuments() {
    fetch(`${API_URL}/moi/documents`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDocuments(data))
      .catch(() => {});

    fetch(`${API_URL}/moi/documents/stats`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }

  function gererUpload() {
    const estModification = !!documentAModifier;

    if (!estModification && (!typeDocument || !fichier)) {
      setErreurUpload("Choisissez un type de document et un fichier.");
      return;
    }
    if (estModification && !typeDocument && !fichier) {
      setErreurUpload("Modifiez le type ou selectionnez un nouveau fichier.");
      return;
    }

    setEnvoiEnCours(true);
    setErreurUpload("");

    const formData = new FormData();
    if (typeDocument) formData.append("type_document", typeDocument);
    if (fichier) formData.append("fichier", fichier);

    const url = estModification
      ? `${API_URL}/documents/${documentAModifier.id}`
      : `${API_URL}/documents/upload`;
    const method = estModification ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { ...authHeaders() },
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Échec de l'envoi du document.");
        }
        return res.json();
      })
      .then(() => {
        setModalOuvert(false);
        setTypeDocument("");
        setFichier(null);
        setDocumentAModifier(null);
        rechargerDocuments();
      })
      .catch((err) => {
        setErreurUpload(err.message || "Erreur lors de l'envoi.");
      })
      .finally(() => setEnvoiEnCours(false));
  }

  useEffect(() => {
    fetch(`${API_URL}/moi/documents`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger vos documents.");
        setLoading(false);
      });

    fetch(`${API_URL}/moi/documents/stats`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  const typesDisponibles = [...new Set(documents.map((d) => d.nom))];

  const documentsFiltres = documents.filter((doc) => {
    if (!doc.fichier_url) return false;
    if (filtreStatut !== "tous" && doc.statut !== filtreStatut) return false;
    if (filtreType !== "tous" && doc.nom !== filtreType) return false;
    if (recherche && !doc.nom.toLowerCase().includes(recherche.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(documentsFiltres.length / PAR_PAGE));
  const pageActuelle = Math.min(page, totalPages);
  const documentsPage = documentsFiltres.slice((pageActuelle - 1) * PAR_PAGE, pageActuelle * PAR_PAGE);

  if (loading) {
    return (
      <>
<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress sx={{ color: PRIMARY }} />
        </Box>
      </>
    );
  }

  return (
    <>
<Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: "56px", md: "120px" } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY, fontSize: "1.75rem" }}>
                Gestion documentaire
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 0.5 }}>
                Centralisez, suivez et gérez tous vos documents administratifs de stage.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => {
                setDocumentAModifier(null);
                setTypeDocument("");
                setFichier(null);
                setErreurUpload("");
                setModalOuvert(true);
              }}
              sx={{ bgcolor: PRIMARY, textTransform: "none", borderRadius: 2, "&:hover": { bgcolor: PRIMARY } }}
            >
              + Ajouter un document
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {(error || erreurProfil) && (
            <Typography variant="body2" sx={{ color: SECONDARY, mb: 2 }}>
              {error || erreurProfil}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <CarteStat icon={<DescriptionIcon fontSize="small" />} label="Total fichiers" valeur={stats.total} couleur={PRIMARY} />
            <CarteStat icon={<CheckCircleIcon fontSize="small" />} label="Validés" valeur={stats.valides} couleur="#2E7D32" />
            <CarteStat icon={<HourglassEmptyIcon fontSize="small" />} label="En attente" valeur={stats.en_attente} couleur="#1565C0" />
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${BORDER}`, overflow: "hidden", bgcolor: WHITE }}>
            <Box sx={{ p: 2.5, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", borderBottom: `1px solid ${BORDER}` }}>
              <Paper elevation={0} sx={{ display: "flex", alignItems: "center", px: 1.5, py: 0.5, borderRadius: 2, border: `1px solid ${BORDER}`, minWidth: 220 }}>
                <SearchIcon fontSize="small" sx={{ color: TEXT_LIGHT, mr: 1 }} />
                <InputBase
                  placeholder="Rechercher un fichier..."
                  fullWidth
                  value={recherche}
                  onChange={(e) => {
                    setRecherche(e.target.value);
                    setPage(1);
                  }}
                  sx={{ fontSize: "0.9rem" }}
                />
              </Paper>

              <Select
                size="small"
                value={filtreType}
                onChange={(e) => {
                  setFiltreType(e.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: 180, borderRadius: 2 }}
              >
                <MenuItem value="tous">Tous les types</MenuItem>
                {typesDisponibles.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>

              <Select
                size="small"
                value={filtreStatut}
                onChange={(e) => {
                  setFiltreStatut(e.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: 160, borderRadius: 2 }}
              >
                <MenuItem value="tous">Tous les statuts</MenuItem>
                <MenuItem value="Valide">Validé</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="Manquant">Manquant</MenuItem>
              </Select>

              <Box sx={{ flexGrow: 1 }} />

              <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
                {documentsFiltres.length === 0
                  ? "Aucun document"
                  : `Affichage de ${(pageActuelle - 1) * PAR_PAGE + 1}-${Math.min(pageActuelle * PAR_PAGE, documentsFiltres.length)} sur ${documentsFiltres.length}`}
              </Typography>
              <IconButton size="small" disabled={pageActuelle <= 1} onClick={() => setPage(pageActuelle - 1)}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" disabled={pageActuelle >= totalPages} onClick={() => setPage(pageActuelle + 1)}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", px: 2.5, py: 1.5, bgcolor: "#FAFAFC", borderBottom: `1px solid ${BORDER}` }}>
              <Typography variant="caption" sx={{ color: TEXT_LIGHT, flex: 3 , fontWeight: 700 }}>DOCUMENT</Typography>
              <Typography variant="caption" sx={{ color: TEXT_LIGHT, flex: 1.5 , fontWeight: 700 }}>DATE D'AJOUT</Typography>
              <Typography variant="caption" sx={{ color: TEXT_LIGHT, flex: 1 , fontWeight: 700 }}>TAILLE</Typography>
              <Typography variant="caption" sx={{ color: TEXT_LIGHT, flex: 1.5 , fontWeight: 700 }}>STATUT</Typography>
              <Typography variant="caption" sx={{ color: TEXT_LIGHT, flex: 1, textAlign: "right" , fontWeight: 700 }}>ACTIONS</Typography>
            </Box>

            {documentsPage.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
                  Aucun document ne correspond à ces critères.
                </Typography>
              </Box>
            ) : (
              documentsPage.map((doc) => (
                <Box
                  key={doc.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2.5,
                    py: 2,
                    borderBottom: `1px solid ${BORDER}`,
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 3 }}>
                    <IconeDocument icon={doc.icon} />
                    <Box>
                      <Typography variant="body2" sx={{ color: "#1F2937" , fontWeight: 600 }}>
                        {doc.nom}
                      </Typography>
                      {(() => {
                        const origineConfig = {
                          stagiaire: { label: "Déposé par moi", bg: "#DBEAFE", color: "#2563EB" },
                          rh: { label: "Reçu du RH", bg: "#DCFCE7", color: "#16A34A" },
                          encadrant: { label: "Reçu de l'encadrant", bg: "#F3E8FF", color: "#7C3AED" },
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
                              fontSize: "0.65rem",
                              height: 20,
                              borderRadius: 1.5,
                              mt: 0.3,
                              px: 0.3,
                            }}
                          />
                        );
                      })()}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: TEXT_LIGHT, flex: 1.5 }}>
                    {formaterDate(doc.date_document)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: TEXT_LIGHT, flex: 1 }}>
                    {doc.taille_affichee || "-"}
                  </Typography>
                  <Box sx={{ flex: 1.5 }}>
                    <BadgeStatut statut={doc.statut} />
                  </Box>
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                    {doc.valide || doc.fichier_url ? (
                      <>
                        <IconButton
                          size="small"
                          disabled={!doc.fichier_url}
                          href={doc.fichier_url ? `${API_URL}${doc.fichier_url}` : undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={!doc.fichier_url}
                          onClick={() =>
                            telechargerFichier(`${API_URL}${doc.fichier_url}`, doc.nom)
                          }
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        {doc.statut !== "Valide" && doc.statut !== "Refuse" && (
                          <IconButton size="small" onClick={() => ouvrirModification(doc)}>
                            <EditIcon fontSize="small" sx={{ color: PRIMARY }} />
                          </IconButton>
                        )}
                      </>
                    ) : null}
                  </Box>
                </Box>
              ))
            )}
          </Paper>

          <Box sx={{ display: "flex", gap: 3, mt: 3, flexWrap: "wrap" }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: PRIMARY, color: "white", flex: 2, minWidth: 280 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <LightbulbIcon fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Conseils pour vos documents</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>
                • Assurez-vous que les fichiers PDF ne dépassent pas 5 Mo.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>
                • Les rapports doivent être signés par votre encadrant avant dépôt.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                • Nommez vos fichiers de manière explicite (Type_Nom_Date).
              </Typography>
            </Paper>

          </Box>
      </Box>

      <Dialog
        open={modalOuvert}
        onClose={() => {
          if (envoiEnCours) return;
          setModalOuvert(false);
          setDocumentAModifier(null);
          setTypeDocument("");
          setFichier(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {documentAModifier ? "Modifier le document" : "Ajouter un document"}
        </DialogTitle>
        <DialogContent>
          {erreurUpload && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erreurUpload}
            </Alert>
          )}

          <Typography variant="caption" sx={{ color: TEXT_LIGHT , fontWeight: 600 }}>
            Type de document
          </Typography>
          <Select
            fullWidth
            size="small"
            value={typeDocument}
            onChange={(e) => setTypeDocument(e.target.value)}
            displayEmpty
            sx={{ mt: 0.5, mb: 2 }}
          >
            <MenuItem value="" disabled>Choisir un type</MenuItem>
            {Object.entries(TYPES_DEPOT_STAGIAIRE).map(([valeur, libelle]) => (
              <MenuItem key={valeur} value={valeur}>{libelle}</MenuItem>
            ))}
          </Select>

          <Typography variant="caption" sx={{ color: TEXT_LIGHT , fontWeight: 600 }}>
            Fichier (PDF, image ou Word)
          </Typography>
          <Button
            component="label"
            variant="outlined"
            fullWidth
            sx={{ mt: 0.5, textTransform: "none", borderRadius: 2, borderColor: BORDER, color: "#1F2937" }}
          >
            {fichier ? fichier.name : "Sélectionner un fichier"}
            <input
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setFichier(e.target.files[0] || null)}
            />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {documentAModifier && (
            <Button
              onClick={() => {
                setModalOuvert(false);
                setDocumentASupprimer(documentAModifier.id);
                setDocumentAModifier(null);
                setTypeDocument("");
                setFichier(null);
              }}
              disabled={envoiEnCours}
              sx={{ textTransform: "none", color: SECONDARY, mr: "auto" }}
            >
              Supprimer
            </Button>
          )}
          <Button
            onClick={() => {
              setModalOuvert(false);
              setDocumentAModifier(null);
              setTypeDocument("");
              setFichier(null);
            }}
            disabled={envoiEnCours}
            sx={{ textTransform: "none", color: TEXT_LIGHT }}
          >
            Annuler
          </Button>
          <Button
            onClick={gererUpload}
            disabled={envoiEnCours}
            variant="contained"
            sx={{ bgcolor: PRIMARY, textTransform: "none", "&:hover": { bgcolor: PRIMARY } }}
          >
            {envoiEnCours ? <CircularProgress size={20} sx={{ color: "white" }} /> : (documentAModifier ? "Enregistrer" : "Envoyer")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!documentASupprimer} onClose={() => !suppressionEnCours && setDocumentASupprimer(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Supprimer le document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
            Cette action est irreversible. Voulez-vous vraiment supprimer ce document ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDocumentASupprimer(null)}
            disabled={suppressionEnCours}
            sx={{ textTransform: "none", color: TEXT_LIGHT }}
          >
            Annuler
          </Button>
          <Button
            onClick={confirmerSuppressionDocument}
            disabled={suppressionEnCours}
            variant="contained"
            sx={{ bgcolor: SECONDARY, textTransform: "none", "&:hover": { bgcolor: "#c4171d" } }}
          >
            {suppressionEnCours ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DocumentsStagiaire;
