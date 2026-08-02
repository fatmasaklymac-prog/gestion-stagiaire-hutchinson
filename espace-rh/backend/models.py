from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy import Text
from sqlalchemy.sql import func
from datetime import datetime
from database import Base

class Etablissement(Base):
    __tablename__ = "etablissements"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(150), nullable=False)


class Departement(Base):
    __tablename__ = "departements"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)


class Encadrant(Base):
    __tablename__ = "encadrants"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(150))
    departement_id = Column(Integer, ForeignKey("departements.id"))
    fonction = Column(String(150), nullable=True)
    telephone = Column(String(20), nullable=True)
    bureau = Column(String(150), nullable=True)
    horaires_disponibilite = Column(String(255), nullable=True)
    photo_url = Column(String(255), nullable=True)
    
class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    mot_de_passe_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"), nullable=True)
    encadrant_id = Column(Integer, ForeignKey("encadrants.id"), nullable=True)

from sqlalchemy import Column, Integer, String, ForeignKey, Date, Boolean, JSON

class Stagiaire(Base):
    __tablename__ = "stagiaires"

    id = Column(Integer, primary_key=True, index=True)
    prenom = Column(String(100), nullable=False)
    nom = Column(String(100), nullable=False)
    email = Column(String(150))
    telephone = Column(String(20))
    cin = Column(String(20), unique=True)
    etablissement_id = Column(Integer, ForeignKey("etablissements.id"))
    ecole = Column(String(100))
    niveau_etudes = Column(String(50))
    specialisation = Column(String(150))
    type_stage = Column(String(20))
    departement_id = Column(Integer, ForeignKey("departements.id"))
    encadrant_id = Column(Integer, ForeignKey("encadrants.id"))
    date_debut = Column(Date, nullable=False)
    date_fin = Column(Date, nullable=False)
    statut = Column(String(20), default="en_cours")
    notifier_par_email = Column(Boolean, default=True)
    localisation = Column(String(150))
    photo_url = Column(String(255))

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"))
    type_document = Column(String(30))
    statut = Column(String(20), default="en_attente")
    date_document = Column(Date)
    fichier_url = Column(String(255))
    taille_octets = Column(Integer)
    
class ConfirmationEvenement(Base):
    __tablename__ = "confirmations_evenement"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"))
    evenement_cle = Column(String(100), nullable=False)
    date_confirmation = Column(DateTime, default=datetime.utcnow)


class Presence(Base):
    __tablename__ = "presences"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"))
    date = Column(Date, nullable=False)
    present = Column(Boolean, nullable=False)
    marque_par = Column(Integer, ForeignKey("utilisateurs.id"))
    heure_arrivee = Column(String(5), nullable=True)
    heure_depart = Column(String(5), nullable=True)
    
    


from sqlalchemy import DateTime
from datetime import datetime

class Activite(Base):
    __tablename__ = "activites"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"))
    action = Column(String(150), nullable=False)
    statut = Column(String(30))
    date_action = Column(DateTime, default=datetime.utcnow)
    priorite = Column(String(20), default="moyenne")
    echeance = Column(Date, nullable=True)
    progression = Column(Integer, default=0)
    derniere_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SessionFormation(Base):
    __tablename__ = "sessions_formation"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(150), nullable=False)
    date_session = Column(Date, nullable=False)
    heure = Column(String(10), nullable=True)
    salle = Column(String(100), nullable=True)
    description = Column(String(500), nullable=True)


class CommentaireEncadrant(Base):
    __tablename__ = "commentaires_encadrant"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"))
    encadrant_id = Column(Integer, ForeignKey("encadrants.id"))
    titre = Column(String(150), nullable=False)
    contenu = Column(String(1000), nullable=False)
    date_commentaire = Column(DateTime, default=datetime.utcnow)


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"))
    encadrant_id = Column(Integer, ForeignKey("encadrants.id"))
    titre = Column(String(150), nullable=False)
    note = Column(String(5), nullable=True)
    date_evaluation = Column(Date, nullable=False)
    fichier_url = Column(String(255), nullable=True)
    criteres = Column(JSON, nullable=True)
    commentaire_global = Column(String(2000), nullable=True)
    recommandations = Column(String(2000), nullable=True)
    statut = Column(String(20), default="brouillon")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"))
    encadrant_id = Column(Integer, ForeignKey("encadrants.id"))
    expediteur = Column(String(20), nullable=False)
    type_message = Column(String(20), default="message")
    contenu = Column(String(2000), nullable=False)
    date_envoi = Column(DateTime, default=datetime.utcnow)
    lu = Column(Boolean, default=False)
    piece_jointe_nom = Column(String(255), nullable=True)
    piece_jointe_url = Column(String(500), nullable=True)
    piece_jointe_taille = Column(Integer, nullable=True)


class Reunion(Base):
    __tablename__ = "reunions"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"))
    encadrant_id = Column(Integer, ForeignKey("encadrants.id"))
    date_reunion = Column(Date, nullable=False)
    heure = Column(String(10), nullable=False)
    type_reunion = Column(String(20), default="presentiel")
    lieu_ou_lien = Column(String(500))
    objet = Column(String(255), nullable=False)
    notes = Column(String(2000))
    date_creation = Column(DateTime, default=datetime.utcnow)
    statut = Column(String(20), default="a_venir")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"), nullable=True)
    encadrant_id = Column(Integer, ForeignKey("encadrants.id"), nullable=True)
    categorie = Column(String(20), nullable=False)
    urgence = Column(String(20), nullable=True)
    titre = Column(String(200), nullable=False)
    contenu = Column(String(1000), nullable=True)
    date_creation = Column(DateTime, default=datetime.utcnow)
    lu = Column(Boolean, default=False)


class Formation(Base):
    __tablename__ = "formations"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"))
    etablissement = Column(String(150), nullable=False)
    diplome = Column(String(150))
    date_debut = Column(Date)
    date_fin = Column(Date)
    ordre = Column(Integer, default=0)


class Competence(Base):
    __tablename__ = "competences"

    id = Column(Integer, primary_key=True, index=True)
    stagiaire_id = Column(Integer, ForeignKey("stagiaires.id"))
    nom = Column(String(100), nullable=False)


class DemandeStage(Base):
    """
    Candidature externe à un stage, avant transformation éventuelle en
    Stagiaire. Les champs 'etablissements' et 'departements' sont du texte
    libre saisi par le candidat (pas encore de lien vers les tables
    Etablissement / Departement) : c'est la route de conversion qui fait
    la correspondance texte -> ID, et qui échoue si rien ne correspond.
    """
    __tablename__ = "demandes_stage"

    id = Column(Integer, primary_key=True, index=True)

    # Informations personnelles
    prenom = Column(String(100), nullable=False)
    nom = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    telephone = Column(String(20), nullable=True)
    cin = Column(String(20), nullable=True)

    # Informations académiques (texte libre, converti en ID à la conversion)
    etablissements = Column(String(150), nullable=False)
    niveau_etudes = Column(String(50), nullable=False)
    specialisation = Column(String(150), nullable=False)

    # Informations sur le stage souhaité
    type_stage = Column(String(20), nullable=False)
    departements = Column(String(100), nullable=False)
    date_debut = Column(String(20), nullable=False)
    date_fin = Column(String(20), nullable=False)

    # Documents de candidature
    cv_url = Column(String(255), nullable=False)
    lettre_motivation_url = Column(String(255), nullable=True)

    # Suivi de la candidature
    # Workflow : en_attente -> en_etude -> entretien_programme -> acceptee / refusee
    statut = Column(String(20), default="en_attente")

    # Notes RH internes (jamais visibles par le candidat)
    commentaire_rh = Column(String(1000), nullable=True)

    # Message visible par le candidat sur la page de suivi
    message_candidat = Column(String(1000), nullable=True)

    # Entretien
    date_entretien = Column(String(20), nullable=True)
    heure_entretien = Column(String(10), nullable=True)
    lieu_entretien = Column(String(150), nullable=True)

    date_creation = Column(String(30), nullable=True)

    # Rempli automatiquement à la conversion : traçabilité candidature -> stagiaire
    stagiaire_id_cree = Column(Integer, ForeignKey("stagiaires.id"), nullable=True)


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
