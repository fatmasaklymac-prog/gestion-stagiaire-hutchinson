with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: { xs: 1.5, md: 2 },
            }}
          >
            <Box
              component="img"
              src="/images/hutchinson-icon.png"
              alt="Hutchinson"
              sx={{ height: { xs: 34, md: 46 }, width: "auto" }}
            />
            <Box
              sx={{
                width: "1px",
                height: { xs: 30, md: 42 },
                bgcolor: "#d5d8e0",
              }}
            />
            <Typography
              sx={{
                fontWeight: 400,
                color: COLORS.blue,
                fontSize: { xs: "1.3rem", md: "1.8rem" },
                letterSpacing: 0.3,
                fontFamily: '"Arial Black", "Arial Bold", sans-serif',
              }}
            >
              HUTCHINSON
              <Box component="span" sx={{ fontSize: "0.5em", verticalAlign: "top", ml: 0.3 }}>
                {"\\u00AE"}
              </Box>
            </Typography>
          </Box>'''

new_block = '''          <Box
            component="img"
            src="/images/hutchinson-logo.png"
            alt="Hutchinson"
            sx={{ height: { xs: 50, md: 68 }, width: "auto" }}
          />'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Logo remplace par l'image complete (photo).")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
