chemin = "/Users/fatmasakly/Desktop/Projet-Suivi-Stagiaires/frontend/src/pages/Presences.jsx"

with open(chemin, "r") as f:
    contenu = f.read()

erreurs = []

# 1. Ajouter le state horaires
ancien_state = 'const [filtersOpen, setFiltersOpen] = useState(false);'
nouveau_state = 'const [filtersOpen, setFiltersOpen] = useState(false);\n  const [horaires, setHoraires] = useState({});'
if ancien_state in contenu:
    contenu = contenu.replace(ancien_state, nouveau_state)
else:
    erreurs.append("state horaires")

# 2. Ajouter les horaires au payload envoyé
ancien_donnees = '''    const donnees = {
      stagiaire_id: stagiaireId,
      date: date,
      present: statut === "present",
    };'''
nouveau_donnees = '''    const h = horaires[stagiaireId] || {};
    const donnees = {
      stagiaire_id: stagiaireId,
      date: date,
      present: statut === "present",
      heure_arrivee: statut === "present" ? (h.arrivee || null) : null,
      heure_depart: statut === "present" ? (h.depart || null) : null,
    };'''
if ancien_donnees in contenu:
    contenu = contenu.replace(ancien_donnees, nouveau_donnees)
else:
    erreurs.append("payload donnees")

# 3. Ajouter les 2 champs horaires dans le tableau (après le bouton Absent)
ancien_boutons = '''                          Absent
                        </Button>
                      </Box>
                    ) : ('''
nouveau_boutons = '''                          Absent
                        </Button>

                        <TextField
                          type="time"
                          size="small"
                          value={horaires[s.id]?.arrivee || ""}
                          onChange={(e) =>
                            setHoraires((prev) => ({
                              ...prev,
                              [s.id]: { ...prev[s.id], arrivee: e.target.value },
                            }))
                          }
                          sx={{ width: 110 }}
                          label="Arrivée"
                          InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                          type="time"
                          size="small"
                          value={horaires[s.id]?.depart || ""}
                          onChange={(e) =>
                            setHoraires((prev) => ({
                              ...prev,
                              [s.id]: { ...prev[s.id], depart: e.target.value },
                            }))
                          }
                          sx={{ width: 110 }}
                          label="Départ"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    ) : ('''
if ancien_boutons in contenu:
    contenu = contenu.replace(ancien_boutons, nouveau_boutons)
else:
    erreurs.append("champs horaires table")

if erreurs:
    print("ERREUR sur : " + ", ".join(erreurs))
else:
    with open(chemin, "w") as f:
        f.write(contenu)
    print("OK : les 3 modifications ont été appliquées avec succès.")
