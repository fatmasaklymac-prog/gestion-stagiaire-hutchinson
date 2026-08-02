with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''          <Box
            component="img"
            src="/images/hutchinson-logo.png"
            alt="Hutchinson"
            sx={{ height: { xs: 36, md: 44 }, width: "auto" }}
          />
        </Box>

        <Box
          sx={{
            textAlign: "center",'''

new_block = '''          <Box
            component="img"
            src="/images/hutchinson-logo.png"
            alt="Hutchinson"
            sx={{ height: { xs: 56, md: 72 }, width: "auto" }}
          />
        </Box>

        <Box
          sx={{
            textAlign: "center",'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Logo du portail agrandi.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
