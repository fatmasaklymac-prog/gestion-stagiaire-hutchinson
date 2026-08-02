from database import SessionLocal
from models import Utilisateur
from auth import hasher_mot_de_passe

db = SessionLocal()

admin = Utilisateur(
    nom="Admin",
    email="admin@stagiaires.com",
    mot_de_passe_hash=hasher_mot_de_passe("admin123"),
    role="admin_rh",
)

db.add(admin)
db.commit()
db.refresh(admin)

print(f"Admin créé avec succès : id={admin.id}, email={admin.email}")

db.close()

