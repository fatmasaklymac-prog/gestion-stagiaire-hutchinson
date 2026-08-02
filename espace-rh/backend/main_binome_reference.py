from datetime import date, datetime
import os
import uuid
import io
import pandas as pd
from fastapi.responses import Response
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, get_db
from models import (
    Stagiaire, Etablissement, Departement, Encadrant,
    Utilisateur, Document, Presence, Activite, SessionFormation,
    DemandeStage, SujetPFE  
)

from sqlalchemy import text

Base.metadata.create_all(bind=engine)

# ===== MINI-MIGRATION : ajout des colonnes duree_min / duree_max =====
# Base.metadata.create_all ne modifie jamais une table déjà existante,
# donc on ajoute ces colonnes manuellement si elles n'existent pas encore.
# "IF NOT EXISTS" (PostgreSQL) rend l'opération idempotente : sans risque
# de replanter au prochain redémarrage si les colonnes existent déjà.
with engine.connect() as _conn:
    _conn.execute(text("ALTER TABLE sujets_pfe ADD COLUMN IF NOT EXISTS duree_min INTEGER"))
    _conn.execute(text("ALTER TABLE sujets_pfe ADD COLUMN IF NOT EXISTS duree_max INTEGER"))
    _conn.commit()

app = FastAPI(title="API Suivi des Stagiaires & PFE Book")

# === Fichiers uploadés (CV, lettres de motivation...) ===
DOSSIER_UPLOADS = "uploads"
os.makedirs(DOSSIER_UPLOADS, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=DOSSIER_UPLOADS), name="uploads")

# === CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Schémas Pydantic ====================

class EtablissementCreate(BaseModel):
    nom: str

class DepartementCreate(BaseModel):
    nom: str
    description: str | None = None

class EncadrantCreate(BaseModel):
    nom: str
    prenom: str
    email: str | None = None
    telephone: str | None = None
    departement: str | None = None

class UtilisateurCreate(BaseModel):
    nom: str
    email: str
    mot_de_passe_hash: str
    role: str

class StagiaireCreate(BaseModel):
    prenom: str
    nom: str
    email: str | None = None
    telephone: str | None = None
    cin: str | None = None
    etablissements: str | None = None
    niveau_etudes: str | None = None
    specialisation: str | None = None
    type_stage: str | None = None
    departements: str | None = None
    encadrant_id: int | None = None
    date_debut: str | None = None
    date_fin: str | None = None
    statut: str = "en_attente"
    notifier_email: bool = False
    # Champs PFE pour création directe
    annee_pfe: int | None = None
    reference_projet: str | None = None
    sujet_libre: str | None = None

class DocumentCreate(BaseModel):
    stagiaire_id: int
    type_document: str
    statut: str | None = "en_attente"
    date_document: str | None = None
    fichier_url: str | None = None
    commentaire_rh: str | None = None

class PresenceCreate(BaseModel):
    stagiaire_id: int
    date: str
    present: bool
    marque_par: int | None = None

class ActiviteCreate(BaseModel):
    stagiaire_id: int
    action: str
    statut: str | None = None

class SessionCreate(BaseModel):
    titre: str
    date: str
    heure: str | None = None
    salle: str | None = None
    description: str | None = None

# --- Demandes de stage (portail candidat externe) ---
class DemandeStageCreate(BaseModel):
    """Schéma utilisé par le formulaire PUBLIC"""
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
    # Champs PFE
    annee_pfe: int | None = None
    reference_projet: str | None = None
    sujet_libre: str | None = None

class DemandeStageUpdate(BaseModel):
    """Schéma utilisé côté RH pour faire avancer une candidature"""
    statut: str | None = None
    commentaire_rh: str | None = None
    message_candidat: str | None = None
    date_entretien: str | None = None
    heure_entretien: str | None = None
    lieu_entretien: str | None = None

# ===== SCHÉMAS PYDANTIC POUR PFE BOOK (MIS À JOUR AVEC LES DATES) =====
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
    date_debut: str | None = None  # <--- AJOUTÉ
    date_fin: str | None = None    # <--- AJOUTÉ
    duree_min: int | None = None   # <--- AJOUTÉ
    duree_max: int | None = None   # <--- AJOUTÉ
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
    date_debut: str | None = None  # <--- AJOUTÉ
    date_fin: str | None = None    # <--- AJOUTÉ
    duree_min: int | None = None   # <--- AJOUTÉ
    duree_max: int | None = None   # <--- AJOUTÉ
    responsable_stage: str | None = None
    email_contact: str | None = None
    departement: str | None = None
    statut: str | None = None

class SujetPFEResponse(SujetPFEBase):
    id: int
    date_creation: datetime
    
    class Config:
        from_attributes = True

# ==================== Helpers ====================

def _log_activite(db: Session, stagiaire_id: int, action: str, statut: str | None = None):
    db.add(Activite(
        stagiaire_id=stagiaire_id,
        action=action,
        statut=statut,
        date=datetime.now().isoformat(),
    ))

def _calculer_duree_mois(date_debut_str: str | None, date_fin_str: str | None) -> int:
    """Calcule la durée en mois entre deux dates au format ISO ('YYYY-MM-DD')."""
    if not date_debut_str or not date_fin_str:
        return 0
    d1 = date.fromisoformat(str(date_debut_str)[:10])
    d2 = date.fromisoformat(str(date_fin_str)[:10])
    return (d2.year - d1.year) * 12 + (d2.month - d1.month)

# ==================== Routes ====================

@app.get("/")
def accueil():
    return {"message": "Bienvenue sur l'API de suivi des stagiaires"}

# --- Upload générique de fichiers ---
EXTENSIONS_AUTORISEES = {".pdf", ".doc", ".docx"}
TAILLE_MAX_OCTETS = 5 * 1024 * 1024  # 5 Mo

@app.post("/upload")
async def uploader_fichier(fichier: UploadFile = File(...)):
    extension = os.path.splitext(fichier.filename or "")[1].lower()
    if extension not in EXTENSIONS_AUTORISEES:
        raise HTTPException(status_code=400, detail="Format non autorisé (PDF, DOC, DOCX)")
    contenu = await fichier.read()
    if len(contenu) > TAILLE_MAX_OCTETS:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (5 Mo max)")
    nom_fichier = f"{uuid.uuid4().hex}{extension}"
    chemin_disque = os.path.join(DOSSIER_UPLOADS, nom_fichier)
    with open(chemin_disque, "wb") as f:
        f.write(contenu)
    return {"url": f"/uploads/{nom_fichier}", "nom_original": fichier.filename}

# --- Établissements ---
@app.get("/etablissements")
def liste_etablissements(db: Session = Depends(get_db)):
    return db.query(Etablissement).all()

@app.post("/etablissements")
def ajouter_etablissement(etab: EtablissementCreate, db: Session = Depends(get_db)):
    nouveau = Etablissement(**etab.model_dump())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@app.delete("/etablissements/{etablissement_id}")
def supprimer_etablissement(etablissement_id: int, db: Session = Depends(get_db)):
    obj = db.query(Etablissement).filter(Etablissement.id == etablissement_id).first()
    if obj is None:
        raise HTTPException(status_code=404, detail="Établissement non trouvé")
    db.delete(obj)
    db.commit()
    return {"message": f"Établissement {etablissement_id} supprimé"}

# --- Départements ---
@app.get("/departements")
def liste_departements(db: Session = Depends(get_db)):
    return db.query(Departement).all()

@app.post("/departements")
def ajouter_departement(dep: DepartementCreate, db: Session = Depends(get_db)):
    nouveau = Departement(**dep.model_dump())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@app.put("/departements/{departement_id}")
def modifier_departement(departement_id: int, dep_maj: DepartementCreate, db: Session = Depends(get_db)):
    departement = db.query(Departement).filter(Departement.id == departement_id).first()
    if departement is None:
        raise HTTPException(status_code=404, detail="Département non trouvé")
    for champ, valeur in dep_maj.model_dump().items():
        setattr(departement, champ, valeur)
    db.commit()
    db.refresh(departement)
    return departement

@app.delete("/departements/{departement_id}")
def supprimer_departement(departement_id: int, db: Session = Depends(get_db)):
    obj = db.query(Departement).filter(Departement.id == departement_id).first()
    if obj is None:
        raise HTTPException(status_code=404, detail="Département non trouvé")
    db.delete(obj)
    db.commit()
    return {"message": f"Département {departement_id} supprimé"}

# --- Encadrants ---
@app.get("/encadrants")
def liste_encadrants(db: Session = Depends(get_db)):
    return db.query(Encadrant).all()

@app.post("/encadrants")
def ajouter_encadrant(encadrant: EncadrantCreate, db: Session = Depends(get_db)):
    nouveau = Encadrant(**encadrant.model_dump())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@app.put("/encadrants/{encadrant_id}")
def modifier_encadrant(encadrant_id: int, encadrant_maj: EncadrantCreate, db: Session = Depends(get_db)):
    encadrant = db.query(Encadrant).filter(Encadrant.id == encadrant_id).first()
    if encadrant is None:
        raise HTTPException(status_code=404, detail="Encadrant non trouvé")
    for champ, valeur in encadrant_maj.model_dump().items():
        setattr(encadrant, champ, valeur)
    db.commit()
    db.refresh(encadrant)
    return encadrant

@app.delete("/encadrants/{encadrant_id}")
def supprimer_encadrant(encadrant_id: int, db: Session = Depends(get_db)):
    obj = db.query(Encadrant).filter(Encadrant.id == encadrant_id).first()
    if obj is None:
        raise HTTPException(status_code=404, detail="Encadrant non trouvé")
    db.query(Stagiaire).filter(Stagiaire.encadrant_id == encadrant_id).update({"encadrant_id": None})
    db.delete(obj)
    db.commit()
    return {"message": f"Encadrant {encadrant_id} supprimé"}

# --- Utilisateurs ---
@app.get("/utilisateurs")
def liste_utilisateurs(db: Session = Depends(get_db)):
    return db.query(Utilisateur).all()

@app.post("/utilisateurs")
def ajouter_utilisateur(utilisateur: UtilisateurCreate, db: Session = Depends(get_db)):
    nouveau = Utilisateur(**utilisateur.model_dump())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@app.delete("/utilisateurs/{utilisateur_id}")
def supprimer_utilisateur(utilisateur_id: int, db: Session = Depends(get_db)):
    obj = db.query(Utilisateur).filter(Utilisateur.id == utilisateur_id).first()
    if obj is None:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    db.delete(obj)
    db.commit()
    return {"message": f"Utilisateur {utilisateur_id} supprimé"}

# --- Stagiaires ---
@app.get("/stagiaires")
def liste_stagiaires(db: Session = Depends(get_db)):
    return db.query(Stagiaire).all()

@app.post("/stagiaires")
def ajouter_stagiaire(stagiaire: StagiaireCreate, db: Session = Depends(get_db)):
    nouveau = Stagiaire(**stagiaire.model_dump())
    db.add(nouveau)
    db.flush()
    _log_activite(db, nouveau.id, f"Nouveau stagiaire ajouté — {nouveau.prenom} {nouveau.nom}", nouveau.statut)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@app.put("/stagiaires/{stagiaire_id}")
def modifier_stagiaire(stagiaire_id: int, stagiaire_maj: StagiaireCreate, db: Session = Depends(get_db)):
    stagiaire = db.query(Stagiaire).filter(Stagiaire.id == stagiaire_id).first()
    if stagiaire is None:
        raise HTTPException(status_code=404, detail="Stagiaire non trouvé")
    ancien_statut = stagiaire.statut
    for champ, valeur in stagiaire_maj.model_dump().items():
        setattr(stagiaire, champ, valeur)
    if stagiaire.statut != ancien_statut:
        action = f"Changement de statut — {stagiaire.prenom} {stagiaire.nom} ({ancien_statut} → {stagiaire.statut})"
    else:
        action = f"Profil mis à jour — {stagiaire.prenom} {stagiaire.nom}"
    _log_activite(db, stagiaire.id, action, stagiaire.statut)
    db.commit()
    db.refresh(stagiaire)
    return stagiaire
@app.delete("/stagiaires/{stagiaire_id}")
def supprimer_stagiaire(stagiaire_id: int, db: Session = Depends(get_db)):
    obj = db.query(Stagiaire).filter(Stagiaire.id == stagiaire_id).first()
    if obj is None:
        raise HTTPException(status_code=404, detail="Stagiaire non trouvé")


    if obj.reference_projet and obj.annee_pfe:
        sujet = db.query(SujetPFE).filter(
            SujetPFE.reference == obj.reference_projet,
            SujetPFE.annee == obj.annee_pfe
        ).first()
        if sujet:
            sujet.nombre_stagiaires = (sujet.nombre_stagiaires or 0) + 1
            # Si le sujet était marqué "pourvu", on le remet "actif"
            if sujet.statut == "pourvu":
                sujet.statut = "actif"
    # ===========================================================================================

    db.query(Activite).filter(Activite.stagiaire_id == stagiaire_id).delete()
    db.query(Document).filter(Document.stagiaire_id == stagiaire_id).delete()
    db.query(Presence).filter(Presence.stagiaire_id == stagiaire_id).delete()
    db.query(DemandeStage).filter(DemandeStage.stagiaire_id_cree == stagiaire_id).update({"stagiaire_id_cree": None})
    db.delete(obj)
    db.commit()
    return {"message": f"Stagiaire {stagiaire_id} supprimé"}

# --- Documents ---
@app.get("/documents")
def liste_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()

@app.post("/documents")
def ajouter_document(document: DocumentCreate, db: Session = Depends(get_db)):
    nouveau = Document(**document.model_dump())
    db.add(nouveau)
    db.flush()
    stagiaire = db.query(Stagiaire).filter(Stagiaire.id == nouveau.stagiaire_id).first()
    nom = f"{stagiaire.prenom} {stagiaire.nom}" if stagiaire else "un stagiaire"
    _log_activite(db, nouveau.stagiaire_id, f"Document ajouté — {nouveau.type_document} ({nom})", nouveau.statut)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@app.put("/documents/{document_id}")
def modifier_document(document_id: int, document_maj: DocumentCreate, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    ancien_statut = document.statut
    for champ, valeur in document_maj.model_dump().items():
        setattr(document, champ, valeur)
    stagiaire = db.query(Stagiaire).filter(Stagiaire.id == document.stagiaire_id).first()
    nom = f"{stagiaire.prenom} {stagiaire.nom}" if stagiaire else "un stagiaire"
    if document.statut != ancien_statut:
        action = f"Document {document.type_document} — statut changé ({ancien_statut} → {document.statut}) — {nom}"
    else:
        action = f"Document {document.type_document} mis à jour — {nom}"
    _log_activite(db, document.stagiaire_id, action, document.statut)
    db.commit()
    db.refresh(document)
    return document

@app.delete("/documents/{document_id}")
def supprimer_document(document_id: int, db: Session = Depends(get_db)):
    obj = db.query(Document).filter(Document.id == document_id).first()
    if obj is None:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    db.delete(obj)
    db.commit()
    return {"message": f"Document {document_id} supprimé"}

# --- Présences ---
@app.get("/presences")
def liste_presences(db: Session = Depends(get_db)):
    return db.query(Presence).all()

@app.post("/presences")
def ajouter_presence(presence: PresenceCreate, db: Session = Depends(get_db)):
    nouvelle = Presence(**presence.model_dump())
    db.add(nouvelle)
    db.flush()
    stagiaire = db.query(Stagiaire).filter(Stagiaire.id == nouvelle.stagiaire_id).first()
    nom = f"{stagiaire.prenom} {stagiaire.nom}" if stagiaire else "un stagiaire"
    statut_txt = "présent" if nouvelle.present else "absent"
    _log_activite(db, nouvelle.stagiaire_id, f"Présence pointée — {nom} marqué {statut_txt}")
    db.commit()
    db.refresh(nouvelle)
    return nouvelle

@app.put("/presences/{presence_id}")
def modifier_presence(presence_id: int, presence_maj: PresenceCreate, db: Session = Depends(get_db)):
    presence = db.query(Presence).filter(Presence.id == presence_id).first()
    if presence is None:
        raise HTTPException(status_code=404, detail="Présence non trouvée")
    for champ, valeur in presence_maj.model_dump().items():
        setattr(presence, champ, valeur)
    stagiaire = db.query(Stagiaire).filter(Stagiaire.id == presence.stagiaire_id).first()
    nom = f"{stagiaire.prenom} {stagiaire.nom}" if stagiaire else "un stagiaire"
    statut_txt = "présent" if presence.present else "absent"
    _log_activite(db, presence.stagiaire_id, f"Présence modifiée — {nom} marqué {statut_txt}")
    db.commit()
    db.refresh(presence)
    return presence

@app.delete("/presences/{presence_id}")
def supprimer_presence(presence_id: int, db: Session = Depends(get_db)):
    obj = db.query(Presence).filter(Presence.id == presence_id).first()
    if obj is None:
        raise HTTPException(status_code=404, detail="Présence non trouvée")
    db.delete(obj)
    db.commit()
    return {"message": f"Présence {presence_id} supprimée"}

# --- Activités ---
@app.get("/activites")
def liste_activites(db: Session = Depends(get_db)):
    resultats = (
        db.query(Activite, Stagiaire.prenom, Stagiaire.nom)
        .join(Stagiaire, Activite.stagiaire_id == Stagiaire.id)
        .order_by(Activite.id.desc())
        .all()
    )
    return [
        {
            "id": act.id,
            "stagiaire_id": act.stagiaire_id,
            "action": act.action,
            "statut": act.statut,
            "date": act.date,
            "stagiaire_nom": f"{prenom} {nom}",
        }
        for act, prenom, nom in resultats
    ]

@app.post("/activites")
def ajouter_activite(activite: ActiviteCreate, db: Session = Depends(get_db)):
    nouvelle = Activite(**activite.model_dump())
    db.add(nouvelle)
    db.commit()
    db.refresh(nouvelle)
    return nouvelle

@app.delete("/activites/{activite_id}")
def supprimer_activite(activite_id: int, db: Session = Depends(get_db)):
    obj = db.query(Activite).filter(Activite.id == activite_id).first()
    if obj is None:
        raise HTTPException(status_code=404, detail="Activité non trouvée")
    db.delete(obj)
    db.commit()
    return {"message": f"Activité {activite_id} supprimée"}

# --- Sessions de formation ---
@app.get("/sessions")
def liste_sessions(db: Session = Depends(get_db)):
    return db.query(SessionFormation).order_by(SessionFormation.date).all()

@app.get("/sessions/a-venir")
def sessions_a_venir(db: Session = Depends(get_db)):
    aujourdhui = date.today().isoformat()
    return db.query(SessionFormation).filter(SessionFormation.date >= aujourdhui).order_by(SessionFormation.date).all()

@app.post("/sessions")
def ajouter_session(session: SessionCreate, db: Session = Depends(get_db)):
    nouvelle = SessionFormation(**session.model_dump())
    db.add(nouvelle)
    db.commit()
    db.refresh(nouvelle)
    return nouvelle

@app.put("/sessions/{session_id}")
def modifier_session(session_id: int, session_maj: SessionCreate, db: Session = Depends(get_db)):
    session_obj = db.query(SessionFormation).filter(SessionFormation.id == session_id).first()
    if session_obj is None:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    for champ, valeur in session_maj.model_dump().items():
        setattr(session_obj, champ, valeur)
    db.commit()
    db.refresh(session_obj)
    return session_obj

@app.delete("/sessions/{session_id}")
def supprimer_session(session_id: int, db: Session = Depends(get_db)):
    obj = db.query(SessionFormation).filter(SessionFormation.id == session_id).first()
    if obj is None:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    db.delete(obj)
    db.commit()
    return {"message": f"Session {session_id} supprimée"}

# --- Agrégats Dashboard ---
@app.get("/presences/jour")
def presences_du_jour(db: Session = Depends(get_db)):
    aujourdhui = date.today().isoformat()
    total = db.query(Stagiaire).filter(Stagiaire.statut == "en_cours").count()
    present = db.query(Presence).filter(Presence.date == aujourdhui, Presence.present == True).count()
    return {"present": present, "total": total}

@app.get("/documents/manquants")
def documents_manquants(db: Session = Depends(get_db)):
    count = (
        db.query(Document)
        .join(Stagiaire, Document.stagiaire_id == Stagiaire.id)
        .filter(Stagiaire.statut == "en_cours")
        .filter(Document.statut.in_(["en_attente", "a_reviser"]))
        .count()
    )
    return {"count": count}

# ==================== Demandes de stage (candidatures externes) ====================

@app.get("/demandes-stage")
def liste_demandes_stage(db: Session = Depends(get_db)):
    return db.query(DemandeStage).order_by(DemandeStage.id.desc()).all()

@app.get("/demandes-stage/suivi")
def suivi_demande_stage(id: int, email: str, db: Session = Depends(get_db)):
    demande = db.query(DemandeStage).filter(DemandeStage.id == id, DemandeStage.email.ilike(email.strip())).first()
    if demande is None:
        raise HTTPException(status_code=404, detail="Aucune candidature ne correspond.")
    return demande

@app.get("/demandes-stage/{demande_id}")
def detail_demande_stage(demande_id: int, db: Session = Depends(get_db)):
    demande = db.query(DemandeStage).filter(DemandeStage.id == demande_id).first()
    if demande is None:
        raise HTTPException(status_code=404, detail="Demande de stage non trouvée")
    return demande

@app.post("/demandes-stage")
def creer_demande_stage(demande: DemandeStageCreate, db: Session = Depends(get_db)):
    # ===== VALIDATION SERVEUR DE LA DURÉE DU STAGE =====
    # Ne jamais faire confiance uniquement au frontend : on revalide ici,
    # sinon un appel direct à l'API contourne toute la logique de durée.
    duree_candidat = _calculer_duree_mois(demande.date_debut, demande.date_fin)

    if demande.date_fin and demande.date_debut and date.fromisoformat(str(demande.date_fin)[:10]) < date.fromisoformat(str(demande.date_debut)[:10]):
        raise HTTPException(status_code=400, detail="La date de fin doit être après la date de début")

    sujet = None
    if demande.reference_projet and demande.annee_pfe:
        sujet = db.query(SujetPFE).filter(
            SujetPFE.reference == demande.reference_projet,
            SujetPFE.annee == demande.annee_pfe,
        ).first()

    if sujet:
        if sujet.date_debut and sujet.date_fin:
            # Cas 1 : sujet avec dates fixes imposées
            duree_sujet = _calculer_duree_mois(sujet.date_debut, sujet.date_fin)
            if duree_candidat < duree_sujet:
                raise HTTPException(
                    status_code=400,
                    detail=f"La durée du stage ne peut pas être inférieure à {duree_sujet} mois",
                )
        elif sujet.duree_min and sujet.duree_max:
            # Cas 2 : sujet avec durée min/max numérique
            if duree_candidat < sujet.duree_min:
                raise HTTPException(
                    status_code=400,
                    detail=f"La durée minimum pour ce sujet est {sujet.duree_min} mois",
                )
            if duree_candidat > sujet.duree_max:
                raise HTTPException(
                    status_code=400,
                    detail=f"La durée maximum pour ce sujet est {sujet.duree_max} mois",
                )
        else:
            # Cas 3 : sujet sans contrainte de durée définie
            if duree_candidat < 1 or duree_candidat > 12:
                raise HTTPException(status_code=400, detail="La durée doit être comprise entre 1 et 12 mois")
    elif demande.sujet_libre:
        # Cas 4 : sujet libre
        if duree_candidat < 1 or duree_candidat > 12:
            raise HTTPException(status_code=400, detail="La durée doit être comprise entre 1 et 12 mois")
    # =====================================================

    nouvelle = DemandeStage(
        **demande.model_dump(),
        statut="en_attente",
        date_creation=datetime.now().isoformat(),
    )
    db.add(nouvelle)
    db.commit()
    db.refresh(nouvelle)
    return nouvelle

@app.put("/demandes-stage/{demande_id}")
def modifier_demande_stage(demande_id: int, demande_maj: DemandeStageUpdate, db: Session = Depends(get_db)):
    demande = db.query(DemandeStage).filter(DemandeStage.id == demande_id).first()
    if demande is None:
        raise HTTPException(status_code=404, detail="Demande de stage non trouvée")
    for champ, valeur in demande_maj.model_dump(exclude_unset=True).items():
        setattr(demande, champ, valeur)
    db.commit()
    db.refresh(demande)
    return demande

@app.delete("/demandes-stage/{demande_id}")
def supprimer_demande_stage(demande_id: int, db: Session = Depends(get_db)):
    obj = db.query(DemandeStage).filter(DemandeStage.id == demande_id).first()
    if obj is None:
        raise HTTPException(status_code=404, detail="Demande de stage non trouvée")
    db.delete(obj)
    db.commit()
    return {"message": f"Demande de stage {demande_id} supprimée"}

@app.post("/demandes-stage/{demande_id}/convertir")
def convertir_demande_en_stagiaire(demande_id: int, db: Session = Depends(get_db)):
    demande = db.query(DemandeStage).filter(DemandeStage.id == demande_id).first()
    if demande is None:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    if demande.stagiaire_id_cree is not None:
        raise HTTPException(status_code=400, detail="Déjà convertie")

    # ===== LOGIQUE PFE : Inactiver le sujet si un stagiaire est affecté =====
    if demande.reference_projet and demande.annee_pfe:
        sujet = db.query(SujetPFE).filter(
            SujetPFE.reference == demande.reference_projet,
            SujetPFE.annee == demande.annee_pfe,
            SujetPFE.statut == "actif"
        ).first()
        if sujet:
            sujet.nombre_stagiaires = max(0, sujet.nombre_stagiaires - 1)
            if sujet.nombre_stagiaires <= 0:
                sujet.statut = "pourvu"  # Disparaît du PFE Book public
    # ======================================================================

    nouveau_stagiaire = Stagiaire(
        prenom=demande.prenom, nom=demande.nom, email=demande.email,
        telephone=demande.telephone, cin=demande.cin,
        etablissements=demande.etablissements, niveau_etudes=demande.niveau_etudes,
        specialisation=demande.specialisation, type_stage=demande.type_stage,
        departements=demande.departements, encadrant_id=None,
        date_debut=demande.date_debut, date_fin=demande.date_fin,
        statut="en_attente", notifier_email=False,
        # Champs PFE
        annee_pfe=demande.annee_pfe, reference_projet=demande.reference_projet, sujet_libre=demande.sujet_libre
    )
    db.add(nouveau_stagiaire)
    db.flush()
    
    demande.statut = "acceptee"
    demande.stagiaire_id_cree = nouveau_stagiaire.id
    _log_activite(db, nouveau_stagiaire.id, f"Stagiaire créé — {nouveau_stagiaire.prenom} {nouveau_stagiaire.nom}", nouveau_stagiaire.statut)
    
    db.commit()
    db.refresh(nouveau_stagiaire)
    db.refresh(demande)
    return {"demande": demande, "stagiaire": nouveau_stagiaire}

# ==================== Routes API pour PFE Book ====================

@app.get("/sujets-pfe", response_model=list[SujetPFEResponse])
def liste_sujets_pfe(db: Session = Depends(get_db)):
    """Récupère tous les sujets PFE"""
    return db.query(SujetPFE).order_by(SujetPFE.annee.desc(), SujetPFE.reference).all()

@app.get("/sujets-pfe/ref/{reference}")
def get_sujet_by_ref(reference: str, db: Session = Depends(get_db)):
    """Récupère les détails d'un sujet PFE par sa référence (utile pour pré-remplir le formulaire)"""
    sujet = db.query(SujetPFE).filter(SujetPFE.reference == reference).first()
    if not sujet:
        raise HTTPException(status_code=404, detail="Sujet non trouvé")
    return sujet

@app.post("/sujets-pfe", response_model=SujetPFEResponse)
def creer_sujet_pfe(sujet: SujetPFECreate, db: Session = Depends(get_db)):
    """Crée un nouveau sujet PFE (Réservé aux RH/Admin)"""
    existing = db.query(SujetPFE).filter(SujetPFE.reference == sujet.reference).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"La référence {sujet.reference} existe déjà.")
        
    nouveau = SujetPFE(**sujet.model_dump())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@app.put("/sujets-pfe/{sujet_id}", response_model=SujetPFEResponse)
def modifier_sujet_pfe(sujet_id: int, sujet_maj: SujetPFEUpdate, db: Session = Depends(get_db)):
    """Modifie un sujet PFE existant"""
    sujet = db.query(SujetPFE).filter(SujetPFE.id == sujet_id).first()
    if not sujet:
        raise HTTPException(status_code=404, detail="Sujet non trouvé")
    
    for champ, valeur in sujet_maj.model_dump(exclude_unset=True).items():
        setattr(sujet, champ, valeur)
        
    db.commit()
    db.refresh(sujet)
    return sujet

@app.delete("/sujets-pfe/{sujet_id}")
def supprimer_sujet_pfe(sujet_id: int, db: Session = Depends(get_db)):
    """Supprime un sujet PFE"""
    sujet = db.query(SujetPFE).filter(SujetPFE.id == sujet_id).first()
    if not sujet:
        raise HTTPException(status_code=404, detail="Sujet non trouvé")
    
    db.delete(sujet)
    db.commit()
    return {"message": f"Sujet {sujet_id} supprimé"}

# ==================== EXPORT EXCEL ====================
@app.get("/stagiaires/export-excel")
def export_stagiaires_excel(db: Session = Depends(get_db)):
    """Exporte la liste des stagiaires en fichier Excel"""
    stagiaires = db.query(Stagiaire).all()
    
    data = [{
        "Nom": s.nom,
        "Prénom": s.prenom,
        "Email": s.email,
        "Téléphone": s.telephone,
        "Établissement": s.etablissements,
        "Département": s.departements,
        "Statut": s.statut,
        "Date Début": s.date_debut,
        "Date Fin": s.date_fin
    } for s in stagiaires]
    
    df = pd.DataFrame(data)
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Stagiaires')
    
    output.seek(0)
    
    return Response(
        content=output.read(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=stagiaires_hutchinson.xlsx"}
    )

# ==================== IMPORT EXCEL ====================
@app.post("/stagiaires/import-excel")
async def import_stagiaires_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Importe des stagiaires depuis un fichier Excel"""
    contents = await file.read()
    
    try:
        df = pd.read_excel(io.BytesIO(contents))
        nb_importes = 0
        
        for index, row in df.iterrows():
            nouveau_stagiaire = Stagiaire(
                nom=str(row.get("Nom", "Inconnu")),
                prenom=str(row.get("Prénom", "Inconnu")),
                email=str(row.get("Email", "")),
                telephone=str(row.get("Téléphone", "")),
                etablissements=str(row.get("Établissement", "")),
                departements=str(row.get("Département", "Non défini")),
                statut=str(row.get("Statut", "en_attente")),
                date_debut=str(row.get("Date Début", "")),
                date_fin=str(row.get("Date Fin", ""))
            )
            db.add(nouveau_stagiaire)
            nb_importes += 1
            
        db.commit()
        return {"message": f"{nb_importes} stagiaires importés avec succès."}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erreur lors de la lecture du fichier Excel : {str(e)}")