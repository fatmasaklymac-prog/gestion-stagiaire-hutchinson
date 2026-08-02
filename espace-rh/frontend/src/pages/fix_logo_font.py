with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''            <Typography
              sx={{
                fontWeight: 800,
                color: COLORS.blue,
                fontSize: { xs: "1.3rem", md: "1.8rem" },
                letterSpacing: 0.5,
              }}
            >'''

new_block = '''            <Typography
              sx={{
                fontWeight: 900,
                color: COLORS.blue,
                fontSize: { xs: "1.3rem", md: "1.8rem" },
                letterSpacing: 0.3,
                fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
              }}
            >'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open("Accueil.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Police du logo mise a jour.")
else:
    print("ATTENTION: bloc non trouve, verifie le fichier manuellement.")
