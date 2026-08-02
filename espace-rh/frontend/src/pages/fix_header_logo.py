with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''        <Typography sx={{ fontWeight: 800, letterSpacing: 1, fontSize: "1rem" }}>
          HUTCHINSON
        </Typography>'''

new_block = '''        <Box
          component="img"
          src="/images/hutchinson-logo.png"
          alt="Hutchinson"
          sx={{ height: 36, width: "auto" }}
        />'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Logo du header remplace avec succes.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
