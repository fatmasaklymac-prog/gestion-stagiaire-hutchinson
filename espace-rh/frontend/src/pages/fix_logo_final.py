with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = '''        <Box sx={{ maxWidth: 1100, mx: "auto", mb: { xs: 5, md: 7 } }}>
          <Box
            component="img"
            src="/images/hutchinson-logo.png"
            alt="Hutchinson"
            sx={{ height: { xs: 50, md: 68 }, width: "auto" }}
          />
        </Box>'''

new = '''        <Box sx={{ maxWidth: 1100, mx: "auto", mb: { xs: 5, md: 7 } }}>
          <Box
            component="img"
            src="/images/hutchinson-logo-horizontal.png"
            alt="Hutchinson"
            sx={{ height: { xs: 50, md: 68 }, width: "auto" }}
          />
        </Box>'''

if old in content:
    content = content.replace(old, new, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Logo remplace par la version horizontale exacte.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
