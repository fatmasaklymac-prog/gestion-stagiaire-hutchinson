import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Stagiaires from "./pages/Stagiaires";
import StagiaireDetail from "./pages/StagiaireDetail";
import Presences from "./pages/Presences";
import Encadrants from "./pages/Encadrants";
import Departements from "./pages/Departements";
import Documents from "./pages/Documents";
import LoginStagiaire from "./pages/LoginStagiaire";
import LoginEncadrant from "./pages/LoginEncadrant";
import LoginRH from "./pages/LoginRH";
import Accueil from "./pages/Accueil";
import SelectionProfil from "./pages/SelectionProfil";
import DashboardEncadrant from "./pages/DashboardEncadrant";
import LayoutEncadrant from "./pages/LayoutEncadrant";
import PresencesEncadrant from "./pages/PresencesEncadrant";
import StagiaireDetailEncadrant from "./pages/StagiaireDetailEncadrant";
import MessagerieEncadrant from "./pages/MessagerieEncadrant";
import NotificationsEncadrant from "./pages/NotificationsEncadrant";
import ReunionsEncadrant from "./pages/ReunionsEncadrant";
import StagiairesEncadrant from "./pages/StagiairesEncadrant";
import EvaluationEncadrant from "./pages/EvaluationEncadrant";
import EvaluationsListe from "./pages/EvaluationsListe";
import DashboardStagiaire from "./pages/DashboardStagiaire";
import DocumentsStagiaire from "./pages/DocumentsStagiaire";
import ActivitesStagiaire from "./pages/ActivitesStagiaire";
import PresencesStagiaire from "./pages/PresencesStagiaire";
import EncadrantStagiaire from "./pages/EncadrantStagiaire";
import ProfilStagiaire from "./pages/ProfilStagiaire";
import LayoutStagiaire from "./pages/LayoutStagiaire";
import NotificationsStagiaire from "./pages/NotificationsStagiaire";
import CandidatureStage from "./pages/CandidatureStage";
import SuiviCandidature from "./pages/SuiviCandidature";
import DemandesStage from "./pages/DemandesStage";

import Sessions from "./pages/Sessions";
import Activites from "./pages/Activites";
import AdminPfeBook from "./pages/AdminPfeBook";
import CreerCompteStagiaire from "./pages/CreerCompteStagiaire";
import DetailDemande from "./pages/DetailDemande";
import PfeBook from "./pages/PfeBook";
import DemandePfePublic from "./pages/DemandePfePublic";
import Demandestagepublic from "./pages/Demandestagepublic";

import AccueilBinome from "./pages/AccueilBinome";
import SuiviCandidatureBinome from "./pages/SuiviCandidatureBinome";
import DemandesStageBinome from "./pages/DemandesStageBinome";

function LayoutRH({ children }) {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginStagiaire />} />
        <Route path="/encadrant/login" element={<LoginEncadrant />} />
        <Route path="/login-rh" element={<LoginRH />} />
        <Route path="/accueil" element={<Accueil />} />
        <Route path="/selection-profil" element={<SelectionProfil />} />
        <Route path="/candidature-stage" element={<CandidatureStage />} />
        <Route path="/suivi-candidature" element={<SuiviCandidature />} />

        <Route path="/pfe/book" element={<PfeBook />} />
        <Route path="/pfe/postuler" element={<DemandePfePublic />} />
        <Route path="/demande-stage" element={<Demandestagepublic />} />
        <Route path="/creer-compte-stagiaire" element={<CreerCompteStagiaire />} />

        <Route path="/encadrant" element={<LayoutEncadrant />}>
          <Route path="dashboard" element={<DashboardEncadrant />} />
          <Route path="stagiaires" element={<StagiairesEncadrant />} />
          <Route path="stagiaires/:id" element={<StagiaireDetailEncadrant />} />
          <Route path="evaluations" element={<EvaluationsListe />} />
          <Route path="evaluations/:stagiaireId" element={<EvaluationEncadrant />} />
          <Route path="evaluations/:stagiaireId/:evaluationId" element={<EvaluationEncadrant />} />
          <Route path="messagerie" element={<MessagerieEncadrant />} />
          <Route path="notifications" element={<NotificationsEncadrant />} />
          <Route path="reunions" element={<ReunionsEncadrant />} />
          <Route path="presences" element={<PresencesEncadrant />} />
        </Route>
        <Route
          path="/stagiaire"
          element={
            <ProtectedRoute>
              <LayoutStagiaire />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardStagiaire />} />
          <Route path="documents" element={<DocumentsStagiaire />} />
          <Route path="activites" element={<ActivitesStagiaire />} />
          <Route path="presences" element={<PresencesStagiaire />} />
          <Route path="encadrant" element={<EncadrantStagiaire />} />
          <Route path="profil" element={<ProfilStagiaire />} />
          <Route path="notifications" element={<NotificationsStagiaire />} />
        </Route>

        <Route path="/" element={<LayoutRH><Dashboard /></LayoutRH>} />
        <Route path="/stagiaires" element={<LayoutRH><Stagiaires /></LayoutRH>} />
        <Route path="/stagiaires/:id" element={<LayoutRH><StagiaireDetail /></LayoutRH>} />
        <Route path="/presences" element={<LayoutRH><Presences /></LayoutRH>} />
        <Route path="/encadrants" element={<LayoutRH><Encadrants /></LayoutRH>} />
        <Route path="/departements" element={<LayoutRH><Departements /></LayoutRH>} />
        <Route path="/documents" element={<LayoutRH><Documents /></LayoutRH>} />
        <Route path="/demandes-stage" element={<LayoutRH><DemandesStage /></LayoutRH>} />

        <Route path="/sessions" element={<LayoutRH><Sessions /></LayoutRH>} />
        <Route path="/activites-rh" element={<LayoutRH><Activites /></LayoutRH>} />
        <Route path="/admin/pfe-book" element={<LayoutRH><AdminPfeBook /></LayoutRH>} />
        <Route path="/demandes-stage/:id" element={<LayoutRH><DetailDemande /></LayoutRH>} />

        <Route path="/candidature/accueil" element={<AccueilBinome />} />
        <Route path="/candidature/suivi-candidature" element={<SuiviCandidatureBinome />} />
        <Route path="/sujets-pfe" element={<LayoutRH><DemandesStageBinome /></LayoutRH>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
