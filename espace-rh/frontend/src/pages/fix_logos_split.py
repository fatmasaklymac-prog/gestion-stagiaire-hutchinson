with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1) Remplace la barre blanche du hero par le picto seul
old_hero_logo = '''        {/* Barre blanche flottante en haut, avec uniquement le logo */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 16, md: 28 },
            left: { xs: 16, md: 40 },
            right: { xs: 16, md: 40 },
            zIndex: 2,
            bgcolor: "#fff",
            borderRadius: 6,
            px: { xs: 2.5, md: 4 },
            py: { xs: 1.25, md: 1.75 },
            display: "flex",
            alignItems: "center",
            boxShadow: "0 10px 30px -8px rgba(0,0,0,0.3)",
            opacity: 0,
            animation: "fadeIn 0.8s ease forwards",
          }}
        >
          <Box
            component="img"
            src="/images/hutchinson-logo.png"
            alt="Hutchinson"
            sx={{ height: { xs: 32, md: 40 }, width: "auto" }}
          />
        </Box>'''

new_hero_logo = '''        {/* Picto seul, flottant en haut a gauche du hero */}
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
        </Box>'''

if old_hero_logo in content:
    content = content.replace(old_hero_logo, new_hero_logo, 1)
    print("Picto seul ajoute dans le hero.")
else:
    print("ATTENTION: bloc hero logo non trouve.")

# 2) Ajoute le logo complet en haut a gauche de la section 2 (le portail)
old_section = '''        sx={{ bgcolor: COLORS.white, py: { xs: 8, md: 12 }, px: 3 }}
      >
        <Box
          sx={{
            textAlign: "center",'''

new_section = '''        sx={{ bgcolor: COLORS.white, py: { xs: 8, md: 12 }, px: 3 }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto", mb: { xs: 4, md: 6 } }}>
          <Box
            component="img"
            src="/images/hutchinson-logo.png"
            alt="Hutchinson"
            sx={{ height: { xs: 36, md: 44 }, width: "auto" }}
          />
        </Box>

        <Box
          sx={{
            textAlign: "center",'''

if old_section in content:
    content = content.replace(old_section, new_section, 1)
    print("Logo complet ajoute en haut de la section portail.")
else:
    print("ATTENTION: bloc section 2 non trouve.")

with open("Accueil.jsx", "w", encoding="utf-8") as f:
    f.write(content)
