import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Skeleton,
  Tooltip,
  Stack,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CircleIcon from "@mui/icons-material/Circle";

const API_URL = "http://127.0.0.1:8001";
const AUTO_REFRESH_MS = 30000;

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
const BLUE_LIGHT = "#E8F0FE";
const RED_LIGHT = "#FDECEC";
const GREEN_LIGHT = "#E8F5E9";
const ORANGE_LIGHT = "#FFF3E0";

const STATUS_META = {
  en_cours: { label: "En cours", color: SUCCESS, bg: GREEN_LIGHT, icon: PendingRoundedIcon },
  termine: { label: "Complété", color: "#1565c0", bg: BLUE_LIGHT, icon: CheckCircleRoundedIcon },
  complete: { label: "Complété", color: "#1565c0", bg: BLUE_LIGHT, icon: CheckCircleRoundedIcon },
  en_attente: { label: "Programmé", color: WARNING, bg: ORANGE_LIGHT, icon: ScheduleRoundedIcon },
  programme: { label: "Programmé", color: WARNING, bg: ORANGE_LIGHT, icon: ScheduleRoundedIcon },
  a_reviser: { label: "À réviser", color: DANGER, bg: RED_LIGHT, icon: WarningAmberRoundedIcon },
};

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "en_cours", label: "En cours" },
  { key: "termine", label: "Complété" },
  { key: "en_attente", label: "Programmé" },
  { key: "a_reviser", label: "À réviser" },
];

function statusMeta(statut) {
  return (
    STATUS_META[statut] || { label: statut || "—", color: "#616161", bg: "#F5F5F5", icon: CircleIcon }
  );
}

function formatRelative(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const diffMs = now - date;
  const heures = Math.floor(diffMs / (1000 * 60 * 60));
  const jours = Math.floor(heures / 24);

  if (heures < 1) {
    const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return minutes < 60 ? `Il y a ${minutes} min` : "À l'instant";
  }
  if (heures < 24) return `Il y a ${heures}h`;
  if (jours === 1) return "Hier";
  if (jours < 7) return `Il y a ${jours} jours`;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(nom) {
  return nom?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";
}

function getAvatarColor(id) {
  const colors = [PRIMARY, SECONDARY, "#64748B", SUCCESS, "#1565c0", WARNING];
  return colors[(id || 0) % colors.length];
}

export default function Activites() {
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [spin, setSpin] = useState(false);

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    setSpin(true);
    fetch(`${API_URL}/activites`)
      .then((r) => {
        if (!r.ok) throw new Error("Erreur activites");
        return r.json();
      })
      .then((data) => {
        setActivites(Array.isArray(data) ? data : []);
        setErrored(false);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        console.error("Erreur activites:", err);
        setErrored(true);
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => setSpin(false), 400);
      });
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const counts = useMemo(() => {
    const base = { all: activites.length, en_cours: 0, termine: 0, en_attente: 0, a_reviser: 0 };
    activites.forEach((a) => {
      const s = a.statut === "complete" ? "termine" : a.statut === "programme" ? "en_attente" : a.statut;
      if (base[s] !== undefined) base[s] += 1;
    });
    return base;
  }, [activites]);

  const filtered = useMemo(() => {
    return activites.filter((a) => {
      const normalizedStatut = a.statut === "complete" ? "termine" : a.statut === "programme" ? "en_attente" : a.statut;
      const matchesFilter = filter === "all" || normalizedStatut === filter;
      const haystack = `${a.stagiaire_nom || ""} ${a.action || ""}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [activites, filter, query]);

  const statCards = [
    { key: "en_cours", label: "En cours", icon: PendingRoundedIcon, color: SUCCESS, bg: GREEN_LIGHT },
    { key: "termine", label: "Complétées", icon: CheckCircleRoundedIcon, color: "#1565c0", bg: BLUE_LIGHT },
    { key: "en_attente", label: "Programmées", icon: ScheduleRoundedIcon, color: WARNING, bg: ORANGE_LIGHT },
    { key: "a_reviser", label: "À réviser", icon: WarningAmberRoundedIcon, color: DANGER, bg: RED_LIGHT },
  ];

  return (
    <Box sx={{ bgcolor: BACKGROUND, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: PRIMARY, fontSize: "1.75rem" }}>
              Activité récente
            </Typography>
            <Box
              sx={{
                width: 8, height: 8, borderRadius: "50%", bgcolor: SUCCESS,
                boxShadow: `0 0 0 4px ${GREEN_LIGHT}`,
                animation: "pulse 2s ease-in-out infinite",
                "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.35 } },
              }}
            />
          </Stack>
          <Typography sx={{ color: TEXT_LIGHT, fontSize: 14, mt: 0.5 }}>
            {loading
              ? "Chargement…"
              : `${filtered.length} activité${filtered.length > 1 ? "s" : ""} · mis à jour ${lastUpdated ? formatRelative(lastUpdated.toISOString()) : "—"}`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Rechercher un stagiaire ou une action…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{
              minWidth: { xs: "100%", sm: 280 },
              bgcolor: WHITE,
              "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: TEXT_LIGHT }} />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Actualiser">
            <IconButton
              onClick={() => load()}
              sx={{
                bgcolor: WHITE, border: "1px solid", borderColor: BORDER, borderRadius: 2.5,
                color: PRIMARY,
                "&:hover": { bgcolor: BLUE_LIGHT },
              }}
            >
              <RefreshRoundedIcon sx={{ fontSize: 20, transition: "transform 0.5s", transform: spin ? "rotate(360deg)" : "none" }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 2, mb: 3 }}>
        {statCards.map(({ key, label, icon: Icon, color, bg }) => (
          <Box
            key={key}
            onClick={() => setFilter(filter === key ? "all" : key)}
            sx={{
              cursor: "pointer",
              bgcolor: WHITE,
              border: "1px solid",
              borderColor: filter === key ? color : BORDER,
              borderRadius: 3,
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              transition: "all 0.15s ease",
              "&:hover": { borderColor: color, transform: "translateY(-1px)" },
            }}
          >
            <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon sx={{ fontSize: 20, color }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: TEXT, lineHeight: 1 }}>
                {loading ? <Skeleton width={24} /> : counts[key] ?? 0}
              </Typography>
              <Typography sx={{ fontSize: 12, color: TEXT_LIGHT, mt: 0.3 }}>{label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Filter chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: "wrap", rowGap: 1 }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.key === "all" ? `Toutes (${counts.all})` : f.label}
            onClick={() => setFilter(f.key)}
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: filter === f.key ? PRIMARY : WHITE,
              color: filter === f.key ? WHITE : TEXT_LIGHT,
              border: "1px solid",
              borderColor: filter === f.key ? PRIMARY : BORDER,
              "&:hover": { bgcolor: filter === f.key ? PRIMARY : "#F1F5F9" },
            }}
          />
        ))}
      </Stack>

      {/* Feed */}
      <Box
        sx={{
          bgcolor: WHITE,
          border: "1px solid",
          borderColor: BORDER,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ p: 3 }}>
            {[...Array(5)].map((_, i) => (
              <Stack key={i} direction="row" spacing={2} alignItems="center" sx={{ py: 1.5 }}>
                <Skeleton variant="circular" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="65%" height={14} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton width={80} height={24} sx={{ borderRadius: 2 }} />
              </Stack>
            ))}
          </Box>
        ) : errored ? (
          <Box sx={{ textAlign: "center", py: 7, px: 3 }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 34, color: DANGER, mb: 1 }} />
            <Typography sx={{ color: TEXT, fontWeight: 600 }}>Impossible de charger l'activité</Typography>
            <Typography sx={{ color: TEXT_LIGHT, fontSize: 13, mt: 0.5 }}>
              Vérifiez que le serveur est démarré, puis réessayez.
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 7, px: 3 }}>
            <InboxRoundedIcon sx={{ fontSize: 34, color: TEXT_LIGHT, mb: 1 }} />
            <Typography sx={{ color: TEXT, fontWeight: 600 }}>
              {query || filter !== "all" ? "Aucun résultat" : "Aucune activité récente"}
            </Typography>
            <Typography sx={{ color: TEXT_LIGHT, fontSize: 13, mt: 0.5 }}>
              {query || filter !== "all"
                ? "Essayez un autre mot-clé ou une autre catégorie."
                : "Les nouvelles activités des stagiaires apparaîtront ici."}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ position: "relative" }}>
            {filtered.map((a, idx) => {
              const meta = statusMeta(a.statut);
              const StatusIcon = meta.icon;
              const isLast = idx === filtered.length - 1;
              return (
                <Box
                  key={a.id ?? idx}
                  sx={{
                    display: "flex",
                    gap: 2,
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    borderBottom: isLast ? "none" : "1px solid #F1F5F9",
                    transition: "background 0.15s ease",
                    "&:hover": { bgcolor: "#F8FAFC" },
                  }}
                >
                  <Avatar sx={{ bgcolor: getAvatarColor(a.id), width: 38, height: 38, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {getInitials(a.stagiaire_nom)}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                      <Typography sx={{ fontWeight: 600, color: TEXT, fontSize: "0.88rem" }}>
                        {a.stagiaire_nom || "Utilisateur"}
                      </Typography>
                      <Typography sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>·</Typography>
                      <Typography sx={{ color: TEXT_LIGHT, fontSize: "0.8rem" }}>{formatRelative(a.date)}</Typography>
                    </Stack>
                    <Typography sx={{ color: TEXT_LIGHT, fontSize: "0.85rem", mt: 0.25 }}>
                      {a.action || "—"}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    icon={<StatusIcon sx={{ fontSize: "14px !important", color: `${meta.color} !important` }} />}
                    label={meta.label}
                    sx={{
                      bgcolor: meta.bg,
                      color: meta.color,
                      fontWeight: 600,
                      borderRadius: 1.5,
                      alignSelf: "center",
                      flexShrink: 0,
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}