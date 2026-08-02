from datetime import date, datetime
from pydantic import BaseModel


# ============================================================
# Schéma pour modifier son propre profil (PUT /moi)
# ============================================================

class ProfilUpdate(BaseModel):
    nom: str | None = None
    email: str | None = None
    telephone: str | None = None
    localisation: str | None = None

    class Config:
        from_attributes = True


# ============================================================
# Schéma pour changer son mot de passe (PUT /moi/mot-de-passe)
# ============================================================

class ChangementMotDePasse(BaseModel):
    ancien_mot_de_passe: str
    nouveau_mot_de_passe: str


# ============================================================
# Schémas pour le mot de passe oublié (simulation)
# ============================================================

class MotDePasseOublie(BaseModel):
    email: str


class ReinitialiserMotDePasse(BaseModel):
    token: str
    nouveau_mot_de_passe: str


# ============================================================
# Schémas pour les compétences techniques du stagiaire
# ============================================================

class CompetenceCreate(BaseModel):
    nom: str


class CompetenceOut(BaseModel):
    id: int
    nom: str

    class Config:
        from_attributes = True


# ============================================================
# Schémas pour l'historique de formation du stagiaire
# ============================================================

class FormationCreate(BaseModel):
    etablissement: str
    diplome: str | None = None
    date_debut: str | None = None
    date_fin: str | None = None


class FormationOut(BaseModel):
    id: int
    etablissement: str
    diplome: str | None = None
    date_debut: date | None = None
    date_fin: date | None = None

    class Config:
        from_attributes = True


# ============================================================
# Schémas pour les commentaires de l'encadrant sur un stagiaire
# ============================================================

class CommentaireCreate(BaseModel):
    titre: str
    contenu: str


class CommentaireOut(BaseModel):
    id: int
    titre: str
    contenu: str
    date_commentaire: datetime

    class Config:
        from_attributes = True


# ============================================================
# Schémas pour la gestion encadrant (dates, incidents)
# ============================================================

class DatesUpdate(BaseModel):
    date_debut: date
    date_fin: date


class IncidentCreate(BaseModel):
    titre: str
    contenu: str


# ============================================================
# Schéma pour l'affectation d'un stagiaire à l'encadrant courant
# ============================================================

class StagiaireDisponibleOut(BaseModel):
    id: int
    nom: str
    prenom: str
    email: str | None = None
    photo_url: str | None = None
    specialisation: str | None = None
    type_stage: str | None = None
    date_debut: date
    date_fin: date

    class Config:
        from_attributes = True


# ============================================================
# Schémas pour les demandes de stage (candidatures externes)
# ============================================================

class DemandeStageCreate(BaseModel):
    """
    Schéma utilisé par le formulaire PUBLIC (candidat externe, sans connexion).
    Volontairement, il n'accepte ni statut, ni commentaire_rh, ni infos
    d'entretien : ces champs sont uniquement pilotés par le RH ensuite.
    """
    prenom: str
    nom: str
    email: str
    telephone: str | None = None
    cin: str | None = None
    etablissements: str
    niveau_etudes: str
    specialisation: str
    type_stage: str
    departements: str
    date_debut: str
    date_fin: str
    cv_url: str
    lettre_motivation_url: str | None = None


class DemandeStageUpdate(BaseModel):
    """
    Schéma utilisé côté RH pour faire avancer une candidature dans son
    workflow : en_attente -> en_etude -> entretien_programme -> acceptee/refusee.
    Tous les champs sont optionnels : le RH ne modifie souvent qu'un seul
    champ à la fois.
    """
    statut: str | None = None
    commentaire_rh: str | None = None
    message_candidat: str | None = None
    date_entretien: str | None = None
    heure_entretien: str | None = None
    lieu_entretien: str | None = None


# ============================================================
# Schemas pour le PFE Book (sujets_pfe)
# ============================================================

class SujetPFEBase(BaseModel):
    reference: str
    annee: int
    titre: str
    description: str
    profil_requis: str | None = None
    competences_requises: str | None = None
    environnement_technique: str | None = None
    nombre_stagiaires: int = 1
    duree_stage: str | None = None
    date_debut: str | None = None
    date_fin: str | None = None
    duree_min: int | None = None
    duree_max: int | None = None
    responsable_stage: str | None = None
    email_contact: str | None = None
    departement: str | None = None
    statut: str = "actif"


class SujetPFECreate(SujetPFEBase):
    pass


class SujetPFEUpdate(BaseModel):
    titre: str | None = None
    description: str | None = None
    profil_requis: str | None = None
    competences_requises: str | None = None
    environnement_technique: str | None = None
    nombre_stagiaires: int | None = None
    duree_stage: str | None = None
    date_debut: str | None = None
    date_fin: str | None = None
    duree_min: int | None = None
    duree_max: int | None = None
    responsable_stage: str | None = None
    email_contact: str | None = None
    departement: str | None = None
    statut: str | None = None


class SujetPFEResponse(SujetPFEBase):
    id: int
    date_creation: datetime

    class Config:
        from_attributes = True
