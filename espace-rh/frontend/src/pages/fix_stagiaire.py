with open("LoginStagiaire.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <FormControlLabel
                  control={<Checkbox size="small" sx={{ color: "text.secondary", "&.Mui-checked": { color: ACCENT } }} />}
                  label={
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Se souvenir de moi
                    </Typography>
                  }
                />
                <Typography
                  variant="body2"
                  sx={{ color: "#E31E24", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Mot de passe oublie ?
                </Typography>
              </Box>'''

new_block = '''              <FormControlLabel
                control={<Checkbox size="small" sx={{ color: "text.secondary", "&.Mui-checked": { color: ACCENT } }} />}
                label={
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Se souvenir de moi
                  </Typography>
                }
              />'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("LoginStagiaire.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("LoginStagiaire.jsx mis a jour : lien 'Mot de passe oublie' retire.")
else:
    print("Bloc non trouve - verifie le fichier manuellement.")
