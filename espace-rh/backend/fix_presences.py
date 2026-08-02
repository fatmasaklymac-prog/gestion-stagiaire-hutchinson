with open("/Users/fatmasakly/Desktop/Projet-Suivi-Stagiaires/frontend/src/pages/Presences.jsx", "r") as f:
    contenu = f.read()

ancien = '''      fetch(`${API_URL}/presences/${existante.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      })
        .then(() => chargerPresences())
        .catch((err) => console.error(err));
    } else {
      fetch(`${API_URL}/presences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      })
        .then(() => chargerPresences())
        .catch((err) => console.error(err));
    }'''

nouveau = '''      fetch(`${API_URL}/presences/${existante.id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      })
        .then(() => chargerPresences())
        .catch((err) => console.error(err));
    } else {
      fetch(`${API_URL}/presences`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      })
        .then(() => chargerPresences())
        .catch((err) => console.error(err));
    }'''

if ancien not in contenu:
    print("ERREUR : bloc non trouvé, aucune modification faite.")
else:
    contenu = contenu.replace(ancien, nouveau)
    with open("/Users/fatmasakly/Desktop/Projet-Suivi-Stagiaires/frontend/src/pages/Presences.jsx", "w") as f:
        f.write(contenu)
    print("OK : authHeaders() ajouté aux requêtes PUT et POST.")
