import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { getToken, clearToken, authHeaders } from "../auth";
import SidebarEncadrant from "../components/SidebarEncadrant";

const API_URL = "http://127.0.0.1:8001";
const PRIMARY = "#1D2B5B";
const BACKGROUND = "#F5F7FB";

function LayoutEncadrant() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function rechargerProfil() {
    return fetch(`${API_URL}/moi`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.status === 401) {
          clearToken();
          navigate("/encadrant/login");
          return null;
        }
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        if (data) {
          if (data.role !== "encadrant") {
            clearToken();
            navigate("/encadrant/login");
            return;
          }
          setProfil(data);
        }
      })
      .catch(() => setError("Impossible de charger votre profil."));
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/encadrant/login");
      return;
    }
    rechargerProfil().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <SidebarEncadrant
        nom={profil?.nom}
        role="Encadrant"
        photoUrl={profil?.photo_url ? `${API_URL}${profil.photo_url}` : undefined}
      />
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: BACKGROUND }}>
        <Outlet context={{ profil, setProfil, rechargerProfil, erreurProfil: error }} />
      </Box>
    </Box>
  );
}

export default LayoutEncadrant;
