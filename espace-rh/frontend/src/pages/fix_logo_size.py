with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''        <Box
          component="img"
          src="/images/hutchinson-logo.png"
          alt="Hutchinson"
          sx={{
            width: { xs: 150, md: 190 },
            height: "auto",
            mb: 4,
          }}
        />'''

new_block = '''        <Box
          component="img"
          src="/images/hutchinson-logo.png"
          alt="Hutchinson"
          sx={{
            width: { xs: 240, sm: 320, md: 400 },
            height: "auto",
            mb: 5,
          }}
        />'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Logo central agrandi.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
