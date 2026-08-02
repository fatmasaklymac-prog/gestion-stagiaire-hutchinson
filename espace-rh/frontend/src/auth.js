// Utilitaires d'authentification pour l'espace stagiaire.
// Le token JWT est stocké dans localStorage sous la clé "token".

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function isAuthenticated() {
  return Boolean(getToken());
}

// Petit helper pour ajouter automatiquement le header Authorization
// aux appels fetch vers les routes protégées.
export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
