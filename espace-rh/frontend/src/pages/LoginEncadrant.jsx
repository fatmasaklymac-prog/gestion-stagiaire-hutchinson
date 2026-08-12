import { useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { setToken, clearToken, authHeaders } from "../auth";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlined from "@mui/icons-material/LockOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GroupsIcon from "@mui/icons-material/Groups";
import ShaderBackground from "../components/ShaderBackground";
import { encadrantFragmentShader } from "../shaders/encadrantShader";

const API_URL = "http://127.0.0.1:8001";
const ACCENT = "#1D2B5B";
const ACCENT_DARK = "#0f1730";

export default function LoginEncadrant() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      const body = new URLSearchParams();
      body.append("username", email.trim());
      body.append("password", password);

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Email ou mot de passe incorrect.");
        setLoading(false);
        return;
      }

      setToken(data.access_token);

      const resProfil = await fetch(`${API_URL}/moi`, {
        headers: authHeaders(),
      });
      const profil = await resProfil.json();

      if (!resProfil.ok || profil.role !== "encadrant") {
        clearToken();
        setError("Ce compte n'est pas un compte encadrant.");
        setLoading(false);
        return;
      }

      navigate("/encadrant/dashboard");
    } catch (err) {
      setError("Impossible de contacter le serveur. Verifiez qu'il est demarre.");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#f7f8fa",
      }}
    >
      {/* Panneau gauche - fond uni */}
      <Box
        sx={{
          position: "relative",
          flex: { xs: "0 0 auto", md: "1 1 48%" },
          minHeight: { xs: "38vh", md: "auto" },
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          bgcolor: ACCENT,
        }}
      >
        <ShaderBackground fragmentShader={encadrantFragmentShader} />
        <Box sx={{ position: "relative", zIndex: 1, p: { xs: 4, md: 6 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GroupsIcon sx={{ color: ACCENT, fontSize: 22 }} />
            </Box>

          </Stack>
        </Box>

        <Box sx={{ position: "relative", zIndex: 1, p: { xs: 4, md: 6 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.15 }}>
            Espace Encadrant
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.75)", mb: 4, maxWidth: 380 }}>
            Connectez-vous pour accompagner vos stagiaires, suivre leur progression et realiser leurs evaluations.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Box
              sx={{
                flex: 1,
                bgcolor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 2,
                p: 2,
                backdropFilter: "blur(4px)",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800 }}>40+</Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Stagiaires suivis
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                bgcolor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 2,
                p: 2,
                backdropFilter: "blur(4px)",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800 }}>8</Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Divisions metiers
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Panneau droit - formulaire */}
      <Box
        sx={{
          position: "relative",
          flex: { xs: "1 1 auto", md: "1 1 52%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: { xs: 20, md: 36 },
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <img src={logo} alt="Logo" style={{ height: 68, objectFit: "contain" }} />
        </Box>
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: ACCENT, mb: 0.5 }}>
            Connexion
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
            Accedez a votre espace encadrant
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: ACCENT, mb: 0.75 }}>
                  Adresse e-mail professionnelle
                </Typography>
                <TextField
                  type="email"
                  fullWidth
                  required
                  placeholder="nom.prenom@hutchinson.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#f7f8fa",
                      "&.Mui-focused fieldset": {
                        borderColor: ACCENT,
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: ACCENT, mb: 0.75 }}>
                  Mot de passe
                </Typography>
                <TextField
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((s) => !s)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#f7f8fa",
                      "&.Mui-focused fieldset": {
                        borderColor: ACCENT,
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <FormControlLabel
                  control={<Checkbox size="small" sx={{ color: "text.secondary", "&.Mui-checked": { color: ACCENT } }} />}
                  label={
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Se souvenir de moi
                    </Typography>
                  }
                />
                <Typography
                  component="a"
                  href="mailto:rh@hutchinson.com?subject=Demande%20de%20reinitialisation%20de%20mot%20de%20passe&body=Bonjour%2C%0A%0AJe%20n%27arrive%20plus%20a%20me%20connecter%20a%20mon%20espace%20encadrant.%20Merci%20de%20reinitialiser%20mon%20mot%20de%20passe.%0A%0ANom%20%3A%0AEmail%20professionnel%20%3A"
                  variant="body2"
                  sx={{
                    color: "#E31E24",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Mot de passe oublie ?
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                endIcon={!loading && <ArrowForwardIcon />}
                sx={{
                  py: 1.4,
                  borderRadius: 2,
                  bgcolor: ACCENT,
                  color: "#fff",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: "0 8px 24px -8px rgba(10,22,40,0.5)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: ACCENT_DARK,
                    boxShadow: "0 10px 28px -8px rgba(10,22,40,0.6)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    bgcolor: ACCENT,
                    opacity: 0.6,
                  },
                }}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </Stack>
          </Box>

          <Typography
            variant="caption"
            sx={{ display: "block", textAlign: "center", color: "text.secondary", mt: 4 }}
          >
            (c) 2026 Hutchinson - Suivi des stagiaires. Tous droits reserves.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
