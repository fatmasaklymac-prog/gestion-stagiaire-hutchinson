with open("App.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_import = 'import LoginRH from "./pages/LoginRH";'
new_import = (
    'import LoginRH from "./pages/LoginRH";\n'
    'import Accueil from "./pages/Accueil";\n'
    'import SelectionProfil from "./pages/SelectionProfil";'
)
if old_import in content:
    content = content.replace(old_import, new_import, 1)
    print("Imports ajoutes.")
else:
    print("ATTENTION: import LoginRH non trouve.")

old_route = '<Route path="/login-rh" element={<LoginRH />} />'
new_route = (
    '<Route path="/login-rh" element={<LoginRH />} />\n'
    '        <Route path="/accueil" element={<Accueil />} />\n'
    '        <Route path="/selection-profil" element={<SelectionProfil />} />'
)
if old_route in content:
    content = content.replace(old_route, new_route, 1)
    print("Routes ajoutees.")
else:
    print("ATTENTION: route /login-rh non trouvee.")

with open("App.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("App.jsx mis a jour.")
