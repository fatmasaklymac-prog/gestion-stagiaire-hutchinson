import os
import uuid
from datetime import datetime

import cloudinary
import cloudinary.uploader
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal
from models import DemandeStage, Departement, SujetPFE
from schemas import DemandeStageCreate, DemandeStageOut, DepartementOut, SujetPFEResponse

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

app = FastAPI(title="Portail Candidatures Hutchinson")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def envoyer_email_confirmation(destinataire: str, prenom: str, reference: str):
    if not RESEND_API_KEY:
        print("⚠️ RESEND_API_KEY non configurée, email non envoyé")
        return
    try:
        requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            json={
                "from": "Hutchinson RH <onboarding@resend.dev>",
                "to": [destinataire],
                "subject": "Confirmation de votre candidature - Hutchinson",
                "html": f"""
                    <p>Bonjour {prenom},</p>
                    <p>Votre candidature a bien été reçue.</p>
                    <p>Vous pouvez suivre son statut à tout moment avec cette référence :</p>
                    <p><strong>{reference}</strong></p>
                """,
            },
        )
    except requests.RequestException as e:
        print(f"❌ Erreur envoi email confirmation : {e}")


@app.get("/departements", response_model=list[DepartementOut])
def lister_departements(db: Session = Depends(get_db)):
    return db.query(Departement).order_by(Departement.nom).all()


@app.post("/upload-document")
async def televerser_document(fichier: UploadFile = File(...)):
    resultat = cloudinary.uploader.upload(
        fichier.file,
        resource_type="raw",
        public_id=f"candidatures/{uuid.uuid4()}_{fichier.filename}",
    )
    return {"url": resultat["secure_url"]}


@app.post("/demandes-stage", response_model=dict)
def creer_demande_stage(demande: DemandeStageCreate, db: Session = Depends(get_db)):
    reference = str(uuid.uuid4())

    nouvelle_demande = DemandeStage(
        **demande.model_dump(),
        statut="en_attente",
        date_creation=datetime.utcnow().isoformat(),
        reference_suivi=reference,
    )
    db.add(nouvelle_demande)
    db.commit()
    db.refresh(nouvelle_demande)

    envoyer_email_confirmation(demande.email, demande.prenom, reference)

    return {"message": "Candidature envoyée", "reference_suivi": reference, "id": nouvelle_demande.id, "date_creation": nouvelle_demande.date_creation}


@app.get("/demandes-stage/suivi/{reference_suivi}", response_model=DemandeStageOut)
def consulter_statut(reference_suivi: str, db: Session = Depends(get_db)):
    demande = db.query(DemandeStage).filter(DemandeStage.reference_suivi == reference_suivi).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Référence introuvable")
    return demande

@app.get("/demandes-stage/id/{demande_id}", response_model=DemandeStageOut)
def consulter_statut_par_id(demande_id: int, email: str, db: Session = Depends(get_db)):
    demande = db.query(DemandeStage).filter(
        DemandeStage.id == demande_id,
        DemandeStage.email == email
    ).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Aucune candidature ne correspond à ce numéro et cet email")
    return demande


# ==================== Routes API pour PFE Book (lecture seule) ====================

@app.get("/sujets-pfe", response_model=list[SujetPFEResponse])
def liste_sujets_pfe(db: Session = Depends(get_db)):
    """Recupere tous les sujets PFE"""
    return db.query(SujetPFE).order_by(SujetPFE.annee.desc(), SujetPFE.reference).all()


@app.get("/sujets-pfe/ref/{reference}", response_model=SujetPFEResponse)
def get_sujet_by_ref(reference: str, db: Session = Depends(get_db)):
    """Recupere les details d'un sujet PFE par sa reference"""
    sujet = db.query(SujetPFE).filter(SujetPFE.reference == reference).first()
    if not sujet:
        raise HTTPException(status_code=404, detail="Sujet non trouve")
    return sujet
