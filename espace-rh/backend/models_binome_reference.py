from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Etablissement(Base):
    __tablename__ = "etablissements"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)

class Departement(Base):
    __tablename__ = "departements"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    description = Column(String, nullable=True)

class Encadrant(Base):
    __tablename__ = "encadrants"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    email = Column(String, nullable=True)
    telephone = Column(String, nullable=True)
    departement = Column(String, nullable=True)

class Utilisateur(Base):
    __tablename__ = "utilisateurs"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    email = Column(String, nullable=False)
    mot_de_passe_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)

class Stagiaire(Base):
    __tablename__ = "stagiaires"
    id = Column(Integer, primary_key=True, index=True)
    prenom = Column(String, nullable=False)
    nom = Column(String, nullable=False)
    email = Column(String, nullable=True)
    telephone = Column(String, nullable=True)
    cin = Column(String, nullable=True)
    etablissements = Column(String, nullable=True)
    niveau_etudes = Column(String, nullable=True)
    specialisation = Column(String, nullable=True)
    type_stage = Column(String, nullable=True)
    departements = Column(String, nullable=True)
    encadrant_id = Column(Integer, ForeignKey("encadrants.id"), nullable=True)
    date_debut = Column(String, nullable=True)
    date_fin = Column(String, nullable=True)
    statut = Column(String, default="en_attente")
    notifier_email = Column(Boolean, default=False)
    
    # ===== CHAMPS PFE (OBLIGATOIRES) =====
    annee_pfe = Column(Integer, nullable=True)
    reference_projet = Column(String(50), nullable=True)
    sujet_libre = Column(Text, nullable=True)

class DemandeStage(Base):
    __tablename__ = "demandes_stage"
    id = Column(Integer, primary_key=True, index=True)
    prenom = Column(String, nullable=False)
    nom = Column(String, nullable=False)
    email = Column(String, nullable=False)
    telephone = Column(String, nullable=True)
    cin = Column(String, nullable=True)
    etablissements = Column(String, nullable=False)
    niveau_etudes = Column(String, nullable=False)
    specialisation = Column(String, nullable=False)
    type_stage = Column(String, nullable=False)
    departements = Column(String, nullable=False)
    date_debut = Column(String, nullable=False)
    date_fin = Column(String, nullable=False)
    cv_url = Column(String, nullable=False)
    lettre_motivation_url = Column(String, nullable=True)
    statut = Column(String, default="en_attente")
    commentaire_rh = Column(String, nullable=True)
    message_candidat = Column(String, nullable=True)
    date_entretien = Column(String, nullable=True)
    heure_entretien = Column(String, nullable=True)
    lieu_entretien = Column(String, nullable=True)
    date_creation = Column(String, nullable=True)
    stagiaire_id_cree = Column(Integer, ForeignKey("stagiaires.id"), nullable=True)
    
    # ===== CHAMPS PFE (OBLIGATOIRES) =====
    annee_pfe = Column(Integer, nullable=True)
    reference_projet = Column(String(50), nullable=True)
    sujet_libre = Column(Text, nullable=True)

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"), nullable=False)
    type_document = Column(String, nullable=False)
    statut = Column(String, default="en_attente")
    date_document = Column(String, nullable=True)
    fichier_url = Column(String, nullable=True)
    commentaire_rh = Column(String, nullable=True)

class Presence(Base):
    __tablename__ = "presences"
    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, nullable=False)
    date = Column(String, nullable=False)
    present = Column(Boolean, default=False)
    marque_par = Column(Integer, nullable=True)

class Activite(Base):
    __tablename__ = "activites"
    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"), nullable=False)
    action = Column(String, nullable=False)
    statut = Column(String, nullable=True)
    date = Column(String, nullable=True)

class SessionFormation(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String, nullable=False)
    date = Column(String, nullable=False)
    heure = Column(String, nullable=True)
    salle = Column(String, nullable=True)
    description = Column(String, nullable=True)

# ===== MODÈLE POUR LE PFE BOOK (AVEC DATES FIXES) =====
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
    
    # ===== NOUVEAUX CHAMPS POUR LES DATES FIXES =====
    date_debut = Column(String(50), nullable=True)  # ex: "2026-02-01"
    date_fin = Column(String(50), nullable=True)    # ex: "2026-07-31"

    # ===== NOUVEAUX CHAMPS POUR LA DURÉE MIN/MAX (validation candidat) =====
    duree_min = Column(Integer, nullable=True)  # ex: 4
    duree_max = Column(Integer, nullable=True)  # ex: 6
    
    responsable_stage = Column(String(150), nullable=True)
    email_contact = Column(String(150), nullable=True)
    departement = Column(String(100), nullable=True)
    statut = Column(String(20), default="actif")
    date_creation = Column(DateTime(timezone=True), server_default=func.now())