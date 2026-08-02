with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = '''        <Box sx={{ maxWidth: 1100, mx: "auto", mb: { xs: 5, md: 7 } }}>'''

new = '''        <Box sx={{ maxWidth: 1100, mx: "auto", mb: { xs: 5, md: 7 }, ml: { xs: 0, md: "-24px" } }}>'''

if old in content:
    content = content.replace(old, new, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Logo decale vers la gauche.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
