import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  IconButton,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import LogoutIcon from "@mui/icons-material/Logout";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LockClockIcon from "@mui/icons-material/LockClock";
import FolderIcon from "@mui/icons-material/Folder";
import CampaignIcon from "@mui/icons-material/Campaign";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import EventIcon from "@mui/icons-material/Event";
import { clearToken, authHeaders } from "../auth";
import TopBarStagiaire from "../components/TopBarStagiaire";

const API_URL = "http://127.0.0.1:8001";

// === COULEURS (alignées sur le Dashboard RH de la binôme) ===
const PRIMARY = "#1D2B5B";
const SECONDARY = "#E31E24";
const SUCCESS = "#2E7D32";
const DANGER = "#C62828";
const WARNING = "#EF6C00";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const BORDER = "#E5E7EB";
const TEXT = "#1F2937";
const TEXT_LIGHT = "#6B7280";
const BLUE = "#1565C0";
const BLUE_LIGHT = "#E8F0FE";
const RED_LIGHT = "#FDECEC";
const GREEN_LIGHT = "#E8F5E9";
const ORANGE_LIGHT = "#FFF3E0";

/*
  ⚠️ DONNÉES MOCKÉES TEMPORAIRES
  Les sections "Activités récentes" et "Flash infos" n'ont pas encore de
  route backend dédiée. À remplacer par un fetch vers l'API dès que ces
  routes existent côté FastAPI et sont branchées ici.
*/
const ACTIVITES_RECENTES_MOCK = [
  {
    id: 1,
    date: "Aujourd'hui, 09:30",
    titre: "Rapport mensuel validé par l'encadrant",
    description: "Félicitations pour vos avancées sur le projet.",
    type: "valide",
  },
  {
    id: 2,
    date: "Hier, 14:15",
    titre: "Nouveau document partagé",
    description: "Directives de sécurité mises à jour.",
    type: "document",
  },
  {
    id: 3,
    date: "02 Mars 2024",
    titre: "Réunion de mi-parcours planifiée",
    description: "Prévue prochainement en salle de réunion.",
    type: "planifie",
  },
];

const FLASH_INFO_MOCK = {
  cle: "seminaire-jeunes-talents-2026",
  titre: "Séminaire Jeunes Talents",
  message:
    "Rappel : la session d'accueil pour tous les nouveaux stagiaires aura lieu vendredi à 14h00.",
};

function joursEntre(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function calculerProgression(dateDebut, dateFin) {
  const total = joursEntre(dateDebut, dateFin);
  const ecoule = joursEntre(dateDebut, new Date());
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((ecoule / total) * 100)));
}

function determinerPhase(progression) {
  if (progression < 25) return "Phase 1 : Intégration";
  if (progression < 60) return "Phase 2 : Analyse & Conception";
  if (progression < 90) return "Phase 3 : Réalisation";
  return "Phase 4 : Clôture";
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function calculerDureeMois(dateDebut, dateFin) {
  const a = new Date(dateDebut);
  const b = new Date(dateFin);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const mois = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  return Math.max(1, mois);
}

function capitaliser(texte) {
  return texte.charAt(0).toUpperCase() + texte.slice(1).replace(".", "");
}

function formaterPeriode(dateDebut, dateFin) {
  const a = new Date(dateDebut);
  const b = new Date(dateFin);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "—";
  const options = { month: "short", year: "numeric" };
  return `${capitaliser(a.toLocaleDateString("fr-FR", options))} - ${capitaliser(b.toLocaleDateString("fr-FR", options))}`;
}

// === Carte statistique — même style que le Dashboard RH ===
function CarteStat({ titre, valeur, Icone, couleurIcone, couleurFond, badge, badgeColor, badgeFond }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${BORDER}`,
        bgcolor: WHITE,
        flex: 1,
        minWidth: 220,
        transition: "all 0.25s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: couleurFond,
            color: couleurIcone,
          }}
        >
          <Icone sx={{ fontSize: 24 }} />
        </Box>
        {badge && (
          <Typography
            variant="caption"
            sx={{
              color: badgeColor || SUCCESS,
              fontWeight: 700,
              bgcolor: badgeFond || GREEN_LIGHT,
              px: 1.2,
              py: 0.4,
              borderRadius: 1.5,
              fontSize: "0.75rem",
            }}
          >
            {badge}
          </Typography>
        )}
      </Box>
      <Typography
        variant="body2"
        sx={{ color: TEXT_LIGHT, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem", mb: 1 }}
      >
        {titre}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 700, color: PRIMARY, lineHeight: 1, fontSize: "2rem" }}>
        {valeur}
      </Typography>
    </Paper>
  );
}

function EmptyState({ icon, text }) {
  return (
    <Box sx={{ textAlign: "center", py: 5 }}>
      {icon}
      <Typography variant="body2" sx={{ color: TEXT_LIGHT, mt: 1 }}>
        {text}
      </Typography>
    </Box>
  );
}

function DocumentIcon({ type }) {
  if (type === "img") return <FolderIcon sx={{ color: SUCCESS }} />;
  return <InsertDriveFileIcon sx={{ color: SECONDARY }} />;
}

function DocumentRow({ doc }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.5,
        borderBottom: `1px solid ${BORDER}`,
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2.5,
          bgcolor: BACKGROUND,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DocumentIcon type={doc.icon} />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" fontWeight={600} sx={{ color: TEXT }}>
          {doc.nom}
        </Typography>
        <Typography variant="caption" sx={{ color: doc.valide ? SUCCESS : SECONDARY, fontWeight: 600 }}>
          {doc.statut}
        </Typography>
      </Box>
      {doc.valide ? (
        <CheckCircleIcon sx={{ color: SUCCESS, fontSize: 20 }} />
      ) : (
        <ChevronRightIcon sx={{ color: TEXT_LIGHT }} />
      )}
    </Box>
  );
}

function ActiviteIcon({ type }) {
  if (type === "valide") return <CheckCircleIcon sx={{ color: SUCCESS }} />;
  if (type === "document") return <DescriptionIcon sx={{ color: PRIMARY }} />;
  return <LockClockIcon sx={{ color: TEXT_LIGHT }} />;
}

function ActiviteRow({ activite }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, py: 1.5 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          mt: 1,
          flexShrink: 0,
          bgcolor: activite.type === "valide" ? SUCCESS : activite.type === "document" ? PRIMARY : TEXT_LIGHT,
        }}
      />
      <Box>
        <Typography variant="caption" sx={{ color: TEXT_LIGHT }}>
          {activite.date}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color: TEXT }}>
          {activite.titre}
        </Typography>
        <Typography variant="body2" sx={{ color: TEXT_LIGHT }}>
          {activite.description}
        </Typography>
      </Box>
    </Box>
  );
}

function DashboardStagiaire() {
  const navigate = useNavigate();
  const { profil } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [statsPresence, setStatsPresence] = useState(null);
  const [prochaineReunion, setProchaineReunion] = useState(null);
  const [presenceConfirmee, setPresenceConfirmee] = useState(false);
  const [confirmationEnCours, setConfirmationEnCours] = useState(false);
  const [prochaineSession, setProchaineSession] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/sessions`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const aujourdHui = new Date();
        aujourdHui.setHours(0, 0, 0, 0);
        const sessionsAVenir = (data || [])
          .filter((s) => new Date(s.date_session) >= aujourdHui)
          .sort((a, b) => new Date(a.date_session) - new Date(b.date_session));
        const prochaine = sessionsAVenir[0] || null;
        setProchaineSession(prochaine);

        if (prochaine) {
          fetch(`${API_URL}/moi/confirmer-evenement/session-${prochaine.id}`, {
            headers: { ...authHeaders(), "Content-Type": "application/json" },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((confData) => {
              if (confData) setPresenceConfirmee(Boolean(confData.confirme));
            })
            .catch(() => {});
        }
      })
      .catch(() => setProchaineSession(null));

    fetch(`${API_URL}/moi/documents`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger vos données. Vérifiez votre connexion.");
        setLoading(false);
      });

    fetch(`${API_URL}/moi/presences/stats`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStatsPresence(data))
      .catch(() => setStatsPresence(null));

    fetch(`${API_URL}/moi/prochaine-reunion`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProchaineReunion(data))
      .catch(() => setProchaineReunion(null));
  }, []);

  async function chargerImageBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function exporterRapport() {
    const stageDoc = profil?.stage;
    const progressionDoc = stageDoc ? calculerProgression(stageDoc.date_debut, stageDoc.date_fin) : 0;
    const phaseDoc = determinerPhase(progressionDoc);
    const dureeMoisDoc = stageDoc ? calculerDureeMois(stageDoc.date_debut, stageDoc.date_fin) : null;
    const periodeDoc = stageDoc ? formaterPeriode(stageDoc.date_debut, stageDoc.date_fin) : "—";

    const PRIMARY_RGB = [29, 43, 91];

    const doc = new jsPDF();

    doc.setFillColor(...PRIMARY_RGB);
    doc.rect(0, 0, 210, 32, "F");

    try {
      const logoBase64 = await chargerImageBase64("/images/sigle-hutchinson.png");
      doc.addImage(logoBase64, "PNG", 14, 6, 20, 20);
    } catch (e) {
      // pas grave si le logo ne charge pas
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Rapport de stage", 40, 16);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Genere le ${new Date().toLocaleDateString("fr-FR")}`, 40, 23);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text(profil?.nom || "-", 14, 42);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(profil?.email || "", 14, 48);
    doc.text(`Periode de stage : ${periodeDoc}`, 14, 54);

    autoTable(doc, {
      startY: 62,
      head: [["Indicateur", "Valeur"]],
      body: [
        ["Duree totale", dureeMoisDoc ? `${dureeMoisDoc} mois` : "-"],
        ["Progression", `${progressionDoc}%`],
        ["Phase actuelle", phaseDoc],
        ["Documents deposes", `${documents.length} fichier${documents.length > 1 ? "s" : ""}`],
        ["Taux de presence (mois)", statsPresence ? `${statsPresence.taux_presence}%` : "-"],
        ["Total heures (mois)", statsPresence ? `${statsPresence.total_heures_mois} h` : "-"],
        ["Jours d'absence (mois)", statsPresence ? `${statsPresence.jours_absence_mois}` : "-"],
      ],
      headStyles: { fillColor: PRIMARY_RGB, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 251] },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    const nomFichier = `rapport-stage-${(profil?.nom || "stagiaire").toLowerCase().replace(/\s+/g, "-")}.pdf`;
    doc.save(nomFichier);
  }

  async function confirmerPresenceEvenement() {
    if (!prochaineSession) return;
    setConfirmationEnCours(true);
    try {
      const res = await fetch(`${API_URL}/moi/confirmer-evenement/session-${prochaineSession.id}`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      if (res.ok) {
        setPresenceConfirmee(true);
      }
    } catch (e) {
      // silencieux : le bouton reste cliquable si ca echoue
    } finally {
      setConfirmationEnCours(false);
    }
  }

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  if (loading) {
    return (
      <>
        <TopBarStagiaire nom={profil?.nom} photoUrl={profil?.photo_url ? `${API_URL}${profil.photo_url}` : undefined} />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress sx={{ color: PRIMARY }} />
        </Box>
      </>
    );
  }

  const stage = profil?.stage;
  const progression = stage ? calculerProgression(stage.date_debut, stage.date_fin) : 0;
  const joursPasses = stage ? Math.max(0, joursEntre(stage.date_debut, new Date())) : 0;
  const joursRestants = stage ? Math.max(0, joursEntre(new Date(), stage.date_fin)) : 0;
  const phase = determinerPhase(progression);
  const dureeMois = stage ? calculerDureeMois(stage.date_debut, stage.date_fin) : null;
  const periodeLibelle = stage ? formaterPeriode(stage.date_debut, stage.date_fin) : "—";

  return (
    <>
      <TopBarStagiaire nom={profil?.nom} photoUrl={profil?.photo_url ? `${API_URL}${profil.photo_url}` : undefined} />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, mb: 0.5, fontSize: "1.75rem" }}>
                Bienvenue, {profil?.nom || "—"} !
              </Typography>
              <Typography sx={{ color: TEXT_LIGHT, fontSize: 14 }}>
                {stage ? "Voici un aperçu de l'avancement de votre stage chez Hutchinson." : profil?.email}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                onClick={exporterRapport}
                variant="contained"
                startIcon={<FileDownloadIcon />}
                sx={{ bgcolor: PRIMARY, textTransform: "none", borderRadius: 2, "&:hover": { bgcolor: PRIMARY } }}
              >
                Exporter le rapport
              </Button>

              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                variant="contained"
                sx={{
                  bgcolor: SECONDARY,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  boxShadow: "0 8px 20px rgba(227,30,36,.25)",
                  "&:hover": {
                    bgcolor: "#c4171d",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Déconnexion
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {!stage && !error && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Aucune fiche de stage n'est encore associée à votre compte. Contactez le service RH.
            </Alert>
          )}

          {stage && (
            <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", mb: 3 }}>
              <CarteStat
                titre="Durée totale"
                valeur={dureeMois ? `${dureeMois} Mois` : "—"}
                Icone={WorkIcon}
                couleurIcone={PRIMARY}
                couleurFond="#E8EAF6"
              />
              <CarteStat
                titre="Progression"
                valeur={`${progression}%`}
                Icone={CheckCircleIcon}
                couleurIcone={SUCCESS}
                couleurFond={GREEN_LIGHT}
              />
              <CarteStat
                titre="Documents"
                valeur={`${documents.length} Fichiers`}
                Icone={FolderIcon}
                couleurIcone={WARNING}
                couleurFond={ORANGE_LIGHT}
                badge={documents.length > 0 ? "Action requise" : null}
                badgeColor={DANGER}
                badgeFond={RED_LIGHT}
              />
              <CarteStat
                titre="Présence"
                valeur={statsPresence ? `${statsPresence.taux_presence}%` : "—"}
                Icone={AccessTimeIcon}
                couleurIcone={BLUE}
                couleurFond={BLUE_LIGHT}
                badge={
                  statsPresence
                    ? `${statsPresence.jours_absence_mois} abs.`
                    : null
                }
                badgeColor={TEXT_LIGHT}
                badgeFond={BACKGROUND}
              />
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Colonne gauche */}
            <Box sx={{ flex: 2, minWidth: 320, display: "flex", flexDirection: "column", gap: 3 }}>
              {stage && (
                <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY }}>
                      Progression du stage
                    </Typography>
                    <Chip
                      label={phase}
                      size="small"
                      sx={{ bgcolor: RED_LIGHT, color: DANGER, fontWeight: 700, borderRadius: 1.5, height: 22, fontSize: "0.7rem" }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.7rem" }}>
                      Début — {formatDate(stage.date_debut)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.7rem" }}>
                      Fin — {formatDate(stage.date_fin)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progression}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#EEF1F6",
                      "& .MuiLinearProgress-bar": { bgcolor: PRIMARY, borderRadius: 4 },
                    }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.7rem" }}>
                      {progression}% complété · {joursPasses} jours passés
                    </Typography>
                    <Typography variant="caption" sx={{ color: TEXT_LIGHT, fontSize: "0.7rem" }}>
                      {joursRestants} jours restants
                    </Typography>
                  </Box>
                </Paper>
              )}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.1rem" }}>
                    Activités récentes
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigate("/stagiaire/activites")}
                    sx={{ textTransform: "none", fontWeight: 700, color: PRIMARY }}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                  >
                    Voir tout
                  </Button>
                </Box>
                {ACTIVITES_RECENTES_MOCK.length === 0 ? (
                  <EmptyState
                    icon={<AssignmentTurnedInIcon sx={{ color: TEXT_LIGHT, fontSize: 32 }} />}
                    text="Le suivi des activités arrive prochainement dans cet espace."
                  />
                ) : (
                  ACTIVITES_RECENTES_MOCK.map((a, i) => (
                    <Box key={a.id}>
                      <ActiviteRow activite={a} />
                      {i < ACTIVITES_RECENTES_MOCK.length - 1 && <Divider sx={{ borderColor: "#f1f5f9" }} />}
                    </Box>
                  ))
                )}
              </Paper>
            </Box>

            {/* Colonne droite */}
            <Box sx={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${BORDER}`, bgcolor: WHITE }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.1rem" }}>
                    Documents en attente
                  </Typography>
                  {documents.length > 3 && (
                    <Button
                      size="small"
                      onClick={() => navigate("/stagiaire/documents")}
                      sx={{ textTransform: "none", fontWeight: 700, color: PRIMARY }}
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                    >
                      Voir tout
                    </Button>
                  )}
                </Box>
                {documents.length === 0 ? (
                  <EmptyState
                    icon={<DescriptionIcon sx={{ color: TEXT_LIGHT, fontSize: 32 }} />}
                    text="Le dépôt de documents arrive prochainement dans cet espace."
                  />
                ) : (
                  documents.slice(0, 3).map((doc) => <DocumentRow key={doc.id} doc={doc} />)
                )}
              </Paper>

              <Paper
                elevation={0}
                sx={{ p: 3, pb: 4, borderRadius: 4, bgcolor: PRIMARY, color: "#fff", position: "relative", overflow: "visible" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CampaignIcon fontSize="small" />
                    <Typography variant="overline" fontWeight={700}>
                      Flash infos
                    </Typography>
                  </Box>
                  <FiberManualRecordIcon sx={{ fontSize: 10, color: SECONDARY }} />
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                  {prochaineSession ? prochaineSession.titre : "Aucune session à venir"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#C7CBE0", mb: 2 }}>
                  {prochaineSession
                    ? `Prévue le ${new Date(prochaineSession.date_session).toLocaleDateString("fr-FR")}${prochaineSession.heure ? ` à ${prochaineSession.heure}` : ""}${prochaineSession.salle ? ` — ${prochaineSession.salle}` : ""}`
                    : "Aucune nouvelle session de formation programmée pour le moment."}
                </Typography>

                {prochaineSession && (
                  <Button
                    onClick={confirmerPresenceEvenement}
                    disabled={presenceConfirmee || confirmationEnCours}
                    endIcon={presenceConfirmee ? null : <ArrowForwardIcon />}
                    sx={{
                      textTransform: "none",
                      color: presenceConfirmee ? "#8BC48A" : SECONDARY,
                      fontWeight: 700,
                      p: 0,
                      "&.Mui-disabled": { color: presenceConfirmee ? "#8BC48A" : "#E3717A" },
                    }}
                  >
                    {presenceConfirmee ? "Présence confirmée ✓" : confirmationEnCours ? "Envoi..." : "Confirmer ma présence"}
                  </Button>
                )}


              </Paper>
            </Box>
          </Box>
      </Box>
    </>
  );
}

export default DashboardStagiaire;
