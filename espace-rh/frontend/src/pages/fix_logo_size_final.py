with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = '''          <Box
            component="img"
            src="/images/hutchinson-logo-horizontal.png"
            alt="Hutchinson"
            sx={{ height: { xs: 50, md: 68 }, width: "auto" }}
          />'''

new = '''          <Box
            component="img"
            src="/images/hutchinson-logo-horizontal.png"
            alt="Hutchinson"
            sx={{ height: { xs: 72, md: 100 }, width: "auto" }}
          />'''

if old in content:
    content = content.replace(old, new, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Logo agrandi.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
