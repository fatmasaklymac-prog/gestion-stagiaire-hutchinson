with open("LoginEncadrant.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''                <Typography
                  variant="body2"
                  sx={{ color: "#E31E24", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Mot de passe oublie ?
                </Typography>'''

new_block = '''                <Typography
                  component="a"
                  href="mailto:rh@hutchinson.com?subject=Demande%20de%20reinitialisation%20de%20mot%20de%20passe&body=Bonjour%2C%0A%0AJe%20n%27arrive%20plus%20a%20me%20connecter%20a%20mon%20espace%20encadrant.%20Merci%20de%20reinitialiser%20mon%20mot%20de%20passe.%0A%0ANom%20%3A%0AEmail%20professionnel%20%3A"
                  variant="body2"
                  sx={{
                    color: "#E31E24",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Mot de passe oublie ?
                </Typography>'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("LoginEncadrant.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("LoginEncadrant.jsx mis a jour : lien 'Mot de passe oublie' active (mailto).")
else:
    print("Bloc non trouve - verifie le fichier manuellement.")
