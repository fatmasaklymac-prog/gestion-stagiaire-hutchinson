#!/usr/bin/env python3
"""
Script de migration des données liées au stagiaire (local -> Neon).
Migre : activites, notifications, evaluations, messages
pour le stagiaire dont l'id local est STAGIAIRE_ID_LOCAL,
en remappant vers STAGIAIRE_ID_NEON sur la base Neon.

Usage:
    python3 migrer_donnees.py
"""

import psycopg2
import psycopg2.extras
from psycopg2.extras import Json

# --- Configuration ---
LOCAL_DSN = "postgresql://postgres@localhost/stagiaires_db"
NEON_DSN = "postgresql://neondb_owner:npg_mTpFvH3Y9sMI@ep-steep-mud-axo174gn-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Remapping des ids entre local et Neon
STAGIAIRE_ID_LOCAL = 3
STAGIAIRE_ID_NEON = 1

# encadrant_id : local 1 -> neon 1 (identique, pas de remapping nécessaire)
ENCADRANT_ID_MAP = {1: 1}


def remap_stagiaire(val):
    return STAGIAIRE_ID_NEON if val == STAGIAIRE_ID_LOCAL else val


def remap_encadrant(val):
    if val is None:
        return None
    return ENCADRANT_ID_MAP.get(val, val)


def migrer_table(local_cur, neon_cur, table, colonnes, where_clause, transform=None):
    """
    Copie les lignes de `table` depuis local vers Neon.
    colonnes : liste des colonnes à copier (hors id, généré automatiquement)
    where_clause : clause SQL WHERE pour filtrer les lignes locales
    transform : fonction optionnelle (dict_row) -> dict_row pour remapper des valeurs
    """
    cols_sql = ", ".join(colonnes)
    local_cur.execute(f"SELECT {cols_sql} FROM {table} WHERE {where_clause}")
    rows = local_cur.fetchall()

    if not rows:
        print(f"  Aucune ligne trouvée dans {table}, rien à migrer.")
        return 0

    placeholders = ", ".join(["%s"] * len(colonnes))
    insert_sql = f"INSERT INTO {table} ({cols_sql}) VALUES ({placeholders})"

    count = 0
    for row in rows:
        row_dict = dict(row)
        if transform:
            row_dict = transform(row_dict)
        values = [
            Json(row_dict[c]) if isinstance(row_dict[c], (dict, list)) else row_dict[c]
            for c in colonnes
        ]
        neon_cur.execute(insert_sql, values)
        count += 1

    print(f"  {count} ligne(s) migrée(s) vers {table}.")
    return count


def main():
    local_conn = psycopg2.connect(LOCAL_DSN, cursor_factory=psycopg2.extras.RealDictCursor)
    neon_conn = psycopg2.connect(NEON_DSN, cursor_factory=psycopg2.extras.RealDictCursor)

    local_cur = local_conn.cursor()
    neon_cur = neon_conn.cursor()

    try:
        # --- activites ---
        print("Migration de 'activites'...")

        def transform_activites(r):
            r["stagiaire_id"] = remap_stagiaire(r["stagiaire_id"])
            return r

        migrer_table(
            local_cur, neon_cur, "activites",
            ["stagiaire_id", "action", "statut", "date_action",
             "priorite", "echeance", "progression", "derniere_modification"],
            f"stagiaire_id = {STAGIAIRE_ID_LOCAL}",
            transform_activites,
        )

        # --- notifications ---
        print("Migration de 'notifications'...")

        def transform_notifications(r):
            r["stagiaire_id"] = remap_stagiaire(r["stagiaire_id"])
            r["encadrant_id"] = remap_encadrant(r["encadrant_id"])
            return r

        migrer_table(
            local_cur, neon_cur, "notifications",
            ["stagiaire_id", "categorie", "urgence", "titre", "contenu",
             "date_creation", "lu", "encadrant_id"],
            f"stagiaire_id = {STAGIAIRE_ID_LOCAL}",
            transform_notifications,
        )

        # --- evaluations ---
        print("Migration de 'evaluations'...")

        def transform_evaluations(r):
            r["stagiaire_id"] = remap_stagiaire(r["stagiaire_id"])
            r["encadrant_id"] = remap_encadrant(r["encadrant_id"])
            return r

        migrer_table(
            local_cur, neon_cur, "evaluations",
            ["stagiaire_id", "encadrant_id", "titre", "note", "date_evaluation",
             "fichier_url", "criteres", "commentaire_global", "recommandations", "statut"],
            f"stagiaire_id = {STAGIAIRE_ID_LOCAL}",
            transform_evaluations,
        )

        # --- messages ---
        print("Migration de 'messages'...")

        def transform_messages(r):
            r["stagiaire_id"] = remap_stagiaire(r["stagiaire_id"])
            r["encadrant_id"] = remap_encadrant(r["encadrant_id"])
            return r

        migrer_table(
            local_cur, neon_cur, "messages",
            ["stagiaire_id", "encadrant_id", "expediteur", "type_message", "contenu",
             "date_envoi", "lu", "piece_jointe_nom", "piece_jointe_url", "piece_jointe_taille"],
            f"stagiaire_id = {STAGIAIRE_ID_LOCAL}",
            transform_messages,
        )

        neon_conn.commit()
        print("\n✅ Migration terminée avec succès, tout a été validé (commit).")

    except Exception as e:
        neon_conn.rollback()
        print(f"\n❌ Erreur pendant la migration, tout a été annulé (rollback) : {e}")
        raise
    finally:
        local_cur.close()
        neon_cur.close()
        local_conn.close()
        neon_conn.close()


if __name__ == "__main__":
    main()
