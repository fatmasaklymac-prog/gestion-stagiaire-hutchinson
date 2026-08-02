import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccueilBinome from "./pages/AccueilBinome";
import CandidatureStage from "./pages/CandidatureStage";
import SuiviCandidatureBinome from "./pages/SuiviCandidatureBinome";
import DemandeStagePublic from "./pages/DemandeStagePublic";
import DemandePfePublic from "./pages/DemandePfePublic";
import PfeBook from "./pages/PfeBook";
import SuiviCandidature from "./pages/SuiviCandidature";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccueilBinome />} />
        <Route path="/accueil" element={<AccueilBinome />} />
        <Route path="/candidature-stage" element={<CandidatureStage />} />
        <Route path="/suivi-candidature" element={<SuiviCandidatureBinome />} />
        <Route path="/demande-stage" element={<DemandeStagePublic />} />
        <Route path="/pfe/postuler" element={<DemandePfePublic />} />
        <Route path="/pfe-book" element={<PfeBook />} />
        <Route path="/suivi" element={<SuiviCandidature />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
