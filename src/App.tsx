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
import AchievementVault from "./pages/AchievementVault.tsx";
import FounderMode from "./pages/FounderMode.tsx";
import CareerSimulator from "./pages/CareerSimulator.tsx";
import EssayAssistant from "./pages/EssayAssistant.tsx";
import Network from "./pages/Network.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import AIAgents from "./pages/AIAgents.tsx";
import ImpactAnalytics from "./pages/ImpactAnalytics.tsx";
import ParentDashboard from "./pages/ParentDashboard.tsx";
import CounselorDashboard from "./pages/CounselorDashboard.tsx";
import InterviewPrep from "./pages/InterviewPrep.tsx";
import DiscoveryDashboard from "./pages/DiscoveryDashboard.tsx";
import DigitalTwin from "./pages/DigitalTwin.tsx";
import PortfolioBuilder from "./pages/PortfolioBuilder.tsx";
import ResearchMatching from "./pages/ResearchMatching.tsx";
import OpportunityMarketplace from "./pages/OpportunityMarketplace.tsx";

import Messages from "./pages/Messages.tsx";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="twin" element={<DigitalTwin />} />
            <Route path="portfolio" element={<PortfolioBuilder />} />
            <Route path="research" element={<ResearchMatching />} />
            <Route path="marketplace" element={<OpportunityMarketplace />} />
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
            <Route path="vault" element={<AchievementVault />} />
            <Route path="founder" element={<FounderMode />} />
            <Route path="career" element={<CareerSimulator />} />
            <Route path="essay" element={<EssayAssistant />} />
            <Route path="interview" element={<InterviewPrep />} />
            <Route path="network" element={<Network />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="agents" element={<AIAgents />} />
            <Route path="analytics" element={<ImpactAnalytics />} />
            <Route path="discovery" element={<DiscoveryDashboard />} />
            <Route path="parent" element={<ParentDashboard />} />
            <Route path="counselor" element={<CounselorDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
