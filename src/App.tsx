/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import Layout from "./components/Layout.tsx";
import Landing from "./pages/Landing.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Opportunities from "./pages/Opportunities.tsx";
import OpportunityDetail from "./pages/OpportunityDetail.tsx";
import Profile from "./pages/Profile.tsx";
import AcademicProfile from "./pages/AcademicProfile.tsx";
import ApplicationTracker from "./pages/ApplicationTracker.tsx";
import Roadmap from "./pages/Roadmap.tsx";
import ActivityTracker from "./pages/ActivityTracker.tsx";
import CollegeAnalyzer from "./pages/CollegeAnalyzer.tsx";
import EssayAssistant from "./pages/EssayAssistant.tsx";
import Network from "./pages/Network.tsx";
import InterviewPrep from "./pages/InterviewPrep.tsx";
import Messages from "./pages/Messages.tsx";

// Restored pages
import Leaderboard from "./pages/Leaderboard.tsx";
import AiAgents from "./pages/AiAgents.tsx";
import CareerSimulator from "./pages/CareerSimulator.tsx";
import DigitalTwin from "./pages/DigitalTwin.tsx";
import FounderMode from "./pages/FounderMode.tsx";
import AchievementVault from "./pages/AchievementVault.tsx";
import ResearchMatching from "./pages/ResearchMatching.tsx";
import CounselorDashboard from "./pages/CounselorDashboard.tsx";
import ParentDashboard from "./pages/ParentDashboard.tsx";
import ImpactAnalytics from "./pages/ImpactAnalytics.tsx";
import DiscoveryDashboard from "./pages/DiscoveryDashboard.tsx";
import OpportunityMarketplace from "./pages/OpportunityMarketplace.tsx";
import PortfolioBuilder from "./pages/PortfolioBuilder.tsx";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="messages" element={<Messages />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="opportunities/:id" element={<OpportunityDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="academic-profile" element={<AcademicProfile />} />
              <Route path="applications" element={<ApplicationTracker />} />
              <Route path="analyzer" element={<CollegeAnalyzer />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="activities" element={<ActivityTracker />} />
              <Route path="essay" element={<EssayAssistant />} />
              <Route path="interview" element={<InterviewPrep />} />
              <Route path="network" element={<Network />} />
              
              {/* Restored page routes */}
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="agents" element={<AiAgents />} />
              <Route path="career" element={<CareerSimulator />} />
              <Route path="twin" element={<DigitalTwin />} />
              <Route path="founder" element={<FounderMode />} />
              <Route path="vault" element={<AchievementVault />} />
              <Route path="research" element={<ResearchMatching />} />
              <Route path="counselor" element={<CounselorDashboard />} />
              <Route path="parent" element={<ParentDashboard />} />
              <Route path="analytics" element={<ImpactAnalytics />} />
              <Route path="discovery" element={<DiscoveryDashboard />} />
              <Route path="marketplace" element={<OpportunityMarketplace />} />
              <Route path="portfolio" element={<PortfolioBuilder />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
