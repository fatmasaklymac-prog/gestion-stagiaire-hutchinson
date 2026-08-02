import re

with open("Accueil.jsx", "r", encoding="utf-8") as f:
    content = f.read()

count = 0

# Titres principaux (H1/H2) -> Montserrat 800/900
title_patterns = [
    'Hutchinson Management System',
    'Choisissez votre espace',
]
for t in title_patterns:
    pattern = re.compile(r'(<Typography\s+sx=\{\{[^}]*?)(\}\}\s*>\s*' + re.escape(t))
    def add_font(m):
        global count
        block = m.group(1)
        if "fontFamily" not in block:
            block = block.rstrip() + ', fontFamily: "Montserrat, sans-serif"'
            count += 1
        return block + m.group(0)[len(m.group(1)):]
    content = pattern.sub(add_font, content)

# Applique Inter par defaut a tout le body via un style global insere en fin de fichier (fallback simple et fiable)
if "GLOBAL_FONT_STYLE_INJECTED" not in content:
    content = content.replace(
        "      <style>{`",
        "      <style>{`\n        /* GLOBAL_FONT_STYLE_INJECTED */\n        body, .MuiTypography-root, .MuiButton-root { font-family: 'Inter', sans-serif; }\n        h1, h2, .hms-title { font-family: 'Montserrat', sans-serif; }",
        1
    )
    count += 1

with open("Accueil.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Polices appliquees ({count} modifications).")
