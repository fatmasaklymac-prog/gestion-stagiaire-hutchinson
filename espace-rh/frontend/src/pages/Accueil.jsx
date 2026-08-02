import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LoginIcon from "@mui/icons-material/Login";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

const COLORS = {
  blue: "#102A72",
  darkBlue: "#091A47",
  red: "#E30613",
  white: "#FFFFFF",
  lightGray: "#F6F7FB",
};

const PROFILS = [
  {
    key: "stagiaire",
    label: "Espace Stagiaire",
    icon: SchoolIcon,
    description:
      "Gerez votre candidature, soumettez vos documents et suivez l'evolution de votre parcours au sein de nos equipes mondiales.",
    path: "/login",
  },
  {
    key: "encadrant",
    label: "Espace Encadrant",
    icon: GroupsIcon,
    description:
      "Accompagnez vos stagiaires, validez les objectifs de mission et assurez le transfert de competences critiques au coeur de l'usine.",
    path: "/encadrant/login",
  },
  {
    key: "rh",
    label: "Espace RH",
    icon: AssignmentIndIcon,
    description:
      "Pilotez la campagne de recrutement, gerez les contrats et analysez les indicateurs de performance RH a l'echelle du groupe.",
    path: "/login-rh",
  },
];

function useInView() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true);
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function useShaderBackground(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ; m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = v_texCoord;
    float time = u_time * 0.15;

    vec3 color1 = vec3(0.07, 0.11, 0.24);
    vec3 color2 = vec3(0.11, 0.17, 0.36);
    vec3 accent = vec3(0.85, 0.1, 0.15);

    float n1 = snoise(uv * 2.0 + time);
    float n2 = snoise(uv * 4.0 - time * 0.8);
    float n3 = snoise(vec2(uv.x * 10.0, uv.y * 0.5) + time * 2.0);

    vec3 finalColor = mix(color1, color2, n1 * 0.5 + 0.5);

    float line = smoothstep(0.98, 1.0, sin(uv.y * 50.0 + n2 * 2.0 + time * 5.0));
    finalColor = mix(finalColor, accent, line * 0.15);

    float dots = pow(clamp(snoise(uv * 15.0 + time), 0.0, 1.0), 10.0);
    finalColor += vec3(1.0) * dots * 0.4;

    float vignette = 1.0 - length(uv - 0.5) * 1.2;
    finalColor *= clamp(vignette, 0.4, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
}`;

    function compileShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    let rafId;
    function render(t) {
      if (typeof ResizeObserver === "undefined") syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [canvasRef]);
}

export default function Accueil() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [sectionRef2, sectionVisible] = useInView();

  useShaderBackground(canvasRef);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Box sx={{ bgcolor: COLORS.white }}>
      {/* ============= HERO 100vh ============= */}
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          color: "#fff",
          bgcolor: "#000",
        }}
      >
        <Box
          component="canvas"
          ref={canvasRef}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            display: "block",
          }}
        />

        {/* Picto seul, flottant en haut a gauche du hero */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 24, md: 40 },
            left: { xs: 24, md: 48 },
            zIndex: 2,
            opacity: 0,
            animation: "fadeIn 0.8s ease forwards",
          }}
        >
          <Box
            component="img"
            src="/images/hutchinson-icon.png"
            alt="Hutchinson"
            sx={{ height: { xs: 44, md: 56 }, width: "auto", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.4))" }}
          />
        </Box>

        {/* Contenu central */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 3,
          }}
        >
          <Typography
            sx={{
              opacity: 0,
              animation: "slideUp 0.9s ease forwards",
              animationDelay: "0.15s",
              fontWeight: 800,
              lineHeight: 1.15,
              fontSize: { xs: "2.1rem", sm: "2.8rem", md: "3.4rem" },
              maxWidth: 820,
              mb: 2.5,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Hutchinson Management System
          </Typography>

          <Typography
            sx={{
              opacity: 0,
              animation: "slideUp 0.9s ease forwards",
              animationDelay: "0.3s",
              color: "rgba(255,255,255,0.85)",
              maxWidth: 560,
              lineHeight: 1.7,
              fontSize: { xs: "0.98rem", md: "1.05rem" },
              mb: 5,
            }}
          >
            Plateforme intelligente de gestion des stages, des talents et des
            parcours professionnels.
          </Typography>

          <Box
            sx={{
              opacity: 0,
              animation: "slideUp 0.9s ease forwards",
              animationDelay: "0.45s",
            }}
          >
            <Button
              onClick={scrollToSection}
              endIcon={<LoginIcon />}
              sx={{
                bgcolor: COLORS.red,
                color: "#fff",
                fontWeight: 700,
                textTransform: "none",
                px: 4.5,
                py: 1.5,
                borderRadius: 3,
                fontSize: "1rem",
                boxShadow: "0 10px 28px -8px rgba(227,6,19,0.55)",
                transition: "all 0.25s ease",
                "&:hover": {
                  bgcolor: "#c00510",
                  transform: "scale(1.04)",
                  boxShadow: "0 14px 34px -8px rgba(227,6,19,0.65)",
                },
              }}
            >
              Acceder au portail
            </Button>
          </Box>
        </Box>

        {/* Indicateur de scroll */}
        <Box
          onClick={scrollToSection}
          sx={{
            position: "absolute",
            bottom: { xs: 28, md: 42 },
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            opacity: 0,
            animation: "fadeIn 1s ease forwards",
            animationDelay: "0.9s",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.7rem",
              letterSpacing: 1.5,
              fontWeight: 600,
              color: "rgba(255,255,255,0.75)",
              textTransform: "uppercase",
            }}
          >
            Decouvrir la plateforme
          </Typography>
          <Box
            sx={{
              width: 24,
              height: 38,
              borderRadius: 4,
              border: "2px solid rgba(255,255,255,0.55)",
              display: "flex",
              justifyContent: "center",
              pt: 0.75,
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 8,
                borderRadius: 2,
                bgcolor: "#fff",
                animation: "scrollDot 1.6s ease infinite",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ============= SECTION 2 - CHOISIR SON ESPACE ============= */}
      <Box
        ref={(node) => {
          sectionRef.current = node;
          sectionRef2.current = node;
        }}
        sx={{ bgcolor: COLORS.white, pt: { xs: 1, md: 1.5 }, pb: { xs: 8, md: 12 }, px: 3 }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto", mb: { xs: 3, md: 4 }, ml: { xs: 0, md: "-24px" } }}>
          <Box
            component="img"
            src="/images/hutchinson-logo-horizontal.png"
            alt="Hutchinson"
            sx={{ height: { xs: 42, md: 56 }, width: "auto" }}
          />
        </Box>

        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 6, md: 8 },
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s ease",
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              color: COLORS.blue,
              fontSize: { xs: "1.8rem", md: "2.3rem" },
              mb: 1.5,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Choisissez votre espace
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 560, mx: "auto" }}>
            Accedez a votre environnement de travail selon votre role et
            pilotez l'excellence industrielle.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            maxWidth: 1100,
            mx: "auto",
          }}
        >
          {PROFILS.map((profil, idx) => {
            const Icon = profil.icon;
            return (
              <Box
                key={profil.key}
                sx={{
                  flex: 1,
                  bgcolor: COLORS.lightGray,
                  borderRadius: "20px",
                  p: 4,
                  border: "1px solid transparent",
                  opacity: sectionVisible ? 1 : 0,
                  transform: sectionVisible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.97)",
                  transition: `all 0.6s ease ${0.15 * idx}s`,
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px) scale(1.02)",
                    boxShadow: "0 20px 40px -12px rgba(16,42,114,0.25)",
                    borderColor: COLORS.blue,
                    bgcolor: "#fff",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: "16px",
                    bgcolor: COLORS.blue,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <Icon sx={{ color: "#fff", fontSize: 26 }} />
                </Box>
                <Typography
                  sx={{ fontWeight: 700, color: COLORS.blue, fontSize: "1.15rem", mb: 1.5 }}
                >
                  {profil.label}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.92rem", lineHeight: 1.6, mb: 3 }}>
                  {profil.description}
                </Typography>
                <Button
                  onClick={() => navigate(profil.path)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: COLORS.red,
                    color: "#fff",
                    fontWeight: 700,
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    borderRadius: 2.5,
                    "&:hover": { bgcolor: "#c00510" },
                  }}
                >
                  Acceder
                </Button>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            maxWidth: 1100,
            mx: "auto",
            mt: { xs: 6, md: 9 },
            pt: 3,
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            rowGap: 1,
          }}
        >
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: COLORS.blue }}>
            HUTCHINSON · INDUSTRIAL EXCELLENCE
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
            (c) 2026 HUTCHINSON — Systeme de Management Industriel Global
          </Typography>
        </Box>
      </Box>

      <style>{`
        /* GLOBAL_FONT_STYLE */
        .MuiTypography-root, .MuiButton-root { font-family: 'Inter', sans-serif; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.4; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </Box>
  );
}
