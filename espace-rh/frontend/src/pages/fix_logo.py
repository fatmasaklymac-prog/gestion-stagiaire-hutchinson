with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''        <Box
          sx={{
            width: 130,
            height: 65,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: 1, opacity: 0.85 }}>
            H
          </Typography>
        </Box>'''

new_block = '''        <Box
          component="img"
          src="/images/hutchinson-logo.png"
          alt="Hutchinson"
          sx={{
            width: { xs: 150, md: 190 },
            height: "auto",
            mb: 4,
          }}
        />'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Logo remplace avec succes.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
