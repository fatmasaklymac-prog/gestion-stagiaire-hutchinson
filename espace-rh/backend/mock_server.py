#!/usr/bin/env python3
"""
Serveur mock pour tester dashboard-stagiaire.html en local,
sans avoir besoin du vrai backend Flask/FastAPI.

Lancement :
    python3 mock_server.py

Endpoints simulés :
    GET  /stagiaire/me                  -> données du dashboard
    POST /stagiaire/documents           -> upload d'un document (JSON: {name, type, sizeKB})
    POST /stagiaire/message             -> envoi d'un message à l'encadrant (JSON: {message})
    POST /stagiaire/presence/checkin    -> marquer la présence du jour

Toutes les routes nécessitent un header Authorization: Bearer <token>
(n'importe quel token non vide fonctionne pour ce mock).

Les données sont gardées en mémoire tant que le serveur tourne (pas de vraie base de données) --
utile pour vérifier que les actions se reflètent bien dans le dashboard après un refresh.
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from datetime import datetime

PORT = 5001

STATE = {
    "nom": "Thomas Bernard",
    "poste": "Développement Web",
    "progression": {
        "pourcentage": 53,
        "joursEffectues": 48,
        "joursTotal": 90
    },
    "documents": {
        "valides": 3,
        "enAttente": 1,
        "liste": [
            {"id": 1, "name": "Convention de stage", "meta": "1.2 MB · PDF", "status": "valid", "date": "15/05/2026"},
            {"id": 2, "name": "Rapport intermédiaire", "meta": "4.5 MB · PDF", "status": "pending", "date": "11/07/2026"},
            {"id": 3, "name": "Rapport final", "meta": "Non déposé", "status": "missing", "date": None}
        ]
    },
    "presence": {
        "pourcentage": 98,
        "label": "Excellent",
        "note": "2 retards signalés"
    },
    "stage": {
        "dateDebut": "15 Mai 2026",
        "dateFin": "15 Août 2026"
    },
    "alerte": {
        "titre": "Rapport intermédiaire",
        "description": "À rendre dans 12 jours (date limite : 24 juillet 2026)"
    },
    "encadrant": {
        "nom": "Julie Lefebvre",
        "role": "Directrice de l'innovation",
        "departement": "Département R&D · Industrialisation",
        "email": "j.lefebvre@hutchinson.com",
        "telephone": "+33 1 45 67 89 00",
        "suivi": {"presence": "18/20", "activites": "7/8", "documents": "3/4"},
        "derniereValidation": "12 juillet 2026"
    },
    "activitesRecentes": [
        {"title": "Présence validée", "description": "Validé par Julie Lefebvre pour la semaine 27.",
         "date": "Aujourd'hui, 09:30", "icon": "check", "color": "green"},
        {"title": "Rapport déposé", "description": "Le document \"Rapport_S8_Bernard.pdf\" a été mis en ligne.",
         "date": "Hier, 17:45", "icon": "doc", "color": "blue"},
        {"title": "Activité mise à jour", "description": "Fiche d'activité \"Déploiement Frontend\" complétée.",
         "date": "10 juillet, 14:20", "icon": "edit", "color": "red"}
    ],
    "notifications": [
        {"title": "Rappel : Rapport intermédiaire",
         "description": "N'oubliez pas de soumettre votre rapport avant le 24 juillet.",
         "time": "Il y a 2h", "icon": "alertCircle", "color": "amber"},
        {"title": "Document validé",
         "description": "Votre convention de stage a été signée numériquement.",
         "time": "Hier", "icon": "check", "color": "green"}
    ],
    "calendrierPresence": {
        "year": 2026,
        "month": 6,
        "today": 14,
        "presentDays": [1, 2, 3, 6, 7, 8, 9, 10, 13, 14],
        "absentDays": []
    }
}

_next_doc_id = 4


def add_activity(title, description, icon="doc", color="blue"):
    STATE["activitesRecentes"].insert(0, {
        "title": title,
        "description": description,
        "date": datetime.now().strftime("Aujourd'hui, %H:%M"),
        "icon": icon,
        "color": color
    })
    STATE["activitesRecentes"] = STATE["activitesRecentes"][:6]


class Handler(BaseHTTPRequestHandler):

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")

    def _send_json(self, status, payload):
        self.send_response(status)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def _require_auth(self):
        auth_header = self.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer ") or len(auth_header) <= len("Bearer "):
            self._send_json(401, {"error": "Token manquant ou invalide"})
            return False
        return True

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/stagiaire/me":
            if not self._require_auth():
                return
            self._send_json(200, STATE)
        else:
            self.send_response(404)
            self._set_cors_headers()
            self.end_headers()

    def do_POST(self):
        global _next_doc_id

        if self.path == "/login":
            body = self._read_json_body()
            email = body.get("email", "").strip()
            password = body.get("password", "").strip()

            if not email or not password:
                self._send_json(400, {"error": "Email et mot de passe requis"})
                return

            fake_token = f"mock-token-{datetime.now().timestamp()}"
            self._send_json(200, {"success": True, "token": fake_token, "nom": STATE["nom"]})
            return

        if not self._require_auth():
            return

        body = self._read_json_body()

        if self.path == "/stagiaire/documents":
            name = body.get("name", "Document sans nom")
            doc_type = body.get("type", "PDF")
            size_kb = body.get("sizeKB", 500)

            new_doc = {
                "id": _next_doc_id,
                "name": name,
                "meta": f"{round(size_kb / 1024, 1)} MB · {doc_type}" if size_kb >= 1024 else f"{size_kb} KB · {doc_type}",
                "status": "pending",
                "date": datetime.now().strftime("%d/%m/%Y")
            }
            _next_doc_id += 1

            replaced = False
            for i, d in enumerate(STATE["documents"]["liste"]):
                if d["name"] == name and d["status"] == "missing":
                    STATE["documents"]["liste"][i] = new_doc
                    replaced = True
                    break
            if not replaced:
                STATE["documents"]["liste"].append(new_doc)

            STATE["documents"]["enAttente"] = sum(
                1 for d in STATE["documents"]["liste"] if d["status"] == "pending"
            )
            STATE["documents"]["valides"] = sum(
                1 for d in STATE["documents"]["liste"] if d["status"] == "valid"
            )

            add_activity(
                "Document déposé",
                f'Le document "{name}" a été mis en ligne et est en attente de validation.',
                icon="doc", color="blue"
            )

            self._send_json(200, {"success": True, "document": new_doc})
            return

        if self.path == "/stagiaire/message":
            message = body.get("message", "").strip()
            if not message:
                self._send_json(400, {"error": "Message vide"})
                return

            add_activity(
                "Message envoyé",
                f'Message envoyé à {STATE["encadrant"]["nom"]} : "{message[:60]}{"..." if len(message) > 60 else ""}"',
                icon="doc", color="blue"
            )

            self._send_json(200, {"success": True, "sentAt": datetime.now().isoformat()})
            return

        if self.path == "/stagiaire/presence/checkin":
            today = STATE["calendrierPresence"]["today"]
            if today not in STATE["calendrierPresence"]["presentDays"]:
                STATE["calendrierPresence"]["presentDays"].append(today)

            add_activity(
                "Présence marquée",
                "Votre présence a été enregistrée pour aujourd'hui.",
                icon="check", color="green"
            )

            self._send_json(200, {"success": True, "presentDays": STATE["calendrierPresence"]["presentDays"]})
            return

        self.send_response(404)
        self._set_cors_headers()
        self.end_headers()

    def log_message(self, format, *args):
        print(f"[mock_server] {self.address_string()} - {format % args}")


if __name__ == "__main__":
    server = HTTPServer(("localhost", PORT), Handler)
    print(f"✅ Mock server démarré sur http://localhost:{PORT}")
    print(f"   GET  http://localhost:{PORT}/stagiaire/me")
    print(f"   POST http://localhost:{PORT}/stagiaire/documents")
    print(f"   POST http://localhost:{PORT}/stagiaire/message")
    print(f"   POST http://localhost:{PORT}/stagiaire/presence/checkin")
    print("   Ctrl+C pour arrêter.")
    server.serve_forever()
