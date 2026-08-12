from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Utilisateur

# ============================================================
# Configuration JWT
# ============================================================

SECRET_KEY = "change-moi-en-production-super-secret-key-hutchinson-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 heures

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ============================================================
# Gestion des mots de passe
# ============================================================

def hasher_mot_de_passe(mot_de_passe: str) -> str:
    return pwd_context.hash(mot_de_passe)


def verifier_mot_de_passe(mot_de_passe: str, mot_de_passe_hash: str) -> bool:
    return pwd_context.verify(mot_de_passe, mot_de_passe_hash)


# ============================================================
# Gestion des tokens JWT
# ============================================================

def creer_token_acces(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def obtenir_utilisateur_courant(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Utilisateur:
    exception_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise exception_credentials
    except JWTError:
        raise exception_credentials

    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == email).first()
    if utilisateur is None:
        raise exception_credentials
    return utilisateur

# ============================================================
# Vérification des rôles
# ============================================================

def exiger_role(*roles_autorises: str):
    def verificateur(utilisateur: Utilisateur = Depends(obtenir_utilisateur_courant)) -> Utilisateur:
        if utilisateur.role not in roles_autorises:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les droits nécessaires pour cette action",
            )
        return utilisateur
    return verificateur
