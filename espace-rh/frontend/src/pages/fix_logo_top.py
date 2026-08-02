with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = '''        sx={{ bgcolor: COLORS.white, py: { xs: 8, md: 12 }, px: 3 }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto", mb: { xs: 5, md: 7 }, ml: { xs: 0, md: "-24px" } }}>'''

new = '''        sx={{ bgcolor: COLORS.white, pt: { xs: 3, md: 4 }, pb: { xs: 8, md: 12 }, px: 3 }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto", mb: { xs: 4, md: 5 }, ml: { xs: 0, md: "-24px" } }}>'''

if old in content:
    content = content.replace(old, new, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Logo remonte en haut de la section.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
