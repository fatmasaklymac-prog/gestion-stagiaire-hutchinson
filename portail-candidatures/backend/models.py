from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class Departement(Base):
    """
    Lecture seule ici : sert uniquement à peupler la liste déroulante
    du formulaire public. La table existe déjà sur Neon (créée par
    l'Espace RH), ce projet ne fait que la lire.
    """
    __tablename__ = "departements"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)


class DemandeStage(Base):
    """
    Structure identique à celle définie dans l'Espace RH (models.py),
    car la table demandes_stage existe déjà sur Neon avec ce schéma.
    Ce projet ne fait que lire/écrire dedans (jamais create_all ici :
    le rôle portail_candidatures n'a pas les droits CREATE TABLE).
    """
    __tablename__ = "demandes_stage"

    id = Column(Integer, primary_key=True, index=True)

    prenom = Column(String(100), nullable=False)
    nom = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    telephone = Column(String(20), nullable=True)
    cin = Column(String(20), nullable=True)

    etablissements = Column(String(150), nullable=False)
    niveau_etudes = Column(String(50), nullable=False)
    specialisation = Column(String(150), nullable=False)

    type_stage = Column(String(100), nullable=False)
    departements = Column(String(100), nullable=False)
    date_debut = Column(String(20), nullable=False)
    date_fin = Column(String(20), nullable=False)

    cv_url = Column(String(255), nullable=False)
    lettre_motivation_url = Column(String(255), nullable=True)

    statut = Column(String(20), default="en_attente")
    commentaire_rh = Column(String(1000), nullable=True)
    message_candidat = Column(String(1000), nullable=True)

    date_entretien = Column(String(20), nullable=True)
    heure_entretien = Column(String(10), nullable=True)
    lieu_entretien = Column(String(150), nullable=True)

    date_creation = Column(String(30), nullable=True)

    stagiaire_id_cree = Column(Integer, nullable=True)

    # Référence unique envoyée au candidat par email, utilisée pour
    # consulter son statut sans exposer l'id numérique brut.
    reference_suivi = Column(String(36), unique=True, nullable=True, index=True)


class SujetPFE(Base):
    __tablename__ = "sujets_pfe"
    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String(50), unique=True, nullable=False, index=True)
    annee = Column(Integer, nullable=False, index=True)
    titre = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    profil_requis = Column(String(200), nullable=True)
    competences_requises = Column(Text, nullable=True)
    environnement_technique = Column(Text, nullable=True)
    nombre_stagiaires = Column(Integer, default=1)
    duree_stage = Column(String(50), nullable=True)
    date_debut = Column(String(50), nullable=True)
    date_fin = Column(String(50), nullable=True)
    duree_min = Column(Integer, nullable=True)
    duree_max = Column(Integer, nullable=True)
    responsable_stage = Column(String(150), nullable=True)
    email_contact = Column(String(150), nullable=True)
    departement = Column(String(100), nullable=True)
    statut = Column(String(20), default="actif")
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
