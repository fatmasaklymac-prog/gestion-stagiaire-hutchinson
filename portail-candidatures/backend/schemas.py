from pydantic import BaseModel
from datetime import datetime


class DemandeStageCreate(BaseModel):
    """
    Formulaire public de candidature (candidat externe, sans connexion).
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


class DemandeStageOut(BaseModel):
    """
    Ce que le candidat voit sur sa page de suivi — jamais commentaire_rh.
    """
    id: int
    prenom: str
    nom: str
    statut: str
    message_candidat: str | None = None
    date_entretien: str | None = None
    heure_entretien: str | None = None
    lieu_entretien: str | None = None

    class Config:
        from_attributes = True


class DepartementOut(BaseModel):
    id: int
    nom: str

    class Config:
        from_attributes = True


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


class SujetPFEResponse(SujetPFEBase):
    id: int
    date_creation: datetime

    class Config:
        from_attributes = True
