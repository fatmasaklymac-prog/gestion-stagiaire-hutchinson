from database import SessionLocal
from models import Utilisateur
from auth import hasher_mot_de_passe

db = SessionLocal()

# Vérifier si l'admin existe déjà
existant = db.query(Utilisateur).filter(Utilisateur.email == "admin@test.com").first()

if existant:
    print(f"Admin existe déjà : {existant.email}")
else:
    admin = Utilisateur(
        nom="Admin Test",
        email="admin@test.com",
        mot_de_passe_hash=hasher_mot_de_passe("test123"),
        role="admin_rh"
    )
    db.add(admin)
    db.commit()
    print("✅ Admin créé avec succès !")
    print("Email : admin@test.com")
    print("Mot de passe : test123")

db.close()
