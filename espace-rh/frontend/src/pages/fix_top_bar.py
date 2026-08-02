with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''        {/* Logo flottant, en haut a gauche */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 24, md: 40 },
            left: { xs: 24, md: 48 },
            zIndex: 2,
            bgcolor: "#fff",
            borderRadius: 3,
            px: 2.25,
            py: 1,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 8px 24px -6px rgba(0,0,0,0.35)",
            opacity: 0,
            animation: "fadeIn 0.8s ease forwards",
          }}
        >
          <Box
            component="img"
            src="/images/hutchinson-logo.png"
            alt="Hutchinson"
            sx={{ height: { xs: 30, md: 36 }, width: "auto" }}
          />
        </Box>'''

new_block = '''        {/* Barre blanche flottante en haut, avec uniquement le logo */}
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

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Barre blanche du logo mise a jour.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
