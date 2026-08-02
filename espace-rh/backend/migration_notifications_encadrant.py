"""
Migration : ajoute la colonne encadrant_id a la table notifications.
A lancer une seule fois : python migration_notifications_encadrant.py
"""
from sqlalchemy import text
from database import engine

with engine.connect() as connexion:
    connexion.execute(text("""
        ALTER TABLE notifications
        ADD COLUMN IF NOT EXISTS encadrant_id INTEGER REFERENCES encadrants(id);
    """))
    connexion.execute(text("""
        ALTER TABLE notifications
        ALTER COLUMN stagiaire_id DROP NOT NULL;
    """))
    connexion.commit()

print("Migration terminee : colonne encadrant_id ajoutee, stagiaire_id rendue nullable.")
