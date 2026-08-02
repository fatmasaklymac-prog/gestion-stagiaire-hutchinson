import re

fichiers = ["LoginEncadrant.jsx", "LoginStagiaire.jsx"]

for fichier in fichiers:
    with open(fichier, "r", encoding="utf-8") as f:
        content = f.read()

    content = re.sub(
        r'const ACCENT = "#[0-9A-Fa-f]{6}";',
        'const ACCENT = "#1D2B5B";',
        content
    )
    content = re.sub(
        r'const ACCENT_DARK = "#[0-9A-Fa-f]{6}";',
        'const ACCENT_DARK = "#0f1730";',
        content
    )

    with open(fichier, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"{fichier} mis a jour en bleu.")

print("Les 3 pages sont maintenant en bleu navy.")
