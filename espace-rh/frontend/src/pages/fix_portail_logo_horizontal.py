with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''        <Box sx={{ maxWidth: 1100, mx: "auto", mb: { xs: 4, md: 6 } }}>
          <Box
            component="img"
            src="/images/hutchinson-logo.png"
            alt="Hutchinson"
            sx={{ height: { xs: 56, md: 72 }, width: "auto" }}
          />
        </Box>'''

new_block = '''        <Box sx={{ maxWidth: 1100, mx: "auto", mb: { xs: 5, md: 7 } }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: { xs: 1.5, md: 2.5 },
              bgcolor: "#fff",
              borderRadius: 6,
              px: { xs: 3, md: 4.5 },
              py: { xs: 1.5, md: 2.25 },
              boxShadow: "0 12px 32px -10px rgba(16,42,114,0.25)",
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
                fontWeight: 800,
                color: COLORS.blue,
                fontSize: { xs: "1.3rem", md: "1.8rem" },
                letterSpacing: 0.5,
              }}
            >
              HUTCHINSON
              <Box component="span" sx={{ fontSize: "0.5em", verticalAlign: "top", ml: 0.3 }}>
                {"\\u00AE"}
              </Box>
            </Typography>
          </Box>
        </Box>'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Logo horizontal (picto + texte) mis en place.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
