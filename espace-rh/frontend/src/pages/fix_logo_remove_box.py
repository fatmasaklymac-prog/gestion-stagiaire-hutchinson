with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: { xs: 1.5, md: 2.5 },
              bgcolor: "#fff",
              borderRadius: 6,
              px: { xs: 3, md: 4.5 },
              py: { xs: 1.5, md: 2.25 },
              boxShadow: "0 12px 32px -10px rgba(16,42,114,0.25)",
            }}
          >'''

new_block = '''          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: { xs: 1.5, md: 2 },
            }}
          >'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Cadre blanc retire, logo affiche simplement.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
