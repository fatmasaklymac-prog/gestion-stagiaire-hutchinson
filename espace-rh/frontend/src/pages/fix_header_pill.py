with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''        <Box
          component="img"
          src="/images/hutchinson-logo.png"
          alt="Hutchinson"
          sx={{ height: 36, width: "auto" }}
        />'''

new_block = '''        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 8,
            px: 2.5,
            py: 1,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 18px -4px rgba(0,0,0,0.35)",
          }}
        >
          <Box
            component="img"
            src="/images/hutchinson-logo.png"
            alt="Hutchinson"
            sx={{ height: 34, width: "auto" }}
          />
        </Box>'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Pastille blanche ajoutee autour du logo.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
